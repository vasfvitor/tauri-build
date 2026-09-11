## Build experiments report

Records: 2 · run 34547535170 · tag `20260910-214104` · app: `plugins-api` · change scenario: `none`

### windows-2022 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-cache-swatinem | 2 | 7m00s | - | 6m48s..7m11s | 6m26s | 0m21s | 0m13s | - | 8m25s | - | 20.9 | 35.9 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
