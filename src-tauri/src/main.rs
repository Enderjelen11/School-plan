#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file,print_dev])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn save_file(path: String, contents: String) {
    println!("{}",path);
    fs::write(path, contents).unwrap();
    //fs::create_dir(path).unwrap();
}

#[tauri::command]
fn print_dev(text: String) {
    println!("{}",text);
}
