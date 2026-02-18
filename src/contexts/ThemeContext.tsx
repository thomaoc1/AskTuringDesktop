import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { emit, listen } from "@tauri-apps/api/event";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("askturing-theme");
    return stored === "dark" || stored === "light" ? stored : "light";
  });

  // Apply theme to DOM and persist
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("askturing-theme", theme);
  }, [theme]);

  // Listen for theme changes broadcast from other windows
  useEffect(() => {
    const unlisten = listen<Theme>("theme-changed", (event) => {
      setThemeState(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    emit("theme-changed", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
