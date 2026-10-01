"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

/* Three reading modes: English (the default), Japanese, or "mix": English with the Japanese set beside or beneath it.
   Every text exists in both languages in the static HTML and CSS picks what is visible (globals.css), so the page is
   complete without JavaScript. `mix` controls how a pair is set in mix mode:
     sub   the Japanese goes on its own line under the English (headings, captions, labels)
     side  the Japanese follows inline in a muted tone (short labels)
     en    English only (long running text where both would crowd the page)
     ja    Japanese only (navigation) */

type Mix = "sub" | "side" | "en" | "ja";

export function T({ en, ja, mix = "sub" }: { en: ReactNode; ja: ReactNode; mix?: Mix }) {
  return (
    <>
      <span className={`i18n-en ${mix === "ja" ? "mx-no" : ""}`} lang="en">
        {en}
      </span>
      <span className={`i18n-ja ${mix === "en" ? "mx-no" : `mx-${mix}`}`} lang="ja">
        {ja}
      </span>
    </>
  );
}

export function TB({ en, ja, className = "", mix = "sub" }: { en: ReactNode; ja: ReactNode; className?: string; mix?: "sub" | "en" }) {
  return (
    <>
      <div className={`i18n-en ${className}`} lang="en">
        {en}
      </div>
      <div className={`i18n-ja ${mix === "en" ? "mx-no" : "mx-sub"} ${className}`} lang="ja">
        {ja}
      </div>
    </>
  );
}

export type SiteLang = "mix" | "en" | "ja";
const OPTIONS: [SiteLang, string, string][] = [
  ["en", "English", "EN"],
  ["ja", "日本語", "日本語"],
  ["mix", "Mix", "英日"],
];

export function LangMenu() {
  const [lang, setLang] = useState<SiteLang>("en");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const l = document.documentElement.getAttribute("data-lang");
    if (l === "en" || l === "ja" || l === "mix") setLang(l);
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const pick = (next: SiteLang) => {
    setLang(next);
    setOpen(false);
    const root = document.documentElement;
    root.setAttribute("data-lang", next);
    root.setAttribute("lang", next === "ja" ? "ja" : "en");
    try {
      localStorage.setItem("kitsune-lang", next);
    } catch {
      /* storage can be unavailable; the choice then lasts for this visit only */
    }
  };
  const current = OPTIONS.find((o) => o[0] === lang)!;
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent"
      >
        {current[2]}
      </button>
      {open && (
        <ul role="listbox" aria-label="Language" className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-line bg-surface py-1 text-sm shadow-lg">
          {OPTIONS.map(([id, name]) => (
            <li key={id}>
              <button
                type="button"
                role="option"
                aria-selected={lang === id}
                onClick={() => pick(id)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-wash ${lang === id ? "text-accent" : "text-ink-2"}`}
              >
                {name}
                <span className="text-xs text-muted">{id === "mix" ? "EN + 日本語" : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
