"use client";
import { useMemo } from "react";
import { useData } from "@/components/DataProvider";
import { BudgetBanner, PageHeader, Progress, Stat } from "@/components/ui";
import { CompareBars, CompletionDonut, SpendDonut } from "@/components/Charts";
import { actualCost, budgetLevel, categoryStats, totals } from "@/lib/calc";
import { fmtDate, money } from "@/lib/format";

export default function BudgetPage() {
  const { items, categories, settings: s } = useData();
  const t = useMemo(() => totals(items, s.overall_budget), [items, s.overall_budget]);
  const stats = useMemo(() => categoryStats(categories, items), [categories, items]);
  const fmt = (n: number) => money(n, s.currency);
  const log = items.filter((i) => i.quantity_purchased > 0).sort((a, b) => (b.purchase_date ?? "").localeCompare(a.purchase_date ?? ""));
  const pct = s.overall_budget > 0 ? (t.spent / s.overall_budget) * 100 : 0;
  return (
    <>
      <PageHeader title="Budget and Expenses" sub="One shared family budget for everything." />
      <BudgetBanner level={t.level} spent={t.spent} budget={s.overall_budget} projected={t.projected} fmt={fmt} />
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Overall budget" value={fmt(s.overall_budget)} />
        <Stat label="Spent" value={fmt(t.spent)} sub={`${Math.round(pct)}% of budget`} />
        <Stat label="Remaining" value={fmt(t.remaining)} tone={t.remaining < 0 ? "warn" : "good"} />
        <Stat label="Still to buy (est.)" value={fmt(t.outstandingEst)} sub={`Projected total ${fmt(t.projected)}`} tone={t.projectedLevel === "over" ? "warn" : undefined} />
      </section>
      <section className="card mb-6 p-5"><Progress value={pct} level={t.level} /></section>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-2 text-xl">Spending by category</h2><SpendDonut stats={stats} currency={s.currency} /></section>
        <section className="card p-5"><h2 className="mb-2 text-xl">Shopping completion</h2><CompletionDonut percent={t.completion} /></section>
        <section className="card p-5"><h2 className="mb-2 text-xl">Estimated vs actual</h2><CompareBars stats={stats} currency={s.currency} mode="est-actual" /></section>
        <section className="card p-5"><h2 className="mb-2 text-xl">Outstanding purchase costs</h2><CompareBars stats={stats} currency={s.currency} mode="outstanding" /></section>
      </div>
      <section className="card mb-6 overflow-x-auto p-5">
        <h2 className="mb-3 text-xl">By category</h2>
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs uppercase text-ink-mute"><tr><th className="pb-2">Category</th><th className="pb-2 text-right">Budget / est.</th><th className="pb-2 text-right">Spent</th><th className="pb-2 text-right">Remaining</th></tr></thead>
          <tbody className="divide-y divide-sand-100">{stats.map((c) => (
            <tr key={c.category.id}><td className="py-2">{c.category.name}</td><td className="py-2 text-right">{fmt(c.budget)}</td><td className="py-2 text-right">{fmt(c.actual)}</td>
              <td className={`py-2 text-right ${budgetLevel(c.actual, c.budget) === "over" ? "text-clay-600" : ""}`}>{fmt(c.remaining)}</td></tr>))}
            <tr className="font-semibold"><td className="py-2">Total</td><td className="py-2 text-right">{fmt(stats.reduce((a, c) => a + c.budget, 0))}</td><td className="py-2 text-right">{fmt(t.spent)}</td><td className="py-2 text-right">{fmt(stats.reduce((a, c) => a + c.remaining, 0))}</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-ink-mute">Budget / est. is the category budget if you set one, otherwise the sum of estimates. The overall budget above is set in Settings.</p>
      </section>
      <section className="card overflow-x-auto p-5">
        <h2 className="mb-3 text-xl">Purchase records</h2>
        {!log.length ? <p className="text-sm text-ink-soft">No purchases recorded yet.</p> : (
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase text-ink-mute"><tr><th className="pb-2">Date</th><th className="pb-2">Item</th><th className="pb-2">Shop</th><th className="pb-2 text-right">Qty</th><th className="pb-2 text-right">Paid</th></tr></thead>
            <tbody className="divide-y divide-sand-100">{log.map((i) => (
              <tr key={i.id}><td className="py-2">{fmtDate(i.purchase_date)}</td><td className="py-2">{i.name}{i.notes && <span className="block text-xs text-ink-mute">{i.notes}</span>}</td><td className="py-2">{i.vendor ?? "—"}</td><td className="py-2 text-right">{i.quantity_purchased}</td><td className="py-2 text-right">{fmt(actualCost(i))}</td></tr>))}</tbody>
          </table>)}
      </section>
    </>
  );
}
