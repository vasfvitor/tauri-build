## Build experiments report

Records: 42 · run 34538813689 · tag `20260910-194307` · app: `plugins-api` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-profile-default | 2 | 4m06s | -29% | 3m41s..4m30s | 3m51s | 0m11s | 0m04s | - | 4m42s | - | 24.5 | 33.2 |
| pw-cache-both | 2 | 4m35s | 12% | 3m51s..5m19s | 4m22s | 0m08s | 0m05s | - | 5m17s | - | 24.5 | 33.2 |
| pw-cache-sccache | 2 | 4m38s | 13% | 4m25s..4m51s | 4m22s | 0m11s | 0m05s | - | 5m21s | - | 24.5 | 33.2 |
| pw-cache-swatinem-ws | 2 | 4m55s | 20% | 4m44s..5m06s | 4m41s | 0m10s | 0m04s | - | 5m42s | - | 24.5 | 33.2 |
| pw-cache-actions-cargo | 2 | 4m57s | 21% | 4m55s..4m59s | 4m42s | 0m10s | 0m05s | - | 5m39s | - | 24.5 | 33.2 |
| pw-cache-swatinem | 2 | 4m58s | 21% | 4m49s..5m07s | 4m40s | 0m13s | 0m05s | - | 5m41s | - | 24.5 | 33.2 |
| pw-baseline | 2 | 5m45s | - | 5m32s..5m57s | 5m28s | 0m13s | 0m04s | - | 6m28s | - | 10.2 | 15.3 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-cache-swatinem-ws | 2 | 6m41s | -1% | 6m35s..6m46s | 5m01s | 1m36s | 0m04s | - | 7m40s | 0m22s | 33.1 | 408.4 |
| pw-profile-default | 2 | 6m46s | -1% | 6m37s..6m54s | 5m06s | 1m36s | 0m04s | - | 7m51s | 0m27s | 33.1 | 408.4 |
| pw-cache-both | 2 | 6m48s | 0% | 6m26s..7m10s | 5m11s | 1m33s | 0m04s | - | 7m50s | 0m26s | 33.1 | 408.4 |
| pw-baseline | 2 | 6m50s | - | 6m33s..7m07s | 5m21s | 1m25s | 0m04s | - | 7m51s | 0m24s | 13.4 | 351.0 |
| pw-cache-actions-cargo | 2 | 6m50s | 1% | 6m42s..6m58s | 5m02s | 1m44s | 0m04s | - | 7m49s | 0m23s | 33.1 | 408.4 |
| pw-cache-swatinem | 2 | 6m58s | 3% | 6m41s..7m15s | 5m07s | 1m47s | 0m04s | - | 8m06s | 0m28s | 33.1 | 408.4 |
| pw-cache-sccache | 2 | 7m11s | 6% | 6m58s..7m24s | 5m27s | 1m40s | 0m04s | - | 8m13s | 0m26s | 33.1 | 408.4 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-cache-both | 2 | 6m58s | -1% | 6m55s..7m00s | 6m32s | 0m17s | 0m09s | - | 8m06s | - | 20.9 | 35.9 |
| pw-profile-default | 2 | 7m02s | -24% | 5m48s..8m16s | 6m33s | 0m21s | 0m08s | - | 8m03s | - | 20.9 | 35.9 |
| pw-cache-swatinem | 2 | 7m04s | 0% | 6m54s..7m13s | 6m29s | 0m06s | 0m29s | - | 8m46s | - | 20.9 | 35.9 |
| pw-cache-sccache | 2 | 7m59s | 14% | 7m10s..8m48s | 7m30s | 0m20s | 0m09s | - | 9m09s | - | 20.9 | 35.9 |
| pw-cache-swatinem-ws | 2 | 8m11s | 16% | 7m56s..8m25s | 7m42s | 0m19s | 0m10s | - | 9m30s | - | 20.9 | 35.9 |
| pw-cache-actions-cargo | 2 | 8m16s | 18% | 8m06s..8m25s | 7m46s | 0m20s | 0m10s | - | 9m26s | - | 20.9 | 35.9 |
| pw-baseline | 2 | 9m14s | - | 9m05s..9m22s | 8m39s | 0m23s | 0m12s | - | 10m52s | - | 8.1 | 16.5 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
