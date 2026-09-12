# Experiment catalogue

Each section lists the variants in `experiments/matrix.json`, what they
change, when the option is applicable, and what to expect. "Expected" is a
hypothesis to confirm or refute with the reports in `results/`.

## Methodology

- **Runners.** Standard GitHub-hosted runners. Public repositories get 4-core
  Linux and Windows runners; private ones get 2 cores. The report prints the
  core count per runner, taken from the job itself. Don't mix numbers from
  the two.
- **Repetitions.** `scripts/run.sh --repeat 3` runs every job three times in
  the same workflow run. The report shows the median and the min..max spread.
  Runner variance is 15 to 20% between identical cold builds, so a single
  sample can't support a claim below that.
- **Change scenarios.** A cache is only as good as what changed since it was
  saved. `--change` selects what the job modifies before building:
  `none` (nothing, a docs-only commit), `app` (one function appended to
  `lib.rs`, a normal commit), `deps` (`cargo add chrono`, the lockfile
  changes). `--twice --change app` runs cold, then warm with the change.
  The scenario is recorded in every timing JSON.
- **What is measured.** `tauri build` is the wall time of the whole command.
  `cargo` is cargo's own total from `--timings`. `frontend` is a separate
  timed `pnpm build` before the Tauri build. `bundling` is the remainder and
  includes the overhead of the Tauri command-line tool.
- **App size.** The app crate of this benchmark compiles in about 50 s on 8
  cores because of Tauri's monomorphization, independent of app code. The
  `big` feature adds 150 generated modules (+50%) so profile knobs, which
  mostly act on the app crate, have something to act on. Profile experiments
  use it and compare against `baseline-big`.
- **Two apps.** The benchmark app in `app/` is small on purpose, so every
  knob is measured on the same code. The `workspace` group builds the `api`
  example of `tauri-apps/plugins-workspace` instead, pinned to one commit: a
  real app with 16 plugins that live as path crates in the same Cargo
  workspace, 434 crates in the Linux dependency graph, a Svelte frontend, and
  a size-optimised release profile. It exists to check that the findings
  survive contact with a monorepo, where the tools behave differently.
- **Isolation.** Each experiment has its own `rust-cache` key, `actions/cache`
  key and `sccache` namespace (`SCCACHE_GHA_VERSION`), so variants don't feed
  each other's caches. Every batch also mixes a salt (the run tag) into those
  keys, so the first run of a batch is cold even if an earlier batch left
  caches behind. `--twice` reuses the salt for its second run. Caches from
  the private-repo pilot leaked into the first public batch this way; that
  batch is kept only for its warm numbers.

## Where the time goes

The build time of a Tauri app in CI splits into five parts. Knowing which part
an option touches tells you whether it can help at all:

1. **System dependencies** (Linux only): `apt-get install libwebkit2gtk…`, 30 to 90 s.
2. **Toolchain setup** for Rust, Node, pnpm, and their caches, 10 to 60 s.
3. **Frontend build**, `pnpm install` plus Vite. Seconds for this app, minutes for a large SPA.
4. **Cargo build**: compiling several hundred crates. The dominant cost, 4 to 12 min cold.
5. **Bundling**: `.deb`/AppImage/`.dmg`/NSIS. AppImage and DMG are the slow ones.

## Group `baseline`

| Name | Change |
|---|---|
| `baseline` | No cache, default release profile, default linker, all bundles. |

The reference point for every delta in the report. Run it on all three
runners at least twice to learn the natural variance.

## Group `cache`

| Name | Change |
|---|---|
| `cache-swatinem` | `Swatinem/rust-cache`: caches `~/.cargo` registry and `target/`, keyed by the lockfile. Prunes unused artifacts before saving. |
| `cache-sccache` | `sccache` with the GitHub Actions cache backend. Caches individual compiled crates by hash; works across branches and jobs. |
| `cache-both` | Both. `rust-cache` restores `target/`, `sccache` fills the gaps. |
| `cache-actions-cargo` | Plain `actions/cache` on `~/.cargo` and `target/`. What most hand-written workflows do. |

