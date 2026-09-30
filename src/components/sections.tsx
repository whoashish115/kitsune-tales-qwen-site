import { D, int, pct, released, sys, usd } from "@/lib/kitsune";
import { T, TB } from "./i18n";
import { Card, Ext, Figure, Pill, Section, Sub, TableWrap } from "./primitives";
import { TrainingPanels } from "./training-curves";

const L = D.project.links;
const RUNS = D.training.runs;
const FORMATS = D.project.formats as { ja: string; en: string; ja_chars: number[]; en_words: number[] }[];
const mean = (s: ReturnType<typeof sys>, part: "test" | "policy", k: string) => (s[part][k] as { mean: number }).mean;

/* ================================================================== 1. model */

function AtAGlance() {
  const jb = sys("ja", "base"),
    jr = sys("ja", released("ja")),
    eb = sys("en", "base-en"),
    er = sys("en", released("en"));
  const rows: { en: string; ja: string; base: string; ours: string; n: string; better: "up" | "down" }[] = [
    {
      en: "Japanese stories that stay within the requested length",
      ja: "日本語：指定した長さに収まった物語",
      base: pct(mean(jb, "test", "length_ok"), 1),
      ours: pct(mean(jr, "test", "length_ok"), 0),
      n: "270 × 3",
      better: "up",
    },
    {
      en: "English stories that stay within the requested length",
      ja: "英語：指定した長さに収まった物語",
      base: pct(mean(eb, "test", "length_ok"), 0),
      ours: pct(mean(er, "test", "length_ok"), 0),
      n: "270 × 3",
      better: "up",
    },
    {
      en: "Outputs with markdown or meta text, Japanese / English",
      ja: "Markdown やメタ文を含む出力（日本語 / 英語）",
      base: `${pct(mean(jb, "test", "markdown"), 0)} / ${pct(mean(eb, "test", "markdown"), 0)}`,
      ours: `${pct(mean(jr, "test", "markdown"), 0)} / ${pct(mean(er, "test", "markdown"), 0)}`,
      n: "270 × 3",
      better: "down",
    },
    {
      en: "Japanese: disallowed requests carried out anyway",
      ja: "日本語：禁止リクエストをそのまま実行した割合",
      base: pct(mean(jb, "policy", "violation_rate_disallowed"), 0),
      ours: pct(mean(jr, "policy", "violation_rate_disallowed"), 0),
      n: "45 × 3",
      better: "down",
    },
    {
      en: "English: disallowed requests carried out anyway",
      ja: "英語：禁止リクエストをそのまま実行した割合",
      base: pct(mean(eb, "policy", "violation_rate_disallowed"), 0),
      ours: pct(mean(er, "policy", "violation_rate_disallowed"), 0),
      n: "45 × 3",
      better: "down",
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-xl font-bold">
        <T en="At a glance: base model vs Kitsune" ja="概要：ベースモデルと Kitsune の比較" />
      </h3>
      <TableWrap>
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/20 text-left text-muted">
              <th className="py-2 pr-4 font-normal">
                <T en="What was measured" ja="測定項目" mix="side" />
              </th>
              <th className="px-3 py-2 text-right font-normal">
                <T en="Base model" ja="ベース" mix="side" />
              </th>
              <th className="px-3 py-2 text-right font-normal text-ink">Kitsune</th>
              <th className="py-2 pl-3 text-right font-normal">
                <T en="Test size" ja="件数" mix="side" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.en} className="border-b border-line">
                <td className="py-2.5 pr-4 text-ink-2">
                  <T en={r.en} ja={r.ja} />
                  <span className="ml-1 text-xs text-muted">{r.better === "up" ? "(higher is better)" : "(lower is better)"}</span>
                </td>
                <td className="num px-3 text-right text-ink-2">{r.base}</td>
                <td className="num px-3 text-right text-lg font-semibold text-ink">{r.ours}</td>
                <td className="num pl-3 text-right text-xs text-muted">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <p className="text-sm text-muted">
        <T
          en="Kitsune = the released model for each language. Test size = held-out prompts × sampling seeds. Story quality as judged by an LLM is about equal to the base model once length is controlled (Results, 4.2)."
          ja="Kitsune は各言語の公開モデル。件数は未使用プロンプト数 × サンプリングのシード数。LLM による物語の質の評価は、長さを揃えるとベースモデルとほぼ同等です（結果 4.2）。"
        />
      </p>
    </div>
  );
}

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
    ["Hardware", "計算環境", `1 × H100 80 GB on Modal, ${usd(D.budget.total_billed)} in total`],
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
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="py-1.5 pr-3 font-normal">
                <T en="Format" ja="形式" mix="side" />
              </th>
              <th className="py-1.5 pr-3 text-right font-normal">
                <T en="Japanese, characters" ja="日本語（字）" mix="side" />
              </th>
              <th className="py-1.5 text-right font-normal">
                <T en="English, words" ja="英語（語）" mix="side" />
              </th>
            </tr>
          </thead>
          <tbody className="num">
            {FORMATS.map((f) => (
              <tr key={f.ja} className="border-t border-line">
                <td className="py-1.5 pr-3 font-sans text-ink">
                  {f.ja} <span className="text-xs text-muted">{f.en}</span>
                </td>
                <td className="py-1.5 pr-3 text-right text-ink-2">
                  {int(f.ja_chars[0])}–{int(f.ja_chars[1])}
                </td>
                <td className="py-1.5 text-right text-ink-2">
                  {int(f.en_words[0])}–{int(f.en_words[1])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  ["Seeds", "シード", "Title templates, genre combinations and formats; titles near a test title are excluded.", "タイトルテンプレート・ジャンルの組み合わせ・形式。テストタイトルに近いものは除外。"],
  ["Two generators", "2つの生成モデル", "Qwen3.6-35B-A3B and Gemma 4 26B-A4B write the stories (both Apache-2.0).", "Qwen3.6-35B-A3B と Gemma 4 26B-A4B が物語を生成（いずれも Apache-2.0）。"],
  ["Cross-labeling", "相互ラベリング", "Each generator labels the other's stories for fantasy, audience, real people or IP, genre and title fit, quality.", "各モデルが相手の物語を判定：ファンタジー性・対象年齢・実在人物/IP・ジャンルとタイトルの一致・品質。"],
  ["Filters, dedup", "フィルタ・重複除去", "Script purity, length, repetition, safety, PII and tag checks, then MinHash deduplication.", "文字種・長さ・反復・安全性・個人情報・タグの検査の後、MinHash で重複除去。"],
  ["SFT", "SFT", "LoRA on all language-model linear layers, loss on the assistant turn only, one epoch.", "言語モデルの全線形層に LoRA、損失は応答部分のみ、1エポック。"],
  ["DPO", "DPO", "Two self-samples per prompt; rule pairs, judge pairs that agree in both orders, refusal pairs.", "プロンプトごとに自己サンプル2つ。ルールペア・両順序で一致した判定ペア・拒否ペア。"],
  ["Merge, verify", "マージ・検証", "fp32 merge, then token-level agreement with the unmerged adapter.", "fp32 でマージし、未マージのアダプタとトークン単位で一致を確認。"],
  ["Evaluate", "評価", "Automatic metrics, policy suite, pairwise judge, JGLUE, perplexity, leakage audit.", "自動指標・ポリシー評価・ペアワイズ判定・JGLUE・パープレキシティ・リーク監査。"],
  ["Export", "変換", "Merged safetensors and Q4_K_M / Q8_0 GGUF, run once on CPU with llama.cpp.", "マージ済み safetensors と Q4_K_M / Q8_0 GGUF。llama.cpp の CPU で動作確認。"],
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
      <AtAGlance />
      <ModelCards />
      <Task />
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-xl font-bold">
          <T en="Pipeline" ja="パイプライン" />
        </h3>
        <ol className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
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
  const rows: [string, string, (d: typeof D.data.ja) => string][] = [
    ["Generations", "生成数", (d) => int(d.generations)],
    ["Kept after filters and labels", "フィルタ・ラベル通過", (d) => `${int(d.kept)} (${pct(d.kept / d.generations, 0)})`],
    ["Train / validation examples", "学習 / 検証", (d) => `${int(d.train)} / ${int(d.val)}`],
    ["Policy templates in train", "学習中のポリシー例", (d) => int(d.policy_templates)],
  ];
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

const STAGE_ROWS: { run: string; en: string; ja: string; data: string; result: string; status: [string, string]; tone: "accent" | "neutral" }[] = [
  { run: "sft-pilot", en: "Pilot", ja: "パイロット", data: `${int(RUNS["sft-pilot"].train_examples)} ex.`, result: `val ${RUNS["sft-pilot"].eval_loss.toFixed(3)}`, status: ["sizing run", "設定確認"], tone: "neutral" },
  { run: "abl-data10", en: "Ablation", ja: "アブレーション", data: `${int(RUNS["abl-data10"].train_examples)} ex.`, result: `val ${RUNS["abl-data10"].eval_loss.toFixed(3)}`, status: ["10 % data", "10 %"], tone: "neutral" },
  { run: "abl-data30", en: "Ablation", ja: "アブレーション", data: `${int(RUNS["abl-data30"].train_examples)} ex.`, result: `val ${RUNS["abl-data30"].eval_loss.toFixed(3)}`, status: ["30 % data", "30 %"], tone: "neutral" },
  { run: "abl-r16", en: "Ablation", ja: "アブレーション", data: `${int(RUNS["abl-r16"].train_examples)} ex.`, result: `val ${RUNS["abl-r16"].eval_loss.toFixed(3)}`, status: ["rank 16", "ランク16"], tone: "neutral" },
  { run: "abl-r64", en: "Ablation", ja: "アブレーション", data: `${int(RUNS["abl-r64"].train_examples)} ex.`, result: `val ${RUNS["abl-r64"].eval_loss.toFixed(3)}`, status: ["rank 64", "ランク64"], tone: "neutral" },
  { run: "sft-main", en: "Japanese SFT", ja: "日本語 SFT", data: `${int(RUNS["sft-main"].train_examples)} ex.`, result: `val ${RUNS["sft-main"].eval_loss.toFixed(3)}`, status: ["released", "公開"], tone: "accent" },
  { run: "dpo-main-v2", en: "Japanese DPO", ja: "日本語 DPO", data: `${int(RUNS["dpo-main-v2"].n_pairs)} pairs`, result: `pref. acc. ${pct(RUNS["dpo-main-v2"].reward_accuracy, 0)}`, status: ["not released", "非公開"], tone: "neutral" },
  { run: "sft-en-main", en: "English SFT", ja: "英語 SFT", data: `${int(RUNS["sft-en-main"].train_examples)} ex.`, result: `val ${RUNS["sft-en-main"].eval_loss.toFixed(3)}`, status: ["DPO reference", "DPO の参照"], tone: "neutral" },
  { run: "dpo-en-main", en: "English DPO", ja: "英語 DPO", data: `${int(RUNS["dpo-en-main"].n_pairs)} pairs`, result: `pref. acc. ${pct(RUNS["dpo-en-main"].reward_accuracy, 0)}`, status: ["released", "公開"], tone: "accent" },
];

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
              Nine logged runs. The two main SFT runs share every hyperparameter; only the data and the system prompt differ. The
              adapter trains {(tr.params_trainable / 1e6).toFixed(1)}M parameters. DPO starts from the SFT adapter, which also serves
              as the frozen reference model. Settings: lr 2e-4 (SFT) and 2e-5 (DPO, β = 0.1), cosine schedule, effective batch 16,
              one epoch, seed 42, one H100.
            </p>
          }
          ja={
            <p>
              記録した学習は9回です。2つの主要 SFT はハイパーパラメータがすべて同じで、違いはデータとシステムプロンプトだけです。アダプタの学習対象は{" "}
              {(tr.params_trainable / 1e6).toFixed(1)}M パラメータ。DPO は SFT アダプタから開始し、同じアダプタを固定参照モデルとして使います。設定：学習率 2e-4（SFT）・2e-5（DPO、β =
              0.1）、コサインスケジュール、実効バッチ16、1エポック、シード42、H100 1基。
            </p>
          }
        />
      }
    >
      <TableWrap>
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/20 text-left text-muted">
              <th className="py-2 pr-4 font-normal">
                <T en="Stage" ja="段階" mix="side" />
              </th>
              <th className="py-2 pr-4 font-normal">
                <T en="Run" ja="実行名" mix="side" />
              </th>
              <th className="py-2 pr-4 text-right font-normal">
                <T en="Data" ja="データ" mix="side" />
              </th>
              <th className="py-2 pr-4 text-right font-normal">
                <T en="Result" ja="結果" mix="side" />
              </th>
              <th className="py-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {STAGE_ROWS.map((r) => (
              <tr key={r.run} className={`border-b border-line ${r.tone === "accent" ? "bg-accent-soft/60" : ""}`}>
                <td className="py-2 pr-4 text-ink-2">
                  <T en={r.en} ja={r.ja} mix="side" />
                </td>
                <td className="num py-2 pr-4 text-ink">{r.run}</td>
                <td className="num py-2 pr-4 text-right text-ink-2">{r.data}</td>
                <td className="num py-2 pr-4 text-right text-ink">{r.result}</td>
                <td className="py-2">
                  <Pill tone={r.tone}>
                    <T en={r.status[0]} ja={r.status[1]} mix="en" />
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <p className="-mt-8 text-xs text-muted">
        <T
          en="val = validation cross-entropy on assistant tokens; pref. acc. = held-out DPO preference accuracy (85 JP / 79 EN pairs). The two are different losses and are not comparable."
          ja="val は応答トークンでの検証交差エントロピー、pref. acc. は DPO の検証選好正解率（日本語85・英語79ペア）。両者は別の指標で比較できません。"
        />
      </p>
      <Sub n="3.1" title={<T en="Training curves" ja="学習曲線" />}>
        <T
          en={
            <>
              Interactive view of the trainer logs for every run. The full W&amp;B project is at <Ext href={L.wandb}>wandb.ai/whoashish115-base/kitsune-tales</Ext>.
            </>
          }
          ja={
            <>
              全実行のトレーナーログを操作できる形で表示しています。W&amp;B プロジェクト：<Ext href={L.wandb}>wandb.ai/whoashish115-base/kitsune-tales</Ext>
            </>
          }
        />
      </Sub>
      <TrainingPanels />
            <Figure
        n={2}
        src="sft_loss"
        alt="SFT loss curves"
        caption={
          <T
            en="SFT loss. Faint line: training loss every 10 steps; solid: its moving average; points: validation loss every 150 steps. Validation follows training to the end of the epoch with no sign of overfitting."
            ja="SFT の損失。薄線は10ステップごとの学習損失、実線はその移動平均、点は150ステップごとの検証損失。検証損失はエポックの最後まで学習損失に追従し、過学習の兆候はありません。"
          />
        }
      />
      <Figure
        n={3}
        src="ablations"
        alt="Ablations on data share and LoRA rank"
        caption={
          <T
            en="Ablations on the Japanese recipe. (a) Validation loss during training at 10 %, 30 % and 100 % of the data. (b) Final validation loss falls roughly log-linearly with data; at a fixed 25 % subset, rank 64 beats rank 16 by 0.036, well below the 0.087 gained from 30 % to 100 % of the data."
            ja="日本語レシピのアブレーション。(a) データ10 %・30 %・100 % での学習中の検証損失。(b) 最終検証損失はデータ量の対数にほぼ比例して低下。25 % 固定ではランク64がランク16を0.036下回るものの、データを30 % から100 % にした効果（0.087）よりずっと小さい差です。"
          />
        }
      />
            <Figure
        n={4}
        src="dpo_training"
        alt="DPO loss, held-out preference accuracy and margin"
        caption={
          <T
            en={`DPO. Japanese v2 reaches ${pct(RUNS["dpo-main-v2"].reward_accuracy, 0)} held-out preference accuracy. The English run ends at ${pct(RUNS["dpo-en-main"].reward_accuracy, 0)}, down from 67 % at step 50: its quality preferences are only weakly learnable, and its measured gains over English SFT are in length adherence and safety (Results).`}
            ja={`DPO。日本語 v2 の検証選好正解率は ${pct(RUNS["dpo-main-v2"].reward_accuracy, 0)}。英語はステップ50の67 % から最終 ${pct(RUNS["dpo-en-main"].reward_accuracy, 0)} に下がりました。品質の選好は学習しにくく、英語 SFT に対する改善は長さの遵守と安全性に現れています（結果）。`}
          />
        }
      />
    </Section>
  );
}
