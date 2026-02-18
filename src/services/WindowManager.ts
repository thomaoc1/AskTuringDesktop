import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"; // Used for toggle fallback

// Type definitions
export type WindowLabel = "bubble" | "login" | "main";

export interface WindowConfig {
  label: WindowLabel;
  route: string;
  requiresAuth: boolean;
}

// Window configurations mapping
export const WINDOW_CONFIGS: Record<WindowLabel, WindowConfig> = {
  bubble: { label: "bubble", route: "/bubble", requiresAuth: true },
  login: { label: "login", route: "/login", requiresAuth: false },
  main: { label: "main", route: "/settings", requiresAuth: true },
};

// WindowManager class - single source of truth for window operations
class WindowManager {
  // Low-level operations (wrap Tauri commands)

  async show(label: WindowLabel): Promise<void> {
    const commandMap: Record<WindowLabel, string> = {
      bubble: "show_bubble_window",
      login: "show_login_window",
      main: "show_main_window",
    };

    const command = commandMap[label];
    console.log(`[WindowManager] Invoking ${command} for ${label}`);
    await invoke(command);
    console.log(`[WindowManager] ${command} completed`);
  }

  async hide(label: WindowLabel): Promise<void> {
    const commandMap: Record<WindowLabel, string> = {
      bubble: "hide_bubble_window",
      login: "hide_login_window",
      main: "hide_main_window",
    };

    const command = commandMap[label];
    if (!command) {
      throw new Error(`No hide command for window: ${label}`);
    }

    console.log(`[WindowManager] Invoking ${command} for ${label}`);
    await invoke(command);
    console.log(`[WindowManager] ${command} completed`);
  }

  async toggle(label: WindowLabel): Promise<void> {
    console.log("Toggle:", label);
    if (label === "bubble") {
      await invoke("toggle_bubble_window");
    } else {
      // For other windows, manually check visibility and toggle
      const window = await WebviewWindow.getByLabel(label);
      if (window) {
        const isVisible = await window.isVisible();
        if (isVisible) {
          await this.hide(label);
        } else {
          await this.show(label);
        }
      } else {
        await this.show(label);
      }
    }
  }

  async resize(label: WindowLabel, height: number): Promise<void> {
    // Currently only bubble window supports resizing
    if (label === "bubble") {
      await invoke("resize_bubble_window", { height });
    } else {
      console.warn(`Resize not supported for window: ${label}`);
    }
  }

  // High-level operations

  async switchWindows(from: WindowLabel, to: WindowLabel): Promise<void> {
    console.log(`[WindowManager] switchWindows called: ${from} -> ${to}`);

    // Show the target window first, then hide the source
    // This ensures smooth transition and prevents any auto-show logic from interfering
    await this.show(to);

    try {
      await this.hide(from);
    } catch (error) {
      console.warn(`Failed to hide ${from} window:`, error);
    }

    console.log(`[WindowManager] switchWindows completed: ${from} -> ${to}`);
  }

  async navigate(to: WindowLabel): Promise<void> {
    // Just show the target window without hiding others
    await this.show(to);
  }

  async handleLogout(): Promise<void> {
    // Hide all auth-required windows and show login
    try {
      await this.hide("bubble");
    } catch (error) {
      console.log("Bubble window not open");
    }

    try {
      await this.hide("main");
    } catch (error) {
      console.log("Main window not open");
    }

    await this.show("login");
  }

  async handleLogin(): Promise<void> {
    // Hide login and show bubble
    await this.switchWindows("login", "bubble");
  }

  // Utilities

  getConfig(label: WindowLabel): WindowConfig {
    return WINDOW_CONFIGS[label];
  }

  isAuthRequired(label: WindowLabel): boolean {
    return WINDOW_CONFIGS[label].requiresAuth;
  }
}

// Export singleton instance
export const windowManager = new WindowManager();
