import { D, int, pct, released, sys, usd } from "@/lib/kitsune";
import { T, TB } from "./i18n";
import { Card, Ext, Figure, Pill, Section, Sub, TableWrap } from "./primitives";
import { TrainingPanels } from "./wandb";
const L = D.project.links;
const RUNS = D.training.runs;
const FORMATS = D.project.formats as { ja: string; en: string; ja_chars: number[]; en_words: number[] }[];
const mean = (s: ReturnType<typeof sys>, part: "test" | "policy", k: string) => (s[part][k] as { mean: number }).mean;
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
