import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabase";
import * as authLib from "../lib/auth";

interface AuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: User | null;
  lastAuthEvent: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<string>;
  logout: () => Promise<void>;
  handleOAuthCallback: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAuthenticating: true,
    user: null,
    lastAuthEvent: null,
  });

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession();

        // If there's an error or no session, user is not authenticated
        if (error || !session) {
          setAuthState({
            isAuthenticated: false,
            isAuthenticating: false,
            user: null,
            lastAuthEvent: null,
          });
          return;
        }

        // Verify the session is still valid by checking if token is expired
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;

        if (expiresAt < now) {
          // Session expired, clear it
          await supabaseClient.auth.signOut();
          setAuthState({
            isAuthenticated: false,
            isAuthenticating: false,
            user: null,
            lastAuthEvent: null,
          });
          return;
        }

        // Valid session
        setAuthState({
          isAuthenticated: true,
          isAuthenticating: false,
          user: session.user,
          lastAuthEvent: "INITIAL_SESSION",
        });
      } catch (error) {
        console.error("Error checking session:", error);
        setAuthState({
          isAuthenticated: false,
          isAuthenticating: false,
          user: null,
          lastAuthEvent: null,
        });
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);

      // Handle sign out
      if (event === "SIGNED_OUT") {
        setAuthState({
          isAuthenticated: false,
          isAuthenticating: false,
          user: null,
          lastAuthEvent: event,
        });
        return;
      }

      // Handle sign in
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          setAuthState({
            isAuthenticated: true,
            isAuthenticating: false,
            user: session.user,
            lastAuthEvent: event,
          });
        }
        return;
      }

      // For other events, check if session exists
      setAuthState({
        isAuthenticated: !!session,
        isAuthenticating: false,
        user: session?.user || null,
        lastAuthEvent: event,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authLib.initiateCredentialLogin(email, password);
      // State will be updated by onAuthStateChange listener
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<string> => {
    try {
      const oauthUrl = await authLib.initiateGoogleOAuth();
      return oauthUrl;
    } catch (error) {
      console.error("Google OAuth failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optimistically update state immediately - we know user will be logged out
      setAuthState({
        isAuthenticated: false,
        isAuthenticating: false,
        user: null,
        lastAuthEvent: "SIGNED_OUT",
      });

      await authLib.logout();
      // onAuthStateChange will also fire, but state is already correct
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const handleOAuthCallback = async (url: string) => {
    if (!url.startsWith("askturing://auth/callback")) {
      throw new Error("Invalid callback URL");
    }
    
    try {
      // Extract the URL fragment and parse it
      const urlObj = new URL(url);
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));

      // Get access token and refresh token from the hash
      const accessToken = hashParams.get("access_token");
      
      if (accessToken && !/^[A-Za-z0-9\-._~+/]+=*$/.test(accessToken)) {
        throw new Error("Invalid token format");
      }
      
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken) {
        // Set the session in Supabase
        await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });
        console.log("OAuth login successful");
        // State will be updated by onAuthStateChange listener
      } else {
        const errorDescription = hashParams.get("error_description");
        throw new Error(errorDescription || "OAuth callback failed");
      }
    } catch (error) {
      console.error("Failed to handle OAuth callback:", error);
      throw error;
    }
  };

  const value: AuthContextValue = {
    ...authState,
    login,
    loginWithGoogle,
    logout,
    handleOAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
