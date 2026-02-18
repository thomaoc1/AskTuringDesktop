use tauri::{AppHandle, Manager, LogicalSize, LogicalPosition, Emitter};

#[tauri::command]
pub fn show_login_window(app: AppHandle) -> Result<(), String> {
    let login_window = app.get_webview_window("login")
        .ok_or("Login window not found")?;

    login_window.show().map_err(|e| e.to_string())?;
    login_window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn hide_login_window(app: AppHandle) -> Result<(), String> {
    let login_window = app.get_webview_window("login")
        .ok_or("Login window not found")?;

    login_window.hide().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn show_main_window(app: AppHandle) -> Result<(), String> {
    let main_window = app.get_webview_window("main")
        .ok_or("Main window not found")?;

    main_window.show().map_err(|e| e.to_string())?;
    main_window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn hide_main_window(app: AppHandle) -> Result<(), String> {
    let main_window = app.get_webview_window("main")
        .ok_or("Main window not found")?;

    main_window.hide().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn toggle_bubble_window(app: AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("bubble")
        .ok_or("Bubble window not found")?;

    if window.is_visible().unwrap_or(false) {
        let _ = window.emit("window-hiding", ());
        // Delay hide to allow animation to complete
        std::thread::sleep(std::time::Duration::from_millis(200));
        window.hide().map_err(|e| e.to_string())?;
    } else {
        window.show().map_err(|e| e.to_string())?;
        let _ = window.emit("window-showing", ());
        window.set_focus().map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn show_bubble_window(app: AppHandle) -> Result<(), String> {
    // Reposition the window before showing it
    position_bubble_window(&app)?;

    let window = app.get_webview_window("bubble")
        .ok_or("Bubble window not found")?;

    window.show().map_err(|e| e.to_string())?;
    let _ = window.emit("window-showing", ());
    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn hide_bubble_window(app: AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("bubble")
        .ok_or("Bubble window not found")?;

    window.hide().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn resize_bubble_window(app: AppHandle, height: f64) -> Result<(), String> {
    let window = app.get_webview_window("bubble")
        .ok_or("Bubble window not found")?;

    let size = LogicalSize::new(700.0, height);
    window.set_size(size).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn position_bubble_window<R: tauri::Runtime>(app: &impl Manager<R>) -> Result<(), String> {
    let window = app.get_webview_window("bubble")
        .ok_or("Bubble window not found")?;

    // Get the current monitor
    let monitor = window.current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No monitor found")?;

    let monitor_size = monitor.size();
    let scale_factor = monitor.scale_factor();

    // Convert physical to logical
    let screen_width = monitor_size.width as f64 / scale_factor;
    let screen_height = monitor_size.height as f64 / scale_factor;

    // Position window centered horizontally, and higher up vertically
    let window_width = 700.0;
    let window_height = 600.0;

    // Center horizontally
    let x = (screen_width - window_width) / 2.0;

    // Position from bottom with some padding
    let y = screen_height - window_height - 200.0; // 200px from bottom

    let position = LogicalPosition::new(x, y);
    window.set_position(position).map_err(|e| e.to_string())?;

    Ok(())
}
