// Turns --key value pairs into the timing JSON written by build.yml.
const a = process.argv.slice(2);
const get = (k, d = "") => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : d; };
const num = (k) => Number(get(k, "0")) || 0;
process.stdout.write(JSON.stringify({
  name: get("name"),
  os: get("os"),
  status: get("status"),
  tag: get("tag"),
  run_id: get("run-id"),
  run_attempt: get("attempt"),
  seconds: {
    sysdeps: num("sysdeps"),
    pnpm_install: num("pnpm"),
    build_1: num("build1"),
    build_2: num("build2"),
    job_total: num("job-total"),
  },
  binary_bytes: num("binary-bytes"),
  bundle_kbytes: num("bundle-kbytes"),
}, null, 2));
