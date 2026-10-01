"use client";

import { D } from "@/lib/data";
import { T } from "./i18n";

const L = D.project.links;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="seigaiha pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div className="flex min-w-0 flex-col gap-5">
          <p className="text-sm text-muted">
            <T en="Open research release, v0.1, September 2026" ja="オープン研究リリース v0.1（2026年9月）" mix="side" />
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] sm:text-7xl">
            Kitsune Tales
            <span className="mt-2 block text-2xl font-bold text-accent sm:text-3xl">狐の物語</span>
          </h1>
          <p className="max-w-[56ch] text-lg text-ink-2">
            <T
              en="Two small open models that write original fantasy light-novel stories: one in Japanese, one in English with Japanese anime themes. Both are LoRA fine-tunes of Gemma 4 E4B, evaluated on held-out prompts with confidence intervals."
              ja="オリジナルのファンタジー・ライトノベルを書く2つの小型オープンモデル。日本語版と、日本のアニメ的世界観の英語版です。どちらも Gemma 4 E4B の LoRA 微調整で、未使用プロンプトと信頼区間で評価しています。"
            />
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href={L.space} target="_blank" rel="noreferrer" className="rounded-full bg-accent px-4 py-2 font-medium text-paper hover:opacity-90">
              <T en="Try the demo" ja="デモを試す" mix="en" />
            </a>
            <a href="#model" className="rounded-full border border-line bg-surface px-4 py-2 text-ink hover:border-accent">
              <T en="The models" ja="モデル" mix="en" />
            </a>
            <a href={`${L.github}/blob/main/REPORT.md`} target="_blank" rel="noreferrer" className="rounded-full border border-line bg-surface px-4 py-2 text-ink hover:border-accent">
              <T en="Technical report" ja="技術レポート" mix="en" />
            </a>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(D.project.models as { slug: string; recipe: string }[]).map((m) => (
              <span key={m.slug} className="num rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-2">
                {m.slug} <span className="text-muted">({m.recipe})</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src="logo.png" alt="Kitsune Tales logo: a blue-violet fox" width={512} height={512} className="h-56 w-56 sm:h-72 sm:w-72" />
          <div aria-hidden className="tategaki hidden font-display text-5xl font-bold leading-relaxed text-ink/80 sm:block">
            狐火の<span className="text-accent">物語</span>
          </div>
        </div>
      </div>
    </section>
  );
}
