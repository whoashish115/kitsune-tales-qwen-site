"use client";

import { D, pct, released, sys } from "@/lib/kitsune";
import { T, TB } from "./i18n";
import { Ext, Figure, Section, Sub, TableWrap } from "./ui";

const mean = (s: ReturnType<typeof sys>, part: "test" | "policy", k: string) => (s[part][k] as { mean: number }).mean;

function MainResults() {
  const jb = sys("ja", "base"),
    jr = sys("ja", released("ja")),
    eb = sys("en", "base-en"),
    er = sys("en", released("en"));
  const rows: { en: string; ja: string; base: string; ours: string; better: "up" | "down" }[] = [
    {
      en: "Stories within the requested length, JP / EN",
      ja: "指定した長さに収まった物語（日本語 / 英語）",
      base: `${pct(mean(jb, "test", "length_ok"), 1)} / ${pct(mean(eb, "test", "length_ok"), 0)}`,
      ours: `${pct(mean(jr, "test", "length_ok"), 0)} / ${pct(mean(er, "test", "length_ok"), 0)}`,
      better: "up",
    },
    {
      en: "Outputs with markdown or meta text, JP / EN",
      ja: "Markdown やメタ文を含む出力（日本語 / 英語）",
      base: `${pct(mean(jb, "test", "markdown"), 0)} / ${pct(mean(eb, "test", "markdown"), 0)}`,
      ours: `${pct(mean(jr, "test", "markdown"), 0)} / ${pct(mean(er, "test", "markdown"), 0)}`,
      better: "down",
    },
    {
      en: "Disallowed requests carried out anyway, JP / EN",
      ja: "禁止リクエストをそのまま実行した割合（日本語 / 英語）",
      base: `${pct(mean(jb, "policy", "violation_rate_disallowed"), 0)} / ${pct(mean(eb, "policy", "violation_rate_disallowed"), 0)}`,
      ours: `${pct(mean(jr, "policy", "violation_rate_disallowed"), 0)} / ${pct(mean(er, "policy", "violation_rate_disallowed"), 0)}`,
      better: "down",
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      <TableWrap>
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/20 text-left text-muted">
              <th className="py-2 pr-4 font-normal">
                <T en="Metric" ja="指標" mix="side" />
              </th>
              <th className="px-3 py-2 text-right font-normal">
                <T en="Base model" ja="ベース" mix="side" />
              </th>
              <th className="py-2 pl-3 text-right font-normal text-ink">Kitsune</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.en} className="border-b border-line">
                <td className="py-2.5 pr-4 text-ink-2">
                  <T en={r.en} ja={r.ja} />
                  <span className="ml-1 text-xs text-muted">{r.better === "up" ? "↑" : "↓"}</span>
                </td>
                <td className="num px-3 text-right text-ink-2">{r.base}</td>
                <td className="num pl-3 text-right text-base font-semibold text-ink">{r.ours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <p className="text-sm text-muted">
        <T
          en="Kitsune is the released model for each language. Test set: 270 held-out prompts × 3 seeds; policy suite: 45 disallowed requests × 3 seeds per language."
          ja="Kitsune は各言語の公開モデル。テストは未使用プロンプト270件 × 3シード、ポリシー評価は各言語45件の禁止リクエスト × 3シード。"
        />
      </p>
    </div>
  );
}

function Meme() {
  return (
    <figure className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src="meme.jpg" alt="Meme: the LLM judge points at a 2,400-character story and asks: is this quality?" width={1200} height={675} loading="lazy" className="h-auto w-full rounded-md" />
      <figcaption className="text-center text-xs text-muted">
        <T en="Figure 2, restated: the judge's preference for length." ja="図2を別の形で：評価モデルの長さへの選好。" mix="en" />
      </figcaption>
    </figure>
  );
}

export function Results() {
  return (
    <Section
      id="results"
      n="4"
      title={<T en="Results" ja="結果" />}
      lede={
        <TB
          en={
            <p>
              Every system answers the same held-out prompts with the same decoding (temperature 0.8, top-p 0.95, three seeds), plus a
              separate policy suite. Fine-tuning fixes length, format and refusals; story quality stays level with the base model.
            </p>
          }
          ja={
            <p>
              全システムが同じ未使用プロンプトに同じデコード設定（temperature 0.8、top-p 0.95、3シード）で回答し、別のポリシー評価にも回答します。微調整で長さ・形式・拒否が改善し、物語の質はベースモデルと同程度です。
            </p>
          }
        />
      }
    >
      <MainResults />
      <Sub id="judge" n="4.1" title={<T en="Judge" ja="LLM 評価" />}>
        <T
          en={`A model from another family (${D.project.judge.split("/")[1]}) compares two stories for the same request in both orders; a win counts only when both orders agree. On full outputs it prefers the base model, which writes far past the requested length. On equal-length openings the difference disappears.`}
          ja={`別系統のモデル（${D.project.judge.split("/")[1]}）が同じリクエストへの2つの物語を両方の提示順で比較し、両順序で一致した場合のみ勝敗とします。出力全体では指定より大幅に長く書くベースモデルが好まれますが、同じ長さの冒頭に揃えると差は消えます。`}
        />
      </Sub>
      <Figure
        n={2}
        src="judge_preference"
        alt="Judge net preference with confidence intervals"
        caption={
          <T
            en="Net preference (wins minus losses) with 95 % CIs. Grey: full outputs. Diamonds: equal-length openings (600 characters JP, 2,000 characters EN). The released models lose to the base on full outputs but not on equal-length openings; both Japanese models lose to the 35B teacher."
            ja="純選好率（勝ち − 負け）と95 % CI。灰色は出力全体、菱形は同じ長さの冒頭（日本語600字、英語2,000字）での比較。公開モデルは出力全体ではベースに負けますが、同じ長さの冒頭では負けません。日本語の2モデルは35Bの教師には負けています。"
          />
        }
      />
      <Meme />
      <Sub id="safety" n="4.2" title={<T en="Safety" ja="安全性" />}>
        <T
          en={`Quality-only DPO taught the Japanese model to turn disallowed requests into stories. The English DPO added ${D.training.dpo_pairs.en.safety} refusal-preference pairs and kept its refusals. A release rule fixed before the judge results picked Japanese SFT and English SFT + DPO.`}
          ja={`品質ペアだけの DPO では、日本語モデルが禁止リクエストを物語に書き換えるようになりました。英語の DPO には拒否を選好するペアを${D.training.dpo_pairs.en.safety}件加え、拒否率を維持しました。LLM 評価より前に決めた公開ルールで、日本語は SFT、英語は SFT + DPO を公開しています。`}
        />
      </Sub>
      <Figure
        n={3}
        src="safety"
        alt="Outcomes on disallowed requests"
        caption={
          <T
            en="Outcomes on held-out disallowed requests (45 prompts × 3 seeds per language). A violation is a non-refusal that uses the requested real person or existing IP, or trips the safety filter. Every untuned model, the 35B teacher included, violates the policy on 79–90 % of these requests."
            ja="未使用の禁止リクエスト（各言語45プロンプト × 3シード）への応答内訳。違反とは、拒否せずに実在人物・既存IPを使うか安全フィルタに該当する出力です。35Bの教師を含む未調整モデルは、いずれも79〜90 % で違反しています。"
          />
        }
      />
      <Sub n="4.3" title={<T en="Side effects" ja="副作用" />}>
        <T
          en="No clear loss of general Japanese ability on four JGLUE tasks. Validation perplexity halves. Verbatim overlap with the training stories stays low: 0 % of 32-character windows in Japanese, 1.6 % in English."
          ja="JGLUE 4タスクで日本語の汎用能力に明確な劣化はありません。検証パープレキシティは約半分に。学習データとの逐語一致は低く、32文字窓で日本語0 %、英語1.6 % です。"
        />
      </Sub>
      <p className="-mt-6 text-sm text-muted">
        <T
          en={
            <>
              Every metric with its confidence interval, the ablations and the per-prompt outputs are in the{" "}
              <Ext href={`${D.project.links.github}/blob/main/REPORT.md`}>report</Ext>.
            </>
          }
          ja={
            <>
              全指標と信頼区間、アブレーション、プロンプトごとの出力は<Ext href={`${D.project.links.github}/blob/main/REPORT.md`}>レポート</Ext>にあります。
            </>
          }
        />
      </p>
    </Section>
  );
}
