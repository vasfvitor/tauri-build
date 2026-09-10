use serde::Serialize;

#[cfg(feature = "big")]
include!(concat!(env!("OUT_DIR"), "/big.rs"));
use sha2::{Digest, Sha256};

#[derive(Serialize)]
pub struct BuildInfo {
    version: &'static str,
    profile: &'static str,
    features: Vec<&'static str>,
    target: &'static str,
}

#[tauri::command]
fn build_info() -> BuildInfo {
    let mut features = Vec::new();
    if cfg!(feature = "heavy") {
        features.push("heavy");
    }
    BuildInfo {
        version: env!("CARGO_PKG_VERSION"),
        profile: if cfg!(debug_assertions) { "debug" } else { "release" },
        features,
        target: std::env::consts::ARCH,
    }
}

#[tauri::command]
fn sha256(text: String) -> String {
    let digest = Sha256::digest(text.as_bytes());
    hex::encode(digest)
}

#[cfg(feature = "heavy")]
#[tauri::command]
async fn fetch_json(url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .user_agent("bench-app/0.1")
        .build()
        .map_err(|e| e.to_string())?;
    let value: serde_json::Value = client
        .get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;
    serde_json::to_string_pretty(&value).map_err(|e| e.to_string())
}

#[cfg(not(feature = "heavy"))]
#[tauri::command]
fn fetch_json(_url: String) -> Result<String, String> {
    Err("fetch_json is only available when built with the `heavy` feature".into())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![build_info, sha256, fetch_json])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
