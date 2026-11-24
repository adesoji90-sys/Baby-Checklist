"use client";
import Link from "next/link";
import { useMemo } from "react";
import { CalendarHeart, Flag } from "lucide-react";
import NatureArt from "@/components/NatureArt";
import { useData } from "@/components/DataProvider";
import { BudgetBanner, Empty, PriorityChip, Progress, Stat } from "@/components/ui";
import { SpendDonut } from "@/components/Charts";
import ItemImage from "@/components/ItemImage";
import { useItemModals } from "@/components/useItemModals";
import { actualCost, categoryStats, daysUntil, itemStatus, outstandingQty, totals } from "@/lib/calc";
import { fmtDate, money } from "@/lib/format";

export default function Dashboard() {
  const { loading, settings: s, items, categories, me } = useData();
  const m = useItemModals();
  const t = useMemo(() => totals(items, s.overall_budget), [items, s.overall_budget]);
  const stats = useMemo(() => categoryStats(categories, items), [categories, items]);
  const fmt = (n: number) => money(n, s.currency);
  const days = daysUntil(s.due_date);
  const recent = [...items].filter((i) => i.quantity_purchased > 0).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")).slice(0, 5);
  const essential = items.filter((i) => i.priority === "essential" && itemStatus(i) !== "full");
  const attention = items.filter((i) => itemStatus(i) === "partial" || (i.quantity_purchased > 0 && i.actual_unit_price == null));
  const spentPct = s.overall_budget > 0 ? (t.spent / s.overall_budget) * 100 : 0;

  if (loading) return <p className="text-ink-soft">Loading…</p>;
  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-100 via-cream-50 to-cream-200 p-6 pb-28 sm:p-8 sm:pb-8">
        <NatureArt className="pointer-events-none absolute bottom-0 right-0 h-auto w-[92%] max-w-[460px] sm:w-[55%]" />
        <p className="relative text-sm text-sage-700">Welcome back, {me?.display_name ?? "friend"}</p>
        <h1 className="relative mt-1 max-w-md text-3xl sm:text-5xl">Getting ready for {s.baby_nickname}</h1>
        <div className="relative mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-3"><CalendarHeart className="text-sage-600" />
            <div><p className="text-xs uppercase tracking-wide text-ink-mute">Estimated delivery</p><p className="font-medium">{s.due_date ? fmtDate(s.due_date) : "Not set"}</p></div></div>
          <div><p className="text-xs uppercase tracking-wide text-ink-mute">Countdown</p>
            <p className="font-serif text-3xl">{days == null ? <Link href="/settings" className="text-base text-sage-700 underline">Set due date</Link> : days > 0 ? <>{days} <span className="text-base text-ink-soft">day{days === 1 ? "" : "s"} to go{days >= 14 ? ` (${Math.floor(days / 7)} wks)` : ""}</span></> : days === 0 ? "Due today 💛" : <span className="text-base text-ink-soft">{Math.abs(days)} day{days === -1 ? "" : "s"} past due date</span>}</p></div>
        </div>
      </section>

      <BudgetBanner level={t.level} spent={t.spent} budget={s.overall_budget} projected={t.projected} fmt={fmt} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total items" value={String(t.total)} />
        <Stat label="Purchased" value={String(t.purchased)} sub={t.partial ? `${t.partial} partly bought` : undefined} tone="good" />
        <Stat label="Outstanding" value={String(t.outstanding)} />
        <Stat label="Complete" value={`${t.completion}%`} />
        <Stat label="Estimated total" value={fmt(t.estimated)} />
        <Stat label="Spent so far" value={fmt(t.spent)} />
        <Stat label="Budget" value={fmt(s.overall_budget)} />
        <Stat label="Remaining budget" value={fmt(t.remaining)} tone={t.remaining < 0 ? "warn" : "good"} />
      </section>

      <section className="card space-y-4 p-5">
        <div><div className="mb-1.5 flex justify-between text-sm"><span>Shopping progress</span><span className="text-ink-soft">{t.purchased} of {t.total} items</span></div><Progress value={t.completion} /></div>
        <div><div className="mb-1.5 flex justify-between text-sm"><span>Budget used</span><span className="text-ink-soft">{fmt(t.spent)} of {fmt(s.overall_budget)}</span></div><Progress value={spentPct} level={t.level} /></div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-2 text-xl">Spending by category</h2><SpendDonut stats={stats} currency={s.currency} /></section>
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl"><Flag size={18} className="text-clay-500" />Essentials still to buy</h2><Link href="/priorities" className="text-sm text-sage-700 underline">See all</Link></div>
          {!essential.length ? <Empty>All essential items are bought. 🎉</Empty> : (
            <ul className="divide-y divide-sand-100">{essential.slice(0, 7).map((i) => (
              <li key={i.id}><button onClick={() => m.buy(i)} className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-sand-100/60"><span className="truncate text-sm">{i.name}</span><span className="shrink-0 text-xs text-ink-soft">{outstandingQty(i)} needed</span></button></li>))}</ul>)}
          {essential.length > 7 && <p className="mt-2 text-xs text-ink-mute">+ {essential.length - 7} more essentials</p>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-xl">Recently purchased</h2>
          {!recent.length ? <Empty>Nothing bought yet. Record your first purchase from the Shopping List.</Empty> : (
            <ul className="space-y-3">{recent.map((i) => (
              <li key={i.id} className="flex items-center gap-3"><ItemImage path={i.image_path} alt="" className="h-11 w-11 rounded-lg" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{i.name}</p><p className="text-xs text-ink-soft">{i.quantity_purchased}/{i.quantity_required} · {fmtDate(i.purchase_date)}{i.vendor ? ` · ${i.vendor}` : ""}</p></div>
                <span className="text-sm">{fmt(actualCost(i))}</span></li>))}</ul>)}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-xl">Needs attention</h2>
          {!attention.length ? <Empty>Nothing needs attention right now.</Empty> : (
            <ul className="divide-y divide-sand-100">{attention.slice(0, 7).map((i) => (
              <li key={i.id}><button onClick={() => (i.actual_unit_price == null ? m.edit(i) : m.buy(i))} className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-sand-100/60">
                <span className="min-w-0"><span className="block truncate text-sm">{i.name}</span><span className="text-xs text-ink-soft">{i.actual_unit_price == null ? "Bought but no price recorded" : `${outstandingQty(i)} still to buy`}</span></span><PriorityChip p={i.priority} /></button></li>))}</ul>)}
        </section>
      </div>
      {m.node}
    </div>
  );
}
