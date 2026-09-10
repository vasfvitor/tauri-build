## Build experiments report

Records: 3 · run 34515763300 · tag `20260910-154018`

### macos-14

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | ✅ | 2m57s | 0% | - | 3m12s | 0m03s | - | 7.2 | 10.1 |

### ubuntu-24.04

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | ✅ | 8m57s | 0% | - | 9m33s | 0m02s | 0m25s | 10.2 | 339.1 |

### windows-2022

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline | ✅ | 9m41s | 0% | - | 10m28s | 0m10s | - | 10.3 | 5.2 |

_build #1 = wall time of `pnpm tauri build` (frontend + cargo + bundling). Δ is relative to the `baseline` experiment on the same runner. A cache-based experiment only shows its benefit on the **second** workflow run (first run populates the cache)._
