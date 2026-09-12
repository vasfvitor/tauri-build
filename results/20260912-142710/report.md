## Build experiments report

Records: 12 · run 34708267022 · tag `20260912-142710` · app: `bench` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| deps-heavy-cached | 2 | 2m57s | - | 2m42s..3m11s | 2m45s | 0m10s | 0m02s | - | 3m15s | - | 9.5 | 13.5 |
| deps-heavy | 2 | 3m45s | - | 3m28s..4m01s | 3m33s | 0m11s | 0m01s | - | 4m09s | - | 9.5 | 13.5 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| deps-heavy | 2 | 4m52s | - | 4m17s..5m27s | 3m38s | 1m12s | 0m02s | - | 5m34s | 0m29s | 12.9 | 349.0 |
| deps-heavy-cached | 2 | 5m24s | - | 5m17s..5m30s | 4m05s | 1m17s | 0m02s | - | 5m59s | 0m22s | 12.9 | 349.0 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| deps-heavy | 2 | 5m18s | - | 4m18s..6m18s | 4m57s | 0m19s | 0m02s | - | 5m50s | - | 13.0 | 7.2 |
| deps-heavy-cached | 2 | 5m56s | - | 5m46s..6m05s | 5m34s | 0m20s | 0m02s | - | 6m30s | - | 13.0 | 7.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
