use std::{env, fs, path::Path};

fn main() {
    // With the `big` feature, generate a chunk of synthetic-but-realistic code
    // so the app crate is large enough for profile knobs (LTO, codegen-units,
    // opt-level) to show measurable differences. BIG_MODULES tunes the size.
    if env::var_os("CARGO_FEATURE_BIG").is_some() {
        let modules: usize = env::var("BIG_MODULES").ok().and_then(|v| v.parse().ok()).unwrap_or(150);
        let out = Path::new(&env::var("OUT_DIR").unwrap()).join("big.rs");
        fs::write(&out, generate(modules)).unwrap();
        println!("cargo:rerun-if-env-changed=BIG_MODULES");
    }
    tauri_build::build()
}

fn generate(modules: usize) -> String {
    let mut s = String::new();
    for m in 0..modules {
        s.push_str(&format!(
            r#"
pub mod m{m} {{
    use serde::{{Deserialize, Serialize}};
    use std::collections::HashMap;
    use std::fmt;

    #[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
    pub struct Record {{
        pub id: u64,
        pub name: String,
        pub tags: Vec<String>,
        pub score: f64,
        pub attrs: HashMap<String, String>,
        pub kind: Kind,
    }}

    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
    pub enum Kind {{ #[default] A, B, C, D }}

    impl fmt::Display for Record {{
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {{
            write!(f, "{{}}#{{}} [{{}}] {{:.2}}", self.name, self.id, self.tags.join(","), self.score)
        }}
    }}

    pub fn build(n: u64) -> Vec<Record> {{
        (0..n).map(|i| Record {{
            id: i,
            name: format!("rec-{m}-{{i}}"),
            tags: (0..(i % 5)).map(|t| format!("t{{t}}")).collect(),
            score: (i as f64).sqrt() * {m}.0,
            attrs: [("k".to_string(), i.to_string())].into_iter().collect(),
            kind: match i % 4 {{ 0 => Kind::A, 1 => Kind::B, 2 => Kind::C, _ => Kind::D }},
        }}).collect()
    }}

    pub fn summarize(rs: &[Record]) -> HashMap<Kind, (usize, f64)> {{
        let mut out: HashMap<Kind, (usize, f64)> = HashMap::new();
        for r in rs {{
            let e = out.entry(r.kind).or_insert((0, 0.0));
            e.0 += 1;
            e.1 += r.score;
        }}
        out
    }}

    pub fn roundtrip(rs: &[Record]) -> Result<Vec<Record>, String> {{
        let json = serde_json::to_string(rs).map_err(|e| e.to_string())?;
        serde_json::from_str(&json).map_err(|e| e.to_string())
    }}

    pub fn classify(r: &Record) -> &'static str {{
        match (r.kind, r.score as u64 % 7, r.tags.len()) {{
            (Kind::A, 0, _) => "a0", (Kind::A, 1, 0) => "a1z", (Kind::A, 1, _) => "a1",
            (Kind::A, 2..=3, _) => "a23", (Kind::A, _, _) => "a",
            (Kind::B, x, y) if x > y as u64 => "bx", (Kind::B, _, _) => "b",
            (Kind::C, _, 0) => "c0", (Kind::C, _, _) => "c",
            (Kind::D, 6, _) => "d6", (Kind::D, _, _) => "d",
        }}
    }}

    #[tauri::command]
    pub fn cmd_{m}(n: u64) -> Result<String, String> {{
        let rs = build(n);
        let rs = roundtrip(&rs)?;
        let sum = summarize(&rs);
        let kinds: Vec<String> = rs.iter().map(classify).map(String::from).collect();
        Ok(format!("{{}} records, {{}} kinds, {{}} classes", rs.len(), sum.len(), kinds.len()))
    }}
}}
"#
        ));
    }
    s
}
