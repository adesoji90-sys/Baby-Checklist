"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useData } from "@/components/DataProvider";
import { Empty, Modal, PageHeader, Progress } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { budgetLevel, categoryStats, num, type CategoryStat } from "@/lib/calc";
import { money } from "@/lib/format";

export default function CategoriesPage() {
  const { categories, items, settings: s, reload } = useData();
  const stats = useMemo(() => categoryStats(categories, items), [categories, items]);
  const [edit, setEdit] = useState<CategoryStat | "new" | null>(null);
  const [del, setDel] = useState<CategoryStat | null>(null);
  const fmt = (n: number) => money(n, s.currency);
  return (
    <>
      <PageHeader title="Categories" sub="Group your list and set an optional budget for each group."><button className="btn-primary" onClick={() => setEdit("new")}><Plus size={18} />New category</button></PageHeader>
      {!stats.length ? <Empty>No categories yet.</Empty> : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {stats.map((c) => (
            <div key={c.category.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="font-sans text-base font-semibold"><Link href={`/items?cat=${c.category.id}`} className="hover:underline">{c.category.name}</Link></h3><p className="text-xs text-ink-soft">{c.purchased} of {c.count} items complete</p></div>
                <div className="flex gap-1"><button aria-label={`Edit ${c.category.name}`} className="btn-ghost p-2" onClick={() => setEdit(c)}><Pencil size={15} /></button><button aria-label={`Delete ${c.category.name}`} className="btn-ghost p-2 text-clay-600" onClick={() => setDel(c)}><Trash2 size={15} /></button></div>
              </div>
              <div className="my-3"><Progress value={c.count ? (c.purchased / c.count) * 100 : 0} /></div>
              <dl className="grid grid-cols-3 gap-2 text-sm">
                <div><dt className="text-xs text-ink-mute">{c.category.budget != null ? "Budget" : "Estimated"}</dt><dd>{fmt(c.budget)}</dd></div>
                <div><dt className="text-xs text-ink-mute">Spent</dt><dd>{fmt(c.actual)}</dd></div>
                <div><dt className="text-xs text-ink-mute">Remaining</dt><dd className={budgetLevel(c.actual, c.budget) === "over" ? "text-clay-600" : ""}>{fmt(c.remaining)}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      )}
      {edit && <CategoryModal cat={edit === "new" ? undefined : edit} count={categories.length} onClose={() => setEdit(null)} onSaved={reload} />}
      {del && <DeleteCategory stat={del} onClose={() => setDel(null)} onDone={reload} />}
    </>
  );
}

function CategoryModal({ cat, count, onClose, onSaved }: { cat?: CategoryStat; count: number; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(cat?.category.name ?? "");
  const [budget, setBudget] = useState(cat?.category.budget != null ? String(cat.category.budget) : "");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const row = { name: name.trim(), budget: budget === "" ? null : num(budget) };
    const sb = createClient();
    const r = cat ? await sb.from("categories").update(row).eq("id", cat.category.id) : await sb.from("categories").insert({ ...row, sort_order: count });
    if (r.error) { setErr(r.error.code === "23505" ? "A category with that name already exists." : r.error.message); setBusy(false); return; }
    await onSaved(); onClose();
  }
  return (
    <Modal title={cat ? "Edit category" : "New category"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div><label>Name</label><input required value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div><label>Category budget (optional)</label><input type="number" min={0} step="any" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Leave empty to use the sum of estimates" /></div>
        {err && <p role="alert" className="rounded-xl bg-clay-100 px-3 py-2 text-sm text-clay-600">{err}</p>}
        <div className="flex gap-2"><button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button><button className="btn-primary flex-1" disabled={busy}>Save</button></div>
      </form>
    </Modal>
  );
}

function DeleteCategory({ stat, onClose, onDone }: { stat: CategoryStat; onClose: () => void; onDone: () => Promise<void> }) {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const { error } = await createClient().from("categories").delete().eq("id", stat.category.id);
    if (error) { setErr(error.code === "23503" ? "This category still has items. Move or delete them first." : error.message); setBusy(false); return; }
    await onDone(); onClose();
  }
  return (
    <Modal title="Delete category?" onClose={onClose}>
      <p className="text-sm text-ink-soft">“{stat.category.name}” will be removed.{stat.count > 0 && ` It still contains ${stat.count} item${stat.count === 1 ? "" : "s"}, so you’ll need to move or delete those first.`}</p>
      {err && <p role="alert" className="mt-3 text-sm text-clay-600">{err}</p>}
      <div className="mt-5 flex gap-2"><button className="btn-ghost flex-1" onClick={onClose}>Cancel</button><button className="btn-danger flex-1" disabled={busy || stat.count > 0} onClick={go}>Delete</button></div>
    </Modal>
  );
}
