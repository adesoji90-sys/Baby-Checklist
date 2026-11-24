"use client";
import { useMemo, useState } from "react";
import { Download, Printer, Search } from "lucide-react";
import { useData } from "@/components/DataProvider";
import { Empty, Modal, PageHeader, PriorityChip } from "@/components/ui";
import { PurchaseModal } from "@/components/ItemModals";
import { createClient } from "@/lib/supabase/client";
import { estimatedCost, itemStatus, outstandingCost, outstandingQty, priorityRank } from "@/lib/calc";
import { money } from "@/lib/format";
import type { Item } from "@/lib/types";

export default function ShoppingListPage() {
  const { items, categories, settings: s, reload, loading } = useData();
  const [onlyOut, setOnlyOut] = useState(true); const [q, setQ] = useState("");
  const [buying, setBuying] = useState<Item | null>(null);
  const [untick, setUntick] = useState<Item | null>(null);
  const fmt = (n: number) => money(n, s.currency);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return categories.map((c) => ({
      c, its: items.filter((i) => i.category_id === c.id && (!onlyOut || itemStatus(i) !== "full") && (!needle || i.name.toLowerCase().includes(needle) || (i.brand ?? "").toLowerCase().includes(needle)))
        .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.name.localeCompare(b.name)),
    })).filter((g) => g.its.length);
  }, [items, categories, onlyOut, q]);
  const shownItems = groups.flatMap((g) => g.its);
  const total = shownItems.reduce((a, i) => a + (onlyOut ? outstandingCost(i) : estimatedCost(i)), 0);

  async function exportPdf() {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const doc = new jsPDF(); const sym = s.currency === "NGN" ? "NGN " : s.currency + " ";
    // jsPDF's built-in fonts lack the ₦ glyph, so the PDF uses the "NGN" code instead.
    const pdfMoney = (n: number) => sym + Math.round(n).toLocaleString("en-NG");
    doc.setFontSize(18); doc.text(`Baby Shopping List - ${s.baby_nickname}`, 14, 16);
    doc.setFontSize(10); doc.setTextColor(110); doc.text(`${onlyOut ? "Outstanding items" : "All items"} - ${new Date().toLocaleDateString("en-GB")}`, 14, 22);
    let y = 28;
    for (const g of groups) {
      autoTable(doc, {
        startY: y, head: [[g.c.name, "Qty", "Est. each", "Est. total"]],
        body: g.its.map((i) => [`${itemStatus(i) === "full" ? "[x]" : "[ ]"} ${i.name}${i.brand ? ` (${i.brand})` : ""}`, String(onlyOut ? outstandingQty(i) : i.quantity_required), i.est_unit_price > 0 ? pdfMoney(i.est_unit_price) : "", (onlyOut ? outstandingCost(i) : estimatedCost(i)) > 0 ? pdfMoney(onlyOut ? outstandingCost(i) : estimatedCost(i)) : ""]),
        headStyles: { fillColor: [107, 129, 89] }, styles: { fontSize: 9 }, columnStyles: { 1: { halign: "right", cellWidth: 16 }, 2: { halign: "right", cellWidth: 30 }, 3: { halign: "right", cellWidth: 32 } },
        margin: { left: 14, right: 14 },
      });
      // @ts-expect-error lastAutoTable is added by the plugin
      y = doc.lastAutoTable.finalY + 6;
    }
    doc.setFontSize(11); doc.setTextColor(0);
    if (y > 280) { doc.addPage(); y = 20; }
    if (total > 0) doc.text(`Estimated total: ${pdfMoney(total)}`, 14, y + 2);
    doc.save(`baby-shopping-list-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  async function doUntick() {
    if (!untick) return;
    await createClient().from("items").update({ quantity_purchased: 0, purchase_date: null }).eq("id", untick.id);
    await reload(); setUntick(null);
  }

  return (
    <>
      <PageHeader title="Shopping List" sub="Take this to the shops. Tick items off as you buy them.">
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} />Print</button>
        <button className="btn-primary" onClick={exportPdf} disabled={!shownItems.length}><Download size={16} />PDF</button>
      </PageHeader>
      <div className="print-only mb-4"><h1 className="text-2xl">Baby Shopping List — {s.baby_nickname}</h1><p className="text-sm">{onlyOut ? "Outstanding items" : "All items"} · {new Date().toLocaleDateString("en-GB")}</p></div>
      <div className="no-print card mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-3.5 text-ink-mute" /><input aria-label="Search list" placeholder="Search list…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <label className="m-0 flex cursor-pointer items-center gap-2 text-sm normal-case tracking-normal"><input type="checkbox" checked={onlyOut} onChange={(e) => setOnlyOut(e.target.checked)} className="h-5 w-5" />Outstanding only</label>
      </div>
      {loading ? <p className="text-ink-soft">Loading…</p> : !groups.length ? <Empty>{onlyOut ? "Nothing left to buy — or nothing matches your search." : "No items match."}</Empty> : (
        <div className="space-y-5">
          {groups.map(({ c, its }) => (
            <section key={c.id} className="card print-group p-4">
              <h2 className="mb-2 text-lg">{c.name} <span className="text-sm text-ink-mute">({its.length})</span></h2>
              <ul className="divide-y divide-sand-100">
                {its.map((i) => {
                  const done = itemStatus(i) === "full";
                  return (
                    <li key={i.id} className="flex items-center gap-3 py-2.5">
                      <button aria-label={done ? `Mark ${i.name} not purchased` : `Record purchase of ${i.name}`} onClick={() => (done ? setUntick(i) : setBuying(i))}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition ${done ? "border-sage-500 bg-sage-500 text-onprimary" : "border-sand-300 bg-surface"}`}>{done && "✓"}</button>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[15px] ${done ? "text-ink-mute line-through" : ""}`}>{i.name}{i.brand && <span className="text-ink-mute"> · {i.brand}</span>}</p>
                        <p className="text-xs text-ink-soft">
                          {onlyOut || !done ? <>Need <b>{outstandingQty(i)}</b>{i.quantity_purchased > 0 && ` (have ${i.quantity_purchased}/${i.quantity_required})`}</> : <>Bought {i.quantity_purchased}</>} {i.est_unit_price > 0 && <> · {fmt(i.est_unit_price)} each</>}
                        </p>
                      </div>
                      <div className="text-right"><p className="text-sm font-medium">{(onlyOut ? outstandingCost(i) : estimatedCost(i)) > 0 ? fmt(onlyOut ? outstandingCost(i) : estimatedCost(i)) : ""}</p><span className="no-print"><PriorityChip p={i.priority} /></span></div>
                    </li>);
                })}
              </ul>
            </section>))}
          <div className="card flex items-center justify-between p-4"><span className="text-sm text-ink-soft">{total > 0 ? `Estimated total (${shownItems.length} items)` : `${shownItems.length} items to buy`}</span>{total > 0 && <span className="font-serif text-2xl">{fmt(total)}</span>}</div>
        </div>)}
      {buying && <PurchaseModal item={buying} onClose={() => setBuying(null)} />}
      {untick && (
        <Modal title="Undo purchase?" onClose={() => setUntick(null)}>
          <p className="text-sm text-ink-soft">This resets “{untick.name}” to not purchased and removes its recorded spending from the budget.</p>
          <div className="mt-5 flex gap-2"><button className="btn-ghost flex-1" onClick={() => setUntick(null)}>Cancel</button><button className="btn-primary flex-1" onClick={doUntick}>Undo purchase</button></div>
        </Modal>)}
    </>
  );
}
