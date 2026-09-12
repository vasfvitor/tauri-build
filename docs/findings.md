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
same run built in 3m33s and about 5m02s (batch `20260910-194307-warm-app`),
and two `bundle-app` jobs compiled in 2m19s and 3m13s (batch
`20260910-235250`). A macOS delta under 40% needs 3 samples or more.

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

### A new dependency costs the same as an app change, and `sccache` can't help

Warm run after `cargo add chrono` (lockfile changed, 3 new crates), cargo
time, median of 2, next to the app-change scenario:

| | Linux app / deps | Windows app / deps | macOS app / deps |
|---|---:|---:|---:|
| `rust-cache` | 0m58s / 0m50s | 1m45s / 2m05s | 1m06s / 1m21s |
| plain `actions/cache` | 0m45s / 0m57s | 2m01s / 2m07s | 1m03s / 1m05s |
| `rust-cache` + `sccache` | 0m52s / 0m53s | 2m08s / 2m10s | 1m17s / 1m28s |
| `sccache` only | 2m43s / 3m45s | 3m48s / 5m45s | 1m27s / 2m19s |

The expectation was wrong: a lockfile-keyed cache doesn't "miss" on a new
dependency. `rust-cache` and `actions/cache` fall back to the previous entry
through their restore keys, and cargo's per-crate fingerprints keep the
other 580 crates. The timings show the new crates (`chrono`,
`iana-time-zone`, `num-traits`) at 3 s on Linux and 15 s on Windows on top
of the usual app crate. Every difference in the table is within the spread.

`sccache` has nothing to offer here. A crate that was never compiled before
can't be in any cache: with `rust-cache` restored, `sccache` saw 3 to 14
compile requests and hit none of them. Alone, it was worse than in the app
scenario and close to a cold build on Linux and Windows, because the cold
batch of 24 jobs had lost 73 to 100% of its writes to the rate limit (34
to 51% on macOS, which explains the better macOS number). Confidence: medium
for the lockfile-keyed caches, high for the claim that `sccache` can't serve
a new crate. Batches `20260912-130914` and `20260912-130914-warm-deps`.

Limit: the harness edits the lockfile after the restore step, so the
restore was an exact key hit. In a real commit it is a prefix fallback with
the same content, plus a save of the new entry in the post step.

Implication: the two scenarios where `sccache` would earn its place are a
`target/` cache that is missing or unusable while the objects were compiled
before (a new branch with no fallback, an evicted cache, a dependency
rolled back to a known version), and a small enough matrix to survive the
rate limit. Neither is the normal commit or the normal dependency bump.

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
| bench app, `20260912-130914` | 24 | 73 to 100% on Linux and Windows, 34 to 51% on macOS |

The following warm runs hit 57 to 100% (bench app) and 38 to 68% (monorepo)
instead of nearly everything. `rust-cache` and `actions/cache` make one call
per job and are mostly immune, not entirely: both Windows repeats of
`pw-cache-swatinem` tried to save the same key in the same second, GitHub
answered with the rate limit, and neither save happened. Confidence: high
(the counters are in the logs of 24 jobs). The threshold is not measured;
batches of 24, 30 and 42 jobs all lost more than half.

Implication: the `sccache` GitHub backend suits a workflow with a few
concurrent jobs, not a large matrix. Check the `Cache write errors` line
before trusting a hit rate. The harness now gives each repetition its own
cache key; the 4-job rerun of the Windows cell saved and restored both
repetitions without a hitch (batch `20260910-214104`).

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

## In-job rebuilds

Batch `20260911-014047`: cold build, then a second `tauri build` in the same
job after a comment is appended to `lib.rs`, 2 samples per cell. The
`build #2` column of the report includes bundling; the numbers here are
cargo's own time for the second build.

### Rebuilding the app crate costs 43 s on Linux and 90 s on Windows

| cargo, second build | Linux | Windows | macOS |
|---|---:|---:|---:|
| `baseline` | 43 s | 91 to 94 s | 43 to 58 s |
| `baseline-big` (150 extra modules) | 58 to 76 s | 115 to 138 s | 89 to 111 s |
| `linker-mold` | 43 to 45 s | - | - |

