"use client";
import { useMemo, useState } from "react";
import { Flag, Plus } from "lucide-react";
import { useData } from "@/components/DataProvider";
import { Empty, PageHeader, Progress } from "@/components/ui";
import ItemCard from "@/components/ItemCard";
import { useItemModals } from "@/components/useItemModals";
import { PRIORITIES, itemStatus, outstandingCost } from "@/lib/calc";
import { money } from "@/lib/format";
import type { Priority } from "@/lib/types";

export default function PrioritiesPage() {
  const { items, settings: s } = useData();
  const m = useItemModals();
  const [tab, setTab] = useState<Priority>("essential");
  const [hideDone, setHideDone] = useState(false);
  const groups = useMemo(() => PRIORITIES.map((p) => {
    const its = items.filter((i) => i.priority === p.value);
    const done = its.filter((i) => itemStatus(i) === "full").length;
    return { ...p, its, done, left: its.length - done, cost: its.reduce((a, i) => a + outstandingCost(i), 0) };
  }), [items]);
  const cur = groups.find((g) => g.value === tab)!;
  const shown = cur.its.filter((i) => !hideDone || itemStatus(i) !== "full").sort((a, b) => Number(itemStatus(a) === "full") - Number(itemStatus(b) === "full") || a.name.localeCompare(b.name));
  const ess = groups[0];

  return (
    <>
      <PageHeader title="Shopping Priorities" sub="What must be ready before delivery, and what can wait."><button className="btn-primary" onClick={() => m.add()}><Plus size={18} />Add item</button></PageHeader>
      <section className="card mb-5 bg-gradient-to-br from-clay-100/70 to-cream-50 p-5">
        <div className="flex items-center gap-2"><Flag className="text-clay-500" size={20} /><h2 className="text-xl">Essential before delivery</h2></div>
        <p className="mt-1 text-sm text-ink-soft">{ess.left} of {ess.its.length} essentials still to buy · about {money(ess.cost, s.currency)} outstanding (estimate)</p>
        <div className="mt-3"><Progress value={ess.its.length ? (ess.done / ess.its.length) * 100 : 0} /></div>
      </section>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {groups.map((g) => (
          <button key={g.value} role="tab" aria-selected={tab === g.value} onClick={() => setTab(g.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${tab === g.value ? "bg-sage-600 text-onprimary" : "bg-sand-100 text-ink-soft hover:bg-sand-200"}`}>
            {g.short} <span className="opacity-75">({g.left}/{g.its.length})</span>
          </button>))}
      </div>
      <div className="mb-3 flex items-center justify-between"><p className="text-sm text-ink-soft">{cur.label}</p>
        <label className="m-0 flex cursor-pointer items-center gap-2 text-xs normal-case tracking-normal"><input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />Hide completed</label></div>
      {!shown.length ? <Empty>{cur.its.length ? "Everything here is bought. 🎉" : "No items in this priority yet."}</Empty> :
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{shown.map((i) => <ItemCard key={i.id} item={i} onBuy={() => m.buy(i)} onEdit={() => m.edit(i)} onDelete={() => m.del(i)} />)}</div>}
      {m.node}
    </>
  );
}
