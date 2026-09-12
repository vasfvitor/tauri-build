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
| `20260910-165048-warm-app` | cache | 4-core | warm, app code changed | cache comparison | 2 samples each. The first valid warm cache measurement. The `sccache` cache was only partly populated (57 to 100% hits), see the rate limit entry in the findings. |
| `20260910-170743` | cache | 4-core | cold (salted keys) | cold cost of each cache | 2 samples each. One macOS job failed in `bundle_dmg.sh`, unrelated to caching. `sccache` lost 60 to 85% of its writes to the cache API rate limit. |
| `20260910-190155` | pw-profile-default (Linux) | 4-core | cold | pipeline check for the plugins-workspace app | Single sample. `frontend` includes the plugin JS build here (fixed afterwards), so `bundling` reads 20 to 30 s low. |
| `20260910-191325` | pw-profile-default (Windows, macOS) | 4-core, 3-core | cold | pipeline check | Same caveat: `bundling` shows as `-` because `frontend` swallowed it. |
| `20260910-194307` | workspace | 4-core, 3-core | cold (salted keys) | cost of the size-optimised profile, cold cost of each cache | 2 samples each, 42 jobs. The cache API rate limit hit: `sccache` lost 56% of its writes on Linux and macOS and 100% on Windows; both Windows `pw-cache-swatinem` repeats failed to save (same key, same second). |
| `20260910-194307-warm-app` | workspace | 4-core, 3-core | warm, app code changed | cache comparison on a monorepo, except `pw-cache-swatinem` on Windows (nothing to restore) and the `sccache` rows (partial cache) | 2 samples each. One Windows `pw-baseline` job failed in the Vite build (UnoCSS timed out fetching web fonts), one macOS `pw-baseline` job built fine but lost its record to an artifact upload timeout. |
| `20260910-214104` | pw-cache-swatinem (Windows) | 4-core | cold (salted, per-repetition keys) | cold cost of `rust-cache` on the monorepo | 2 samples. Rerun of the cell whose save the rate limit dropped; both saves went through this time. |
| `20260910-214104-warm-app` | pw-cache-swatinem (Windows) | 4-core | warm, app code changed | the Windows `rust-cache` cell of the `workspace` group | 2 samples, 4 jobs in total. |
| `20260910-235250` | bundle | 4-core, 3-core | cold, no cache | cost of each bundler, against the all-bundles baseline in `20260910-164108` | 2 samples each, 12 jobs. macOS compile varied 2m19s to 3m13s between identical jobs. |
| `20260911-000401` | profile | 4-core, 3-core | cold, no cache (`incremental-on` fills a `rust-cache`) | cost of each release-profile flag on the `big` app, against `baseline-big` in `20260910-164108` | 2 samples each, 60 jobs. The reference comes from another batch, so deltas under 10% are noise. |
| `20260911-012718` | linker | 4-core | cold, no cache | linker swaps against the defaults in `20260910-164108` and `20260910-235250` | 2 samples each, 6 jobs. Rust 1.98.1, which already links Linux with `rust-lld`. |
| `20260911-014047` | baseline, baseline-big, incremental-on, linker-mold | 4-core, 3-core | cold, then a second build in the same job after a comment change (`--runs 2`) | in-job rebuild cost; incremental compilation; linker on a rebuild | 2 samples each, 20 jobs. `build #2` includes bundling; the JSON records carry `cargo_2` on its own. |
| `20260912-130914` | cache | 4-core, 3-core | cold (salted keys) | cold cost of each cache, repeat of `20260910-170743` | 2 samples each, 24 jobs, no failures. `sccache` lost 73 to 100% of its writes on Linux and Windows, 34 to 51% on macOS. |
| `20260912-130914-warm-deps` | cache | 4-core, 3-core | warm, new dependency (`cargo add chrono`) | cache comparison after a lockfile change | 2 samples each. `rust-cache` and `actions/cache` restored the previous entry; `sccache` hit 0 to 62% and, on top of `rust-cache`, 0 of 3 to 14 requests. |

Reports were regenerated on 2026-09-10 after fixing the median for an even
number of samples (it used to pick the lower one).
