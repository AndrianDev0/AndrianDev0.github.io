"use client";

import { Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "andrian-dev-theme";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* Storage can be unavailable in private mode. */ }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((current) => current === "light" ? "dark" : "light") }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle({ className = "", language = "ru" }: { className?: string; language?: "ru" | "en" }) {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeToggle must be used inside ThemeProvider");
  const isLight = context.theme === "light";
  const label = language === "ru"
    ? (isLight ? "Включить тёмную тему" : "Включить светлую тему")
    : (isLight ? "Switch to dark theme" : "Switch to light theme");
  const title = language === "ru"
    ? (isLight ? "Тёмная тема" : "Светлая тема")
    : (isLight ? "Dark theme" : "Light theme");

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={context.toggleTheme}
      aria-label={label}
      title={title}
    >
      <span>{isLight ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}</span>
    </button>
  );
}
