# Findings

The evidence ledger behind the tutorial. One entry per claim: what the data
supports, the numbers behind it, the confidence level, and where it
stops applying. Batches are the folders in `results/`; see `results/README.md`
for which batches are valid.

Confidence scale: **high** = 3+ samples per cell and the delta is well
outside the spread; **medium** = 2 samples or delta near the spread;
**low** = single sample or a known confound.

## Environment

### Runner size decides the absolute numbers

Public repositories get 4-core Linux and Windows runners; private ones get
2 cores. macOS is 3 cores either way. The same cold build:

| Runner | 2 cores | 4 cores |
|---|---:|---:|
| ubuntu-24.04 | 8m57s | 5m03s |
| windows-2022 | 9m41s | 5m25s |
| macos-14 | 2m57s | 3m04s |

Confidence: medium (2-core is a single sample). Batches `20260910-154018`,
`20260910-164108`.

Limit: ratios between options transfer between runner sizes better than
the absolute times. Anything measured on a private repo should be labelled.

### Runner variance is 5 to 30%, up to 40% on macOS

Identical cold builds on `ubuntu-24.04` repeated within 4 s of each other,
but `windows-2022` spread from 4m30s to 5m54s and the `big` build on Linux
from 4m24s to 5m44s. Confidence: high. Batch `20260910-164108`.

Limit: a single-sample delta below 20% means nothing on Windows. Every
claim below is a median of at least 2 samples.

macOS can be worse: two `pw-baseline` jobs with identical settings in the
same run built in 3m33s and about 5m02s. Batch `20260910-194307-warm-app`.
A macOS delta under 40% needs 3 samples or more.

### Where a cold build spends its time (4 cores)

| Stage | Linux | Windows | macOS |
|---|---:|---:|---:|
| apt system deps | 33 s | 0 | 0 |
| pnpm install | 2 s | 10 s | 3 s |
| frontend build | 2 s | 3 s | 2 s |
| cargo | 3m43s | 5m05s | 2m50s |
| bundling | 1m18s | 17 s | 12 s |

Confidence: high. Batch `20260910-164108`. The frontend of this app is
trivial; a large SPA moves that line into minutes.

## Caching

### A warm cache cuts the build of a normal commit by 55 to 65%

Warm run after a one-function change in the app crate, median of 2:

| | Linux | Windows | macOS |
|---|---:|---:|---:|
| no cache | 5m03s | 5m25s | 3m04s |
| `rust-cache` | 2m17s | 2m06s | 1m17s |
| plain `actions/cache` | 2m07s | 2m25s | 1m14s |
| `rust-cache` + `sccache` | 2m05s | 2m29s | 1m30s |
| `sccache` only | 3m55s | 4m22s | 1m38s |

Confidence: medium. Batch `20260910-165048-warm-app`.

### `rust-cache` and plain `actions/cache` are equivalent on time

They differ by less than the spread on every runner. The choice is about
cache size and hygiene: `rust-cache` prunes unused artifacts and always
rebuilds the workspace crate; `actions/cache` stores everything and hits the
10 GB repository limit sooner. Confidence: medium. Same batch.

### `sccache` alone is the worst warm option

With no `target/` restored, every crate still has to be linked and the
final crate compiled; the cache only skips codegen of unchanged crates.
Cargo took 2m43s on Linux and 3m48s on Windows, twice the other options.
Confidence: medium. Same batch.

Caveat: the `sccache` cache in that batch was only partly populated, 57 to
77% hits on Linux and Windows (see the rate limit entry below), so part of
the gap is missing entries. The linking argument still holds: the macOS
sample with a 100% hit rate took 1m38s against 1m17s for `rust-cache`.

### Adding `sccache` on top of `rust-cache` doesn't help on a normal commit

The pilot showed a 3x win for the combination, but only because nothing had
changed between runs and `sccache` served the app crate itself from cache.
With a real change that crate recompiles no matter what, and the combination
lands within the spread of `rust-cache` alone, sometimes behind it because of
the per-object uploads. Confidence: medium. Batches `20260910-155243-warm`
(the misleading one), `20260910-165048-warm-app` (the corrected one).

Open: the `deps` scenario (lockfile changed) is where `sccache` should
matter, because lockfile-keyed caches miss. Not measured yet.

### The cache API rate limit silently truncates `sccache`

`sccache` with `SCCACHE_GHA_ENABLED` stores one cache entry per compiled
object through the GitHub Actions cache API. That API rate-limits the
repository, and a matrix of parallel jobs trips it within minutes. `sccache`
reports the loss only as `Cache write errors` in `--show-stats`; the job
still succeeds and the cache is quietly partial:

