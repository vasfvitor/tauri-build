#!/usr/bin/env bash
# Trigger the experiments workflow from the terminal, wait for it, download
# the report into results/. Needs `gh` authenticated with `workflow` scope.
#
#   scripts/run.sh                          # everything in experiments/matrix.json
#   scripts/run.sh --only cache,linker      # groups and/or experiment names
#   scripts/run.sh --only baseline --os ubuntu-24.04 --repeat 3
#   scripts/run.sh --only cache --twice     # cold run, then a warm run (caches populated)
#   scripts/run.sh --only cache --twice --change app   # warm run rebuilds after an app-code change
#   scripts/run.sh --only cache --twice --change deps  # warm run after a new dependency (lockfile changed)
#   scripts/run.sh --only baseline --runs 2 # build twice inside the job (in-job warm rebuild)
#   scripts/run.sh --no-wait                # just dispatch and print the run URL
# --- end of usage ---
set -euo pipefail
cd "$(dirname "$0")/.."

ONLY="" OS="" RUNS="1" REPEAT="1" CHANGE="" TAG="" WAIT=1 TWICE=0 REF="${REF:-}"
while [ $# -gt 0 ]; do
  case "$1" in
    --only)   ONLY="$2";   shift 2 ;;
    --os)     OS="$2";     shift 2 ;;
    --runs)   RUNS="$2";   shift 2 ;;
    --repeat) REPEAT="$2"; shift 2 ;;
    --change) CHANGE="$2"; shift 2 ;;
    --tag)    TAG="$2";    shift 2 ;;
    --ref)    REF="$2";    shift 2 ;;
    --twice)  TWICE=1; shift ;;
    --no-wait) WAIT=0; shift ;;
    -h|--help) sed -n '2,/end of usage/p' "$0" | sed '$d'; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
TAG="${TAG:-$(date +%Y%m%d-%H%M%S)}"
REF="${REF:-$(git rev-parse --abbrev-ref HEAD)}"

# Find the run created by our dispatch: poll for a run newer than the
# dispatch timestamp instead of trusting `--limit 1` right after `gh workflow run`.
find_run() {
  local since="$1" id="" i
  for i in $(seq 1 30); do
    id=$(gh run list --workflow=experiments.yml --branch "$REF" --event workflow_dispatch \
          --limit 5 --json databaseId,createdAt \
          -q "[.[] | select(.createdAt > \"$since\")] | sort_by(.createdAt) | last | .databaseId // empty")
    [ -n "$id" ] && { echo "$id"; return 0; }
    sleep 3
  done
  echo "could not find the dispatched run after 90 s" >&2
  return 1
}

dispatch_and_wait() {
  local tag="$1" change="$2" since run_id dest
  since=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  echo ">> dispatching experiments (only='$ONLY' os='$OS' runs=$RUNS repeat=$REPEAT change=$change tag=$tag ref=$REF)"
  gh workflow run experiments.yml --ref "$REF" \
    -f only="$ONLY" -f os="$OS" -f runs="$RUNS" -f repeat="$REPEAT" -f change="$change" -f tag="$tag"
  run_id=$(find_run "$since")
  echo ">> run $run_id: $(gh run view "$run_id" --json url -q .url)"
  [ "$WAIT" = 1 ] || return 0
  # `gh run watch` redraws the whole job list every 3 s; keep the log quiet.
  gh run watch "$run_id" --exit-status >/dev/null || echo ">> some jobs failed (report still collected)"
  dest="results/${tag}"
  mkdir -p "$dest"
  gh run download "$run_id" --name report --dir "$dest" || echo ">> no report artifact"
  if [ -f "$dest/report.md" ]; then
    echo ">> report: $dest/report.md"
    cat "$dest/report.md"
  else
    echo ">> report missing for run $run_id" >&2
  fi
  return 0
}

# A single run uses --change as given (default none). With --twice the first
# run is always the cold one (change=none) and the second applies --change.
dispatch_and_wait "$TAG" "$([ "$TWICE" = 1 ] && echo none || echo "${CHANGE:-none}")"
if [ "$TWICE" = 1 ]; then
  dispatch_and_wait "${TAG}-warm-${CHANGE:-none}" "${CHANGE:-none}"
fi
