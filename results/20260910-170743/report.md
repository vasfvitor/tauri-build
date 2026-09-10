## Build experiments report

Records: 24 · run 34524500128 · tag `20260910-170743` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 3m02s | - | 2m48s..3m15s | 2m46s | 0m14s | 0m02s | - | 3m19s | - | 7.2 | 10.1 |
| cache-both | 2 | 3m19s | - | 2m17s..4m20s | 3m06s | 0m11s | 0m02s | - | 3m39s | - | 7.2 | 10.1 |
| cache-actions-cargo ❌ 1/2 failed | 2 | 3m42s | - |  | 3m28s | 0m12s | 0m02s | - | 3m49s | - | 7.2 | 8.8 |
| cache-sccache | 2 | 3m58s | - | 3m56s..4m00s | 3m46s | 0m10s | 0m02s | - | 4m22s | - | 7.2 | 10.2 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 4m31s | - | 4m00s..5m01s | 3m08s | 1m21s | 0m02s | - | 5m21s | 0m37s | 10.2 | 339.1 |
| cache-actions-cargo | 2 | 4m50s | - | 4m39s..5m01s | 3m35s | 1m13s | 0m02s | - | 5m28s | 0m26s | 10.2 | 339.1 |
| cache-sccache | 2 | 5m02s | - | 4m34s..5m29s | 3m46s | 1m15s | 0m01s | - | 5m44s | 0m32s | 10.2 | 339.1 |
| cache-both | 2 | 5m14s | - | 5m08s..5m19s | 4m02s | 1m10s | 0m02s | - | 5m48s | 0m22s | 10.2 | 339.1 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 4m55s | - | 4m23s..5m27s | 4m37s | 0m15s | 0m03s | - | 5m26s | - | 10.3 | 5.2 |
| cache-actions-cargo | 2 | 5m59s | - | 5m39s..6m19s | 5m37s | 0m18s | 0m04s | - | 6m39s | - | 10.3 | 5.2 |
| cache-both | 2 | 6m11s | - | 6m08s..6m14s | 5m49s | 0m19s | 0m03s | - | 6m50s | - | 10.3 | 5.2 |
| cache-sccache | 2 | 6m13s | - | 6m12s..6m14s | 5m52s | 0m18s | 0m03s | - | 7m02s | - | 10.3 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