**When it applies:** always. Caching is the single largest win and is the
first thing to add.

**Expected:** cold run equals baseline plus 10 to 30 s to save the cache.
Warm run with `--change app` drops cargo to roughly the app crate compile
plus linking. Plain `actions/cache` saves more data than `rust-cache` (no
pruning) and hits the 10 GB repository cache limit faster. `sccache` alone is
slower than `rust-cache` warm, because linking and the final crate still run,
but it should win with `--change deps`, where lockfile-keyed caches miss.
Note the `CARGO_INCREMENTAL=0` requirement with `sccache`.

**Pilot result (2026-09-10, private repo, 2 cores, `--change none`):**
`rust-cache` + `sccache` looked 3x better than `rust-cache` alone, but only
because nothing had changed and `sccache` served the app crate itself from
cache. With a real commit that crate always recompiles, so the pilot number
is an artifact. The honest warm figure was `rust-cache` alone, with cargo at
75 s on Linux, 160 s on Windows and 58 s on macOS, all of it the app crate.
`sccache` alone was the worst warm option on Linux at 190 s of cargo.

**Measured** (batches `20260910-165048-warm-app`, `20260910-170743`,
`20260912-130914` and `20260912-130914-warm-deps`): a warm `rust-cache` or
`actions/cache` cuts a normal commit by 55 to 65% and costs nothing to
populate. A new dependency costs the same as an app change: the restore keys
fall back to the previous entry and cargo only compiles the new crates. The
`--change deps` expectation for `sccache` did not hold, a crate compiled for
the first time is in no cache, and on top of `rust-cache` it hit 0 of its
requests. Alone it stays the worst option, and in a matrix of 24 or more
jobs the cache API rate limit drops most of its writes.

**Caveats:** caches are per-branch with fallback to the default branch, so
PR builds only benefit if `main` has a cache. The `key` input in the workflow
namespaces the cache per experiment so variants don't overwrite each other.

## Group `linker`

| Name | Change |
|---|---|
| `linker-lld` | LLVM `lld` through `clang` on Linux; `rust-lld` on Windows. |
| `linker-mold` | `mold` on Linux through `clang`, installed by `rui314/setup-mold`. |

**When it applies:** any target where the default linker is GNU `ld`
(Linux) or MSVC `link.exe` (Windows). macOS already uses Apple's fast
`ld-prime`, so it's skipped there.

**Expected:** linking a Tauri binary takes 5 to 20 s with GNU `ld` and 1 to 3 s
with `lld` or `mold`. On a cold build that's a rounding error. On warm
incremental builds it can be a third of the total. Since Rust 1.90 `lld` is the
default on `x86_64-unknown-linux-gnu`, so this experiment may show no delta on a
current stable toolchain. Check the `rustc` version in the job log.

**Measured** (batches `20260911-012718` and `20260911-014047`, Rust 1.98.1):
nothing, cold or on an in-job rebuild. `lld` and `mold` landed on the
default on Linux, `rust-lld` was no faster than MSVC `link.exe` on Windows.
See the findings ledger.

## Group `profile`

All of these set `CARGO_PROFILE_RELEASE_*` environment variables, so the
source tree stays identical and caches remain comparable. They build with
the `big` feature and compare against `baseline-big`. Builds run with
`--locked` once `Cargo.lock` is committed, so dependency versions can't
drift between variants either.

