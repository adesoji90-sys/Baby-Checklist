import { describe, it, expect } from "vitest";
import { itemStatus, outstandingQty, estimatedCost, actualCost, totals, categoryStats, budgetLevel, daysUntil } from "./calc";
import type { Item, Category } from "./types";

const mk = (o: Partial<Item>): Item => ({
  id: "x", category_id: "c1", name: "n", quantity_required: 1, quantity_purchased: 0,
  est_unit_price: 0, actual_unit_price: null, brand: null, vendor: null, purchase_date: null,
  priority: "important", notes: null, image_path: null, created_at: "", updated_at: "", ...o,
});

describe("item maths", () => {
  it("status and outstanding quantity for partial purchases", () => {
    const i = mk({ quantity_required: 6, quantity_purchased: 2 });
    expect(itemStatus(i)).toBe("partial");
    expect(outstandingQty(i)).toBe(4);
    expect(itemStatus(mk({ quantity_required: 6, quantity_purchased: 0 }))).toBe("not");
    expect(itemStatus(mk({ quantity_required: 6, quantity_purchased: 6 }))).toBe("full");
    expect(outstandingQty(mk({ quantity_required: 2, quantity_purchased: 5 }))).toBe(0);
  });
  it("estimated = required x est; actual = purchased x actual", () => {
    const i = mk({ quantity_required: 6, est_unit_price: 1500, quantity_purchased: 2, actual_unit_price: 1800 });
    expect(estimatedCost(i)).toBe(9000);
    expect(actualCost(i)).toBe(3600);
    expect(actualCost(mk({ quantity_purchased: 3, actual_unit_price: null }))).toBe(0);
  });
});

describe("dashboard totals", () => {
  const items = [
    mk({ id: "a", quantity_required: 2, est_unit_price: 1000, quantity_purchased: 2, actual_unit_price: 1200 }),
    mk({ id: "b", quantity_required: 4, est_unit_price: 500, quantity_purchased: 1, actual_unit_price: 600 }),
    mk({ id: "c", quantity_required: 1, est_unit_price: 3000 }),
  ];
  it("sums correctly", () => {
    const t = totals(items, 10000);
    expect(t.total).toBe(3); expect(t.purchased).toBe(1); expect(t.partial).toBe(1); expect(t.outstanding).toBe(2);
    expect(t.completion).toBe(33);
    expect(t.estimated).toBe(2000 + 2000 + 3000);
    expect(t.spent).toBe(2400 + 600);
    expect(t.remaining).toBe(10000 - 3000);
    expect(t.outstandingEst).toBe(0 + 1500 + 3000);
  });
  it("category stats use sum of estimates unless a cap is set", () => {
    const cats: Category[] = [{ id: "c1", name: "A", sort_order: 0, budget: null }, { id: "c2", name: "B", sort_order: 1, budget: 5000 }];
    const s = categoryStats(cats, [...items, mk({ id: "d", category_id: "c2", quantity_required: 1, est_unit_price: 100 })]);
    expect(s[0].budget).toBe(7000); expect(s[0].remaining).toBe(7000 - 3000);
    expect(s[1].budget).toBe(5000); expect(s[1].estimated).toBe(100);
  });
});

describe("budget warnings & countdown", () => {
  it("levels", () => {
    expect(budgetLevel(500, 1000)).toBe("ok");
    expect(budgetLevel(900, 1000)).toBe("near");
    expect(budgetLevel(1000, 1000)).toBe("near");
    expect(budgetLevel(1001, 1000)).toBe("over");
  });
  it("days until", () => {
    const now = new Date(2026, 10, 21, 22, 0);
    expect(daysUntil("2026-11-30", now)).toBe(9);
    expect(daysUntil("2026-11-21", now)).toBe(0);
    expect(daysUntil("2026-11-20", now)).toBe(-1);
    expect(daysUntil(null, now)).toBeNull();
  });
});
