use crate::types::SpotifyAuthD;
use std::{fs, path::Path};
use rand::{thread_rng, Rng};

static SPOTIFY_AUTH_FILE_NAME: &str = "spotify_auth.json";

#[tauri::command]
pub fn save_spotify_auth_datas(datas: SpotifyAuthD) -> Result<(), String> {
    // Save into file
    let serialized = serde_json::to_string(&datas)
        .unwrap();
    
    fs::write(SPOTIFY_AUTH_FILE_NAME, serialized)
        .unwrap();
    
    Ok(())
}

#[tauri::command]
pub fn load_spotify_auth_datas() -> SpotifyAuthD {
    let p = Path::new(SPOTIFY_AUTH_FILE_NAME);

    if p.exists() {
        let datas = fs::read_to_string(p)
            .unwrap();
        let datas_des = serde_json::from_str::<SpotifyAuthD>(&datas)
            .unwrap();
        datas_des // Return here result
    }
    else {
        SpotifyAuthD::default()
    }
}

#[tauri::command]
pub fn get_rotation_degrees() -> u8 {
    thread_rng().gen_range(0..90)
}

#[tauri::command]
/** Terminates application */
pub fn quit(app_handle: tauri::AppHandle) {
    app_handle.exit(0);
}
