// Expands experiments/matrix.json into a GitHub Actions matrix ({include:[...]}).
// Filters: ONLY (comma list of experiment names or groups), OS (comma list of runner labels).
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? "experiments/matrix.json";
const { defaults, experiments } = JSON.parse(readFileSync(file, "utf8"));
const only = (process.env.ONLY ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const osFilter = (process.env.OS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const include = [];
for (const exp of experiments) {
  if (only.length && !only.includes(exp.name) && !only.includes(exp.group)) continue;
  const { os = defaults.os, group, ...rest } = exp;
  for (const runner of os) {
    if (osFilter.length && !osFilter.includes(runner)) continue;
    include.push({ ...rest, os: runner });
  }
}
process.stdout.write(JSON.stringify({ include }));
