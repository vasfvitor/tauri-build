# Experiment catalogue

Each section lists the variants in `experiments/matrix.json`, what they
change, when the option is applicable, and what to expect. "Expected" is a
hypothesis to confirm or refute with the reports in `results/`.

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
Warm run drops the cargo step to under a minute when only app code changed.
Plain `actions/cache` saves more data than `rust-cache` (no pruning) and hits
the 10 GB repository cache limit faster. `sccache` alone is slower than
`rust-cache` warm, because linking and the final crate still run, but it
degrades gracefully when the lockfile changes. Note the `CARGO_INCREMENTAL=0`
requirement with `sccache`.

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

## Group `profile`

All of these set `CARGO_PROFILE_RELEASE_*` environment variables, so the
source tree stays identical and caches remain comparable. Builds run with
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

## Group `deps`

| Name | Change |
|---|---|
| `deps-heavy` | Enables the `heavy` feature: `reqwest` (rustls) + `tokio`. |
| `deps-heavy-cached` | Same, with `rust-cache`, to see whether caching erases the cost. |

**What it shows:** how much a typical dependency addition costs cold, and
that a warm cache makes dependency weight almost irrelevant. The lesson for
the guide: dependency pruning matters only for uncached builds.

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

## Not covered yet

Ideas for a second round, each needs a new workflow input:

- **Larger runners** (`ubuntu-latest-8-cores`): compile time scales with cores until linking. Paid.
- **Prebuilt container image** with the Linux system deps and toolchain: removes stages 1 and 2 entirely.
- **Cross-compiling** macOS `aarch64` from `x86_64` and vice versa with `--target`, instead of two runners.
- **`cargo-zigbuild`** or **`cargo-xwin`** to build Windows from Linux.
- **Splitting** the frontend build into its own job and passing `dist/` as an artifact.
- **Dependency audit** with `cargo tree -d` and `cargo bloat --time` to find duplicate crate versions.
