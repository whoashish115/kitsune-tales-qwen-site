import { D, int, usd } from "@/lib/kitsune";
import { T, TB } from "./i18n";
import { Card, Ext, Figure, Pill, Section } from "./primitives";
import { TrainingPanels } from "./training-curves";

const L = D.project.links;
const RUNS = D.training.runs;

/* ================================================================== 1. model */

function ModelCards() {
  const tr = RUNS["sft-main"];
  const cards = [
    { k: "jp" as const, slug: D.project.models[0].slug, en: "Japanese", ja: "日本語", recipe: "SFT", data: `${int(RUNS["sft-main"].train_examples)} SFT examples` },
    { k: "en" as const, slug: D.project.models[1].slug, en: "English with Japanese anime themes", ja: "日本のアニメ的世界観の英語", recipe: "SFT + DPO", data: `${int(RUNS["sft-en-main"].train_examples)} SFT examples + ${int(RUNS["dpo-en-main"].n_pairs)} preference pairs` },
  ];
  const spec: [string, string, string][] = [
    ["Base model", "ベースモデル", `${D.project.base_model} (rev. ${D.project.base_revision.slice(0, 7)})`],
    ["Parameters", "パラメータ数", `${D.project.params.stored_b}B stored, ${D.project.params.effective_b}B effective`],
    ["Adapter", "アダプタ", "LoRA r = 32, α = 64, dropout 0.05, all language-model linear layers"],
    ["Trainable", "学習対象", `${(tr.params_trainable / 1e6).toFixed(1)}M parameters (${((tr.params_trainable / tr.params_total) * 100).toFixed(2)} %)`],
    ["Precision, length", "精度・長さ", "bf16, up to 2,048 tokens per example"],
    ["Hardware", "計算環境", `1 × H100 80 GB (cloud), ${usd(D.budget.total_billed)} in total`],
    ["License", "ライセンス", "Apache-2.0 (code, adapters, weights, datasets)"],
  ];
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-4">
        {cards.map((m) => (
          <Card key={m.slug}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="num font-semibold text-ink">{m.slug}</span>
              <Pill tone="accent">{m.recipe}</Pill>
            </div>
            <p className="mt-1 text-sm text-ink-2">
              <T en={m.en} ja={m.ja} mix="side" />
            </p>
            <p className="num mt-1 text-xs text-muted">{m.data}</p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Ext href={L.models[m.k].merged}>
                <T en="Weights" ja="重み" mix="side" />
              </Ext>
              <Ext href={L.models[m.k].lora}>LoRA</Ext>
              <Ext href={L.models[m.k].gguf}>GGUF</Ext>
              <Ext href={L.datasets[m.k]}>
                <T en="Dataset" ja="データ" mix="side" />
              </Ext>
            </p>
          </Card>
        ))}
      </div>
      <table className="w-full self-start border-collapse text-sm">
        <caption className="mb-2 text-left font-display text-lg font-bold">
          <T en="Specification" ja="仕様" mix="side" />
        </caption>
        <tbody>
          {spec.map(([en, ja, v]) => (
            <tr key={en} className="border-t border-line">
              <th className="w-40 py-2 pr-4 text-left align-top font-normal text-muted">
                <T en={en} ja={ja} />
              </th>
              <td className="num py-2 text-xs leading-relaxed text-ink sm:text-sm">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Task() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="font-display text-xl font-bold">
          <T en="The task" ja="タスク" />
        </h3>
        <TB
          className="text-sm text-ink-2"
          en={
            <p>
              A request names one to three genres, a title and a format; the answer is prose only, without headings, markdown or meta
              commentary. Requests for sexual content, real people, existing IP or hate are refused, and non-fantasy requests are
              rewritten as fantasy. The test set crosses the nine genres with the three formats, ten prompts per cell (270 per
              language), frozen before any training data existed.
            </p>
          }
          ja={
            <p>
              リクエストは1〜3個のジャンル、タイトル、形式で構成され、応答は本文のみ（見出し・Markdown・メタ的な注釈なし）です。性的内容・実在人物・既存IP・ヘイトの依頼は拒否し、ファンタジー以外の依頼はファンタジーとして書き直します。テストセットは9ジャンル
              × 3形式の各セル10件（言語ごとに270件）で、学習データより先に凍結しました。
            </p>
          }
        />
        <ul className="flex flex-wrap gap-2">
          {(D.project.genres as { ja: string; en_prompt: string }[]).map((g) => (
            <li key={g.ja} className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-2">
              {g.ja} <span className="text-muted">{g.en_prompt}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <pre className="num overflow-x-auto rounded-md bg-wash p-3 text-xs leading-relaxed text-ink-2">
{`ジャンル: 魔王と勇者, スローライフ
タイトル: 引退した魔王は湖畔で喫茶店を開く
形式: あらすじ

Genres: Slow Life, High Fantasy
Title: A Kicked-Out Summoner Wants a Quiet Life in the Frontier
Format: continuation`}
        </pre>
      </div>
    </div>
  );
}

const STAGES: [string, string, string, string][] = [
  ["Data", "データ", "Two Apache-2.0 models write the stories and label each other's; rule filters and MinHash dedup follow.", "Apache-2.0 の2モデルが物語を書き、互いの物語をラベル付け。その後ルールフィルタと MinHash で重複除去。"],
  ["SFT", "SFT", "LoRA on all language-model linear layers, loss on the assistant turn only, one epoch.", "言語モデルの全線形層に LoRA、損失は応答部分のみ、1エポック。"],
  ["DPO", "DPO", "Two self-samples per prompt, ranked by rules, an order-consistent judge and refusal preferences.", "プロンプトごとに自己サンプル2つ。ルール・両順序で一致した判定・拒否の選好で順位付け。"],
  ["Evaluate", "評価", "Held-out prompts, a policy suite, a pairwise judge, JGLUE and a leakage audit.", "未使用プロンプト・ポリシー評価・ペアワイズ判定・JGLUE・リーク監査。"],
  ["Release", "公開", "fp32 merge checked against the adapter, plus Q4_K_M and Q8_0 GGUF.", "fp32 マージをアダプタと照合し、Q4_K_M・Q8_0 の GGUF も作成。"],
];

export function ModelSection() {
  return (
    <Section
      id="model"
      n="1"
      title={<T en="The models" ja="モデル" />}
      lede={
        <TB
          en={<p>Two LoRA fine-tunes of the same base model, one per language, trained with the same recipe and tested on the same design.</p>}
          ja={<p>同じベースモデルに対する言語別の2つの LoRA 微調整です。学習レシピも評価設計も共通です。</p>}
        />
      }
    >
      <ModelCards />
      <Task />
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-xl font-bold">
          <T en="Pipeline" ja="パイプライン" />
        </h3>
        <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map(([en, ja, den, dja], i) => (
            <li key={en} className="flex gap-3 border-t border-line pt-3">
              <span className="num text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-semibold text-ink">
                  <T en={en} ja={ja} mix="side" />
                </span>
                <span className="text-sm text-ink-2">
                  <T en={den} ja={dja} />
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ================================================================== 2. data */

export function DataSection() {
  return (
    <Section
      id="data"
      n="2"
      title={<T en="Data" ja="データ" />}
      lede={
        <TB
          en={
            <p>
              All training stories are synthetic: written by one of two Apache-2.0 models and labeled by the other. No web fiction was
              scraped. A story is kept only if it passes both the rule filters and the other model&apos;s labels. For English,
              protagonist names were rebalanced before filtering because both generators reused a few default names.
            </p>
          }
          ja={
            <p>
              学習用の物語はすべて合成データで、Apache-2.0 の2モデルのどちらかが書き、もう一方がラベル付けしました。Web 小説のスクレイピングは行っていません。採用されるのはルールフィルタと相手モデルのラベルの両方を通過した物語だけです。英語では、両生成モデルが同じ名前を多用するため、フィルタ前に主人公名を再配分しました。
            </p>
          }
        />
      }
    >
      <Figure
        n={1}
        src="data_funnel"
        alt="Data funnel for the Japanese and English datasets"
        caption={
          <T
            en="Synthetic data funnel. Rule filters remove most rejected stories; the cross-model labels remove a further 1–2 % of generations. The last bar is the synthetic part of the train split (validation stories held out; refusal and redirect templates are added on top)."
            ja="合成データの採用過程。除外の大半はルールフィルタによるもので、相互ラベルがさらに生成の1〜2 % を除外します。最後の棒は学習分割の合成部分です（検証用は除外、拒否・書き換えのテンプレートはこの上に追加）。"
          />
        }
      />
    </Section>
  );
}

/* ================================================================== 3. training */

export function Training() {
  const tr = RUNS["sft-main"];
  return (
    <Section
      id="training"
      n="3"
      title={<T en="Training" ja="学習" />}
      lede={
        <TB
          en={
            <p>
              The two main SFT runs share every hyperparameter; only the data and the system prompt differ. The adapter trains{" "}
              {(tr.params_trainable / 1e6).toFixed(1)}M parameters with lr 2e-4, a cosine schedule, effective batch 16 and one epoch on
              one H100. DPO (lr 2e-5, β = 0.1) starts from the SFT adapter, which is also its frozen reference. Ablations on the Japanese
              recipe show that data volume matters more than LoRA rank.
            </p>
          }
          ja={
            <p>
              2つの主要 SFT はハイパーパラメータがすべて同じで、違いはデータとシステムプロンプトだけです。アダプタは{" "}
              {(tr.params_trainable / 1e6).toFixed(1)}M パラメータを学習率 2e-4、コサインスケジュール、実効バッチ16、1エポック、H100 1基で学習します。DPO（学習率 2e-5、β = 0.1）は SFT
              アダプタから開始し、同じアダプタを固定参照に使います。日本語レシピのアブレーションでは、LoRA ランクよりデータ量の効果が大きいことを確認しました。
            </p>
          }
        />
      }
    >
      <TrainingPanels />
      <p className="-mt-8 text-sm text-ink-2">
        <T
          en={
            <>
              Full logs: <Ext href={L.wandb}>W&amp;B project</Ext>. Ablation and DPO figures: <Ext href={`${L.github}/blob/main/REPORT.md`}>REPORT.md</Ext>.
            </>
          }
          ja={
            <>
              全ログ：<Ext href={L.wandb}>W&amp;B プロジェクト</Ext>。アブレーションと DPO の図：<Ext href={`${L.github}/blob/main/REPORT.md`}>REPORT.md</Ext>。
            </>
          }
        />
      </p>
    </Section>
  );
}
