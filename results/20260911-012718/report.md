## Build experiments report

Records: 6 · run 34562258066 · tag `20260911-012718` · app: `bench` · change scenario: `none`

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| linker-lld | 2 | 4m35s | - | 4m18s..4m51s | 3m20s | 1m13s | 0m02s | - | 5m18s | 0m30s | 10.2 | 339.1 |
| linker-mold | 2 | 4m43s | - | 4m28s..4m57s | 3m15s | 1m26s | 0m02s | - | 5m34s | 0m35s | 9.9 | 338.0 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| linker-lld | 2 | 6m10s | - | 6m06s..6m14s | 5m47s | 0m20s | 0m03s | - | 6m43s | - | 10.1 | 5.1 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
