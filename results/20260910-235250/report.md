## Build experiments report

Records: 12 · run 34556311587 · tag `20260910-235250` · app: `bench` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| bundle-none | 2 | 2m22s | - | 2m10s..2m33s | 2m19s | 0m02s | 0m01s | - | 2m37s | - | 7.2 | - |
| bundle-app | 2 | 3m17s | - | 2m45s..3m48s | 3m13s | 0m02s | 0m02s | - | 3m39s | - | 7.2 | 7.3 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| bundle-none | 2 | 3m24s | - | 3m03s..3m45s | 3m20s | 0m02s | 0m02s | - | 4m05s | 0m28s | 10.2 | - |
| bundle-deb | 2 | 3m25s | - | 2m55s..3m55s | 3m20s | 0m04s | 0m01s | - | 4m12s | 0m36s | 10.2 | 17.7 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| bundle-none | 2 | 5m39s | - | 5m25s..5m52s | 5m27s | 0m06s | 0m06s | - | 6m25s | - | 10.3 | - |
| bundle-nsis | 2 | 5m48s | - | 5m46s..5m50s | 5m32s | 0m11s | 0m05s | - | 6m40s | - | 10.3 | 2.1 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
