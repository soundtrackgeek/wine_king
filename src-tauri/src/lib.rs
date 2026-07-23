mod game;

use game::{GameState, PlayerAction};
use std::sync::Mutex;
use tauri::{Manager, State};

struct GameStore(Mutex<GameState>);

#[tauri::command]
fn get_game(store: State<'_, GameStore>) -> Result<GameState, String> {
    store
        .0
        .lock()
        .map(|game| game.clone())
        .map_err(|_| "The game state is unavailable.".to_string())
}

#[tauri::command]
fn new_game(seed: Option<u64>, store: State<'_, GameStore>) -> Result<GameState, String> {
    let mut game = store
        .0
        .lock()
        .map_err(|_| "The game state is unavailable.".to_string())?;
    *game = GameState::new(seed.unwrap_or(2_026_072_300_1));
    Ok(game.clone())
}

#[tauri::command]
fn perform_action(action: PlayerAction, store: State<'_, GameStore>) -> Result<GameState, String> {
    let mut game = store
        .0
        .lock()
        .map_err(|_| "The game state is unavailable.".to_string())?;
    game.perform(action)?;
    Ok(game.clone())
}

#[tauri::command]
fn advance_week(store: State<'_, GameStore>) -> Result<GameState, String> {
    let mut game = store
        .0
        .lock()
        .map_err(|_| "The game state is unavailable.".to_string())?;
    game.advance_week()?;
    Ok(game.clone())
}

#[tauri::command]
fn save_game(app: tauri::AppHandle, store: State<'_, GameStore>) -> Result<String, String> {
    let game = store
        .0
        .lock()
        .map_err(|_| "The game state is unavailable.".to_string())?;
    let save_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not locate the save directory: {error}"))?;
    std::fs::create_dir_all(&save_dir)
        .map_err(|error| format!("Could not create the save directory: {error}"))?;
    let save_path = save_dir.join("season-1.json");
    let json = serde_json::to_string_pretty(&*game)
        .map_err(|error| format!("Could not serialize the game: {error}"))?;
    std::fs::write(&save_path, json)
        .map_err(|error| format!("Could not write the save file: {error}"))?;
    Ok(save_path.to_string_lossy().into_owned())
}

#[tauri::command]
fn load_game(app: tauri::AppHandle, store: State<'_, GameStore>) -> Result<GameState, String> {
    let save_path = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not locate the save directory: {error}"))?
        .join("season-1.json");
    let json = std::fs::read_to_string(&save_path)
        .map_err(|_| "No saved season was found yet.".to_string())?;
    let loaded: GameState = serde_json::from_str(&json)
        .map_err(|error| format!("The save file could not be read: {error}"))?;
    let mut game = store
        .0
        .lock()
        .map_err(|_| "The game state is unavailable.".to_string())?;
    *game = loaded;
    Ok(game.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(GameStore(Mutex::new(GameState::new(2_026_072_300_1))))
        .invoke_handler(tauri::generate_handler![
            get_game,
            new_game,
            perform_action,
            advance_week,
            save_game,
            load_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running Wine King");
}
