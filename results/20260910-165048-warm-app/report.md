## Build experiments report

Records: 24 · run 34523591019 · tag `20260910-165048-warm-app` · change scenario: `app`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-actions-cargo | 2 | 1m05s | - | 1m05s..1m23s | 0m53s | 0m10s | 0m02s | - | 1m26s | - | 7.2 | 10.1 |
| cache-swatinem | 2 | 1m11s | - | 1m11s..1m23s | 1m02s | 0m08s | 0m01s | - | 1m38s | - | 7.2 | 10.1 |
| cache-sccache | 2 | 1m16s | - | 1m16s..1m59s | 1m07s | 0m07s | 0m02s | - | 1m39s | - | 7.2 | 10.1 |
| cache-both | 2 | 1m29s | - | 1m29s..1m31s | 1m16s | 0m12s | 0m01s | - | 2m08s | - | 7.2 | 10.2 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-actions-cargo | 2 | 1m52s | - | 1m52s..2m21s | 0m31s | 1m20s | 0m01s | - | 2m55s | 0m29s | 10.2 | 339.1 |
| cache-both | 2 | 1m59s | - | 1m59s..2m10s | 0m51s | 1m07s | 0m01s | - | 2m37s | 0m22s | 10.2 | 339.1 |
| cache-swatinem | 2 | 2m10s | - | 2m10s..2m23s | 0m51s | 1m17s | 0m02s | - | 3m13s | 0m30s | 10.2 | 339.1 |
| cache-sccache | 2 | 3m48s | - | 3m48s..4m01s | 2m38s | 1m09s | 0m01s | - | 4m21s | 0m22s | 10.2 | 339.1 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 2m05s | - | 2m05s..2m07s | 1m44s | 0m19s | 0m02s | - | 3m04s | - | 10.3 | 5.2 |
| cache-actions-cargo | 2 | 2m11s | - | 2m11s..2m39s | 1m52s | 0m16s | 0m03s | - | 3m01s | - | 10.3 | 5.2 |
| cache-both | 2 | 2m22s | - | 2m22s..2m36s | 2m00s | 0m20s | 0m02s | - | 3m25s | - | 10.3 | 5.2 |
| cache-sccache | 2 | 4m12s | - | 4m12s..4m32s | 3m36s | 0m33s | 0m03s | - | 5m42s | - | 10.3 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
