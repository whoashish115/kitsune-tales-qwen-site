"use client";

import { useEffect, useState } from "react";
import { D } from "@/lib/data";
import { LangMenu, T } from "./i18n";

export const SECTIONS = [
  ["model", "Model", "モデル"],
  ["data", "Data", "データ"],
  ["training", "Training", "学習"],
  ["results", "Results", "結果"],
  ["samples", "Samples", "出力例"],
  ["resources", "Links", "リンク"],
] as const;

type Theme = "light" | "dark";

/** Light by default; the button switches to dark and back. The OS colour scheme is not consulted. */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    if (document.documentElement.getAttribute("data-theme") === "dark") setTheme("dark");
  }, []);
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("kitsune-theme", next);
    } catch {
      /* storage can be unavailable; the choice then lasts for this visit only */
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 hover:border-accent hover:text-accent"
    >
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
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
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src="logo.png" alt="" width={36} height={36} className="h-9 w-9" />
          <span className="font-display text-lg font-bold sm:text-xl">Kitsune Tales</span>
          <span className="hidden text-sm text-muted md:inline">狐の物語</span>
        </a>
        <nav aria-label="Sections" className="no-scrollbar min-w-0 flex-1 overflow-x-auto">
          <ul className="flex gap-0.5 whitespace-nowrap text-[0.95rem]">
            {SECTIONS.map(([id, en, ja]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`rounded-md px-3 py-1.5 transition-colors ${active === id ? "bg-accent-soft text-accent" : "text-ink-2 hover:text-ink"}`}
                >
                  <T en={en} ja={ja} mix="ja" />
                </a>
              </li>
            ))}
            <li>
              <a href="/slides/" className="rounded-md px-3 py-1.5 text-ink-2 transition-colors hover:text-ink">
                <T en="Slides" ja="スライド" mix="ja" />
              </a>
            </li>
          </ul>
        </nav>
        <div className="hidden items-center gap-4 text-sm text-ink-2 lg:flex">
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
