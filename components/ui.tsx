"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import type { Priority, Status } from "@/lib/types";
import { STATUS_LABEL, priorityShort, type BudgetLevel } from "@/lib/calc";

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl sm:text-4xl">{title}</h1>{sub && <p className="mt-1 text-sm text-ink-soft">{sub}</p>}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/45 animate-fade sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg animate-sheet overflow-y-auto rounded-t-3xl bg-cream-50 p-5 shadow-soft sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded-full p-1 hover:bg-sand-100"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

const PRI_STYLE: Record<Priority, string> = {
  essential: "bg-clay-100 text-clay-600", important: "bg-sand-200 text-ink-soft",
  after_delivery: "bg-sage-100 text-sage-700", later: "bg-cream-200 text-ink-mute",
};
export const PriorityChip = ({ p }: { p: Priority }) => <span className={`chip ${PRI_STYLE[p]}`}>{priorityShort(p)}</span>;
const ST_STYLE: Record<Status, string> = { not: "bg-sand-100 text-ink-soft", partial: "bg-clay-100 text-clay-600", full: "bg-sage-100 text-sage-700" };
export const StatusChip = ({ s }: { s: Status }) => <span className={`chip ${ST_STYLE[s]}`}>{STATUS_LABEL[s]}</span>;

export function Progress({ value, level = "ok" }: { value: number; level?: BudgetLevel }) {
  const color = level === "over" ? "bg-clay-500" : level === "near" ? "bg-clay-400" : "bg-sage-500";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-sand-100" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "warn" | "good" }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-ink-mute">{label}</p>
      <p className={`mt-1 font-serif text-2xl sm:text-[28px] ${tone === "warn" ? "text-clay-600" : tone === "good" ? "text-sage-700" : ""}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-sand-300 p-8 text-center text-sm text-ink-soft">{children}</div>;
}

export function BudgetBanner({ level, spent, budget, projected, fmt }: { level: BudgetLevel; spent: number; budget: number; projected: number; fmt: (n: number) => string }) {
  if (level === "over") return <div role="alert" className="no-print mb-5 rounded-2xl bg-clay-100 p-4 text-sm text-clay-600"><b>Over budget.</b> You have spent {fmt(spent)} against a budget of {fmt(budget)} ({fmt(spent - budget)} over).</div>;
  if (level === "near") return <div role="alert" className="no-print mb-5 rounded-2xl bg-clay-100 p-4 text-sm text-clay-600"><b>Nearing your budget.</b> {fmt(spent)} spent of {fmt(budget)}. Only {fmt(budget - spent)} left.</div>;
  if (projected > budget) return <div className="no-print mb-5 rounded-2xl bg-sand-100 p-4 text-sm text-ink-soft"><b>Heads up:</b> spending so far plus the remaining estimates comes to {fmt(projected)}, which is above your {fmt(budget)} budget.</div>;
  return null;
}
