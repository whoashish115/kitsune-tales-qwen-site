"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { D } from "@/lib/kitsune";
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
  return null;
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
