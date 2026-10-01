// Every number on the site comes from this file, which `python -m kitsune.site_export` builds from reports/.
import raw from "@/data/kitsune.json";

export type CI = { mean: number; low: number; high: number; n?: number | null };
export type System = {
  id: string;
  note: string;
  n_generations: number;
  test: Record<string, CI | null>;
  policy: Record<string, CI | number | null>;
  diversity: Record<string, number>;
};
export type Lang = "ja" | "en";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const D = raw as any;

export const LANGS: { id: Lang; label: string; slug: string }[] = [
  { id: "ja", label: "日本語", slug: D.project.models[0].slug },
  { id: "en", label: "English", slug: D.project.models[1].slug },
];

export function released(lang: Lang): string {
  return D.project.models.find((m: { lang: string }) => m.lang === lang).release_system;
}
export function sys(lang: Lang, id: string): System {
  return (D.eval[lang].systems as System[]).find((s) => s.id === id) as System;
}

export const pct = (x: number | null | undefined, d = 1) => (x == null || Number.isNaN(x) ? "n/a" : `${(x * 100).toFixed(d)}%`);
export const usd = (x: number) => `$${x.toFixed(2)}`;
export const int = (x: number) => x.toLocaleString("en-US");
