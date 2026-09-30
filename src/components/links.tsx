"use client";
import { useState } from "react";
import { D, type Lang, LANGS, int, usd } from "@/lib/kitsune";
import { T, TB } from "./i18n";
import { Ext, Figure, Pill, Section, Sub, TableWrap } from "./primitives";
/* ================================================================== 5. samples */
export function Samples() {
  const [lang, setLang] = useState<Lang>("ja");
  const [i, setI] = useState(0);
  const list = D.samples[lang === "ja" ? "jp" : "en"] as {
    prompt_id: string;
    genres: string[];
    title: string;
    format: string;
    passage: string | null;
    text: string;
    translation_en?: string;
  }[];
  const s = list[Math.min(i, list.length - 1)];
  const gname = (g: string) => D.project.genres.find((x: { ja: string }) => x.ja === g)?.en_prompt ?? g;
  const fname = (f: string) => D.project.formats.find((x: { ja: string }) => x.ja === f)?.en ?? f;
  return (
    <Section
      id="samples"
      n="5"
      title={<T en="Samples" ja="出力例" />}
      lede={
        <TB
          en={
            <p>
              Seed-0 outputs of the released models on held-out prompts, one random pick per format (seeded), not chosen for quality.
              The Japanese samples come with an English translation that keeps the model&apos;s slips. To write your own, use the{" "}
              <Ext href={L.space}>demo</Ext>.
            </p>
          }
          ja={
            <p>
              公開モデルの未使用プロンプトに対するシード0の出力です。形式ごとにシード固定で無作為に選び、品質では選んでいません。日本語の例には、モデルの誤りを残したままの英訳を付けています。自分で試すには
              <Ext href={L.space}>デモ</Ext>をどうぞ。
            </p>
          }
        />
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Model language" className="inline-flex rounded-lg border border-line bg-surface p-1 text-sm">
          {LANGS.map((l) => (
            <button
              key={l.id}
              role="tab"
              aria-selected={lang === l.id}
              onClick={() => {
                setLang(l.id);
                setI(0);
              }}
              className={`rounded-md px-3 py-1 ${lang === l.id ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {list.map((x, k) => (
            <button
              key={x.prompt_id}
              onClick={() => setI(k)}
              className={`num rounded-full border px-3 py-1 text-xs ${k === i ? "border-accent text-accent" : "border-line text-ink-2 hover:text-ink"}`}
            >
              {fname(x.format)} · {x.prompt_id}
            </button>
          ))}
        </div>
      </div>
      <article className="grid gap-8 border-t border-line pt-6">
        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-bold" lang={lang}>
              {s.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {s.genres.map((g) => (
                <Pill key={g}>{lang === "ja" ? `${g} / ${gname(g)}` : gname(g)}</Pill>
              ))}
              <Pill tone="accent">{lang === "ja" ? `${s.format} / ${fname(s.format)}` : fname(s.format)}</Pill>
            </div>
          </header>
          {s.passage && (
            <details className="rounded-md bg-wash p-3 text-sm text-ink-2">
              <summary className="cursor-pointer text-muted">
                <T en="Passage given to continue" ja="続きを書くための本文" mix="side" />
              </summary>
              <p className="mt-2 whitespace-pre-line">{s.passage}</p>
            </details>
          )}
          <div className={`grid gap-8 ${lang === "ja" && s.translation_en ? "xl:grid-cols-2" : ""}`}>
            <div className="min-w-0 max-w-[70ch] whitespace-pre-line text-[0.97rem] leading-8 text-ink" lang={lang}>
              {s.text}
            </div>
            {lang === "ja" && s.translation_en && (
              <div className="min-w-0 border-t border-line pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                <p className="mb-3 text-sm text-muted">
                  <T en="English translation" ja="英訳" mix="side" />
                </p>
                <div className="whitespace-pre-line text-[0.95rem] leading-7 text-ink-2" lang="en">
                  {s.translation_en}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Section>
  );
}
