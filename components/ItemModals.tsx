"use client";
import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useData } from "./DataProvider";
import { Modal } from "./ui";
import ItemImage from "./ItemImage";
import { PRIORITIES, num, outstandingQty } from "@/lib/calc";
import { todayISO } from "@/lib/format";
import type { Item, Priority } from "@/lib/types";

const clean = (s: string) => (s.trim() === "" ? null : s.trim());

/** Add / edit an item (all fields, incl. image upload and purchase details). */
export function ItemFormModal({ item, defaultCategory, onClose }: { item?: Item; defaultCategory?: string; onClose: () => void }) {
  const { categories, reload, settings } = useData();
  const sb = createClient();
  const [f, setF] = useState({
    name: item?.name ?? "", category_id: item?.category_id ?? defaultCategory ?? categories[0]?.id ?? "",
    quantity_required: String(item?.quantity_required ?? 1), quantity_purchased: String(item?.quantity_purchased ?? 0),
    est_unit_price: item?.est_unit_price ? String(item.est_unit_price) : "", actual_unit_price: item?.actual_unit_price == null ? "" : String(item.actual_unit_price),
    brand: item?.brand ?? "", vendor: item?.vendor ?? "", purchase_date: item?.purchase_date ?? "",
    priority: (item?.priority ?? "important") as Priority, notes: item?.notes ?? "",
  });
  const [imagePath, setImagePath] = useState<string | null>(item?.image_path ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [removeImg, setRemoveImg] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const req = Math.floor(num(f.quantity_required)); const got = Math.floor(num(f.quantity_purchased));
    if (!f.category_id) return setErr("Please choose a category.");
    if (req < 0 || got < 0 || num(f.est_unit_price) < 0 || num(f.actual_unit_price) < 0) return setErr("Quantities and prices cannot be negative.");
    setBusy(true);
    try {
      let path = removeImg ? null : imagePath;
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        path = `items/${crypto.randomUUID()}.${ext}`;
        const up = await sb.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
        if (up.error) throw new Error("Image upload failed: " + up.error.message);
      }
      const row = {
        name: f.name.trim(), category_id: f.category_id, quantity_required: req, quantity_purchased: got,
        est_unit_price: num(f.est_unit_price), actual_unit_price: f.actual_unit_price === "" ? null : num(f.actual_unit_price),
        brand: clean(f.brand), vendor: clean(f.vendor), priority: f.priority, notes: clean(f.notes), image_path: path,
        purchase_date: got > 0 ? (f.purchase_date || todayISO()) : null,
      };
      const res = item ? await sb.from("items").update(row).eq("id", item.id) : await sb.from("items").insert(row);
      if (res.error) throw new Error(res.error.message);
      if (item?.image_path && item.image_path !== path) await sb.storage.from("product-images").remove([item.image_path]);
      await reload(); onClose();
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }

  const pending = outstandingQty({ quantity_required: Math.floor(num(f.quantity_required)), quantity_purchased: Math.floor(num(f.quantity_purchased)) });
  return (
    <Modal title={item ? "Edit item" : "Add item"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div><label>Item name</label><input required value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label>Category</label><select value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label>Priority</label><select value={f.priority} onChange={(e) => set("priority", e.target.value)}>{PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label>Qty required</label><input type="number" inputMode="numeric" min={0} step={1} value={f.quantity_required} onChange={(e) => set("quantity_required", e.target.value)} /></div>
          <div><label>Est. price each (optional)</label><input type="number" inputMode="decimal" min={0} step="any" value={f.est_unit_price} onChange={(e) => set("est_unit_price", e.target.value)} /></div>
          <div><label>Qty purchased</label><input type="number" inputMode="numeric" min={0} step={1} value={f.quantity_purchased} onChange={(e) => set("quantity_purchased", e.target.value)} /></div>
          <div><label>Actual unit price</label><input type="number" inputMode="decimal" min={0} step="any" value={f.actual_unit_price} onChange={(e) => set("actual_unit_price", e.target.value)} /></div>
        </div>
        {num(f.quantity_purchased) > 0 && <p className="text-xs text-ink-soft">Still to buy: <b>{pending}</b></p>}
        <div className="grid grid-cols-2 gap-3">
          <div><label>Preferred brand</label><input value={f.brand} onChange={(e) => set("brand", e.target.value)} /></div>
          <div><label>Shop / vendor</label><input value={f.vendor} onChange={(e) => set("vendor", e.target.value)} /></div>
        </div>
        {num(f.quantity_purchased) > 0 && <div><label>Purchase date</label><input type="date" value={f.purchase_date || todayISO()} onChange={(e) => set("purchase_date", e.target.value)} /></div>}
        <div><label>Notes</label><textarea rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        <div>
          <label>Product picture</label>
          <div className="flex items-center gap-3">
            {file ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
              : <ItemImage path={removeImg ? null : imagePath} alt="" className="h-16 w-16 rounded-xl" />}
            <label className="btn-ghost m-0 cursor-pointer normal-case tracking-normal"><Upload size={16} />Choose image
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setRemoveImg(false); }} /></label>
            {(imagePath || file) && !removeImg && <button type="button" className="text-xs text-clay-600 underline" onClick={() => { setFile(null); setRemoveImg(true); }}>Remove</button>}
          </div>
        </div>
        {err && <p role="alert" className="rounded-xl bg-clay-100 px-3 py-2 text-sm text-clay-600">{err}</p>}
        <div className="flex gap-2 pt-1"><button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button><button className="btn-primary flex-1" disabled={busy}>{busy ? "Saving…" : "Save"}</button></div>
      </form>
    </Modal>
  );
}

