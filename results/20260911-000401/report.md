## Build experiments report

Records: 60 · run 34557020362 · tag `20260911-000401` · app: `bench` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| opt-s | 2 | 2m36s | - | 2m08s..3m04s | 2m25s | 0m10s | 0m01s | - | 2m53s | - | 8.3 | 11.2 |
| profile-fast | 2 | 2m49s | - | 2m38s..3m00s | 2m36s | 0m11s | 0m02s | - | 3m07s | - | 11.4 | 15.1 |
| incremental-on | 2 | 3m15s | - | 2m55s..3m34s | 3m04s | 0m09s | 0m02s | - | 3m34s | - | 7.4 | 10.3 |
| panic-abort | 2 | 3m20s | - | 2m52s..3m48s | 3m06s | 0m12s | 0m02s | - | 3m41s | - | 5.0 | 7.3 |
| cgu-256 | 2 | 3m24s | - | 3m15s..3m33s | 3m13s | 0m09s | 0m02s | - | 3m44s | - | 7.5 | 10.5 |
| lto-off | 2 | 3m34s | - | 3m19s..3m48s | 3m21s | 0m11s | 0m02s | - | 3m57s | - | 7.7 | 10.7 |
| lto-thin | 2 | 3m38s | - | 3m33s..3m43s | 3m25s | 0m11s | 0m02s | - | 3m59s | - | 7.5 | 10.4 |
| opt-1 | 2 | 3m49s | - | 3m37s..4m00s | 3m34s | 0m13s | 0m02s | - | 4m10s | - | 10.1 | 13.5 |
| lto-fat | 2 | 5m10s | - | 5m03s..5m17s | 4m56s | 0m13s | 0m01s | - | 5m31s | - | 6.1 | 8.8 |
| cgu-1 | 2 | 5m54s | - | 5m29s..6m19s | 5m41s | 0m12s | 0m01s | - | 6m14s | - | 5.9 | 8.6 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| profile-fast | 2 | 4m36s | - | 4m26s..4m46s | 3m17s | 1m17s | 0m02s | - | 5m18s | 0m31s | 14.3 | 349.5 |
| lto-off | 2 | 4m50s | - | 4m30s..5m10s | 3m25s | 1m23s | 0m02s | - | 5m45s | 0m39s | 11.3 | 342.0 |
| panic-abort | 2 | 4m51s | - | 4m09s..5m33s | 3m34s | 1m15s | 0m02s | - | 5m28s | 0m27s | 7.6 | 330.1 |
| opt-s | 2 | 5m02s | - | 4m57s..5m07s | 3m38s | 1m21s | 0m03s | - | 5m59s | 0m39s | 9.5 | 335.9 |
| opt-1 | 2 | 5m04s | - | 4m51s..5m17s | 3m26s | 1m36s | 0m02s | - | 5m55s | 0m38s | 13.2 | 346.7 |
| lto-thin | 2 | 5m08s | - | 5m06s..5m10s | 3m37s | 1m30s | 0m01s | - | 5m53s | 0m34s | 10.2 | 338.7 |
| incremental-on | 2 | 5m19s | - | 5m18s..5m19s | 4m01s | 1m16s | 0m02s | - | 6m13s | 0m37s | 10.6 | 339.9 |
| cgu-1 | 2 | 5m40s | - | 5m06s..6m14s | 4m27s | 1m11s | 0m02s | - | 6m20s | 0m29s | 8.6 | 334.5 |
| cgu-256 | 2 | 6m01s | - | 5m53s..6m09s | 4m32s | 1m27s | 0m02s | - | 6m44s | 0m30s | 10.9 | 340.8 |
| lto-fat | 2 | 6m10s | - | 5m48s..6m32s | 4m44s | 1m24s | 0m02s | - | 6m49s | 0m23s | 8.6 | 334.2 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| lto-off | 2 | 5m05s | - | 5m00s..5m10s | 4m44s | 0m18s | 0m03s | - | 5m34s | - | 10.4 | 5.2 |
| panic-abort | 2 | 5m45s | - | 5m39s..5m50s | 5m24s | 0m18s | 0m03s | - | 6m20s | - | 4.9 | 3.5 |
| profile-fast | 2 | 5m56s | - | 5m45s..6m06s | 5m25s | 0m27s | 0m04s | - | 6m42s | - | 10.3 | 5.1 |
| opt-s | 2 | 5m57s | - | 5m53s..6m00s | 5m30s | 0m24s | 0m03s | - | 6m34s | - | 8.6 | 4.5 |
| lto-fat | 2 | 6m17s | - | 5m55s..6m38s | 5m46s | 0m24s | 0m07s | - | 7m06s | - | 9.8 | 5.1 |
| opt-1 | 2 | 6m19s | - | 5m53s..6m44s | 5m53s | 0m22s | 0m04s | - | 7m01s | - | 10.4 | 5.2 |
| lto-thin | 2 | 6m45s | - | 6m03s..7m26s | 6m02s | 0m36s | 0m07s | - | 7m43s | - | 10.6 | 5.3 |
| incremental-on | 2 | 6m49s | - | 6m34s..7m04s | 6m25s | 0m20s | 0m04s | - | 7m37s | - | 10.3 | 5.2 |
| cgu-256 | 2 | 7m00s | - | 6m58s..7m01s | 6m30s | 0m26s | 0m04s | - | 7m57s | - | 10.2 | 5.1 |
| cgu-1 | 2 | 8m46s | - | 8m42s..8m50s | 8m23s | 0m19s | 0m04s | - | 9m21s | - | 9.4 | 4.9 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
