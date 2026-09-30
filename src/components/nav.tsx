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

export function Nav() {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const L = D.project.links;
  return (
    <header className="sticky z-40 border-b border-line bg-paper/85 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src="logo.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="font-display text-base font-bold sm:text-lg">Kitsune Tales</span>
          <span className="hidden text-xs text-muted md:inline">狐の物語</span>
        </a>
        <nav aria-label="Sections" className="no-scrollbar min-w-0 flex-1 overflow-x-auto">
          <ul className="flex gap-0.5 whitespace-nowrap text-sm">
            {SECTIONS.map(([id, en, ja]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`rounded-md px-2.5 py-1 transition-colors ${active === id ? "bg-accent-soft text-accent" : "text-ink-2 hover:text-ink"}`}
                >
                  <T en={en} ja={ja} mix="ja" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-3 text-xs text-ink-2 lg:flex">
          <a href={L.github} target="_blank" rel="noreferrer" className="hover:text-accent">
            GitHub
          </a>
          <a href={L.collection} target="_blank" rel="noreferrer" className="hover:text-accent">
            Hugging Face
          </a>
          <a href={L.wandb} target="_blank" rel="noreferrer" className="hover:text-accent">
            W&amp;B
          </a>
        </div>
        <LangMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
