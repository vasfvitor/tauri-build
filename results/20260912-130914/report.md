## Build experiments report

Records: 24 · run 34704359921 · tag `20260912-130914` · app: `bench` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-actions-cargo | 2 | 3m08s | - | 3m07s..3m09s | 2m56s | 0m10s | 0m02s | - | 3m29s | - | 7.2 | 10.1 |
| cache-swatinem | 2 | 3m34s | - | 2m54s..4m13s | 3m20s | 0m12s | 0m02s | - | 3m55s | - | 7.2 | 10.2 |
| cache-sccache | 2 | 3m35s | - | 2m32s..4m38s | 3m24s | 0m10s | 0m01s | - | 3m54s | - | 7.2 | 10.1 |
| cache-both | 2 | 3m58s | - | 3m48s..4m07s | 3m45s | 0m11s | 0m02s | - | 4m19s | - | 7.2 | 10.1 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 4m26s | - | 3m58s..4m54s | 3m12s | 1m12s | 0m02s | - | 5m01s | 0m25s | 10.2 | 339.1 |
| cache-actions-cargo | 2 | 5m01s | - | 4m49s..5m12s | 3m43s | 1m16s | 0m02s | - | 5m39s | 0m27s | 10.2 | 339.1 |
| cache-sccache | 2 | 5m21s | - | 5m11s..5m31s | 4m04s | 1m15s | 0m02s | - | 6m12s | 0m37s | 10.2 | 339.1 |
| cache-both | 2 | 5m36s | - | 5m31s..5m41s | 4m14s | 1m20s | 0m02s | - | 6m09s | 0m22s | 10.2 | 339.1 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-actions-cargo | 2 | 5m05s | - | 4m35s..5m34s | 4m44s | 0m18s | 0m03s | - | 5m34s | - | 10.3 | 5.2 |
| cache-swatinem | 2 | 5m20s | - | 4m55s..5m45s | 4m59s | 0m17s | 0m04s | - | 5m58s | - | 10.3 | 5.2 |
| cache-both | 2 | 5m52s | - | 5m09s..6m34s | 5m33s | 0m16s | 0m03s | - | 6m26s | - | 10.3 | 5.2 |
| cache-sccache | 2 | 5m56s | - | 5m25s..6m27s | 5m22s | 0m31s | 0m03s | - | 6m32s | - | 10.3 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
