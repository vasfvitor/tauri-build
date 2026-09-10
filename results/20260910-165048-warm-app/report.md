## Build experiments report

Records: 24 · run 34523591019 · tag `20260910-165048-warm-app` · change scenario: `app`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-actions-cargo | 2 | 1m14s | - | 1m05s..1m23s | 1m03s | 0m09s | 0m02s | - | 1m38s | - | 7.2 | 10.1 |
| cache-swatinem | 2 | 1m17s | - | 1m11s..1m23s | 1m06s | 0m09s | 0m02s | - | 1m44s | - | 7.2 | 10.1 |
| cache-both | 2 | 1m30s | - | 1m29s..1m31s | 1m17s | 0m12s | 0m01s | - | 2m09s | - | 7.2 | 10.2 |
| cache-sccache | 2 | 1m38s | - | 1m16s..1m59s | 1m27s | 0m09s | 0m02s | - | 1m58s | - | 7.2 | 10.2 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-both | 2 | 2m05s | - | 1m59s..2m10s | 0m52s | 1m11s | 0m02s | - | 2m50s | 0m27s | 10.2 | 339.1 |
| cache-actions-cargo | 2 | 2m07s | - | 1m52s..2m21s | 0m45s | 1m20s | 0m02s | - | 3m04s | 0m38s | 10.2 | 339.1 |
| cache-swatinem | 2 | 2m17s | - | 2m10s..2m23s | 0m58s | 1m17s | 0m02s | - | 3m23s | 0m44s | 10.2 | 339.1 |
| cache-sccache | 2 | 3m55s | - | 3m48s..4m01s | 2m43s | 1m10s | 0m02s | - | 4m34s | 0m29s | 10.2 | 339.1 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 2m06s | - | 2m05s..2m07s | 1m45s | 0m18s | 0m03s | - | 3m08s | - | 10.3 | 5.2 |
| cache-actions-cargo | 2 | 2m25s | - | 2m11s..2m39s | 2m01s | 0m19s | 0m05s | - | 3m22s | - | 10.3 | 5.2 |
| cache-both | 2 | 2m29s | - | 2m22s..2m36s | 2m08s | 0m18s | 0m03s | - | 3m29s | - | 10.3 | 5.2 |
| cache-sccache | 2 | 4m22s | - | 4m12s..4m32s | 3m48s | 0m29s | 0m05s | - | 5m45s | - | 10.3 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