That's the same floor the warm cache runs showed (45 to 58 s on Linux, 1m45s
to 2m08s on Windows with linking and bundling), measured without any cache
in the way: the app crate recompiles from scratch whenever a line changes,
because the release profile is not incremental. `mold` didn't move it, so
the floor is codegen, not linking. Confidence: high (matches four other
batches). Whole second `tauri build` including bundling: 1m41s to 1m46s on
Linux, 1m43s to 1m46s on Windows, 53 s to 1m09s on macOS.

### Incremental compilation cuts the rebuild to 3 to 8 s, in the best case

| cargo, second build | Linux | Windows | macOS |
|---|---:|---:|---:|
| `baseline` | 43 s | 91 to 94 s | 43 to 58 s |
| `incremental-on` (`CARGO_INCREMENTAL=1`) | 3 to 4 s | 5 to 6 s | 6 to 8 s |

A comment-only change is the best case: incremental compilation finds no
semantic change and reuses every codegen unit. A real edit recompiles the
units it touches, so expect a fraction of the 43 to 94 s, not zero. The
price is the cold build, 7 to 8% slower, and a `target/` with incremental
state that only pays off if the same directory survives to the next build:
a second build in the same job, a self-hosted runner, or a `target/` cache
that keeps the incremental directories (`rust-cache` does; it makes the
cache bigger). Confidence: medium (2 samples, best-case change).

Implication: for a PR workflow that builds once from a restored cache,
incremental compilation is a net loss. It wins where a job builds the same
crate more than once, or where the runner keeps `target/` between jobs.

## Bundling

### On Linux, bundling costs more than a warm compile

Frontend plus bundling was 1m07s to 1m20s on Linux across every cache
variant, while warm cargo was 31 to 51 s. The AppImage is the bulk of it:
the Linux bundle directory is 339 MB against 10 MB on macOS. Windows
bundling is 16 to 33 s, macOS 7 to 12 s. Confidence: high (consistent across
12 jobs). Batches `20260910-164108`, `20260910-165048-warm-app`.

Implication: for pull request checks, `--no-bundle` or `--bundles deb` is
worth more than any compiler flag. The next two entries quantify it.

### Skipping AppImage and rpm saves 1m14s per Linux build

Cold, no cache, median of 2 per cell, against the all-bundles baseline of
batch `20260910-164108`:

| Linux | `tauri build` | bundling | bundle dir |
|---|---:|---:|---:|
| all bundles (deb, rpm, AppImage) | 5m03s | 1m18s | 339 MB |
| `--bundles deb` | 3m25s | 4 s | 17.7 MB |
| `--no-bundle` | 3m24s | 2 s | - |

The 2 to 4 s left is the overhead of the Tauri command itself, which the
bundling column absorbs. Confidence: high for the bundling stage (1m07s to 1m20s in every
Linux job of four batches, 2 to 4 s without AppImage and rpm); medium for
the wall time, since cargo itself moved from 3m43s to 3m20s between the two
batches.

### Windows and macOS bundlers are cheap; the DMG is the risky one

| | all bundles | single bundler | `--no-bundle` |
|---|---:|---:|---:|
| Windows bundling (NSIS + MSI, NSIS only) | 17 s | 11 s | 6 s |
| macOS bundling (`.app` + DMG, `.app` only) | 12 s | 2 s | 2 s |

WiX costs about 6 s on top of NSIS, the DMG about 10 s on top of the `.app`.
Neither is worth dropping for time alone; the DMG is worth dropping from
pull request builds because it's the step that flakes (see Reliability).
Confidence: medium (deltas near the Windows spread; macOS compile varied
2m19s to 3m13s between identical jobs in this batch). Batch
`20260910-235250`.

Implication: a pull request workflow should run `tauri build --no-bundle`
(or `--bundles deb` when a Linux package is needed for tests) and leave
AppImage, rpm, DMG, and MSI to the release workflow. On Linux that's worth
more than any cache on a warm build and about 30% of a cold one. It also
shrinks the artifact from 339 MB to 18 MB.

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

## Dependencies

### A heavy dependency off the critical path is free on 4 cores

The `heavy` feature adds `reqwest` (`rustls-tls`, `json` features) and `tokio` (multi-thread
runtime, macros): 29 more crates (296 to 325 on Linux) and 12% more
compiler CPU (728 to 812 s of unit time on Linux). Cold, no cache, median
of 2, against the trivial app of batch `20260910-164108`:

