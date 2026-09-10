// Aggregates timing JSON files into a Markdown report.
// Usage: node scripts/summarize.mjs <dir-with-json> [<dir> ...]
//
// Repetitions of the same (experiment, os) are collapsed to the median; the
// spread column shows min..max so noise stays visible. Each experiment is
// compared against its own baseline (the `baseline` field in
// experiments/matrix.json, default "baseline").
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dirs = process.argv.slice(2);
const rows = [];
for (const dir of dirs) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try { rows.push(JSON.parse(readFileSync(join(dir, f), "utf8"))); } catch {}
  }
}
if (!rows.length) { console.log("_no timing records found_"); process.exit(0); }

const matrixPath = join(dirname(fileURLToPath(import.meta.url)), "..", "experiments", "matrix.json");
const baselineOf = new Map();
if (existsSync(matrixPath)) {
  for (const e of JSON.parse(readFileSync(matrixPath, "utf8")).experiments) baselineOf.set(e.name, e.baseline ?? "baseline");
}

const median = (xs) => { const s = xs.filter((x) => x > 0).sort((a, b) => a - b); return s.length ? s[(s.length - 1) >> 1] : 0; };
const fmt = (s) => (s ? `${Math.floor(s / 60)}m${String(Math.round(s % 60)).padStart(2, "0")}s` : "-");
const mb = (b) => (b ? (b / 1024 / 1024).toFixed(1) : "-");
const pct = (x, base) => (x && base ? `${(((x - base) / base) * 100).toFixed(0)}%` : "-");

// group by os, then by experiment
const byOs = new Map();
for (const r of rows) {
  const os = byOs.get(r.os) ?? byOs.set(r.os, new Map()).get(r.os);
  (os.get(r.name) ?? os.set(r.name, []).get(r.name)).push(r);
}

const agg = (list) => {
  const s = (k) => median(list.map((r) => r.seconds[k]));
  const b = list.map((r) => r.seconds.build_1).filter((x) => x > 0);
  const ok = list.filter((r) => r.status === "success").length;
  const first = list[0];
  return {
    name: first.name, n: list.length, ok, change: first.change ?? "none", ncpu: first.ncpu ?? 0,
    build: s("build_1"), build2: s("build_2"), cargo: s("cargo_1"), frontend: s("frontend"),
    pnpm: s("pnpm_install"), sysdeps: s("sysdeps"), job: s("job_total"),
    spread: b.length > 1 ? `${fmt(Math.min(...b))}..${fmt(Math.max(...b))}` : "",
    binary: median(list.map((r) => r.binary_bytes)), bundle: median(list.map((r) => r.bundle_kbytes)),
  };
};

const out = [];
out.push(`## Build experiments report`);
out.push(``);
out.push(`Records: ${rows.length} · run ${rows[0].run_id}${rows[0].tag ? ` · tag \`${rows[0].tag}\`` : ""} · change scenario: \`${rows[0].change ?? "none"}\``);
out.push(``);
for (const [os, exps] of [...byOs.entries()].sort()) {
  const aggs = [...exps.values()].map(agg).sort((a, b) => (a.build || 1e9) - (b.build || 1e9));
  const byName = new Map(aggs.map((a) => [a.name, a]));
  const ncpu = aggs.find((a) => a.ncpu)?.ncpu;
  out.push(`### ${os}${ncpu ? ` (${ncpu} cores)` : ""}`);
  out.push(``);
  out.push(`| experiment | n | tauri build | Δ vs baseline | spread | cargo | bundling* | frontend | build #2 | job total | sysdeps | binary MB | bundle MB |`);
  out.push(`|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|`);
  for (const a of aggs) {
    const base = byName.get(baselineOf.get(a.name) ?? "baseline");
    const status = a.ok === a.n ? "" : ` ❌ ${a.n - a.ok}/${a.n} failed`;
    const bundling = a.build && a.cargo ? Math.max(0, a.build - a.cargo - a.frontend) : 0;
    out.push(`| ${a.name}${status} | ${a.n} | ${fmt(a.build)} | ${base && base !== a ? pct(a.build, base.build) : "-"} | ${a.spread} | ${fmt(a.cargo)} | ${fmt(bundling)} | ${fmt(a.frontend)} | ${fmt(a.build2)} | ${fmt(a.job)} | ${fmt(a.sysdeps)} | ${mb(a.binary)} | ${a.bundle ? (a.bundle / 1024).toFixed(1) : "-"} |`);
  }
  out.push(``);
}
out.push(`_tauri build = wall time of \`pnpm tauri build\` (median over n runs). cargo = cargo's own total from \`--timings\`. *bundling = tauri build − cargo − frontend, so it also absorbs the Tauri CLI overhead. Δ is relative to the experiment's baseline on the same runner. Cache experiments only show their benefit on a second workflow run with a warm cache._`);
console.log(out.join("\n"));
