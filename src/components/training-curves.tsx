"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { D } from "@/lib/kitsune";
import { T } from "./i18n";
/* Training metrics as logged by the trainer (reports/train_logs/*.json = each run's trainer_state.json, the same
   values W&B received). Panels share the x axis, the smoothing and the hover position, as in a W&B workspace. */
type Series = { step: number[]; epoch: number[]; [k: string]: number[] };
const CURVES = D.curves as Record<string, { train: Series; eval: Series }>;
type Run = { id: string; en: string; ja: string; color: string; dash?: string };
const RUNS: Record<"sft" | "dpo", Run[]> = {
  sft: [
    { id: "sft-main", en: "sft-main (JP, released)", ja: "sft-main（日本語・公開）", color: "var(--q3)" },
    { id: "sft-en-main", en: "sft-en-main (EN)", ja: "sft-en-main（英語）", color: "var(--s3)" },
    { id: "abl-data30", en: "abl-data30", ja: "abl-data30", color: "var(--q2)" },
    { id: "abl-data10", en: "abl-data10", ja: "abl-data10", color: "var(--q1)" },
    { id: "abl-r16", en: "abl-r16", ja: "abl-r16", color: "var(--s4)", dash: "5 3" },
    { id: "abl-r64", en: "abl-r64", ja: "abl-r64", color: "var(--s5)", dash: "5 3" },
    { id: "sft-pilot", en: "sft-pilot", ja: "sft-pilot", color: "var(--muted)", dash: "2 3" },
  ],
  dpo: [
    { id: "dpo-en-main", en: "dpo-en-main (EN, released)", ja: "dpo-en-main（英語・公開）", color: "var(--s1)" },
    { id: "dpo-main-v2", en: "dpo-main-v2 (JP, experiment)", ja: "dpo-main-v2（日本語・実験）", color: "var(--s3)" },
  ],
};
type Metric = { key: string; src: "train" | "eval"; en: string; ja: string };
const METRICS: Record<"sft" | "dpo", Metric[]> = {
  sft: [
    { key: "loss", src: "train", en: "train/loss", ja: "学習損失" },
    { key: "eval_loss", src: "eval", en: "eval/loss", ja: "検証損失" },
    { key: "mean_token_accuracy", src: "train", en: "train/mean_token_accuracy", ja: "トークン正解率" },
    { key: "grad_norm", src: "train", en: "train/grad_norm", ja: "勾配ノルム" },
    { key: "learning_rate", src: "train", en: "train/learning_rate", ja: "学習率" },
    { key: "entropy", src: "train", en: "train/entropy", ja: "エントロピー" },
  ],
  dpo: [
    { key: "loss", src: "train", en: "train/loss", ja: "DPO 損失" },
    { key: "rewards/accuracies", src: "train", en: "train/rewards/accuracies", ja: "選好正解率（学習）" },
    { key: "eval_rewards/accuracies", src: "eval", en: "eval/rewards/accuracies", ja: "選好正解率（検証）" },
    { key: "rewards/margins", src: "train", en: "train/rewards/margins", ja: "報酬マージン" },
    { key: "rewards/chosen", src: "train", en: "train/rewards/chosen", ja: "報酬（選好側）" },
    { key: "rewards/rejected", src: "train", en: "train/rewards/rejected", ja: "報酬（非選好側）" },
  ],
};
function fmt(v: number): string {
  return null;
}
function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  return null;
}
