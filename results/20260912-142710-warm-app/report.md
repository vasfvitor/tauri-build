## Build experiments report

Records: 12 · run 34708653328 · tag `20260912-142710-warm-app` · app: `bench` · change scenario: `app`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| deps-heavy-cached | 2 | 1m19s | - | 1m15s..1m22s | 1m06s | 0m11s | 0m02s | - | 1m45s | - | 9.5 | 13.4 |
| deps-heavy | 2 | 3m30s | - | 3m21s..3m38s | 3m17s | 0m11s | 0m02s | - | 3m49s | - | 9.5 | 13.4 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| deps-heavy-cached | 2 | 1m53s | - | 1m47s..1m59s | 0m41s | 1m10s | 0m02s | - | 2m39s | 0m31s | 12.9 | 349.0 |
| deps-heavy | 2 | 4m56s | - | 4m32s..5m19s | 3m41s | 1m13s | 0m02s | - | 5m34s | 0m27s | 12.9 | 349.0 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| deps-heavy-cached | 2 | 2m41s | - | 2m23s..2m58s | 2m17s | 0m21s | 0m03s | - | 3m47s | - | 13.0 | 7.2 |
| deps-heavy | 2 | 5m40s | - | 5m01s..6m18s | 5m17s | 0m20s | 0m03s | - | 6m13s | - | 13.0 | 7.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
