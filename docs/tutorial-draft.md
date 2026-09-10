# Speed up Tauri builds on GitHub Actions

> Draft for the Tauri docs. Numbers in `[brackets]` are placeholders to fill
> from `results/`. Keep the structure, replace the guesses.

A release build of a Tauri app compiles several hundred Rust crates, bundles
a frontend, and produces installers. On a stock GitHub-hosted runner that
takes `[N]` minutes per platform. This guide shows which settings shorten
that, how much each one helps, and when to use it.

All numbers come from a small app with three plugins built on
`ubuntu-24.04`, `windows-2022` and `macos-14`. The repository with the
harness is at `[link]`. Your app is bigger; the ratios transfer better than
the absolute times.

## Where the time goes

| Stage | Linux | Windows | macOS | Notes |
|---|---:|---:|---:|---|
| System dependencies | `[s]` | 0 | 0 | WebKitGTK and friends |
| Toolchain and caches | `[s]` | `[s]` | `[s]` | |
| Frontend | `[s]` | `[s]` | `[s]` | Tiny here; can be minutes for a large SPA |
| Cargo build (cold) | `[s]` | `[s]` | `[s]` | The bulk |
| Bundling | `[s]` | `[s]` | `[s]` | AppImage and DMG are the slow ones |

## Step 1: cache the Rust build

This is the change that matters most. Everything else is a refinement.

```yaml
- uses: Swatinem/rust-cache@v2
  with:
    workspaces: src-tauri -> target
```

| | Cold | Warm (app code changed) | Warm (nothing changed) |
|---|---:|---:|---:|
| No cache | `[s]` | `[s]` | `[s]` |
| `rust-cache` | `[s]` | `[s]` | `[s]` |
| `sccache` | `[s]` | `[s]` | `[s]` |
| Both | `[s]` | `[s]` | `[s]` |

When to pick which:

- `rust-cache` is the default choice. It restores `target/`, prunes what the
  build didn't use, and keys the cache on the lockfile.
- `sccache` helps when the lockfile changes often, because it caches
  individual crates rather than the whole `target/`. Set
  `CARGO_INCREMENTAL=0` with it.
- Plain `actions/cache` works but stores everything, so it exhausts the
  10 GB repository limit sooner.

Cache is scoped to the branch, with fallback to the default branch. Make sure
the default branch builds on a schedule or on push, or PRs never get a hit.

## Step 2: don't bundle what you don't ship

For pull request checks, skip the installers:

```bash
tauri build --no-bundle
```

Or restrict to one bundle type per platform:

```bash
tauri build --bundles deb    # Linux
tauri build --bundles app    # macOS
tauri build --bundles nsis   # Windows
```

| | All bundles | Single bundle | `--no-bundle` |
|---|---:|---:|---:|
| Linux | `[s]` | `[s]` | `[s]` |
| macOS | `[s]` | `[s]` | `[s]` |
| Windows | `[s]` | `[s]` | `[s]` |

## Step 3: a separate profile for CI checks

Release settings optimize the binary, not the build. Add a profile that does
the opposite and use it for anything that isn't a release:

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

| Profile knob | Build time | Binary size | Use for |
|---|---:|---:|---|
| default release | `[s]` | `[MB]` | releases |
| `lto = "thin"` | `[s]` | `[MB]` | releases that want smaller binaries |
| `lto = "fat"` | `[s]` | `[MB]` | size-critical releases only |
| `codegen-units = 1` | `[s]` | `[MB]` | runtime-critical releases only |
| `opt-level = 1` | `[s]` | `[MB]` | CI checks |
| `profile.fast` | `[s]` | `[MB]` | CI checks |

## Step 4: a faster linker

Linking is a small share of a cold build and a large share of a warm one.

| Linux | Cold | Warm |
|---|---:|---:|
| GNU `ld` | `[s]` | `[s]` |
| `lld` | `[s]` | `[s]` |
| `mold` | `[s]` | `[s]` |

Recent Rust versions default to `lld` on `x86_64-unknown-linux-gnu`, so check
your toolchain before adding flags. macOS already ships a fast linker.

## Step 5: measure your own app

Add `--timings` to see which crates sit on the critical path:

```bash
tauri build -- --timings
```

Upload `target/cargo-timings/cargo-timing.html` as an artifact. The
experiment harness in `[link]` does this for every job, so you can compare.

## Recommended presets

**Pull request check** (`[s]` warm on Linux):

```yaml
- uses: Swatinem/rust-cache@v2
  with: { workspaces: src-tauri -> target }
- run: pnpm tauri build --no-bundle -- --profile fast
```

**Release** (`[s]` on Linux):

```yaml
- uses: Swatinem/rust-cache@v2
  with: { workspaces: src-tauri -> target }
- run: pnpm tauri build
  env:
    CARGO_PROFILE_RELEASE_LTO: thin
```

## What didn't help

Fill in from the results: options whose delta was inside runner variance.
