# Speed up Tauri builds on GitHub Actions

> Draft for the Tauri docs. Every number comes from repeated builds on
> GitHub-hosted runners; the ledger behind each claim, with sample counts,
> spreads, and limits, is in `docs/findings.md` of the benchmark
> repository.[^data] The guide states what works, what doesn't, and where
> each option stops applying; the repository is a footnote, not the subject.

A release build of a Tauri app compiles several hundred Rust crates, builds
a frontend, and produces installers. On a stock GitHub-hosted runner of a
public repository that takes 3 to 5.5 minutes per platform for a small
app, and 7 to 9 minutes for a real one. This guide shows which settings
shorten that, by how much, and when each one applies.

The numbers are medians of 2 to 6 builds of a small app with three plugins
and a trivial frontend, on `ubuntu-24.04` and `windows-2022` with 4 cores
and `macos-14` with 3, plus one pass over a real monorepo app (the `api`
example of `tauri-apps/plugins-workspace`, 16 plugins, 434 crates). Runner
variance is 5 to 30% between identical builds, up to 40% on macOS, so treat
any difference under 10% as noise. Private repositories get 2-core Linux
and Windows runners, which take about 1.8x longer; the ratios between
options transfer better than the absolute times.

## Where the time goes

A cold build on 4 cores, no cache, all bundlers on:

| Stage | Linux | Windows | macOS |
|---|---:|---:|---:|
| System dependencies (`apt`, WebKitGTK) | 33 s | 0 | 0 |
| `pnpm install` | 2 s | 10 s | 3 s |
| Frontend build | 2 s | 3 s | 2 s |
| Cargo | 3m43s | 5m05s | 2m50s |
| Bundling | 1m18s | 17 s | 12 s |
| **`tauri build` total** | **5m03s** | **5m25s** | **3m04s** |

Two things stand out. Cargo is the bulk everywhere, and on Linux the
bundlers cost a quarter of the build. The frontend of the benchmark app is
trivial; a large single-page app moves that line into minutes, and nothing
in this guide helps with it.

Inside the cargo step, one crate dominates: your own app crate. Tauri's
generic runtime is monomorphized into it, so even a tiny app spends 40 to
55 s on Linux and 70 to 110 s on Windows compiling and linking that one
crate, on top of the dependencies. That crate recompiles whenever a line of
your code changes, and it is the floor under every warm build below.

## Step 1: cache the Rust build

This is the change that matters most. Everything else is a refinement.

```yaml
- uses: Swatinem/rust-cache@v2
  with:
    workspaces: src-tauri -> target
```

Measured on the small app, wall time of `tauri build`:

| | Cold, saving the cache | Warm, app code changed | Warm, dependency added |
|---|---:|---:|---:|
| No cache | 5m03s / 5m25s / 3m04s | same as cold | same as cold |
| `rust-cache` | 4m31s / 4m55s / 3m02s | 2m17s / 2m06s / 1m17s | 1m58s / 2m23s / 1m34s |
| Plain `actions/cache` | 4m50s / 5m59s / 3m42s | 2m07s / 2m25s / 1m14s | 2m11s / 2m26s / 1m17s |

Columns are Linux / Windows / macOS. Three conclusions:

- **A warm cache cuts a normal commit by 55 to 65%.** What remains is the
  app crate plus linking: 45 to 58 s of cargo on Linux, 1m45s to 2m08s on
  Windows, 1m03s to 1m17s on macOS.
- **Populating the cache is free.** The cold builds that also saved a cache
  landed within the spread of the uncached baseline; the upload happens in
  a post step outside the build.
- **A new dependency costs the same as an app change.** The cache key
  includes the lockfile, but both actions fall back to the previous entry
  through their restore keys, and cargo's per-crate fingerprints keep
  everything that didn't change. Adding `chrono` cost 3 s on Linux and 15 s
  on Windows on top of the usual app crate.

`rust-cache` and plain `actions/cache` are equivalent on time. The
difference is hygiene: `rust-cache` prunes artifacts the build didn't use
and drops the crates of the workspace itself before saving, so its entries stay
small; `actions/cache` stores everything and hits the 10 GB repository
limit sooner.

Caches are scoped to the branch, with fallback to the default branch. Make
sure the default branch builds on push, or pull requests never get a hit.

### Don't reach for `sccache`

`sccache` with the GitHub Actions backend caches individual compiled
objects instead of the `target/` directory. It sounds like it should win
whenever the lockfile changes. Measured, it doesn't:

| Warm, app code changed | Linux | Windows | macOS |
|---|---:|---:|---:|
| `rust-cache` | 2m17s | 2m06s | 1m17s |
| `sccache` alone | 3m55s | 4m22s | 1m38s |
| `rust-cache` + `sccache` | 2m05s | 2m29s | 1m30s |

- Alone, it is the worst warm option: with no `target/` restored every
  crate still has to be linked and the app crate compiled, and the cache
  only skips codegen of unchanged crates.