| Name | Change | Applies when | Expected |
|---|---|---|---|
| `lto-off` | `lto = "off"` (no LTO at all, not even the default local thin-local). | You want the fastest link. | Slightly faster than default, larger binary. |
| `lto-thin` | `lto = "thin"` | Release builds that want most of the LTO benefit. | 10 to 30 % more time than `off`, binary 5 to 15 % smaller. |
| `lto-fat` | `lto = "fat"` | Final release artifacts, size-critical. | 1.5 to 3 × the compile time of the last crate; single-threaded. |
| `cgu-1` | `codegen-units = 1` | Best runtime performance and size. | Much slower: the app crate compiles on one core. |
| `cgu-256` | `codegen-units = 256` | Fast CI builds where runtime speed doesn't matter. | Faster app crate compile; little change for dependencies. |
| `opt-1` | `opt-level = 1` | Smoke builds, PR checks. | Noticeably faster codegen. |
| `opt-s` | `opt-level = "s"` | Size-critical apps. | Similar to `opt-level = 2`. |
| `profile-fast` | `--profile fast` from `Cargo.toml`: `opt-level = 1`, 256 CGUs, no LTO. | PR builds where you only need to know that it compiles and runs. | The fastest full build without touching caches. |
| `panic-abort` | `panic = "abort"` | Apps that don't catch panics. | Small compile-time and size win, less unwinding code. |
| `incremental-on` | `CARGO_INCREMENTAL=1` for release, with `rust-cache`. Needs `--runs 2` to show anything. | Repeated warm builds. | Faster build #2; larger cache. Useless without a cache. |

The bundle size column in the report shows the trade-off each option makes.

**Measured** (batches `20260911-000401` and `20260912-140937`, the second
with an in-batch reference and 3 samples per cell): `codegen-units = 1` is
the one expensive flag (+26 / +33 / +54% cargo time pooled). Fat LTO came
out at +7 / -8 / +1% in the rerun and +14 / -2 / +12% pooled, far below the
first batch's +27 to +44%, for a binary 15 to 20% smaller. The `fast`
profile is worth about 20% on every runner (-18 / -23 / -19% pooled) for a
binary 40 to 60% larger on Linux and macOS. Thin LTO is free,
`codegen-units = 256` is slower, not faster, and `opt-level` alone barely
moves the needle. `panic = "abort"` halves the Windows binary. With `--runs 2` (batch `20260911-014047`) incremental
compilation took the second build's cargo step from 43 to 94 s down to 3 to
8 s, best case (a comment change). See the findings ledger.

## Group `bundle`

| Name | Change |
|---|---|
| `bundle-none` | `--no-bundle`: compile only. |
| `bundle-deb` | Linux: only `.deb`. Skips AppImage, which downloads `linuxdeploy` and repacks the whole runtime. |
| `bundle-app` | macOS: only `.app`. Skips the DMG creation. |
| `bundle-nsis` | Windows: only NSIS, skips WiX/MSI. |

**When it applies:** any workflow that isn't the release workflow. PR checks
rarely need installers.

**Expected:** the AppImage is the slowest bundler on Linux by far, DMG on macOS
adds 20 to 60 s, MSI (WiX) is slow on Windows. `--no-bundle` removes the
whole stage.

**Pilot result:** frontend plus bundling was stable per platform regardless
of cache: 85 to 112 s on Linux, 21 to 39 s on Windows, 9 to 14 s on macOS.
On a warm Linux build that is more than the cargo step, so this group is the
second most valuable after caching.

**Measured** (batch `20260910-235250`): `--bundles deb` or `--no-bundle`
removes 1m14s from a Linux build; NSIS-only saves 6 s on Windows and
`.app`-only 10 s on macOS. See the findings ledger.

## Group `deps`

| Name | Change |
|---|---|
| `deps-heavy` | Enables the `heavy` feature: `reqwest` (rustls) + `tokio`. |
| `deps-heavy-cached` | Same, with `rust-cache`, to see whether caching erases the cost. |

**What it shows:** how much a typical dependency addition costs cold, and
that a warm cache makes dependency weight almost irrelevant. The lesson for
the guide: dependency pruning matters only for uncached builds.

**Measured** (batches `20260912-142710` and `20260912-142710-warm-app`):
`reqwest` + `tokio` add 29 crates and 12% compiler CPU but no wall time on
the 4-core Linux and Windows runners (3m38s and 4m57s cargo against 3m43s
and 5m05s), because they compile next to the critical path, not on it. Warm
with `rust-cache` the cargo step is the same 41 s to 2m17s floor as the
trivial app, a 53 to 62% cut of the whole build. Binary 10.2 to 12.9 MB.

## Group `frontend`

| Name | Change |
|---|---|
| `frontend-no-cache` | Disables the pnpm store cache in `setup-node`. |

**Expected:** a few seconds for this app. Mentioned so the guide can say
that the frontend is rarely the bottleneck, unless the app is large.

