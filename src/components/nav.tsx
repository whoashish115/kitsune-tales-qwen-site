"use client";
import { useEffect, useState } from "react";
import { D } from "@/lib/kitsune";
import { LangMenu, T } from "./i18n";
export const SECTIONS = [
  ["model", "Model", "モデル"],
  ["data", "Data", "データ"],
  ["training", "Training", "学習"],
  ["results", "Results", "結果"],
  ["samples", "Samples", "出力例"],
  ["resources", "Links", "リンク"],
] as const;
type Theme = "system" | "light" | "dark";
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") setTheme(t);
  }, []);
  const cycle = () => {
    const next: Theme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    try {
      if (next === "system") localStorage.removeItem("kitsune-theme");
      else localStorage.setItem("kitsune-theme", next);
    } catch {
      /* storage can be unavailable; the choice then lasts for this visit only */
    }
  };
  const name = { system: "auto", dark: "dark", light: "light" }[theme];
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Color theme: ${name}. Change theme`}
      title={`Theme: ${name}`}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-2 hover:border-accent hover:text-accent"
    >
      <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {theme === "dark" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : theme === "light" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
          </>
        )}
      </svg>
    </button>
  );
}
