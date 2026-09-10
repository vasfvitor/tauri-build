## Build experiments report

Records: 24 · run 34522807851 · tag `20260910-165048` · change scenario: `none`

### macos-14 (3 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 0m53s | - | 0m53s..1m08s | 0m43s | 0m09s | 0m01s | - | 1m11s | - | 7.2 | 10.1 |
| cache-both | 2 | 1m25s | - | 1m25s..1m28s | 1m14s | 0m10s | 0m01s | - | 1m59s | - | 7.2 | 10.1 |
| cache-actions-cargo | 2 | 1m28s | - | 1m28s..1m34s | 1m13s | 0m14s | 0m01s | - | 1m56s | - | 7.2 | 10.1 |
| cache-sccache | 2 | 3m14s | - | 3m14s..4m43s | 2m58s | 0m14s | 0m02s | - | 3m35s | - | 7.2 | 10.1 |

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-actions-cargo | 2 | 2m04s | - | 2m04s..2m26s | 0m42s | 1m20s | 0m02s | - | 2m55s | 0m22s | 10.2 | 339.1 |
| cache-both | 2 | 2m09s | - | 2m09s..2m25s | 1m00s | 1m07s | 0m02s | - | 2m48s | 0m22s | 10.2 | 339.1 |
| cache-swatinem | 2 | 2m13s | - | 2m13s..2m15s | 0m51s | 1m20s | 0m02s | - | 2m55s | 0m24s | 10.2 | 339.1 |
| cache-sccache | 2 | 4m50s | - | 4m50s..5m30s | 3m29s | 1m20s | 0m01s | - | 5m33s | 0m23s | 10.2 | 339.1 |

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | 2 | 1m56s | - | 1m56s..2m26s | 1m38s | 0m16s | 0m02s | - | 2m45s | - | 10.3 | 5.2 |
| cache-both | 2 | 2m08s | - | 2m08s..2m13s | 1m49s | 0m17s | 0m02s | - | 3m07s | - | 10.3 | 5.2 |
| cache-actions-cargo | 2 | 2m18s | - | 2m18s..2m28s | 1m57s | 0m18s | 0m03s | - | 2m56s | - | 10.3 | 5.2 |
| cache-sccache | 2 | 6m18s | - | 6m18s..6m22s | 5m41s | 0m35s | 0m02s | - | 7m07s | - | 10.3 | 5.2 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
