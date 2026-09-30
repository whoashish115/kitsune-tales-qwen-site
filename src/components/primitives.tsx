import type { ReactNode } from "react";
import { T } from "./i18n";
export function Section({ id, n, title, lede, children }: { id: string; n?: string; title: ReactNode; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line py-16 sm:py-20">
      <div className="flex flex-col gap-3">
        <h2 className="flex flex-wrap items-baseline gap-x-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
          {n && <span className="num text-xl font-normal text-muted sm:text-2xl">{n}</span>}
          <span>{title}</span>
        </h2>
        {lede && <div className="prose-k max-w-[70ch] text-ink-2">{lede}</div>}
      </div>
      <div className="mt-10 flex flex-col gap-12">{children}</div>
    </section>
  );
}
export function Sub({ id, n, title, children }: { id?: string; n: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div id={id} className="flex scroll-mt-20 flex-col gap-2 border-t border-line pt-10">
      <h3 className="flex flex-wrap items-baseline gap-x-2 font-display text-2xl font-bold">
        <span className="num text-base font-normal text-muted">{n}</span>
        <span>{title}</span>
      </h3>
      {children && <div className="prose-k max-w-[70ch] text-ink-2">{children}</div>}
    </div>
  );
}
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return null;
}
export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" | "accent" }) {
  return null;
}
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}
