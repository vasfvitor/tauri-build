## Build experiments report

Records: 12 · run 34518442568 · tag `20260910-155243-warm`

### macos-14

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-both | ✅ | 0m19s | - | - | 0m49s | 0m02s | - | 7.2 | 10.2 |
| cache-swatinem | ✅ | 1m10s | - | - | 1m38s | 0m02s | - | 7.2 | 10.1 |
| cache-actions-cargo | ✅ | 1m24s | - | - | 2m07s | 0m04s | - | 7.2 | 10.1 |
| cache-sccache | ✅ | 1m30s | - | - | 1m44s | 0m01s | - | 7.2 | 10.1 |

### ubuntu-24.04

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-both | ✅ | 2m12s | - | - | 3m17s | 0m02s | 0m36s | 10.2 | 339.1 |
| cache-swatinem | ✅ | 2m38s | - | - | 4m02s | 0m03s | 0m52s | 10.2 | 339.1 |
| cache-actions-cargo | ✅ | 2m58s | - | - | 3m45s | 0m02s | 0m26s | 10.2 | 339.1 |
| cache-sccache | ✅ | 5m03s | - | - | 6m05s | 0m02s | 0m48s | 10.2 | 339.1 |

### windows-2022

| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| cache-both | ✅ | 0m55s | - | - | 2m01s | 0m06s | - | 10.3 | 5.2 |
| cache-swatinem | ✅ | 3m05s | - | - | 4m09s | 0m05s | - | 10.3 | 5.2 |
| cache-actions-cargo | ✅ | 3m21s | - | - | 4m15s | 0m06s | - | 10.3 | 5.2 |
| cache-sccache | ✅ | 3m27s | - | - | 3m58s | 0m07s | - | 10.3 | 5.2 |

_build #1 = wall time of `pnpm tauri build` (frontend + cargo + bundling). Δ is relative to the `baseline` experiment on the same runner. A cache-based experiment only shows its benefit on the **second** workflow run (first run populates the cache)._