- On top of `rust-cache` it does nothing on a normal commit, because the
  one crate that recompiles is yours and its hash is new. On a new
  dependency it does nothing either: a crate compiled for the first time is
  in no cache. Across 24 such jobs it served 0 of its requests.
- Its one apparent win, a 3x faster build when nothing changed at all, is
  an artifact: it served the app crate itself from cache. No real commit
  looks like that.
- The GitHub Actions cache API rate-limits the repository, and `sccache`
  makes one request per object. In matrices of 24, 30, and 42 parallel
  jobs it lost 34 to 100% of its writes on every platform. It reports the
  loss only as `Cache write errors` in `sccache --show-stats`; the job
  succeeds and the cache is quietly partial.

The scenarios where `sccache` would earn its place, a missing `target/`
cache with objects compiled before, or a workflow with a handful of
concurrent jobs, are not the normal pull request.

### In a Cargo workspace, keep the workspace crates

`rust-cache` deletes the crates of the workspace itself from `target/` before
saving, on the theory that they change every commit. In a monorepo with
many path-dependency crates they don't, and the warm build recompiles them:
16 plugins cost 15 to 30 s per build on the monorepo app. Keep them:

```yaml
- uses: Swatinem/rust-cache@v2
  with:
    workspaces: src-tauri -> target
    cache-workspace-crates: true
```

With that, the monorepo's warm cargo step was 57 s on Linux, 2m53s on
Windows and 1m17s on macOS against 5m35s, 7m06s, and 4m53s uncached. The
warm floor grows slowly with the app: 434 crates and 16 plugins added 10 to
45 s over the trivial app.

## Step 2: don't bundle what you don't ship

For pull request checks, skip the installers:

```bash
tauri build --no-bundle
```

Or keep one bundle type when a test needs an installable package:

```bash
tauri build --bundles deb    # Linux
tauri build --bundles app    # macOS
tauri build --bundles nsis   # Windows
```

| Bundling stage | All bundles | One bundle | `--no-bundle` |
|---|---:|---:|---:|
| Linux (deb, rpm, AppImage) | 1m18s, 339 MB | 4 s, 18 MB (deb) | 2 s |
| Windows (NSIS, MSI) | 17 s | 11 s (NSIS) | 6 s |
| macOS (`.app`, DMG) | 12 s | 2 s (`.app`) | 2 s |

On Linux this is worth more than any cache on a warm build: the AppImage
and rpm take 1m14s and produce 339 MB, while the warm compile takes 45 s.
On a cold build it is about 30% of the total. Windows and macOS bundlers
are cheap. Drop the DMG from pull request builds anyway: `hdiutil` fails
intermittently on GitHub runners (1 job in 24 during this work), and it is
the only bundler that did.

Leave AppImage, rpm, DMG, and MSI to the release workflow.

## Step 3: a profile for CI checks

Release settings optimise the binary, not the build. Tauri's `--profile`
passthrough lets you use another profile for anything that isn't a
release:

```toml
[profile.fast]
inherits = "release"
opt-level = 1
codegen-units = 256
lto = "off"
```

```bash
tauri build --no-bundle -- --profile fast
```

Measured on a larger variant of the app (150 extra modules, so the profile
has something to act on), cold, cargo time and binary size, Linux /
Windows / macOS:

| Profile knob | Cargo time | Binary | Verdict |
|---|---:|---:|---|
| default release (`opt-level = 3`, 16 units, thin-local LTO) | 3m51s / 6m08s / 3m25s | 10.3 / 10.4 / 7.2 MB | the reference |
| `profile.fast` | -18% / -23% / -19% | 14.3 / 10.3 / 11.4 MB | use for checks |
| `lto = "off"` | -8% / -21% / -2% | 11.3 / 10.4 / 7.7 MB | most of the `fast` win on Windows |
| `opt-level = 1` | -8% / -2% / +4% | | little on its own |
| `lto = "thin"` | -3% / +1% / 0% | 10.2 / 10.6 / 7.5 MB | free, and buys nothing |
| `lto = "fat"` | +14% / -2% / +12% | 8.6 / 9.8 / 6.1 MB | fine for releases |
| `codegen-units = 1` | +26% / +33% / +54% | 8.6 / 9.4 / 5.9 MB | the expensive one |
| `codegen-units = 256` | +22% / +9% / -6% | | slower, not faster |
| `panic = "abort"` | within noise | 7.6 / 4.9 / 5.0 MB | cheapest size win |

What this says:

- **A `fast` profile is worth about 20%** of the cargo step, consistently
  on all three platforms, for a binary 40 to 60% larger on Linux and macOS.
  It is the combination that pays; `opt-level` alone barely moves the
  needle, because a Tauri build spends its time in dependency front-ends,
  monomorphization and linking, not in the optimiser.
