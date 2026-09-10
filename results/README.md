# Result batches

One folder per `scripts/run.sh` tag. Each holds `report.md` plus one timing
record per job. The `cargo-timing.html` files stay local and are not
committed.

| Tag | Experiments | Runners | Scenario | Valid for | Notes |
|---|---|---|---|---|---|
| `20260910-154018` | baseline | 2-core (private repo) | cold | pipeline check only | Single sample. Before the methodology review. |
| `20260910-155243` | cache | 2-core (private repo) | cold | nothing | Pilot. Single sample, `sccache` namespace shared between experiments. |
| `20260910-155243-warm` | cache | 2-core (private repo) | warm, no change | nothing | Pilot. Shows why "nothing changed" flatters `sccache`: it served the app crate itself. |
| `20260910-164108` | baseline, baseline-big | 4-core (public repo) | cold | baseline, variance, `big` cost | 3 samples each. |
| `20260910-165048` | cache | 4-core | meant to be cold, was warm | nothing | Caches from the pilot were still valid (same keys). Fixed afterwards with per-batch cache salts. |
| `20260910-165048-warm-app` | cache | 4-core | warm, app code changed | cache comparison | 2 samples each. The first valid warm cache measurement. |
| `20260910-170743` | cache | 4-core | cold (salted keys) | cold cost of each cache | 2 samples each. One macOS job failed in `bundle_dmg.sh`, unrelated to caching. |

Reports were regenerated on 2026-09-10 after fixing the median for an even
number of samples (it used to pick the lower one).
