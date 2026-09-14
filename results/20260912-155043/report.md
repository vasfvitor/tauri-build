## Build experiments report

Records: 10 · run 34712414173 · tag `20260912-155043` · app: `bench` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| combo-fastest-mac | 2 | 2m23s | - | 2m14s..2m32s | 2m20s | 0m01s | 0m02s | - | 2m41s | - | 8.2 | - |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| combo-fastest | 2 | 3m05s | - | 2m57s..3m12s | 3m03s | - | 0m02s | - | 3m47s | 0m29s | 11.8 | - |
| combo-release | 2 | 4m46s | - | 4m42s..4m50s | 3m35s | 1m09s | 0m02s | - | 5m22s | 0m21s | 10.2 | 338.7 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| combo-fastest | 2 | 4m22s | - | 4m12s..4m31s | 4m17s | - | 0m05s | - | 5m03s | - | 10.5 | - |
| combo-release | 2 | 6m03s | - | 5m59s..6m06s | 5m41s | 0m19s | 0m03s | - | 6m44s | - | 10.4 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
