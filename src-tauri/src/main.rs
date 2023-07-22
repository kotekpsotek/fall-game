// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(non_snake_case)]
#[macro_use]
extern crate tauri;
use tauri::{SystemTray, SystemTrayMenu, CustomMenuItem, Menu, WindowMenuEvent, Manager};
use rand::{thread_rng, Rng};
use types::{Games, GameRecord};
use std::{ fs, path::Path, vec };

mod types;
#[path ="./commands/main.rs"]
mod commands_src;

/** Safe border for spawn hearts into user screen view */
const SAFE_BORDER_SIZE: u16 = 50;
const SAFE_BORDER_SIZE_ONLINE: u16 = SAFE_BORDER_SIZE / 2;

/// Command cannot have any not snake case paramaters
#[tauri::command]
fn hello_to_you(nameSnakeCase: &str) -> String {
  format!("Hello from tauri to you {nameSnakeCase:}")
}

#[tauri::command]
fn get_coords(dimensions: types::ComponentDimensions, online: bool) -> (u32, u32) {
  enum RangeType {
    Width,
    Height
  }

  impl RangeType {
    fn range(self, online: bool, dimensions: &types::ComponentDimensions) -> std::ops::Range<u16> {
      match self {
        RangeType::Width => if online {
          return 0..(dimensions.width - SAFE_BORDER_SIZE_ONLINE);
        } else {
          return 0..(dimensions.width - SAFE_BORDER_SIZE)
        },
        RangeType::Height => if online {
          return 0..(dimensions.height - SAFE_BORDER_SIZE_ONLINE);
        } else {
          return 0..(dimensions.height - SAFE_BORDER_SIZE)
        }
      }
    }
  }

  let width_rnd = thread_rng().gen_range(RangeType::Width.range(online, &dimensions));
  let height_rnd = thread_rng().gen_range(RangeType::Height.range(online, &dimensions));

  (width_rnd as u32, height_rnd as u32)
}

#[tauri::command]
fn game_end(userPoints: u32, gameTime: u64, gameStartTime: u64) -> Result<(), ()> {
  let game = GameRecord { points: userPoints, game_time: gameTime, start_time: gameStartTime };

  // Read from file
  let act_file_cnt = fs::read_to_string("game.json")
    .or_else(|_| serde_json::to_string(&Games::default()))
    .unwrap();
  let mut act_cnt_de = serde_json::from_str::<Games>(&act_file_cnt)
    .unwrap();
  
  // Add new record and Save to file
  act_cnt_de.records.push(game);
  let serialized_s = serde_json::to_string(&act_cnt_de)
    .unwrap();
  fs::write("game.json", serialized_s)
    .unwrap();

  Ok(())
}

/// Get from file All games saved records
fn get_game_scores() -> Vec<GameRecord> {
  let p = Path::new("game.json");
  if p.exists() {
    let content = fs::read_to_string(p)
      .unwrap();
    let deserialize = serde_json::from_str::<Games>(&content)
      .unwrap();
    deserialize.records
  }
  else {
    vec![]
  }
}

struct AppMenu;
impl AppMenu {
  /// Create Native Window Menu
  fn create() -> Menu {
    let item_menuScores = CustomMenuItem::new("scores", "Game Scores");
    Menu::new()
      .add_item(item_menuScores)
  }

  /// Handle click on Native Window Menu Items
  fn handle_event(event: WindowMenuEvent) {
    match event.menu_item_id() {
      "scores" => {
        // Obtain all games scores Vector (which in JavaScript will be presented as Array)
        let game_scores = get_game_scores();
        
        // Scores menu will be show up by application frontend
        event.window()
          .emit("show-scores-menu", &game_scores)
          .unwrap();
      },
      _ => ()
    };
  }
}

/// Create **System Tray Menu**
struct AppTrayMenu;
impl AppTrayMenu {
  /// Create system tray menu element
  fn create() -> SystemTray {
    let item_gameScores = CustomMenuItem::new("scores", "Games Scores");
    let tray_menu = SystemTrayMenu::new()
      .add_item(item_gameScores);
    SystemTray::new()
      .with_menu(tray_menu)
  }

  /// Handle click on Tray Menu Item
  fn handle_event(app: &tauri::AppHandle, event: tauri::SystemTrayEvent) {
    match event {
      tauri::SystemTrayEvent::MenuItemClick { tray_id: _, id, .. } => {
        match id.as_str() {
          // When user have hope to see it's game scores, will be see 
          "scores" => {
            let game_scores = get_game_scores();

            app.get_window("main")
              .expect(r#"Could not get "main" window"#)
              .emit("show-scores-menu", &game_scores)
              .unwrap()
          },
          // What ever else is handled by this 'commont' shoulder
          _ => ()
        };
      },
      _ => ()
    };
  }
}

fn main() {
  use commands_src::{ save_spotify_auth_datas, load_spotify_auth_datas, get_rotation_degrees, quit, online_game_id };

  
  let window_menu = AppMenu::create();
  let system_tray = AppTrayMenu::create();
  tauri::Builder::default()
    .menu(window_menu)
    .on_menu_event(AppMenu::handle_event)
    .system_tray(system_tray)
    .on_system_tray_event(AppTrayMenu::handle_event)
    .invoke_handler(generate_handler![hello_to_you, get_coords, game_end, save_spotify_auth_datas, load_spotify_auth_datas, get_rotation_degrees, quit, online_game_id])
    .setup(|app| {
      // Here are defined things by which program walk throught durning application setup to run
      let main_window = app.get_window("main")
        .unwrap();
      let native_menu = main_window.menu_handle();
      
      // Close 'Native Window Menu Bar' when user is durning game-play
      main_window.listen("user-on-game", {
        let native_menu = native_menu.clone();
        move |_| {
          native_menu.toggle()
            .expect("Could not close Native Window Menu for game");
        }}
      );

      // Show user Native Window Menu Bar after capture below event 
      main_window.listen("user-out-of-game", move |_| {
        native_menu.show()
          .expect("Could not show 'Native Window Menu Bar'");
      });
      
      // Maximize window size to full screen
      main_window.maximize()
        .unwrap();

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

    todo!("System Tray Menu with 'Games Scores' option same as in example of 'Native Window Menu'");
}
