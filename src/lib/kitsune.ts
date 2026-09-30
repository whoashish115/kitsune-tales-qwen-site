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
export function systems(lang: Lang): System[] {
  throw new Error("not implemented");
}
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
