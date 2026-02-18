import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { openUrl } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";
import LoginWindow from "../components/auth/LoginWindow";
import { useAuth } from "../contexts/AuthContext";
import { useAuthRouter } from "../hooks/useAuthRouter";

export default function Login() {
  const {
    isAuthenticated,
    isAuthenticating,
    lastAuthEvent,
    login,
    loginWithGoogle,
    handleOAuthCallback,
  } = useAuth();

  // Auth-driven navigation happens automatically
  useAuthRouter({ windowLabel: "login" });

  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Show login window only after auth check completes and user is not authenticated
  useEffect(() => {
    const showLoginIfNeeded = async () => {
      if (!isAuthenticating && !isAuthenticated) {
        // Auth check complete and user not authenticated - show login window
        try {
          await invoke("show_login_window");
        } catch (error) {
          console.error("Failed to show login window:", error);
        }
      }
    };

    showLoginIfNeeded();
  }, [isAuthenticated, isAuthenticating]);

  // Reset login state when user is logged out (after logout)
  useEffect(() => {
    if (!isAuthenticating && !isAuthenticated) {
      setIsLoggingIn(false);
      setLoginSuccess(false);
      setError(null);
      // Increment key to force LoginWindow to remount and clear form fields
      setResetKey((prev) => prev + 1);
    }
  }, [isAuthenticated, isAuthenticating]);

  // Handle successful login - show success message
  // Window switching is now handled by useAuthRouter
  useEffect(() => {
    const handleAuthChange = async () => {
      if (
        !isAuthenticating &&
        isAuthenticated &&
        lastAuthEvent === "SIGNED_IN" &&
        isLoggingIn &&
        !loginSuccess
      ) {
        // Show success message
        setLoginSuccess(true);

        // Wait a bit to show the success message
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Reset login states for next time
        setIsLoggingIn(false);
        setLoginSuccess(false);
      }
    };

    handleAuthChange();
  }, [
    isAuthenticated,
    isAuthenticating,
    lastAuthEvent,
    isLoggingIn,
    loginSuccess,
  ]);

  // Handle OAuth deep link callbacks
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (!url.includes("askturing://auth/callback")) return;

      try {
        setIsLoggingIn(true);
        await handleOAuthCallback(url);
        // Auth state will be updated by AuthContext
        // Window navigation will be handled by useAuthRouter
      } catch (error) {
        console.error("Failed to handle OAuth callback:", error);
        setError(error instanceof Error ? error.message : "OAuth login failed");
        setIsLoggingIn(false);
      }
    };

    // Listen for deep link events (OAuth callback)
    const unlisten = listen<string[]>("deep-link", async (event) => {
      const urls = event.payload;
      console.log("Deep link received:", urls);

      // Get the first URL (should only be one)
      const url = urls[0];
      if (url) {
        await handleDeepLink(url);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [handleOAuthCallback]);

  const handleCredentialLogin = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoggingIn(true);
      await login(email, password);
      // Auth state will be updated by AuthContext
      // Window navigation will be handled by useAuthRouter
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoggingIn(true);

      // Get the OAuth URL from AuthContext
      const oauthUrl = await loginWithGoogle();

      // Open the URL in the system browser
      await openUrl(oauthUrl);
    } catch (error) {
      console.error("Google OAuth failed:", error);
      setError(error instanceof Error ? error.message : "Google OAuth failed");
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginWindow
      key={resetKey}
      onCredentialLogin={handleCredentialLogin}
      onGoogleLogin={handleGoogleLogin}
      error={error}
      isLoggingIn={isLoggingIn}
      loginSuccess={loginSuccess}
    />
  );
}
