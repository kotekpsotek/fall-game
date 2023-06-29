// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(non_snake_case)]
#[macro_use]
extern crate tauri;
use rand::{thread_rng, Rng};

/** Safe border for spawn hearts into user screen view */
const SAFE_BORDER_SIZE: u16 = 300;

/// Command cannot have any not snake case paramaters
#[tauri::command]
fn hello_to_you(nameSnakeCase: &str) -> String {
  format!("Hello from tauri to you {nameSnakeCase:}")
}

#[tauri::command]
fn get_coords(window: tauri::Window) -> (u32, u32) {
  let tauri::PhysicalSize { width, height } = window.inner_size()
    .unwrap();
  let width_rnd = thread_rng().gen_range(0..(width - SAFE_BORDER_SIZE as u32));
  let height_rnd = thread_rng().gen_range(0..(height - SAFE_BORDER_SIZE as u32));

  (width_rnd, height_rnd)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(generate_handler![hello_to_you, get_coords])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
