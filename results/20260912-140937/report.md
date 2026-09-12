## Build experiments report

Records: 36 · run 34707385305 · tag `20260912-140937` · app: `bench` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| profile-fast | 3 | 3m02s | -18% | 2m49s..3m11s | 2m49s | 0m12s | 0m01s | - | 3m20s | - | 11.4 | 15.1 |
| baseline-big | 3 | 3m43s | - | 2m37s..3m54s | 3m30s | 0m12s | 0m01s | - | 4m01s | - | 7.2 | 10.2 |
| lto-fat | 3 | 3m45s | 1% | 3m37s..4m03s | 3m33s | 0m11s | 0m01s | - | 4m03s | - | 6.1 | 8.8 |
| cgu-1 | 3 | 5m11s | 39% | 5m03s..6m03s | 4m58s | 0m12s | 0m01s | - | 5m30s | - | 5.9 | 8.6 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| profile-fast | 3 | 4m25s | -14% | 3m48s..4m35s | 3m09s | 1m14s | 0m02s | - | 5m21s | 0m45s | 14.3 | 349.5 |
| baseline-big | 3 | 5m08s | - | 4m14s..5m24s | 3m59s | 1m08s | 0m01s | - | 5m42s | 0m23s | 10.3 | 339.3 |
| lto-fat | 3 | 5m33s | 8% | 5m27s..5m41s | 4m16s | 1m15s | 0m02s | - | 6m19s | 0m33s | 8.6 | 334.2 |
| cgu-1 | 3 | 6m03s | 18% | 5m49s..6m38s | 4m50s | 1m11s | 0m02s | - | 6m53s | 0m32s | 8.6 | 334.5 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| profile-fast | 3 | 5m04s | -29% | 4m03s..5m04s | 4m43s | 0m18s | 0m03s | - | 5m34s | - | 10.3 | 5.1 |
| lto-fat | 3 | 6m23s | -11% | 5m35s..6m29s | 6m00s | 0m20s | 0m03s | - | 6m54s | - | 9.8 | 5.1 |
| baseline-big | 3 | 7m09s | - | 6m09s..7m14s | 6m33s | 0m33s | 0m03s | - | 7m46s | - | 10.4 | 5.2 |
| cgu-1 | 3 | 8m24s | 17% | 6m56s..8m31s | 8m03s | 0m18s | 0m03s | - | 8m56s | - | 9.4 | 4.9 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
