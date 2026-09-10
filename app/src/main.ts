import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { openUrl } from "@tauri-apps/plugin-opener";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

type BuildInfo = { version: string; profile: string; features: string[]; target: string };

async function loadBuildInfo() {
  const info = await invoke<BuildInfo>("build_info");
  $("build-info").textContent =
    `v${info.version} · ${info.profile} · ${info.target} · features: ${info.features.join(", ") || "none"}`;
}

let count = 0;
$("inc").addEventListener("click", () => {
  count += 1;
  $("count").textContent = String(count);
});

$("hash-btn").addEventListener("click", async () => {
  const text = $<HTMLInputElement>("hash-input").value;
  $("hash-out").textContent = await invoke<string>("sha256", { text });
});

$("open-btn").addEventListener("click", async () => {
  const path = await open({ multiple: false, directory: false });
  if (!path) return;
  const content = await readTextFile(path);
  $("file-out").textContent = `${path}\n---\n${content.slice(0, 2000)}`;
});

$("fetch-btn").addEventListener("click", async () => {
  const url = $<HTMLInputElement>("url-input").value;
  try {
    const json = await invoke<string>("fetch_json", { url });
    $("fetch-out").textContent = json.slice(0, 2000);
  } catch (e) {
    $("fetch-out").textContent = String(e);
  }
});

$("link-btn").addEventListener("click", () => openUrl("https://tauri.app"));

loadBuildInfo();
