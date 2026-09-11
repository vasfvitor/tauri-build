## Build experiments report

Records: 41 · run 34540571980 · tag `20260910-194307-warm-app` · app: `plugins-api` · change scenario: `app`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-cache-actions-cargo | 2 | 1m24s | -73% | 1m09s..1m38s | 1m10s | 0m10s | 0m04s | - | 2m10s | - | 24.5 | 33.2 |
| pw-cache-both | 2 | 1m30s | -71% | 1m28s..1m31s | 1m15s | 0m10s | 0m05s | - | 2m23s | - | 24.5 | 33.2 |
| pw-cache-swatinem-ws | 2 | 1m32s | -70% | 1m20s..1m44s | 1m17s | 0m10s | 0m05s | - | 2m30s | - | 24.5 | 33.2 |
| pw-cache-swatinem | 2 | 2m02s | -61% | 1m54s..2m09s | 1m45s | 0m12s | 0m05s | - | 3m05s | - | 24.5 | 33.2 |
| pw-cache-sccache | 2 | 2m47s | -46% | 2m43s..2m50s | 2m33s | 0m09s | 0m05s | - | 3m26s | - | 24.5 | 33.2 |
| pw-baseline | 1 | 3m33s | - |  | 3m22s | 0m07s | 0m04s | - | 4m05s | - | 10.2 | 15.3 |
| pw-profile-default | 2 | 5m11s | 46% | 4m59s..5m22s | 4m53s | 0m13s | 0m05s | - | 5m56s | - | 24.5 | 33.2 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-cache-actions-cargo | 2 | 2m39s | -64% | 2m24s..2m53s | 1m03s | 1m32s | 0m04s | - | 4m01s | 0m35s | 33.1 | 408.4 |
| pw-cache-swatinem-ws | 2 | 2m51s | -62% | 2m29s..3m12s | 0m57s | 1m51s | 0m03s | - | 4m23s | 0m50s | 33.1 | 408.4 |
| pw-cache-both | 2 | 3m13s | -57% | 3m12s..3m13s | 1m32s | 1m37s | 0m04s | - | 4m29s | 0m23s | 33.1 | 408.4 |
| pw-cache-swatinem | 2 | 3m16s | -56% | 3m15s..3m17s | 1m13s | 1m59s | 0m04s | - | 4m37s | 0m34s | 33.1 | 408.4 |
| pw-cache-sccache | 2 | 5m05s | -31% | 4m45s..5m25s | 3m21s | 1m39s | 0m05s | - | 6m10s | 0m27s | 33.1 | 408.4 |
| pw-baseline | 2 | 6m05s | - | 5m56s..6m14s | 4m46s | 1m15s | 0m04s | - | 7m03s | 0m24s | 13.4 | 351.0 |
| pw-profile-default | 2 | 7m25s | 22% | 7m00s..7m50s | 5m35s | 1m46s | 0m04s | - | 8m45s | 0m35s | 33.1 | 408.4 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-cache-actions-cargo | 2 | 3m25s | -55% | 3m07s..3m42s | 2m50s | 0m24s | 0m11s | - | 4m56s | - | 20.9 | 35.9 |
| pw-cache-swatinem-ws | 2 | 3m25s | -55% | 3m20s..3m29s | 2m53s | 0m22s | 0m10s | - | 5m19s | - | 20.9 | 35.9 |
| pw-cache-both | 2 | 4m11s | -45% | 4m02s..4m20s | 3m32s | 0m12s | 0m27s | - | 6m47s | - | 20.9 | 35.9 |
| pw-profile-default | 2 | 7m38s | -19% | 7m28s..7m47s | 7m06s | 0m22s | 0m10s | - | 8m54s | - | 20.9 | 35.9 |
| pw-cache-sccache | 2 | 7m42s | 1% | 7m20s..8m04s | 7m05s | 0m23s | 0m14s | - | 9m11s | - | 20.9 | 35.9 |
| pw-cache-swatinem | 2 | 8m21s | 9% | 7m43s..8m59s | 7m50s | 0m18s | 0m13s | - | 9m48s | - | 20.9 | 35.9 |
| pw-baseline ❌ 1/2 failed | 2 | 9m24s | - |  | 8m47s | 0m25s | 0m12s | - | 6m09s | - | 8.1 | 16.5 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