| Cold batch | Parallel jobs | Objects lost |
|---|---:|---|
| bench app, `20260910-170743` | 30 | 60 to 85%, every runner |
| monorepo, `20260910-194307` | 42 | 56% on Linux and macOS, 100% on Windows |

The following warm runs hit 57 to 100% (bench app) and 38 to 68% (monorepo)
instead of nearly everything. `rust-cache` and `actions/cache` make one call
per job and are mostly immune, not entirely: both Windows repeats of
`pw-cache-swatinem` tried to save the same key in the same second, GitHub
answered with the rate limit, and neither save happened. Confidence: high
(the counters are in the logs of 24 jobs). The threshold is not measured;
batches of 30 and 42 jobs both lost more than half.

Implication: the `sccache` GitHub backend suits a workflow with a few
concurrent jobs, not a large matrix. Check the `Cache write errors` line
before trusting a hit rate. The harness now gives each repetition its own
cache key.

### Populating a cache is nearly free, except for `sccache`

Cold builds that also save a cache, median of 2, against the uncached
baseline:

| | Linux (5m03s) | Windows (5m25s) | macOS (3m04s) |
|---|---:|---:|---:|
| `rust-cache` | 4m31s | 4m55s | 3m02s |
| plain `actions/cache` | 4m50s | 5m59s | 3m42s |
| `rust-cache` + `sccache` | 5m14s | 6m11s | 3m19s |
| `sccache` only | 5m02s | 6m13s | 3m58s |

`rust-cache` and `actions/cache` land within the spread of the baseline;
the upload happens in a post step outside the timed build. `sccache`
uploads every object during the build and adds 15 to 30% on Windows and
macOS. Confidence: medium (spreads up to a minute). Batch `20260910-170743`.

### The warm floor is the app crate

After a change, cargo's remaining work is the app crate plus linking: 45 to
58 s on Linux, 1m45s to 2m08s on Windows, 1m03s to 1m17s on macOS. Tauri's
generic runtime is monomorphized into that crate, so even a tiny app pays
around 50 s of it on 8 local cores. Confidence: medium.

## Bundling

### On Linux, bundling costs more than a warm compile

Frontend plus bundling was 1m07s to 1m20s on Linux across every cache
variant, while warm cargo was 31 to 51 s. The AppImage is the bulk of it:
the Linux bundle directory is 339 MB against 10 MB on macOS. Windows
bundling is 16 to 33 s, macOS 7 to 12 s. Confidence: high (consistent across
12 jobs). Batches `20260910-164108`, `20260910-165048-warm-app`.

Implication: for pull request checks, `--no-bundle` or `--bundles deb` is
worth more than any compiler flag. The `bundle` group quantifies it.

## Reliability

### The DMG bundler fails intermittently on macOS runners

One of 24 macOS jobs died in `bundle_dmg.sh` after a successful compile,
with no cache involved. Known upstream flakiness of `hdiutil` on GitHub
runners. No recurrence in the 28 macOS jobs of the workspace batches.
Confidence: low (one occurrence). Batch `20260910-170743`.

Implication: a release workflow that needs the DMG should retry the bundle
step or build the DMG in a separate job; a PR check should not build it at
all.

### A frontend build that downloads at build time flakes

One Windows `pw-baseline` job failed inside the Vite build: the example's
UnoCSS web fonts preset fetches Google Fonts during the build and timed
out. Nothing to do with Tauri or caching, and it costs a full 9-minute job.
1 of 84 monorepo jobs. Confidence: low. Batch `20260910-194307-warm-app`.

Implication: vendor build-time downloads or turn them off in CI. A
frontend that needs the network to build has a failure mode the Rust side
doesn't.

### Artifact uploads time out too

One macOS job built fine and then lost its timing record to five failed
`CreateArtifact` requests. 1 of 84. Same batch. A release workflow should
retry the upload step rather than the whole build.

## App size

### 150 generated modules add 17 to 18% to a cold build

`baseline-big` vs `baseline`: +34 s on macOS, +56 s on Windows, within
spread on Linux. Confidence: medium. Batch `20260910-164108`. This is the
headroom the profile experiments have to work with.

## A monorepo app (the plugins-workspace `api` example)

The `workspace` group builds the `api` example of `tauri-apps/plugins-workspace`:
16 plugins as path crates in one Cargo workspace, 434 crates on Linux, a
Svelte frontend, and the size-optimised release profile upstream ships. Batches
`20260910-194307` (cold) and `20260910-194307-warm-app` (warm after a
one-function change in the app crate), 2 samples per cell.

### The size-optimised profile costs 30% on Windows and halves the binary

