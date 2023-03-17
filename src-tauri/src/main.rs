#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file,create_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn save_file(path: String, contents: String) {
    println!("{}",path);
    fs::write(path, contents).unwrap();
}

#[tauri::command]
fn create_dir(path: String) {
    println!("{}",path);
    fs::create_dir(path).unwrap();
}
