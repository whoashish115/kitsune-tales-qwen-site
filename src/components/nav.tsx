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