| cargo, cold | Linux | Windows | macOS |
|---|---:|---:|---:|
| trivial app | 3m43s | 5m05s | 2m50s |
| `heavy` | 3m38s | 4m57s | 3m33s |

Linux and Windows moved by nothing; macOS by 43 s, inside its spread. The
extra crates compile in parallel next to the chain that bounds the build,
`syn`, `gtk`, `tauri-utils`, `tauri`, then the app crate, and none of them
is on it: `rustls` is the biggest at 23 s. The binary grows from 10.2 to
12.9 MB. Confidence: medium (2 samples, reference from another batch).
Batch `20260912-142710`.

Limit: this holds while the runner has idle cores. On the 2-core private
runners the same crates would land on the critical path, and a dependency
that the app crate waits for (a proc-macro crate, or something `tauri`
itself depends on) is not free anywhere.

### Warm, the dependency weight vanishes

Warm run after the app-crate change, `rust-cache`, median of 2:

| | Linux | Windows | macOS |
|---|---:|---:|---:|
| `heavy`, no cache | 4m56s | 5m40s | 3m30s |
| `heavy`, `rust-cache` | 1m53s (-62%) | 2m41s (-53%) | 1m19s (-62%) |
| cargo alone, warm | 41 s | 2m17s | 1m06s |

The warm cargo step is the same floor as the trivial app (45 to 58 s on
Linux, 1m45s to 2m08s on Windows, 1m03s to 1m17s on macOS): the app crate
plus linking, and the 29 extra crates cost nothing once cached. Saving the
cache on the cold run was free again (4m05s, 5m34s, 2m45s against 3m38s,
4m57s, 3m33s uncached, all within spread). Confidence: medium (2 samples).
Batches `20260912-142710`, `20260912-142710-warm-app`.

Implication: dependency pruning is a cold-build and binary-size concern,
not a CI-time one, as long as the workflow caches `target/`. A team
worried about build time gets more from a cache than from auditing
`Cargo.toml`.

## Linker

### Swapping the linker buys nothing on a cold build with a current toolchain

The runners had Rust 1.98.1, and since 1.90 the stable toolchain links
`x86_64-unknown-linux-gnu` with its bundled `rust-lld`. `lld` through
`clang` and `mold` therefore compete with `lld`, not with GNU `ld`, and land
on it. Cargo's own timing of the app crate unit (compile plus link):

| app crate unit | Linux | Windows |
|---|---:|---:|
| default (`rust-lld` on Linux, MSVC `link.exe` on Windows) | 40 to 54 s | 69 to 110 s |
| `lld` via `clang` / `rust-lld.exe` | 44 to 48 s | 112 to 131 s |
| `mold` via `clang` | 41 to 43 s | - |

Whole cargo step: 3m15s to 3m20s on Linux against 3m20s to 3m43s for the
defaults in two other batches; 5m47s on Windows against 5m05s. `rust-lld`
on Windows was no faster than `link.exe`, if anything slower. Confidence:
medium (defaults from other batches, 2 samples each). Batch
`20260911-012718`.

Limit: a cold build links once, so the linker can only ever shave seconds
off it. The in-job rebuild (batch `20260911-014047`) didn't move either:
`mold` rebuilt the app crate in 43 to 45 s against 43 s for the default, so
the rebuild floor is codegen, not linking. On a toolchain older than 1.90, or a target that still defaults to GNU `ld`,
`lld` and `mold` do help, which is what the 5 to 20 s folklore is about.
macOS already ships a fast linker and was skipped.

Implication: on Linux with Rust 1.90 or newer, don't add a linker step to
CI. On Windows, don't bother either.

## Release profile

The `profile` group changes one `CARGO_PROFILE_RELEASE_*` variable at a time
on the `big` app (cold, no cache, 2 samples each) and compares cargo time
and binary size with `baseline-big` from batch `20260910-164108`: cargo
3m43s on Linux, 5m59s on Windows, 3m25s on macOS, binary 10.3 / 10.4 /
7.2 MB. The reference sits in another batch, so deltas under 10% are noise.
Batch `20260911-000401`. The three flags that matter were rerun with an
in-batch reference and 3 samples per cell (batch `20260912-140937`); the
next entry pools both batches.

