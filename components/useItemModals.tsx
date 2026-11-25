"use client";
import { useState } from "react";
import type { Item } from "@/lib/types";
import { DeleteItemModal, EditPurchaseModal, ItemFormModal, PurchaseModal } from "./ItemModals";

type M = { k: "add"; category?: string } | { k: "edit"; item: Item } | { k: "buy"; item: Item } | { k: "del"; item: Item } | { k: "pay"; item: Item } | null;
export function useItemModals() {
  const [m, setM] = useState<M>(null);
  const close = () => setM(null);
  const node = !m ? null : m.k === "add" ? <ItemFormModal defaultCategory={m.category} onClose={close} />
    : m.k === "edit" ? <ItemFormModal item={m.item} onClose={close} />
    : m.k === "buy" ? <PurchaseModal item={m.item} onClose={close} /> : m.k === "pay" ? <EditPurchaseModal item={m.item} onClose={close} /> : <DeleteItemModal item={m.item} onClose={close} />;
  return { node, add: (category?: string) => setM({ k: "add", category }), edit: (item: Item) => setM({ k: "edit", item }), buy: (item: Item) => setM({ k: "buy", item }), del: (item: Item) => setM({ k: "del", item }), pay: (item: Item) => setM({ k: "pay", item }) };
}