## Group `toolchain`

| Name | Change |
|---|---|
| `nightly-threads` | Nightly with `-Zthreads=8`, the parallel front end. |

**When it applies:** only if you accept nightly. Not for production builds.

**Expected:** 10 to 25 % faster on the app crate and large dependencies.
May be unstable; if it fails, that's a result too.

## Group `combo`

| Name | Change |
|---|---|
| `combo-fastest` | `rust-cache` + `lld` + 256 CGUs + no LTO + no bundle. The "PR check" preset. |
| `combo-fastest-mac` | Same without the linker change. |
| `combo-release` | `rust-cache` + `sccache` + `lld` + thin LTO. The "release" preset. |

These are the recommended presets the tutorial ends with, so they need
to be validated together, not only individually.

## Group `workspace`

Builds the `api` example of `tauri-apps/plugins-workspace` (input
`app: plugins-api`). The example depends on 16 plugins through `path`
dependencies, so they're workspace members, not registry crates. That's the
shape of most monorepos and of any app that vendors a plugin.

| Name | Change |
|---|---|
| `pw-baseline` | The example as upstream builds it: `lto = true`, `codegen-units = 1`, `opt-level = "s"`, `panic = "abort"`. No cache. |
| `pw-profile-default` | Same, with cargo's default release profile (no LTO, 16 CGUs, `opt-level = 3`). The reference for the cache variants. |
| `pw-cache-swatinem` | `rust-cache` with the defaults. |
| `pw-cache-swatinem-ws` | `rust-cache` with `cache-workspace-crates: true`. |
| `pw-cache-sccache` | `sccache` only. |
| `pw-cache-both` | `rust-cache` + `sccache`. |
| `pw-cache-actions-cargo` | Plain `actions/cache`. |

**Why it's different:** `rust-cache` deletes every workspace crate from
`target/` before saving, because it assumes they're the code under test.
In a monorepo that's the 16 plugins, rebuilt on every warm run even though
they didn't change. `cache-workspace-crates: true` keeps them; `sccache`
caches them by content hash and doesn't care where they live; plain
`actions/cache` keeps everything but cargo still rebuilds a path crate when
its mtime changed, which a fresh checkout guarantees.

**Expected:** `pw-cache-swatinem` warm after `--change app` is well past
the bench app's floor, because the plugins recompile. `pw-cache-swatinem-ws`
and `pw-cache-both` should close that gap. The `pw-baseline` vs
`pw-profile-default` pair shows what the size-optimised profile costs: fat
LTO with one codegen unit serialises the last step of the build.

**Caveats:** the plugins' JS packages have to be built first
(`pnpm --filter 'api^...' build`, 20 to 30 s on a runner). That time is
recorded as `js_packages` and counts in the job total, not in `frontend`,
because `tauri build` reruns only the Vite build. The workspace
pins pnpm 12.3.4, and the job uses that version for this app. The pin is the
commit in `build.yml`; bump it deliberately and rerun the group.

Every experiment and repetition gets its own cache key (the `-r<rep>`
suffix). Two Windows repeats of `pw-cache-swatinem` once tried to save the
same key in the same second, GitHub answered both with a rate limit, and the
warm run had nothing to restore. The same rate limit truncates the
per-object writes of `sccache` when many jobs run at once, so `--repeat`
and a full-matrix batch make the `sccache` rows pessimistic. The findings
ledger has the counts.

## Not covered yet

Ideas for a second round, each needs a new workflow input:

- **Larger runners** (`ubuntu-latest-8-cores`): compile time scales with cores until linking. Paid.
- **Prebuilt container image** with the Linux system deps and toolchain: removes stages 1 and 2 entirely.
- **Cross-compiling** macOS `aarch64` from `x86_64` and vice versa with `--target`, instead of two runners.
- **`cargo-zigbuild`** or **`cargo-xwin`** to build Windows from Linux.
- **Splitting** the frontend build into its own job and passing `dist/` as an artifact.
- **Dependency audit** with `cargo tree -d` and `cargo bloat --time` to find duplicate crate versions.