/** Record a purchase (full or partial). Quantity bought now is added to anything already purchased. */
export function PurchaseModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const { reload, settings } = useData();
  const left = outstandingQty(item);
  const [qty, setQty] = useState(String(left || 1));
  const [price, setPrice] = useState(item.actual_unit_price != null ? String(item.actual_unit_price) : item.est_unit_price ? String(item.est_unit_price) : "");
  const [date, setDate] = useState(item.purchase_date ?? todayISO());
  const [vendor, setVendor] = useState(item.vendor ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const add = Math.floor(num(qty));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (add < 1) return setErr("Enter how many you bought (at least 1).");
    if (price.trim() === "") return setErr("Enter the price you paid for each one.");
    if (num(price) < 0) return setErr("Price cannot be negative.");
    setBusy(true);
    const { error } = await createClient().from("items").update({
      quantity_purchased: item.quantity_purchased + add, actual_unit_price: num(price),
      purchase_date: date, vendor: clean(vendor), notes: clean(notes),
    }).eq("id", item.id);
    if (error) { setErr(error.message); setBusy(false); return; }
    await reload(); onClose();
  }
  const after = item.quantity_purchased + add;
  return (
    <Modal title="Record purchase" onClose={onClose}>
      <p className="mb-4 text-sm text-ink-soft"><b className="text-ink">{item.name}</b> — {item.quantity_purchased} of {item.quantity_required} bought, {left} to go.</p>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label>Quantity bought now</label><input type="number" inputMode="numeric" min={1} step={1} value={qty} onChange={(e) => setQty(e.target.value)} autoFocus /></div>
          <div><label>Price paid each ({settings.currency})</label><input type="number" inputMode="decimal" min={0} step="any" placeholder="Enter price paid" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label>Purchase date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label>Shop / vendor</label><input value={vendor} onChange={(e) => setVendor(e.target.value)} /></div>
        </div>
        <div><label>Notes</label><input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <p className="text-xs text-ink-soft">After saving: {after} of {item.quantity_required} bought{after >= item.quantity_required ? " — fully purchased." : ` — ${item.quantity_required - after} still to buy.`}</p>
        {err && <p role="alert" className="rounded-xl bg-clay-100 px-3 py-2 text-sm text-clay-600">{err}</p>}
        <div className="flex gap-2"><button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button><button className="btn-primary flex-1" disabled={busy}>{busy ? "Saving…" : "Save purchase"}</button></div>
      </form>
    </Modal>
  );
}

export function DeleteItemModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const { reload } = useData();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function del() {
    setBusy(true); const sb = createClient();
    const { error } = await sb.from("items").delete().eq("id", item.id);
    if (error) { setErr(error.message); setBusy(false); return; }
    if (item.image_path) await sb.storage.from("product-images").remove([item.image_path]);
    await reload(); onClose();
  }
  return (
    <Modal title="Delete item?" onClose={onClose}>
      <p className="text-sm text-ink-soft">“{item.name}” and its purchase details will be removed for both of you. This can’t be undone.</p>
      {err && <p role="alert" className="mt-3 text-sm text-clay-600">{err}</p>}
      <div className="mt-5 flex gap-2"><button className="btn-ghost flex-1" onClick={onClose}>Keep it</button><button className="btn-danger flex-1" onClick={del} disabled={busy}><Trash2 size={16} />{busy ? "Deleting…" : "Delete"}</button></div>
    </Modal>
  );
}

/** Clear purchase info (un-tick). */
export async function unpurchase(item: Item) {
  return createClient().from("items").update({ quantity_purchased: 0, purchase_date: null }).eq("id", item.id);
}
