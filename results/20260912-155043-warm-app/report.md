## Build experiments report

Records: 10 · run 34712794144 · tag `20260912-155043-warm-app` · app: `bench` · change scenario: `app`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| combo-fastest-mac | 2 | 1m25s | - | 0m39s..2m10s | 1m23s | - | 0m02s | - | 1m47s | - | 8.2 | - |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| combo-fastest | 2 | 0m39s | - | 0m38s..0m40s | 0m36s | 0m02s | 0m01s | - | 1m27s | 0m30s | 11.8 | - |
| combo-release | 2 | 2m27s | - | 2m12s..2m41s | 1m14s | 1m11s | 0m02s | - | 3m09s | 0m22s | 10.2 | 338.7 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| combo-fastest | 2 | 1m42s | - | 1m39s..1m45s | 1m37s | 0m02s | 0m03s | - | 2m33s | - | 10.5 | - |
| combo-release | 2 | 2m45s | - | 2m42s..2m48s | 2m25s | 0m18s | 0m02s | - | 3m38s | - | 10.4 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