### Rerun with an in-batch reference: only `codegen-units = 1` is expensive

Cargo time, median of the pooled samples (6 for the reference, 5 per flag),
with the binary as Linux / Windows / macOS:

| | Linux | Windows | macOS | binary |
|---|---:|---:|---:|---|
| `baseline-big` | 3m51s | 6m08s | 3m25s | 10.3 / 10.4 / 7.2 MB |
| `codegen-units = 1` | 4m50s (+26%) | 8m10s (+33%) | 5m16s (+54%) | 8.6 / 9.4 / 5.9 MB |
| `lto = "fat"` | 4m24s (+14%) | 6m00s (-2%) | 3m50s (+12%) | 8.6 / 9.8 / 6.1 MB |
| `--profile fast` | 3m10s (-18%) | 4m43s (-23%) | 2m46s (-19%) | 14.3 / 10.3 / 11.4 MB |

Within the rerun alone (3 samples each, same day, same reference):
`codegen-units = 1` +21 / +23 / +42%, fat LTO +7 / -8 / +1%, the `fast`
profile -21 / -28 / -20%. Every `codegen-units = 1` sample is slower than every
reference sample on Linux and macOS. Confidence: high for
`codegen-units = 1` and the `fast` profile, medium for fat LTO (see below).

### `codegen-units = 1` is the expensive flag

| cargo time | Linux | Windows | macOS |
|---|---:|---:|---:|
| default (16) | 3m43s | 5m59s | 3m25s |
| `codegen-units = 1` | 4m27s (+20%) | 8m23s (+40%) | 5m41s (+66%) |
| `codegen-units = 256` | 4m32s (+22%) | 6m30s (+9%) | 3m13s (-6%) |

One codegen unit serialises the app crate, the crate that carries the
monomorphized Tauri runtime, onto one core. Binary 15 to 20% smaller (8.6 /
9.4 / 5.9 MB). Confidence: high, outside the spread on all three runners,
and the rerun with an in-batch reference agrees (+26 / +33 / +54% pooled).

256 units went the other way from the expectation: slower on Linux and
Windows, flat on macOS. With 4 cores there's no parallelism left to buy past
16 units, and each extra unit costs LLVM overhead and inlining. Confidence:
medium. Implication: leave `codegen-units` alone in CI, and override
`codegen-units = 1` from release profiles in pull request builds.

### Fat LTO costs 0 to 15%, with bad days at 40%; thin LTO is free

| cargo time | Linux | Windows | macOS | binary (Linux / Windows / macOS) |
|---|---:|---:|---:|---|
| `lto = "off"` | 3m25s (-8%) | 4m44s (-21%) | 3m21s (-2%) | 11.3 / 10.4 / 7.7 MB |
| default (`false`, thin-local) | 3m43s | 5m59s | 3m25s | 10.3 / 10.4 / 7.2 MB |
| `lto = "thin"` | 3m37s (-3%) | 6m02s (+1%) | 3m25s (0%) | 10.2 / 10.6 / 7.5 MB |
| `lto = "fat"` | 4m44s (+27%) | 5m46s (-4%) | 4m56s (+44%) | 8.6 / 9.8 / 6.1 MB |

Thin LTO lands on the default everywhere and buys nothing in size either.
Fat LTO takes 15 to 20% off the binary, and its compile cost turned out
smaller and less stable than this first batch suggested. The rerun with an
in-batch reference (batch `20260912-140937`, 3 samples) put it at +7% on
Linux, +1% on macOS and -8% on Windows; pooled over both batches it is
+14 / -2 / +12%. The macOS samples split by batch, 4m49s to 5m02s in the
first and 3m26s to 3m50s in the second against a reference of 2m24s to
3m39s, so the +44% was one day's runners. Windows never showed a fat LTO
cost, which matches the monorepo result, where Windows paid for
`codegen-units = 1` and Linux paid for neither. `lto = "off"` was a real
win only on Windows, 1m15s outside the spread. Confidence: medium, the
samples overlap; the safe claim is that fat LTO costs far less than
`codegen-units = 1` and buys about the same binary size.

### `opt-level` barely moves compile time

