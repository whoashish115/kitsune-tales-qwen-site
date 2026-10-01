"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { D } from "@/lib/data";
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

/* Debiased exponential moving average, the smoothing W&B and TensorBoard apply to line plots. */
function smooth(ys: number[], w: number): number[] {
  if (w <= 0) return ys;
  let s = 0;
  return ys.map((v, i) => {
    s = s * w + (1 - w) * v;
    return s / (1 - Math.pow(w, i + 1));
  });
}

function niceTicks(lo: number, hi: number, count = 4): number[] {
  const span = hi - lo || Math.abs(hi) || 1;
  let step = Math.pow(10, Math.floor(Math.log10(span / count)));
  const err = (count / span) * step;
  if (err <= 0.15) step *= 10;
  else if (err <= 0.35) step *= 5;
  else if (err <= 0.75) step *= 2;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(+v.toPrecision(12));
  return out;
}

function fmt(v: number): string {
  const a = Math.abs(v);
  if (a !== 0 && a < 0.01) return v.toExponential(1);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(3);
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(520);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

type Line = { run: Run; xs: number[]; raw: number[]; ys: number[]; markers: boolean };

function Chart({
  metric,
  lines,
  xKey,
  hoverX,
  setHoverX,
  active,
  setActive,
  idx,
}: {
  metric: Metric;
  lines: Line[];
  xKey: "step" | "epoch";
  hoverX: number | null;
  setHoverX: (x: number | null) => void;
  active: boolean;
  setActive: (i: number | null) => void;
  idx: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const H = 190;
  const m = { l: 46, r: 10, t: 8, b: 26 };
  const all = lines.flatMap((l) => [...l.ys, ...l.raw]);
  const xsAll = lines.flatMap((l) => l.xs);
  if (!all.length) return null;
  let y0 = Math.min(...all),
    y1 = Math.max(...all);
  const pad = (y1 - y0 || Math.abs(y1) || 1) * 0.06;
  y0 -= pad;
  y1 += pad;
  const x0 = Math.min(0, ...xsAll),
    x1 = Math.max(...xsAll);
  const sx = (x: number) => m.l + ((x - x0) / (x1 - x0 || 1)) * (width - m.l - m.r);
  const sy = (y: number) => m.t + (1 - (y - y0) / (y1 - y0 || 1)) * (H - m.t - m.b);
  const path = (xs: number[], ys: number[]) => xs.map((x, i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(ys[i]).toFixed(1)}`).join("");
  const yt = niceTicks(y0, y1, 4);
  const xt = niceTicks(x0, x1, width < 420 ? 3 : 5);
  const nearest = (l: Line, x: number) => {
    let bi = 0;
    for (let i = 1; i < l.xs.length; i++) if (Math.abs(l.xs[i] - x) < Math.abs(l.xs[bi] - x)) bi = i;
    return bi;
  };
  const inRange = hoverX != null && hoverX >= x0 && hoverX <= x1;
  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left + m.l;
    setHoverX(x0 + ((px - m.l) / (width - m.l - m.r)) * (x1 - x0));
    setActive(idx);
  };
  const tip =
    inRange && active
      ? lines
          .map((l) => {
            const i = nearest(l, hoverX!);
            return { l, v: l.ys[i], x: l.xs[i] };
          })
          .sort((a, b) => b.v - a.v)
      : [];
  return (
    <div ref={ref} className="relative min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="num text-xs text-ink">{metric.en}</span>
        <span className="text-xs text-muted">{metric.ja}</span>
      </div>
      <svg width={width} height={H} role="img" aria-label={`${metric.en} by ${xKey}`} className="block max-w-full overflow-visible">
        {yt.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={width - m.r} y1={sy(t)} y2={sy(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={m.l - 6} y={sy(t) + 3.5} textAnchor="end" fontSize="10" fill="var(--muted)" className="num">
              {fmt(t)}
            </text>
          </g>
        ))}
        {xt.map((t) => (
          <text key={t} x={sx(t)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--muted)" className="num">
            {xKey === "epoch" ? t.toFixed(t % 1 ? 1 : 0) : t}
          </text>
        ))}
        {lines.map((l) =>
          l.markers ? (
            <g key={l.run.id}>
              <path d={path(l.xs, l.ys)} fill="none" stroke={l.run.color} strokeWidth="1.5" strokeDasharray={l.run.dash} />
              {l.xs.map((x, i) => (
                <circle key={x} cx={sx(x)} cy={sy(l.ys[i])} r="3.5" fill={l.run.color} stroke="var(--surface)" strokeWidth="1.5" />
              ))}
            </g>
          ) : (
            <g key={l.run.id}>
              <path d={path(l.xs, l.raw)} fill="none" stroke={l.run.color} strokeWidth="1" opacity="0.22" />
              <path d={path(l.xs, l.ys)} fill="none" stroke={l.run.color} strokeWidth="2" strokeDasharray={l.run.dash} strokeLinejoin="round" />
            </g>
          ),
        )}
        {inRange && (
          <g>
            <line x1={sx(hoverX!)} x2={sx(hoverX!)} y1={m.t} y2={H - m.b} stroke="var(--ink-2)" strokeWidth="1" strokeDasharray="3 3" />
            {lines.map((l) => {
              const i = nearest(l, hoverX!);
              return <circle key={l.run.id} cx={sx(l.xs[i])} cy={sy(l.ys[i])} r="4" fill={l.run.color} stroke="var(--surface)" strokeWidth="2" />;
            })}
          </g>
        )}
        <rect
          x={m.l}
          y={m.t}
          width={Math.max(0, width - m.l - m.r)}
          height={H - m.t - m.b}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={() => {
            setHoverX(null);
            setActive(null);
          }}
        />
      </svg>
      {tip.length > 0 && (
        <div
          className="pointer-events-none absolute z-10 min-w-40 rounded-md border border-line bg-surface px-2.5 py-2 text-xs shadow-lg"
          style={{ left: Math.min(Math.max(sx(hoverX!) + 10, 0), width - 190), top: 18 }}
        >
          <div className="num mb-1 text-muted">
            {xKey} {xKey === "epoch" ? tip[0].x.toFixed(2) : tip[0].x}
          </div>
          {tip.map(({ l, v }) => (
            <div key={l.run.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-ink-2">
                <span className="inline-block h-0.5 w-3" style={{ background: l.run.color }} />
                {l.run.id}
              </span>
              <span className="num text-ink">{fmt(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrainingPanels() {
  const [group, setGroup] = useState<"sft" | "dpo">("sft");
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [xKey, setXKey] = useState<"step" | "epoch">("epoch");
  const [w, setW] = useState(0.6);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const runs = RUNS[group].filter((r) => CURVES[r.id]);
  const shown = runs.filter((r) => !hidden[r.id]);
  const panels = useMemo(
    () =>
      METRICS[group].map((mt) => ({
        metric: mt,
        lines: shown
          .map((run) => {
            const s = CURVES[run.id][mt.src];
            const ys = s[mt.key];
            if (!ys) return null;
            const markers = mt.src === "eval";
            return { run, xs: s[xKey], raw: ys, ys: markers ? ys : smooth(ys, w), markers } as Line;
          })
          .filter(Boolean) as Line[],
      })),
    [group, shown, xKey, w],
  );
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div role="tablist" aria-label="Run group" className="inline-flex rounded-lg border border-line bg-surface p-1">
          {(
            [
              ["sft", "SFT runs", "SFT 実行"],
              ["dpo", "DPO runs", "DPO 実行"],
            ] as const
          ).map(([id, en, ja]) => (
            <button
              key={id}
              role="tab"
              aria-selected={group === id}
              onClick={() => {
                setGroup(id);
                setHoverX(null);
              }}
              className={`rounded-md px-3 py-1 ${group === id ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
            >
              <T en={`${en} (${RUNS[id].length})`} ja={`${ja}（${RUNS[id].length}）`} mix="side" />
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-ink-2">
          <T en="x axis" ja="横軸" mix="side" />
          <select value={xKey} onChange={(e) => setXKey(e.target.value as "step" | "epoch")} className="rounded-md border border-line bg-surface px-2 py-1 text-sm">
            <option value="epoch">epoch</option>
            <option value="step">step</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-ink-2">
          <T en="smoothing" ja="平滑化" mix="side" />
          <input type="range" min={0} max={0.95} step={0.05} value={w} onChange={(e) => setW(+e.target.value)} className="w-28 accent-[var(--accent)]" />
          <span className="num w-8 text-xs text-ink">{w.toFixed(2)}</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {runs.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={!hidden[r.id]}
            onClick={() => setHidden((h) => ({ ...h, [r.id]: !h[r.id] }))}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${hidden[r.id] ? "border-line text-muted line-through" : "border-line text-ink-2 hover:border-accent"}`}
          >
            <svg aria-hidden width="16" height="4">
              <line x1="0" x2="16" y1="2" y2="2" stroke={r.color} strokeWidth="2.5" strokeDasharray={r.dash} />
            </svg>
            <T en={r.en} ja={r.ja} mix="en" />
          </button>
        ))}
      </div>
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        {panels.map((p, i) => (
          <Chart key={p.metric.key} idx={i} metric={p.metric} lines={p.lines} xKey={xKey} hoverX={hoverX} setHoverX={setHoverX} active={active === i} setActive={setActive} />
        ))}
      </div>
      <p className="text-xs text-muted">
        <T
          en="Values are the trainer's own logs (every 10 steps for SFT, every 5 for DPO; validation every 150 / 50 steps), identical to what the W&B project received. Train curves: faint = raw, solid = smoothed; validation points are unsmoothed. Click a run to hide it."
          ja="値はトレーナー自身のログ（SFT は10ステップごと、DPO は5ステップごと。検証は150 / 50ステップごと）で、W&B プロジェクトに送られたものと同一です。学習曲線は薄線が生値、実線が平滑化後。検証点は平滑化していません。実行名をクリックすると非表示にできます。"
        />
      </p>
    </div>
  );
}
