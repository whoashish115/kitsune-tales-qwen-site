"use client";

import { useState } from "react";
import { D, type Lang, LANGS, int, usd } from "@/lib/kitsune";
import { T, TB } from "./i18n";
import { Ext, Figure, Pill, Section, Sub, TableWrap } from "./primitives";

const L = D.project.links;

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

/* ================================================================== 6. links, usage, compute, limitations */

function LinkTable({ rows }: { rows: { name: string; href: string; en: string; ja: string }[] }) {
  return (
    <ul className="flex flex-col">
      {rows.map((x) => (
        <li key={x.href} className="grid grid-cols-1 gap-x-4 border-b border-line py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Ext href={x.href} className="num truncate text-sm">
            {x.name}
          </Ext>
          <span className="text-sm text-ink-2">
            <T en={x.en} ja={x.ja} mix="side" />
          </span>
        </li>
      ))}
    </ul>
  );
}

const short = (u: string) => u.replace("https://huggingface.co/", "hf.co/").replace("https://", "");
const BIBTEX = `@misc{kumar2026kitsunetales,
  title  = {Kitsune Tales: Fantasy Light-Novel Fine-Tunes
            of Gemma 4 E4B in Japanese and English},
  author = {Kumar, Ashish},
  year   = {2026},
  url    = {${L.github}}
}`;

