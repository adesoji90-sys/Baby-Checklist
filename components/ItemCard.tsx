"use client";
import { Check, Pencil, ShoppingCart, Trash2 } from "lucide-react";
import { actualCost, estimatedCost, itemStatus, outstandingQty } from "@/lib/calc";
import { fmtDate, money } from "@/lib/format";
import type { Item } from "@/lib/types";
import ItemImage from "./ItemImage";
import { PriorityChip, StatusChip } from "./ui";
import { useData } from "./DataProvider";

export default function ItemCard({ item, onBuy, onEdit, onDelete }: { item: Item; onBuy: () => void; onEdit: () => void; onDelete: () => void }) {
  const { categories, settings: s } = useData();
  const st = itemStatus(item); const out = outstandingQty(item);
  const cat = categories.find((c) => c.id === item.category_id);
  return (
    <div className="card flex gap-3 p-3 transition hover:shadow-md sm:p-4">
      <ItemImage path={item.image_path} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5"><PriorityChip p={item.priority} /><StatusChip s={st} /></div>
        <h3 className="mt-1 truncate font-sans text-base font-semibold">{item.name}</h3>
        <p className="truncate text-xs text-ink-mute">{cat?.name}{item.brand ? ` · ${item.brand}` : ""}{item.vendor ? ` · ${item.vendor}` : ""}</p>
        <p className="mt-1 text-sm text-ink-soft">
          Bought <b className="text-ink">{item.quantity_purchased}</b>/{item.quantity_required}
          {st !== "full" && <> · <b className="text-clay-600">{out} to go</b></>}
        </p>
        <p className="text-xs text-ink-soft">Est. {money(estimatedCost(item), s.currency)}{item.quantity_purchased > 0 && <> · Spent {money(actualCost(item), s.currency)}{item.purchase_date ? ` on ${fmtDate(item.purchase_date)}` : ""}</>}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {st !== "full" ? <button onClick={onBuy} className="btn-soft px-3 py-1.5 text-xs"><ShoppingCart size={14} />Record purchase</button>
            : <span className="chip bg-sage-100 text-sage-700"><Check size={12} className="mr-1" />Done</span>}
          <button onClick={onEdit} className="btn-ghost px-3 py-1.5 text-xs" aria-label={`Edit ${item.name}`}><Pencil size={14} />Edit</button>
          <button onClick={onDelete} className="btn-ghost px-3 py-1.5 text-xs text-clay-600" aria-label={`Delete ${item.name}`}><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}
