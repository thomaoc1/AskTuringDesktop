mod command;

use command::window::{toggle_bubble_window, show_bubble_window, hide_bubble_window, resize_bubble_window, position_bubble_window, show_login_window, hide_login_window, show_main_window, hide_main_window};
use command::shortcuts::{update_shortcuts, get_shortcuts, ShortcutState};
use tauri::{Manager, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, GlobalShortcutExt};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ShortcutState::new())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .filter(|metadata| {
                    // Only show logs from our crate
                    metadata.target().starts_with("ask_turing_desktop")
                })
                .build()
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            // Position the bubble window
            let _ = position_bubble_window(app);

            // Don't show login window immediately - let auth check complete first
            // The frontend will show the appropriate window based on auth state

            // Set up deep link handler for OAuth callbacks
            use tauri_plugin_deep_link::DeepLinkExt;

            let app_handle = app.handle().clone();

            // Register the deep link scheme
            if let Err(e) = app.deep_link().register_all() {
                eprintln!("Failed to register deep link: {}", e);
            }

            app.deep_link().on_open_url(move |event| {
                let urls = event.urls();
                println!("Deep link received: {:?}", urls);
                // Forward the deep link URL to the login window
                if let Some(login_window) = app_handle.get_webview_window("login") {
                    let _ = login_window.emit("deep-link", &urls);
                } else {
                    println!("Login window not found!");
                }
            });

            // Register Cmd+Shift+K global shortcut to toggle bubble window
            let shortcut = Shortcut::new(Some(Modifiers::META | Modifiers::SHIFT), Code::KeyK);

            app.global_shortcut().on_shortcut(shortcut, |app, _shortcut, event| {
                if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("bubble") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.emit("window-hiding", ());
                            // Delay hide to allow animation to complete
                            std::thread::spawn(move || {
                                std::thread::sleep(std::time::Duration::from_millis(200));
                                let _ = window.hide();
                            });
                        } else {
                            let _ = position_bubble_window(app);
                            let _ = window.show();
                            let _ = window.emit("window-showing", ());
                            let _ = window.set_focus();
                        }
                    }
                }
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_bubble_window,
            show_bubble_window,
            hide_bubble_window,
            resize_bubble_window,
            show_login_window,
            hide_login_window,
            show_main_window,
            hide_main_window,
            update_shortcuts,
            get_shortcuts
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
