import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useWindowManager } from "./useWindowManager";
import { WindowLabel } from "../services/WindowManager";

interface UseAuthRouterOptions {
  windowLabel: WindowLabel;
}

/**
 * Hook that automatically coordinates window visibility with auth state.
 * This is the "brain" of the routing system - components just declare their
 * window identity, and navigation happens automatically based on auth state.
 */
export function useAuthRouter({ windowLabel }: UseAuthRouterOptions) {
  const { isAuthenticated, isAuthenticating } = useAuth();
  const windowManager = useWindowManager();
  const config = windowManager.getConfig(windowLabel);

  useEffect(() => {
    console.log(
      `[useAuthRouter] ${windowLabel}: auth=${isAuthenticated}, authenticating=${isAuthenticating}`,
    );

    // Skip during initial auth check to avoid flicker
    if (isAuthenticating) {
      return;
    }

    // User not authenticated but on auth-required window → go to login
    if (!isAuthenticated && config.requiresAuth) {
      console.log(
        `[useAuthRouter] User not authenticated on ${windowLabel}, switching to login`,
      );
      windowManager.switchWindows(windowLabel, "login");
      return;
    }

    // User authenticated but on login window → go to bubble
    if (isAuthenticated && windowLabel === "login") {
      console.log(
        "[useAuthRouter] User authenticated on login window, switching to bubble",
      );
      windowManager.handleLogin();
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    isAuthenticating,
    windowLabel,
    config.requiresAuth,
    // windowManager deliberately excluded to prevent infinite loop
  ]);

  return { isAuthenticated, isAuthenticating };
}
