# Tauri build-time experiments

A small Tauri 2 app plus a GitHub Actions harness that builds it many times
with different settings and reports how long each variant takes. The goal is
a data-backed guide on speeding up Tauri builds in CI, to contribute to the
Tauri docs.

## Layout

| Path | What |
|---|---|
| `app/` | The benchmark app, a Vite + TypeScript frontend and a Rust backend with 3 plugins and an optional `heavy` feature (`reqwest` + `tokio`). |
| `experiments/matrix.json` | The list of build variants. One entry = one experiment; each key maps to an input of the build workflow. |
| `.github/workflows/build.yml` | Reusable workflow that runs **one** build and records timings. Every optimization is an input. |
| `.github/workflows/experiments.yml` | Dispatcher: expands the matrix, fans out builds, aggregates a Markdown report. |
| `.github/workflows/smoke.yml` | Cheap Linux build on push, so the app never rots. |
| `scripts/run.sh` | Drive everything from the terminal with `gh`. No clicking in the Actions UI. |
| `scripts/plan.mjs`, `record.mjs`, `summarize.mjs` | Matrix expansion, timing record, report generation. |
| `docs/experiments.md` | What each experiment tests, when the option applies, expected impact. |
| `docs/tutorial-draft.md` | Skeleton of the guide for the Tauri docs, filled in as results arrive. |
| `results/` | Downloaded reports, one folder per run tag (git-ignored). |
| `tools/` | Unrelated to the harness; a patch for a local Claude Code hook. Not watched by CI. |

## Running experiments

Requirements: the repo pushed to GitHub with Actions enabled, `gh` logged in
with the `workflow` scope, and `app/src-tauri/Cargo.lock` committed (run
`cargo generate-lockfile` in `app/src-tauri` once; it needs a local Rust
toolchain). Without the lockfile the builds still work but skip `--locked`,
so dependency versions may differ between variants.

```bash
scripts/run.sh                          # every experiment, every OS (about 70 jobs)
scripts/run.sh --only baseline          # a single experiment on all 3 runners
scripts/run.sh --only cache --twice     # cache group, run twice: cold then warm
scripts/run.sh --only linker,profile --os ubuntu-24.04
scripts/run.sh --only baseline --runs 2 # build twice inside the job (warm incremental)
scripts/run.sh --no-wait                # dispatch and return immediately
```

Each invocation dispatches `experiments.yml`, waits, then downloads
`report.md` and the raw timing JSON files into `results/<tag>/`. The same
report also shows up in the run's job summary.

Selection accepts experiment names (`cache-swatinem`) or group names
(`cache`, `linker`, `profile`, `bundle`, `deps`, `frontend`, `toolchain`,
`combo`). Edit `experiments/matrix.json` to add a variant. No workflow changes
are needed unless you need a new knob.

## Reading the numbers

- **build #1** is the wall time of `pnpm tauri build`: frontend build, cargo,
  and bundling together. This is the number to compare.
- **build #2** exists only with `--runs 2`: a second build in the same job
  after a one-line change to `lib.rs`, so it measures the cost of rebuilding
  the app crate on a warm `target/`.
- Cache experiments show no gain on the first run. The first run fills the
  cache. Use `--twice` and read the second report.
- Runner times vary by a few percent between runs. Repeat before drawing
  conclusions from small deltas.
- Every job also uploads `cargo-timing.html` (from `cargo build --timings`),
  which shows which crates dominate the critical path.

## Local development

```bash
cd app
pnpm install
pnpm tauri icon src-tauri/app-icon.png   # generates src-tauri/icons/*
pnpm tauri dev
```

Rust and the Tauri Linux prerequisites are needed locally; see the
[Tauri prerequisites](https://tauri.app/start/prerequisites/).