Upstream ships `lto = true`, `codegen-units = 1`, `opt-level = "s"`,
`panic = "abort"`. Against cargo's default release profile, cold:

| | Linux | Windows | macOS |
|---|---:|---:|---:|
| default profile | 6m46s | 7m02s | 4m06s |
| upstream profile | 6m50s | 9m14s | 5m45s |
| binary, default to upstream | 33.1 to 13.4 MB | 20.9 to 8.1 MB | 24.5 to 10.2 MB |

Windows pays about 30%: four samples from 9m05s to 9m24s against 5m48s to
8m16s. Linux pays nothing measurable, the four samples of each overlap
(5m56s to 7m07s against 6m37s to 7m50s); `opt-level = "s"` may simply hand
the fat LTO step less code. macOS flipped between the two batches (5m45s
against 4m06s, then 3m33s against 5m11s) and is inconclusive. Confidence:
medium on Windows, low elsewhere.

Implication: keep the size profile for releases, where a binary 2.5x smaller
is the point, and override it for pull request builds with
`CARGO_PROFILE_RELEASE_LTO=false` and `CARGO_PROFILE_RELEASE_CODEGEN_UNITS=16`.
The `profile` group on the bench app is meant to refine the per-flag cost.

### A warm cache works the same in a monorepo, with one trap

Warm run after the app-crate change, cargo time, median of 2, default
profile:

| | Linux | Windows | macOS |
|---|---:|---:|---:|
| no cache | 5m35s | 7m06s | 4m53s |
| `rust-cache` defaults | 1m13s | no cache saved* | 1m45s |
| `rust-cache`, `cache-workspace-crates: true` | 0m57s | 2m53s | 1m17s |
| plain `actions/cache` | 1m03s | 2m50s | 1m10s |
| `rust-cache` + `sccache` | 1m32s | 3m32s | 1m15s |
| `sccache` only, partial cache | 3m21s | 7m05s | 2m33s |

*The cold save failed, see the rate limit entry; that cell is a cold build
and says nothing about the option. Whole `tauri build` wall time with a
restored `target/` was 2m39s to 3m16s on Linux, 3m25s to 4m11s on Windows,
1m24s to 2m02s on macOS, against 6m46s to 7m25s, 7m02s to 7m38s, and 4m06s
to 5m11s uncached. Confidence: medium.

### `rust-cache` dropping the workspace crates costs 15 to 30 s here

With its defaults `rust-cache` deletes the 16 plugins from `target/` before
saving, and the warm run recompiles them: cargo took 1m13s against 0m57s on
Linux and 1m45s against 1m17s on macOS with `cache-workspace-crates: true`.
Real, but small: the plugins are thin crates, and the expensive part of a
Tauri build, the monomorphized runtime, sits in the app crate, which
recompiles anyway. Plain `actions/cache` keeps the plugins too and landed
within the spread of the `cache-workspace-crates` setting. Adding `sccache`
on top didn't help, as on the bench app. Confidence: medium (Windows lost
its comparison).

Implication: in a workspace, set `cache-workspace-crates: true` on
`rust-cache` or use plain `actions/cache`. Without it the plugins cost a
little on every build, and a workspace with heavier members pays more.

### The warm floor grows slowly with the app

With everything restored, the remaining cargo work was 57 s to 1m03s on
Linux, 2m50s on Windows and 1m10s on macOS, against 45 to 58 s, 1m45s to
2m08s and 1m03s to 1m17s for the bench app. Sixteen plugins and 434 crates
add 10 to 45 s per warm build over a trivial app. Confidence: medium.

### The plugin JS packages add 15 to 20 s outside the timed build

The example's frontend imports the plugins' JS packages from the workspace,
so they have to be built first (`pnpm --filter 'api^...' build`). Nothing in
the harness caches that step; it counts in the job total. Confidence: high.

### Bundling on Linux is 1m25s to 2m for this app

`deb`, `rpm` and AppImage, 351 to 408 MB of bundles, on every Linux job of
both batches. Windows took 6 to 24 s, macOS 7 to 13 s. Consistent with the
bench app. Confidence: high (42 jobs).

## Not yet measured

- `deps` change scenario for caches.
- `bundle`, `linker`, `profile`, `deps`, `toolchain`, `combo` groups.
- In-job rebuild (`--runs 2`).
- The Windows `rust-cache` cell of the `workspace` group and the `deps`
  scenario on the workspace app, now that repetitions have their own cache
  keys.
- Where the cache API rate limit starts for `sccache`: a batch with 3 to 6
  concurrent jobs.
- Larger runners, prebuilt containers, cross-compilation.
