import { useWindowManager } from "./useWindowManager";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook for settings window-specific operations.
 * Provides clean methods for closing and logging out from the settings view.
 */
export function useSettingsWindow() {
  const windowManager = useWindowManager();
  const { logout } = useAuth();

  const handleClose = () => {
    windowManager.hide('main');
  };

  const handleLogout = async () => {
    try {
      // Call logout from AuthContext - updates auth state
      await logout();

      // WindowManager handles the window cascade (hide bubble, hide main, show login)
      await windowManager.handleLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return {
    handleClose,
    handleLogout,
  };
}
