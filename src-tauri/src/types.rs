use serde::Deserialize;

#[derive(Default, Serialize, Deserialize)]
pub struct GameRecord {
    pub game_time: u64,
    pub start_time: u64,
    pub points: u32    
}

#[derive(Debug, serde::Deserialize)]
pub struct ComponentDimensions {
  pub width: u16,
  pub height: u16
}

#[derive(Default, Serialize, Deserialize)]
pub struct Games {
    pub records: Vec<GameRecord>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SpotifyAuthD {
    establishedInMs: Option<u128>,
    access_token: String,
    token_type: String,
    scope: String,
    expires_inS: Option<u16>,
    refresh_token: String
}

impl Default for SpotifyAuthD {
    fn default() -> Self {
        Self {
            establishedInMs: Option::None,
            access_token: Default::default(),
            token_type: Default::default(),
            scope: Default::default(),
            expires_inS: Default::default(),
            refresh_token: Default::default()
        }
    }
}
