## Build experiments report

Records: 1 · run 34535339759 · tag `20260910-190155` · app: `plugins-api` · change scenario: `none`

### ubuntu-24.04 (4 cores)

| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| pw-profile-default | 1 | 6m45s | - |  | 5m04s | 1m12s | 0m29s | - | 7m49s | 0m26s | 33.1 | 408.4 |

_tauri build = wall time of `pnpm tauri build` (median over n runs). cargo = cargo's own total from `--timings`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._
