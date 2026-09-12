## Build experiments report

Records: 24 · run 34705832916 · tag `20260912-130914-warm-deps` · app: `bench` · change scenario: `deps`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-actions-cargo | 2 | 1m17s | - | 1m15s..1m18s | 1m05s | 0m11s | 0m01s | - | 1m42s | - | 7.2 | 10.1 |
| cache-swatinem | 2 | 1m34s | - | 1m28s..1m39s | 1m21s | 0m11s | 0m02s | - | 2m06s | - | 7.2 | 10.2 |
| cache-both | 2 | 1m40s | - | 1m25s..1m54s | 1m28s | 0m11s | 0m01s | - | 2m12s | - | 7.2 | 10.2 |
| cache-sccache | 2 | 2m31s | - | 2m17s..2m44s | 2m19s | 0m10s | 0m02s | - | 2m50s | - | 7.2 | 10.1 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 1m58s | - | 1m55s..2m00s | 0m50s | 1m06s | 0m02s | - | 2m52s | 0m35s | 10.2 | 339.1 |
| cache-both | 2 | 1m59s | - | 1m40s..2m18s | 0m53s | 1m04s | 0m02s | - | 2m49s | 0m31s | 10.2 | 339.1 |
| cache-actions-cargo | 2 | 2m11s | - | 2m03s..2m18s | 0m57s | 1m12s | 0m02s | - | 2m55s | 0m27s | 10.2 | 339.1 |
| cache-sccache | 2 | 4m55s | - | 4m31s..5m19s | 3m45s | 1m08s | 0m02s | - | 5m35s | 0m27s | 10.2 | 339.1 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 2m23s | - | 2m17s..2m29s | 2m05s | 0m16s | 0m02s | - | 3m13s | - | 10.3 | 5.2 |
| cache-actions-cargo | 2 | 2m26s | - | 2m24s..2m27s | 2m07s | 0m16s | 0m03s | - | 3m16s | - | 10.3 | 5.2 |
| cache-both | 2 | 2m29s | - | 2m28s..2m29s | 2m10s | 0m15s | 0m04s | - | 3m16s | - | 10.3 | 5.2 |
| cache-sccache | 2 | 6m09s | - | 5m46s..6m31s | 5m45s | 0m21s | 0m03s | - | 6m56s | - | 10.3 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
