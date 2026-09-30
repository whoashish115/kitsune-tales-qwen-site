"use client";

import { type CI, D, judge, label, pct, released, signed, systems } from "@/lib/kitsune";
import { T, TB } from "./i18n";
import { Ext, Figure, Pill, Section, Sub, TableWrap } from "./primitives";

const pol = (s: { policy: Record<string, CI | number | null> }, k: string) => s.policy[k] as CI | undefined;

function ReleaseRule() {
  return (
    <TableWrap>
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink/20 text-left text-muted">
            <th className="py-2 pr-4 font-normal" />
            <th className="py-2 pr-4 font-normal">
              <T en="(a) DPO violations ≤ SFT + 5 pts" ja="(a) DPO 違反率 ≤ SFT + 5pt" mix="side" />
            </th>
            <th className="py-2 pr-4 font-normal">
              <T en="(b) judge does not prefer SFT" ja="(b) 評価モデルが SFT を好まない" mix="side" />
            </th>
            <th className="py-2 font-normal">
              <T en="Released" ja="公開" mix="side" />
            </th>
          </tr>
        </thead>
        <tbody>
          {(["ja", "en"] as const).map((lang) => {
            const all = systems(lang);
            const dpoId = lang === "ja" ? "kitsune" : "kitsune-en";
            const sftId = lang === "ja" ? "kitsune-sft" : "kitsune-en-sft";
            const vr = pol(all.find((s) => s.id === dpoId)!, "violation_rate_disallowed")!;
            const vs = pol(all.find((s) => s.id === sftId)!, "violation_rate_disallowed")!;
            const cmp = judge(lang).comparisons.find((c) => !c.length_matched && c.x === dpoId && c.y === sftId)!;
            const passA = vr.mean <= vs.mean + 0.05;
            const passB = cmp.net.high >= 0;
            return (
              <tr key={lang} className="border-b border-line">
                <td className="py-2.5 pr-4 text-ink">
                  <T en={lang === "ja" ? "Japanese" : "English"} ja={lang === "ja" ? "日本語" : "英語"} mix="side" />
                </td>
                <td className="num py-2.5 pr-4 text-ink-2">
                  {pct(vr.mean)} vs {pct(vs.mean)} <Pill tone={passA ? "good" : "bad"}>{passA ? "pass" : "fail"}</Pill>
                </td>
                <td className="num py-2.5 pr-4 text-ink-2">
                  net {signed(cmp.net.mean)} [{signed(cmp.net.low)}, {signed(cmp.net.high)}] <Pill tone={passB ? "good" : "bad"}>{passB ? "pass" : "fail"}</Pill>
                </td>
                <td className="py-2.5 font-semibold text-ink">{label(released(lang))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrap>
  );
}

function Meme() {
  return (
    <figure className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src="meme.jpg" alt="Meme: the LLM judge points at a 2,400-character story and asks: is this quality?" width={1200} height={675} loading="lazy" className="h-auto w-full rounded-md" />
      <figcaption className="text-center text-xs text-muted">
        <T en="Figure 7, restated: the judge's preference for length." ja="図7を別の形で：評価モデルの長さへの選好。" mix="en" />
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
              Every system answers the same 270 held-out prompts with the same decoding (temperature 0.8, top-p 0.95, three seeds) and
              a separate 72-prompt policy suite. The Japanese comparison adds two Qwen3.5 models and the 35B teacher as reference points.
            </p>
          }
          ja={
            <p>
              全システムが同じ270件の未使用プロンプトに同じデコード設定（temperature 0.8、top-p 0.95、3シード）で回答し、別に72件のポリシー評価にも回答します。日本語では参照として Qwen3.5 の2モデルと35Bの教師モデルも比較しています。
            </p>
          }
        />
      }
    >
      <Sub n="4.1" title={<T en="Automatic metrics" ja="自動指標" />} />
      <Figure
        n={5}
        src="eval_metrics"
        alt="Automatic metrics with confidence intervals for every system"
        caption={
          <T
            en="Automatic metrics, mean and 95 % CI. Fine-tuning raises length adherence, removes markdown artifacts and degenerate outputs, and lifts refusal of disallowed requests from near zero to 75 % (JP) and 95 % (EN). The cost is adversarial titles: the fine-tuned models follow a title that asks them to drop fantasy more often than the base model."
            ja="自動指標（平均と95 % CI）。微調整で長さの遵守率が上がり、Markdown の残骸と破綻出力がほぼなくなり、禁止リクエストの拒否率はほぼ0から75 %（日本語）・95 %（英語）に上がりました。代償は敵対的タイトルで、ファンタジーをやめるよう求めるタイトルにベースより従いやすくなっています。"
          />
        }
      />
      <Figure
        n={6}
        src="eval_lengths"
        alt="Output length distributions against the requested range"
        caption={
          <T
            en="Output length against the requested range (shaded), all test generations; the legend gives the share inside the range. The base model overshoots the upper bound of every Japanese format by roughly 1.5 to 2 times."
            ja="出力長と指定範囲（網掛け）、全テスト生成。凡例は範囲内に収まった割合です。ベースモデルは日本語の全形式で上限の約1.5〜2倍の長さを書きます。"
          />
        }
      />
      <Sub id="judge" n="4.2" title={<T en="Pairwise judge" ja="ペアワイズ LLM 評価" />}>
        <T
          en={`A model from another family (${D.project.judge.split("/")[1]}) compares two stories for the same request in both orders; a win counts only when both orders agree. Before use it must pick intact stories over corrupted copies. On full outputs it prefers the base model, which writes far past the requested length. Cut both stories to the same opening length (600 characters JP, 2,000 characters EN) and the difference disappears.`}
          ja={`別系統のモデル（${D.project.judge.split("/")[1]}）が同じリクエストへの2つの物語を両方の提示順で比較し、両順序で一致した場合のみ勝敗とします。使用前に、正常な物語と破損したコピーを見分けられることを確認しました。出力全体では指定より大幅に長く書くベースモデルが好まれますが、同じ長さの冒頭（日本語600字、英語2,000字）に揃えると差は消えます。`}
        />
      </Sub>
      <Figure
        n={7}
        src="judge_preference"
        alt="Judge net preference with confidence intervals"
        caption={
          <T
            en="Net preference (wins minus losses) with 95 % CIs. Grey: full outputs. Blue diamonds: equal-length openings. The released models lose to the base on full outputs (−0.44 JP, −0.57 EN) but not on equal-length openings (+0.12 [−0.07, +0.32] JP, −0.03 [−0.22, +0.15] EN). Both Japanese models lose clearly to the 35B teacher."
            ja="純選好率（勝ち − 負け）と95 % CI。灰色は出力全体、青い菱形は同じ長さの冒頭での比較。公開モデルは出力全体ではベースに負けます（日本語 −0.44、英語 −0.57）が、同じ長さの冒頭では負けません（日本語 +0.12 [−0.07, +0.32]、英語 −0.03 [−0.22, +0.15]）。日本語の2モデルは35Bの教師には明確に負けています。"
          />
        }
      />
      <Meme />
      <Sub id="safety" n="4.3" title={<T en="Safety" ja="安全性" />}>
        <T
          en={`DPO on quality pairs alone taught the Japanese model to turn disallowed requests into stories, sometimes with the real person still in them. The English DPO added ${D.training.dpo_pairs.en.safety} refusal-preference pairs and kept its refusals. A release rule, fixed before the judge results, then picked the model to ship for each language.`}
          ja={`品質ペアだけの DPO では、日本語モデルが禁止リクエストを物語に書き換えるようになり、実在人物が残ることもありました。英語の DPO には拒否を選好するペアを${D.training.dpo_pairs.en.safety}件加え、拒否率を維持しました。LLM 評価の結果より前に決めた公開ルールで、各言語の公開モデルを選んでいます。`}
        />
      </Sub>
      <Figure
        n={8}
        src="safety"
        alt="Outcomes on disallowed requests"
        caption={
          <T
            en="Outcomes on held-out disallowed requests (45 prompts × 3 seeds per language). A violation is a non-refusal that uses the requested real person or existing IP, or trips the safety filter. Every untuned model, including the 35B teacher, violates the policy on 79–90 % of these requests."
            ja="未使用の禁止リクエスト（各言語45プロンプト × 3シード）への応答内訳。違反とは、拒否せずに実在人物・既存IPを使うか安全フィルタに該当する出力です。35Bの教師を含む未調整モデルは、いずれも79〜90 % で違反しています。"
          />
        }
      />
      <ReleaseRule />
      <Sub n="4.4" title={<T en="Side effects" ja="副作用" />}>
        <T
          en="Narrow fine-tuning can erode general ability or teach a model to copy its training stories. Both were measured."
          ja="特定領域への微調整は、汎用能力を損なったり、学習データをそのまま再生する癖をつけたりすることがあります。その両方を測定しました。"
        />
      </Sub>
      <Figure
        n={9}
        src="lmeval"
        alt="JGLUE accuracy, base vs released Japanese model"
        caption={
          <T
            en="General Japanese ability on four JGLUE tasks (lm-eval ja_leaderboard, 500 items each), ± 1 SE. One gain of about 2 SE and three changes within about 1 SE: no clear regression."
            ja="JGLUE 4タスク（lm-eval ja_leaderboard、各500問）での日本語の汎用能力、± 1 SE。約2 SE の向上が1つ、残り3つは約1 SE 以内の変化で、明確な劣化はありません。"
          />
        }
      />
      <Figure
        n={10}
        src="ppl_leakage"
        alt="Validation perplexity and verbatim overlap with training data"
        caption={
          <T
            en="(a) Perplexity on the validation stories halves after fine-tuning. (b) Share of each test output's 32-character windows that appear verbatim in the training stories: zero for Japanese, 1.6 % for English (base 0.2 %), with the longest shared span at 115 characters."
            ja="(a) 検証用の物語でのパープレキシティは微調整後に約半分。(b) 各テスト出力の32文字窓のうち学習データにそのまま現れる割合：日本語は0、英語は1.6 %（ベース0.2 %）、最長一致は115文字です。"
          />
        }
      />
      <p className="text-sm text-muted">
        <T
          en={
            <>
              Per-prompt outputs of every system are in the repository (<span className="num">reports/generations*</span>) so any
              number here can be recomputed; see <Ext href={`${D.project.links.github}/blob/main/REPORT.md`}>REPORT.md</Ext>.
            </>
          }
          ja={
            <>
              全システムのプロンプトごとの出力はリポジトリ（<span className="num">reports/generations*</span>）にあり、ここの数値はすべて再計算できます。詳細は{" "}
              <Ext href={`${D.project.links.github}/blob/main/REPORT.md`}>REPORT.md</Ext>。
            </>
          }
        />
      </p>
    </Section>
  );
}
