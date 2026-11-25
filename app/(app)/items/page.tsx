"use client";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useData } from "@/components/DataProvider";
import { Empty, PageHeader } from "@/components/ui";
import ItemCard from "@/components/ItemCard";
import { useItemModals } from "@/components/useItemModals";
import { PRIORITIES, estimatedCost, itemStatus, priorityRank } from "@/lib/calc";

export default function ItemsPage() {
  const { items, categories, loading } = useData();
  const m = useItemModals();
  const [q, setQ] = useState(""); const [cat, setCat] = useState(() => (typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("cat") ?? "")); const [status, setStatus] = useState(""); const [pri, setPri] = useState(""); const [sort, setSort] = useState("name");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
    let r = items.filter((i) =>
      (!cat || i.category_id === cat) && (!status || itemStatus(i) === status) && (!pri || i.priority === pri) &&
      (!needle || [i.name, i.brand, i.vendor, i.notes, catName(i.category_id)].some((v) => v?.toLowerCase().includes(needle))));
    const cmp: Record<string, (a: typeof r[0], b: typeof r[0]) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      price_high: (a, b) => estimatedCost(b) - estimatedCost(a), price_low: (a, b) => estimatedCost(a) - estimatedCost(b),
      priority: (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.name.localeCompare(b.name),
      date: (a, b) => (b.purchase_date ?? "").localeCompare(a.purchase_date ?? ""),
    };
    return r.sort(cmp[sort]);
  }, [items, categories, q, cat, status, pri, sort]);

  return (
    <>
      <PageHeader title="All Shopping Items" sub={`${list.length} of ${items.length} items`}><button className="btn-primary" onClick={() => m.add(cat || undefined)}><Plus size={18} />Add item</button></PageHeader>
      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1"><Search size={16} className="absolute left-3 top-3.5 text-ink-mute" /><input aria-label="Search items" placeholder="Search…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Any status</option><option value="not">Not purchased</option><option value="partial">Partially purchased</option><option value="full">Fully purchased</option></select>
        <select aria-label="Priority" value={pri} onChange={(e) => setPri(e.target.value)}><option value="">Any priority</option>{PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="name">Sort: Name</option><option value="priority">Sort: Priority</option><option value="price_high">Sort: Price (high → low)</option><option value="price_low">Sort: Price (low → high)</option><option value="date">Sort: Purchase date</option></select>
      </div>
      {loading ? <p className="text-ink-soft">Loading…</p> : !list.length ? <Empty>No items match. Try clearing a filter, or add a new item.</Empty> :
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{list.map((i) => <ItemCard key={i.id} item={i} onBuy={() => m.buy(i)} onEdit={() => m.edit(i)} onDelete={() => m.del(i)} onEditExpense={() => m.pay(i)} />)}</div>}
      {m.node}
    </>
  );
}
