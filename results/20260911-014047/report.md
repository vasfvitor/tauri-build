## Build experiments report

Records: 20 · run 34563099217 · tag `20260911-014047` · app: `bench` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | 2 | 3m02s | - | 3m00s..3m03s | 2m49s | 0m11s | 0m02s | 1m01s | 4m21s | - | 7.2 | 10.1 |
| incremental-on | 2 | 3m35s | -1% | 3m28s..3m42s | 3m22s | 0m11s | 0m02s | 0m17s | 4m11s | - | 7.4 | 10.4 |
| baseline-big | 2 | 3m38s | 20% | 3m09s..4m06s | 3m23s | 0m13s | 0m02s | 1m52s | 5m52s | - | 7.2 | 10.2 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | 2 | 4m54s | - | 4m35s..5m12s | 3m39s | 1m12s | 0m03s | 1m44s | 7m30s | 0m37s | 10.2 | 339.1 |
| baseline-big | 2 | 5m07s | 4% | 4m29s..5m45s | 3m46s | 1m19s | 0m02s | 2m07s | 7m59s | 0m31s | 10.3 | 339.3 |
| linker-mold | 2 | 5m10s | 5% | 5m04s..5m15s | 3m49s | 1m19s | 0m02s | 1m47s | 7m43s | 0m29s | 9.9 | 338.0 |
| incremental-on | 2 | 5m25s | 6% | 5m16s..5m34s | 4m00s | 1m23s | 0m02s | 1m11s | 7m14s | 0m25s | 10.6 | 339.9 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | 2 | 5m33s | - | 5m28s..5m37s | 5m11s | 0m19s | 0m03s | 1m45s | 7m49s | - | 10.3 | 5.2 |
| baseline-big | 2 | 6m06s | 10% | 6m03s..6m09s | 5m39s | 0m24s | 0m03s | 2m18s | 9m04s | - | 10.4 | 5.2 |
| incremental-on | 2 | 6m22s | 4% | 6m07s..6m36s | 5m59s | 0m20s | 0m03s | 0m17s | 7m23s | - | 10.3 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
