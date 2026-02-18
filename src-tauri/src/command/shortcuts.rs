use tauri::{AppHandle, Manager, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, GlobalShortcutExt};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShortcutConfig {
    pub id: String,
    pub keys: Vec<String>,
}

pub struct ShortcutState {
    pub current_shortcuts: Mutex<Vec<ShortcutConfig>>,
}

impl ShortcutState {
    pub fn new() -> Self {
        Self {
            current_shortcuts: Mutex::new(Vec::new()),
        }
    }
}

// Convert our key format to Tauri's format
fn parse_shortcut(keys: &[String]) -> Option<Shortcut> {
    let mut modifiers = Modifiers::empty();
    let mut key_code: Option<Code> = None;

    for key in keys {
        match key.as_str() {
            "Cmd" | "Meta" => modifiers |= Modifiers::META,
            "Ctrl" | "Control" => modifiers |= Modifiers::CONTROL,
            "Alt" => modifiers |= Modifiers::ALT,
            "Shift" => modifiers |= Modifiers::SHIFT,
            // Map single letter/number to Code
            letter if letter.len() == 1 => {
                let ch = letter.chars().next().unwrap();
                key_code = match ch {
                    'A' | 'a' => Some(Code::KeyA),
                    'B' | 'b' => Some(Code::KeyB),
                    'C' | 'c' => Some(Code::KeyC),
                    'D' | 'd' => Some(Code::KeyD),
                    'E' | 'e' => Some(Code::KeyE),
                    'F' | 'f' => Some(Code::KeyF),
                    'G' | 'g' => Some(Code::KeyG),
                    'H' | 'h' => Some(Code::KeyH),
                    'I' | 'i' => Some(Code::KeyI),
                    'J' | 'j' => Some(Code::KeyJ),
                    'K' | 'k' => Some(Code::KeyK),
                    'L' | 'l' => Some(Code::KeyL),
                    'M' | 'm' => Some(Code::KeyM),
                    'N' | 'n' => Some(Code::KeyN),
                    'O' | 'o' => Some(Code::KeyO),
                    'P' | 'p' => Some(Code::KeyP),
                    'Q' | 'q' => Some(Code::KeyQ),
                    'R' | 'r' => Some(Code::KeyR),
                    'S' | 's' => Some(Code::KeyS),
                    'T' | 't' => Some(Code::KeyT),
                    'U' | 'u' => Some(Code::KeyU),
                    'V' | 'v' => Some(Code::KeyV),
                    'W' | 'w' => Some(Code::KeyW),
                    'X' | 'x' => Some(Code::KeyX),
                    'Y' | 'y' => Some(Code::KeyY),
                    'Z' | 'z' => Some(Code::KeyZ),
                    '0' => Some(Code::Digit0),
                    '1' => Some(Code::Digit1),
                    '2' => Some(Code::Digit2),
                    '3' => Some(Code::Digit3),
                    '4' => Some(Code::Digit4),
                    '5' => Some(Code::Digit5),
                    '6' => Some(Code::Digit6),
                    '7' => Some(Code::Digit7),
                    '8' => Some(Code::Digit8),
                    '9' => Some(Code::Digit9),
                    ',' => Some(Code::Comma),
                    _ => None,
                };
            }
            _ => {}
        }
    }

    key_code.map(|code| Shortcut::new(Some(modifiers), code))
}

#[tauri::command]
pub fn update_shortcuts(
    app: AppHandle,
    shortcuts: Vec<ShortcutConfig>,
    state: State<ShortcutState>,
) -> Result<(), String> {
    println!("Updating shortcuts: {:?}", shortcuts);

    // Unregister all existing shortcuts
    if let Err(e) = app.global_shortcut().unregister_all() {
        eprintln!("Failed to unregister shortcuts: {}", e);
    }

    // Store the new shortcuts
    if let Ok(mut current) = state.current_shortcuts.lock() {
        *current = shortcuts.clone();
    }

    // Register new shortcuts
    for shortcut_config in shortcuts {
        if let Some(shortcut) = parse_shortcut(&shortcut_config.keys) {
            let id = shortcut_config.id.clone();

            let result = app.global_shortcut().on_shortcut(shortcut, move |app, _shortcut, event| {
                if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                    println!("Shortcut triggered: {}", id);

                    match id.as_str() {
                        "show-hide-bubble" => {
                            if let Some(window) = app.get_webview_window("bubble") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.emit("window-hiding", ());
                                    // Delay hide to allow animation to complete
                                    std::thread::spawn(move || {
                                        std::thread::sleep(std::time::Duration::from_millis(200));
                                        let _ = window.hide();
                                    });
                                } else {
                                    let _ = crate::command::window::position_bubble_window(app);
                                    let _ = window.show();
                                    let _ = window.emit("window-showing", ());
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        "open-settings" => {
                            // Show main window
                            if let Some(main_window) = app.get_webview_window("main") {
                                let _ = main_window.show();
                                let _ = main_window.set_focus();
                            }
                        }
                        _ => {
                            println!("Unknown shortcut id: {}", id);
                        }
                    }
                }
            });

            if let Err(e) = result {
                eprintln!("Failed to register shortcut {}: {}", shortcut_config.id, e);
                return Err(format!("Failed to register shortcut: {}", e));
            }
        } else {
            eprintln!("Failed to parse shortcut: {:?}", shortcut_config);
        }
    }

    println!("Shortcuts updated successfully");
    Ok(())
}

#[tauri::command]
pub fn get_shortcuts(state: State<ShortcutState>) -> Result<Vec<ShortcutConfig>, String> {
    if let Ok(shortcuts) = state.current_shortcuts.lock() {
        Ok(shortcuts.clone())
    } else {
        Err("Failed to get shortcuts".to_string())
    }
}
