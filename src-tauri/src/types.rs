use serde::Deserialize;

#[derive(Default, Serialize, Deserialize)]
pub struct GameRecord {
    pub game_time: u64,
    pub start_time: u64,
    pub points: u32    
}

#[derive(Default, Serialize, Deserialize)]
pub struct Games {
    pub records: Vec<GameRecord>
}
