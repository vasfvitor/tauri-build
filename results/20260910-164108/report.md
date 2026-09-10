## Build experiments report

Records: 18 · run 34521868408 · tag `20260910-164108` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | 3 | 3m04s | - | 2m37s..3m14s | 2m50s | 0m12s | 0m02s | - | 3m23s | - | 7.2 | 10.1 |
| baseline-big | 3 | 3m38s | 18% | 3m07s..3m41s | 3m25s | 0m11s | 0m02s | - | 3m58s | - | 7.2 | 10.1 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | 3 | 5m03s | - | 5m02s..5m06s | 3m43s | 1m18s | 0m02s | - | 5m50s | 0m33s | 10.2 | 339.1 |
| baseline-big | 3 | 5m08s | 2% | 4m24s..5m44s | 3m43s | 1m23s | 0m02s | - | 6m05s | 0m42s | 10.3 | 339.3 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | 3 | 5m25s | - | 4m30s..5m54s | 5m05s | 0m17s | 0m03s | - | 6m08s | - | 10.3 | 5.2 |
| baseline-big | 3 | 6m21s | 17% | 6m07s..6m38s | 5m59s | 0m19s | 0m03s | - | 7m07s | - | 10.4 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
