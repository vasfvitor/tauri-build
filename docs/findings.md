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

### Runner variance is 5 to 30%

Identical cold builds on `ubuntu-24.04` repeated within 4 s of each other,
but `windows-2022` spread from 4m30s to 5m54s and the `big` build on Linux
from 4m24s to 5m44s. Confidence: high. Batch `20260910-164108`.

Limit: a single-sample delta below 20% means nothing on Windows. Every
claim below is a median of at least 2 samples.

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

### Adding `sccache` on top of `rust-cache` doesn't help on a normal commit

The pilot showed a 3x win for the combination, but only because nothing had
changed between runs and `sccache` served the app crate itself from cache.
With a real change that crate recompiles no matter what, and the combination
lands within the spread of `rust-cache` alone, sometimes behind it because of
the per-object uploads. Confidence: medium. Batches `20260910-155243-warm`
(the misleading one), `20260910-165048-warm-app` (the corrected one).

Open: the `deps` scenario (lockfile changed) is where `sccache` should
matter, because lockfile-keyed caches miss. Not measured yet.

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

One of 24 macOS jobs so far died in `bundle_dmg.sh` after a successful
compile, with no cache involved. Known upstream flakiness of `hdiutil` on
GitHub runners. Confidence: low (one occurrence). Batch `20260910-170743`.

Implication: a release workflow that needs the DMG should retry the bundle
step or build the DMG in a separate job; a PR check should not build it at
all.

## App size

### 150 generated modules add 17 to 18% to a cold build

`baseline-big` vs `baseline`: +34 s on macOS, +56 s on Windows, within
spread on Linux. Confidence: medium. Batch `20260910-164108`. This is the
headroom the profile experiments have to work with.

## Not yet measured

- `deps` change scenario for caches.
- `bundle`, `linker`, `profile`, `deps`, `toolchain`, `combo` groups.
- In-job rebuild (`--runs 2`).
- The `workspace` group: whether the cache findings hold for a monorepo
  where the plugins are workspace crates (`rust-cache` drops those from the
  cache by default), and the cost of the size-optimised release profile.
- Larger runners, prebuilt containers, cross-compilation.
