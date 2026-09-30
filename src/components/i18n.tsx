"use client";
import { type ReactNode, useEffect, useRef, useState } from "react";
/* Three reading modes: English, Japanese, or "mix" (the default): English with the Japanese set beside or beneath it.
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
  return null;
}