- **`codegen-units = 1` is the one expensive release flag.** It serialises
  the app crate, the one with the monomorphized runtime, onto a single
  core. Fat LTO costs far less than its reputation, 0 to 15% here with a
  bad day at 40%, and buys about the same 15 to 20% off the binary.
- **`codegen-units = 256` does not speed anything up** on 4 cores; there is
  no parallelism left to buy past 16 units.
- **`panic = "abort"` halves the Windows binary** at no measurable cost, if
  the app doesn't catch panics.

If your release profile sets `codegen-units = 1` and `lto = true`, which
the plugins-workspace example does, override it for pull request builds
instead of maintaining a second profile:

```yaml
env:
  CARGO_PROFILE_RELEASE_LTO: "false"
  CARGO_PROFILE_RELEASE_CODEGEN_UNITS: "16"
```

On the monorepo app that size profile cost 30% on Windows (9m14s against
7m02s) and halved the binary; keep it for releases.

## Step 4: incremental compilation, only where `target/` survives

`rust-cache` sets `CARGO_INCREMENTAL=0`, and for a workflow that builds
once from a restored cache that is right: incremental release builds cost
7 to 8% cold and produce a larger `target/` to upload. The picture flips
when the same `target/` sees a second build:

| Second build in the same job, cargo | Linux | Windows | macOS |
|---|---:|---:|---:|
| release, not incremental | 43 s | 91 to 94 s | 43 to 58 s |
| `CARGO_INCREMENTAL=1` | 3 to 4 s | 5 to 6 s | 6 to 8 s |

That is the best case, a comment-only change; a real edit recompiles the
codegen units it touches. Turn it on where a job builds the same crate
more than once, or on a self-hosted runner that keeps `target/` between
jobs. Leave it off in a plain pull request workflow.

## What didn't help

- **Swapping the linker.** Since Rust 1.90 the stable toolchain links
  `x86_64-unknown-linux-gnu` with its bundled `rust-lld`, so `lld` and
  `mold` compete with `lld`, not with GNU `ld`, and land on it: the app
  crate's compile-plus-link unit was 40 to 54 s with the default, 44 to
  48 s with `lld`, 41 to 43 s with `mold`. The in-job rebuild didn't move
  either, which means the rebuild floor is codegen, not linking. On
  Windows, `rust-lld` was no faster than `link.exe`. On a toolchain older
  than 1.90, or a target that still defaults to GNU `ld`, the folklore of
  5 to 20 s still applies. macOS already ships a fast linker.
- **Trimming dependencies for CI time.** Adding `reqwest` with `rustls` and
  `tokio`, 29 crates and 12% more compiler CPU, changed the cold build by
  nothing on 4 cores (3m38s against 3m43s on Linux, 4m57s against 5m05s on
  Windows): the new crates compile next to the critical path, `syn`, `gtk`,
  `tauri-utils`, `tauri`, then your crate, not on it. Warm, they cost
  nothing at all. Prune dependencies for binary size and for 2-core
  runners, not for CI minutes.
- **`sccache`** on the GitHub Actions backend, for the reasons in step 1.
- **`opt-level` on its own**, `lto = "thin"`, and `codegen-units = 256`.

## Reliability, while you are in the workflow

Three failures happened during this work that had nothing to do with the
compiler, and each one costs a whole job:

- The DMG bundler failed once in 24 macOS jobs after a successful compile.
  Retry the bundle step, or build the DMG in its own job.
- A frontend build that fetches at build time (an UnoCSS web fonts preset
  pulling Google Fonts) timed out on Windows. Vendor build-time downloads
  or turn them off in CI.
- An artifact upload timed out after a good build. Retry the upload step,
  not the build.

## Measure your own app

Add `--timings` to see which crates sit on the critical path:

```bash
tauri build -- --timings
```

Upload `target/cargo-timings/cargo-timing.html` as an artifact and open it.
The wide bar at the end is your app crate; anything to its left on the
critical path is what a dependency change can shorten, and anything
compiling in parallel below it is free.

## Recommended presets

**Pull request check.** Cache, no bundlers, fast profile. Each part is
measured earlier; together they take a Linux check from 5 minutes cold to
roughly a minute of compile plus setup on a warm cache:

```yaml
- uses: Swatinem/rust-cache@v2
  with:
    workspaces: src-tauri -> target
    cache-workspace-crates: true   # if you have workspace crates
- run: pnpm tauri build --no-bundle -- --profile fast
```

**Release.** Same cache, the release profile as shipped, all bundlers,
with retries on the bundle and upload steps:

```yaml
- uses: Swatinem/rust-cache@v2
  with:
    workspaces: src-tauri -> target
- run: pnpm tauri build
```

Fat LTO and `panic = "abort"` are the cheap size wins if you want them;
`codegen-units = 1` is the expensive one, and worth it only if you have
measured the runtime difference.

[^data]: Raw timing records, the workflows that produced them, and the
    reasoning and confidence behind each claim are in the benchmark
    repository `[repository link]`, in `results/` and `docs/findings.md`.
