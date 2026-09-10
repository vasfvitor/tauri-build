## Build experiments report

Records: 12 · run 34517015189 · tag `20260910-155243`

### macos-14

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-swatinem | ✅ | 2m55s | - | - | 3m10s | 0m01s | - | 7.2 | 10.2 |
| cache-actions-cargo | ✅ | 3m14s | - | - | 3m35s | 0m01s | - | 7.2 | 10.2 |
| cache-sccache | ✅ | 3m42s | - | - | 3m59s | 0m01s | - | 7.2 | 10.2 |
| cache-both | ✅ | 4m05s | - | - | 4m27s | 0m01s | - | 7.2 | 10.2 |

### ubuntu-24.04

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-sccache | ✅ | 8m12s | - | - | 9m12s | 0m02s | 0m50s | 10.2 | 339.1 |
| cache-swatinem | ✅ | 8m20s | - | - | 9m11s | 0m02s | 0m38s | 10.2 | 339.1 |
| cache-both | ✅ | 8m36s | - | - | 9m47s | 0m02s | 0m56s | 10.2 | 339.1 |
| cache-actions-cargo | ✅ | 8m47s | - | - | 9m22s | 0m02s | 0m24s | 10.2 | 339.1 |

### windows-2022

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-sccache | ✅ | 8m15s | - | - | 9m00s | 0m08s | - | 10.3 | 5.2 |
| cache-actions-cargo | ✅ | 8m22s | - | - | 9m19s | 0m08s | - | 10.3 | 5.2 |
| cache-both | ✅ | 9m34s | - | - | 10m11s | 0m06s | - | 10.3 | 5.2 |
| cache-swatinem | ✅ | 11m27s | - | - | 12m19s | 0m07s | - | 10.3 | 5.2 |

_build #1 = wall time of `pnpm tauri build` (frontend + cargo + bundling). Δ is relative to the `baseline` experiment on the same runner. A cache-based experiment only shows its benefit on the **second** workflow run (first run populates the cache)._
