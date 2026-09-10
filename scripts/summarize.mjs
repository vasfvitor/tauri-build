// Aggregates timing JSON files into a Markdown report.
// Usage: node scripts/summarize.mjs <dir-with-json> [<dir> ...]
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dirs = process.argv.slice(2);
const rows = [];
for (const dir of dirs) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try { rows.push(JSON.parse(readFileSync(join(dir, f), "utf8"))); } catch {}
  }
}
if (!rows.length) { console.log("_no timing records found_"); process.exit(0); }

const fmt = (s) => (s ? `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s` : "-");
const mb = (b) => (b ? (b / 1024 / 1024).toFixed(1) : "-");
const byOs = new Map();
for (const r of rows) (byOs.get(r.os) ?? byOs.set(r.os, []).get(r.os)).push(r);

const out = [];
out.push(`## Build experiments report`);
out.push(``);
out.push(`Records: ${rows.length} · run ${rows[0].run_id}${rows[0].tag ? ` · tag \`${rows[0].tag}\`` : ""}`);
out.push(``);
for (const [os, list] of [...byOs.entries()].sort()) {
  const base = list.find((r) => r.name === "baseline");
  list.sort((a, b) => (a.seconds.build_1 || 1e9) - (b.seconds.build_1 || 1e9));
  out.push(`### ${os}`);
  out.push(``);
  out.push(`| experiment | status | build #1 | Δ vs baseline | build #2 (warm) | job total | pnpm | sysdeps | binary MB | bundle MB |`);
  out.push(`|---|---|---:|---:|---:|---:|---:|---:|---:|---:|`);
  for (const r of list) {
    const s = r.seconds;
    const delta = base && base.seconds.build_1 && s.build_1
      ? `${(((s.build_1 - base.seconds.build_1) / base.seconds.build_1) * 100).toFixed(0)}%`
      : "-";
    out.push(`| ${r.name} | ${r.status === "success" ? "✅" : "❌ " + r.status} | ${fmt(s.build_1)} | ${delta} | ${fmt(s.build_2)} | ${fmt(s.job_total)} | ${fmt(s.pnpm_install)} | ${fmt(s.sysdeps)} | ${mb(r.binary_bytes)} | ${r.bundle_kbytes ? (r.bundle_kbytes / 1024).toFixed(1) : "-"} |`);
  }
  out.push(``);
}
out.push(`_build #1 = wall time of \`pnpm tauri build\` (frontend + cargo + bundling). Δ is relative to the \`baseline\` experiment on the same runner. A cache-based experiment only shows its benefit on the **second** workflow run (first run populates the cache)._`);
console.log(out.join("\n"));
