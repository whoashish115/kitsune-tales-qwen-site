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
export type Comparison = {
  x: string;
  y: string;
  length_matched: boolean;
  win: number;
  tie: number;
  loss: number;
  net: CI;
  pairs: number;
  consistency: number;
};
export type Judge = {
  comparisons: Comparison[];
  validation: { accuracy: CI; by_corruption: Record<string, number>; n: number } | null;
};
export type Lang = "ja" | "en";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const D = raw as any;
export const LANGS: { id: Lang; label: string; slug: string }[] = [
  { id: "ja", label: "日本語", slug: D.project.models[0].slug },
  { id: "en", label: "English", slug: D.project.models[1].slug },
];
export function systems(lang: Lang): System[] {
  return D.eval[lang].systems as System[];
}
export function judge(lang: Lang): Judge {
  return D.eval[lang].judge as Judge;
}
export function released(lang: Lang): string {
  return D.project.models.find((m: { lang: string }) => m.lang === lang).release_system;
}
export function sys(lang: Lang, id: string): System {
  return systems(lang).find((s) => s.id === id) as System;
}
export function baseId(lang: Lang) {
  return lang === "ja" ? "base" : "base-en";
}
export function variantId(lang: Lang) {
  return lang === "ja" ? "kitsune" : "kitsune-en-sft";
}
// Fixed color per system: color follows the entity, never its rank (validated categorical slots).
const SLOT: Record<string, string> = {
  "kitsune-sft": "var(--s1)",
  "kitsune-en": "var(--s1)",
  base: "var(--s2)",
  "base-en": "var(--s2)",
  kitsune: "var(--s3)",
  "kitsune-en-sft": "var(--s3)",
  "qwen3.5-4b": "var(--s4)",
  "qwen3.5-9b": "var(--s5)",
  teacher: "var(--s6)",
};
export const color = (id: string) => SLOT[id] ?? "var(--muted)";
