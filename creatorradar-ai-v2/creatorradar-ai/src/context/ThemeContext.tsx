import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark"; // what's actually applied right now
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  resolvedTheme: "light",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Resolved: auto follows system, otherwise explicit
  const resolvedTheme: "light" | "dark" =
    mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  // Watch OS theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Apply .dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  // Load saved mode from settings on mount
  useEffect(() => {
    window.creatorRadar.settings.get("theme").then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "auto") {
        setModeState(saved);
        try { localStorage.setItem("cr_theme", saved); } catch {}
      }
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    window.creatorRadar.settings.set("theme", next);
    // Mirror to localStorage so the anti-flash <script> in index.html works on next launch
    try { localStorage.setItem("cr_theme", next); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