| cargo time | Linux | Windows | macOS |
|---|---:|---:|---:|
| `opt-level = 1` | 3m26s (-8%) | 5m53s (-2%) | 3m34s (+4%) |
| `opt-level = "s"` | 3m38s (-2%) | 5m30s (-8%) | 2m25s (-29%) |
| `--profile fast` (`opt-level = 1`, 256 units, no LTO) | 3m17s (-12%) | 5m25s (-9%) | 2m36s (-24%) |

A Tauri build spends its time in dependency front-ends, monomorphization
and linking, not in the optimiser, so dropping the optimisation level does
little on its own. The macOS numbers are inside a 2m08s to 3m04s spread.
Confidence: medium (Linux, Windows), low (macOS).

The `fast` profile as a whole is a different matter: the rerun with an
in-batch reference gave -21 / -28 / -20% and the pooled 5 samples
-18 / -23 / -19%, consistent on all three runners. It is the combination
that pays, `lto = "off"` most of all on Windows. The price is the binary:
14.3 MB against 10.3 on Linux and 11.4 against 7.2 on macOS, unchanged on
Windows. Confidence: high (batches `20260911-000401`, `20260912-140937`).

Implication: a "fast" CI profile is worth about 20% of cargo time, for a
binary 40 to 60% larger on Linux and macOS. Caching and skipping bundlers
are worth 50 to 70%. Add it after those, for pull request builds only.

### `panic = "abort"` halves the Windows binary

Cargo -4% on Linux, -10% on Windows, -9% on macOS: inside the spread. The
binary went from 10.3 to 7.6 MB on Linux, 10.4 to 4.9 MB on Windows, 7.2
to 5.0 MB on macOS. Confidence: high for size, low for time. Cheapest size
win on the list, if the app doesn't catch panics.

### Incremental release builds cost 7 to 8% cold

`CARGO_INCREMENTAL=1` on the release profile: +8% on Linux, +7% on Windows,
inside the spread on macOS, plus a larger `target/` to cache. It only pays
on a second build of the same `target/`; see In-job rebuilds for what it
buys there. Confidence: medium.

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
The per-flag numbers under Release profile say the cost is
`codegen-units = 1`; fat LTO on its own is small and inconsistent.

### A warm cache works the same in a monorepo, with one trap

Warm run after the app-crate change, cargo time, median of 2, default
profile:

| | Linux | Windows | macOS |
|---|---:|---:|---:|
| no cache | 5m35s | 7m06s | 4m53s |
| `rust-cache` defaults | 1m13s | 2m34s* | 1m45s |
| `rust-cache`, `cache-workspace-crates: true` | 0m57s | 2m53s | 1m17s |
| plain `actions/cache` | 1m03s | 2m50s | 1m10s |
| `rust-cache` + `sccache` | 1m32s | 3m32s | 1m15s |
| `sccache` only, partial cache | 3m21s | 7m05s | 2m33s |

*Measured in a 4-job rerun (batch `20260910-214104-warm-app`) after the
rate limit dropped the first cold save, see the rate limit entry. Whole
`tauri build` wall time with a restored `target/` was 2m39s to 3m16s on
Linux, 2m59s to 4m11s on Windows,
1m24s to 2m02s on macOS, against 6m46s to 7m25s, 7m02s to 7m38s, and 4m06s
to 5m11s uncached. Confidence: medium.

### `rust-cache` dropping the workspace crates costs 15 to 30 s here

With its defaults `rust-cache` deletes the 16 plugins from `target/` before
saving, and the warm run recompiles them: cargo took 1m13s against 0m57s on
Linux and 1m45s against 1m17s on macOS with `cache-workspace-crates: true`.
On Windows the defaults came out 19 s faster (2m34s against 2m53s), which
is the runner's spread, not a gain. Real, but small: the plugins are thin
crates, and the expensive part of a Tauri build, the monomorphized runtime,
sits in the app crate, which recompiles anyway. Plain `actions/cache` keeps
the plugins too and landed within the spread of the `cache-workspace-crates`
setting. Adding `sccache` on top didn't help, as on the bench app.
Confidence: medium (the Windows cell comes from a separate 4-job batch).

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

- `toolchain` and `combo` groups.
- The `deps` scenario on the workspace app.
- Where the cache API rate limit starts for `sccache`: a batch with 3 to 6
  concurrent jobs.
- Larger runners, prebuilt containers, cross-compilation.