export function Resources() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const groups: { en: string; ja: string; rows: { name: string; href: string; en: string; ja: string }[] }[] = [
    {
      en: "Models",
      ja: "モデル",
      rows: [
        { name: short(L.models.jp.merged), href: L.models.jp.merged, en: "Japanese, merged bf16 weights (SFT)", ja: "日本語、マージ済み bf16 重み（SFT）" },
        { name: short(L.models.jp.lora), href: L.models.jp.lora, en: "Japanese, LoRA adapter", ja: "日本語、LoRA アダプタ" },
        { name: short(L.models.jp.gguf), href: L.models.jp.gguf, en: "Japanese, GGUF Q4_K_M and Q8_0", ja: "日本語、GGUF Q4_K_M・Q8_0" },
        { name: short(L.models.en.merged), href: L.models.en.merged, en: "English, merged bf16 weights (SFT + DPO)", ja: "英語、マージ済み bf16 重み（SFT + DPO）" },
        { name: short(L.models.en.lora), href: L.models.en.lora, en: "English, LoRA adapter", ja: "英語、LoRA アダプタ" },
        { name: short(L.models.en.gguf), href: L.models.en.gguf, en: "English, GGUF Q4_K_M and Q8_0", ja: "英語、GGUF Q4_K_M・Q8_0" },
      ],
    },
    {
      en: "Data and demo",
      ja: "データとデモ",
      rows: [
        { name: short(L.datasets.jp), href: L.datasets.jp, en: `Japanese SFT data, ${int(D.data.ja.train)} train / ${int(D.data.ja.val)} validation`, ja: `日本語 SFT データ（学習 ${int(D.data.ja.train)} / 検証 ${int(D.data.ja.val)}）` },
        { name: short(L.datasets.en), href: L.datasets.en, en: `English SFT data, ${int(D.data.en.train)} train / ${int(D.data.en.val)} validation`, ja: `英語 SFT データ（学習 ${int(D.data.en.train)} / 検証 ${int(D.data.en.val)}）` },
        { name: short(L.space), href: L.space, en: "Playground for both models (Gradio)", ja: "両モデルのプレイグラウンド（Gradio）" },
        { name: short(L.collection), href: L.collection, en: "Hugging Face collection", ja: "Hugging Face コレクション" },
      ],
    },
    {
      en: "Code, logs and write-ups",
      ja: "コード・ログ・文書",
      rows: [
        { name: short(L.github), href: L.github, en: "Pipeline, training, evaluation, figures and this site", ja: "パイプライン・学習・評価・図・本サイト" },
        { name: short(L.site_repo), href: L.site_repo, en: "Source of this website (Next.js)", ja: "本サイトのソース（Next.js）" },
        { name: "wandb.ai/whoashish115-base/kitsune-tales", href: L.wandb, en: "Training runs and system metrics", ja: "学習実行とシステム指標" },
        { name: "REPORT.md", href: `${L.github}/blob/main/REPORT.md`, en: "Technical report", ja: "技術レポート" },
        { name: "README.ja.md", href: `${L.github}/blob/main/README.ja.md`, en: "Japanese README", ja: "日本語 README" },
        { name: "docs/ARTICLE.md", href: `${L.github}/blob/main/docs/ARTICLE.md`, en: "Article-length write-up", ja: "記事版" },
      ],
    },
  ];
  const limits: [string, string, string, string][] = [
    ["No human evaluation", "人手評価なし", "Quality rests on rule-based metrics and one LLM judge whose full-output verdicts are confounded by length.", "品質の評価はルールベースの指標と1つの LLM 評価に依拠し、出力全体での判定は長さに交絡しています。"],
    ["Synthetic-data ceiling", "合成データの上限", "Everything was learned from two larger models, including their clichés; both released models lose clearly to the 35B teacher.", "学習内容はすべて2つの大型モデル由来で、その常套句も含みます。35Bの教師には明確に及びません。"],
    ["Lexicon-based safety", "語彙ベースの安全性評価", "Filters miss paraphrases and flag idioms; hateful framing that avoids listed terms is undercounted.", "フィルタは言い換えを見逃し慣用句を誤検出します。リスト外の語によるヘイト表現は過小評価されます。"],
    ["Adversarial titles", "敵対的タイトル", "Titles that ask the model to drop fantasy are followed more often than by the base model.", "ファンタジーをやめるよう求めるタイトルに、ベースより従いやすくなっています。"],
    ["Japanese model without DPO", "日本語モデルは DPO なし", "The Japanese release is SFT only; DPO with safety pairs was validated in English and not rerun for Japanese.", "日本語の公開モデルは SFT のみ。安全ペア付き DPO は英語で検証し、日本語では再実行していません。"],
    ["Single annotator", "アノテータは1名", "Manual checks and the sample translations come from one person.", "目視確認と出力例の翻訳は1名によるものです。"],
  ];
  return (
    <Section id="resources" n="6" title={<T en="Links, usage and limits" ja="リンク・使い方・限界" />}>
      <div className="grid gap-10 lg:grid-cols-2">
        {groups.map((g) => (
          <div key={g.en} className={`flex min-w-0 flex-col gap-2 ${g.en === "Models" ? "lg:row-span-2" : ""}`}>
            <h3 className="font-display text-xl font-bold">
              <T en={g.en} ja={g.ja} mix="side" />
            </h3>
            <LinkTable rows={g.rows} />
          </div>
        ))}
      </div>
      <p className="-mt-6 text-xs text-muted">
        <T
          en="Everything is Apache-2.0: the base model, the generators, the code, the adapters, the merged weights and the datasets."
          ja="ベースモデル・生成モデル・コード・アダプタ・マージ済み重み・データセットはすべて Apache-2.0 です。"
        />
      </p>
      <Sub n="6.1" title={<T en="Run it" ja="使い方" />} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm text-muted">Transformers</p>
          <pre className="num overflow-x-auto rounded-md bg-wash p-4 text-xs leading-relaxed text-ink-2">
{`from transformers import AutoModelForCausalLM, AutoTokenizer

repo = "${L.models.en.merged.replace("https://huggingface.co/", "")}"
tok = AutoTokenizer.from_pretrained(repo)
model = AutoModelForCausalLM.from_pretrained(
    repo, torch_dtype="bfloat16", device_map="auto")

messages = [
    {"role": "system", "content": SYSTEM_PROMPT},  # in the model card
    {"role": "user", "content": "Genres: Slow Life, High Fantasy\\n"
        "Title: A Kicked-Out Summoner Wants a Quiet Life in the Frontier\\n"
        "Format: synopsis"},
]
ids = tok.apply_chat_template(messages, add_generation_prompt=True,
                              return_tensors="pt").to(model.device)
out = model.generate(ids, max_new_tokens=700, do_sample=True,
                     temperature=0.8, top_p=0.95, repetition_penalty=1.05)
print(tok.decode(out[0, ids.shape[1]:], skip_special_tokens=True))`}
          </pre>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm text-muted">
            <T en="llama.cpp, 4-bit GGUF on CPU" ja="llama.cpp（4ビット GGUF、CPU）" mix="side" />
          </p>
          <pre className="num overflow-x-auto rounded-md bg-wash p-4 text-xs leading-relaxed text-ink-2">
{`llama-cli -m kitsune-tales-e4b-en-Q4_K_M.gguf -st \\
  --temp 0.8 --top-p 0.95 -n 700 -p \\
'<|turn>system
You write original, general-audience fantasy light novels ...<turn|>
<|turn>user
Genres: Magical Girl
Title: Magical Girl Lumina Is Late Again Today
Format: synopsis<turn|>
<|turn>model
'`}
          </pre>
          <p className="text-xs text-muted">
            <T
              en={`Measured with llama.cpp on 8 CPU cores: ${D.gguf.jp.cpu_tokens_per_s} tokens/s (JP), ${D.gguf.en.cpu_tokens_per_s} tokens/s (EN), Q4_K_M.`}
              ja={`llama.cpp、8 CPU コアで計測：${D.gguf.jp.cpu_tokens_per_s} tokens/s（日本語）、${D.gguf.en.cpu_tokens_per_s} tokens/s（英語）、Q4_K_M。`}
            />
          </p>
        </div>
      </div>
      <Sub n="6.2" title={<T en="Compute" ja="計算資源" />}>
        <T
          en={`All jobs ran on Modal: H100s for generation, training and judging, CPUs for data processing. Before each GPU job a guard compared Modal's billed total plus 1.25 times the job's estimate with a per-account limit. Total billed: ${usd(D.budget.total_billed)}.`}
          ja={`全ジョブを Modal で実行しました（生成・学習・評価は H100、データ処理は CPU）。GPU ジョブの起動前ごとに、Modal の請求額とジョブ見積もりの1.25倍の合計をアカウントごとの上限と比較しています。総請求額：${usd(D.budget.total_billed)}。`}
        />
      </Sub>
      <Sub n="6.3" title={<T en="Limitations" ja="限界" />} />
      <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
        {limits.map(([h, hj, d, dj]) => (
          <div key={h} className="flex flex-col gap-1 border-t border-line pt-3">
            <dt className="font-semibold text-ink">
              <T en={h} ja={hj} mix="side" />
            </dt>
            <dd className="text-sm text-ink-2">
              <T en={d} ja={dj} />
            </dd>
          </div>
        ))}
      </dl>
      <Sub n="6.4" title={<T en="Citation" ja="引用" />} />
      <div className="flex flex-col gap-2">
        <pre className="num overflow-x-auto rounded-md bg-wash p-4 text-xs leading-relaxed text-ink-2">{BIBTEX}</pre>
        <button type="button" onClick={copy} className="self-start rounded-full border border-line px-3 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent">
          {copied ? <T en="Copied" ja="コピーしました" mix="en" /> : <T en="Copy BibTeX" ja="BibTeX をコピー" mix="en" />}
        </button>
      </div>
    </Section>
  );
}

export function Footer() {
  const a = L.author;
  return (
    <footer className="border-t border-line py-10 text-sm text-ink-2">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-display text-lg font-bold text-ink">Kitsune Tales</span>
            <span>
              Ashish Kumar, <Ext href={a.github}>GitHub</Ext>, <Ext href={a.hf}>Hugging Face</Ext>
            </span>
          </div>
        </div>
        <p className="max-w-[60ch] text-xs text-muted">
          <T
            en="Every number and figure on this page is generated from the evaluation files in reports/ (python -m kitsune.site_export, python -m kitsune.figures)."
            ja="本ページの数値と図はすべて reports/ の評価ファイルから生成しています（python -m kitsune.site_export、python -m kitsune.figures）。"
          />
        </p>
      </div>
    </footer>
  );
}
