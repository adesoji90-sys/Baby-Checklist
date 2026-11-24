import type { Category, Item, Priority, Status } from "./types";

export const PRIORITIES: { value: Priority; label: string; short: string; rank: number }[] = [
  { value: "essential", label: "Essential before delivery", short: "Essential", rank: 0 },
  { value: "important", label: "Important before delivery", short: "Important", rank: 1 },
  { value: "after_delivery", label: "Can purchase after delivery", short: "After delivery", rank: 2 },
  { value: "later", label: "Can purchase later as baby grows", short: "Later", rank: 3 },
];
export const priorityRank = (p: Priority) => PRIORITIES.find((x) => x.value === p)?.rank ?? 9;
export const priorityLabel = (p: Priority) => PRIORITIES.find((x) => x.value === p)?.label ?? p;
export const priorityShort = (p: Priority) => PRIORITIES.find((x) => x.value === p)?.short ?? p;

export const num = (v: unknown): number => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

export function itemStatus(i: Pick<Item, "quantity_required" | "quantity_purchased">): Status {
  if (i.quantity_purchased <= 0) return "not";
  if (i.quantity_purchased >= i.quantity_required) return "full";
  return "partial";
}
export const outstandingQty = (i: Pick<Item, "quantity_required" | "quantity_purchased">) =>
  Math.max(0, i.quantity_required - i.quantity_purchased);
/** Quantity required x estimated unit price */
export const estimatedCost = (i: Item) => num(i.quantity_required) * num(i.est_unit_price);
/** Quantity purchased x actual unit price */
export const actualCost = (i: Item) => num(i.quantity_purchased) * num(i.actual_unit_price);
/** Outstanding quantity x estimated unit price */
export const outstandingCost = (i: Item) => outstandingQty(i) * num(i.est_unit_price);

export const STATUS_LABEL: Record<Status, string> = { not: "Not purchased", partial: "Partially purchased", full: "Fully purchased" };

export type BudgetLevel = "ok" | "near" | "over";
export function budgetLevel(spent: number, budget: number): BudgetLevel {
  if (budget <= 0) return spent > 0 ? "over" : "ok";
  if (spent > budget) return "over";
  if (spent / budget >= 0.85) return "near";
  return "ok";
}

export interface CategoryStat {
  category: Category; count: number; purchased: number;
  estimated: number; actual: number; outstanding: number;
  budget: number; remaining: number;
}
export function categoryStats(categories: Category[], items: Item[]): CategoryStat[] {
  return categories.map((category) => {
    const its = items.filter((i) => i.category_id === category.id);
    const estimated = its.reduce((s, i) => s + estimatedCost(i), 0);
    const actual = its.reduce((s, i) => s + actualCost(i), 0);
    const outstanding = its.reduce((s, i) => s + outstandingCost(i), 0);
    const budget = category.budget != null ? num(category.budget) : estimated;
    return {
      category, count: its.length, purchased: its.filter((i) => itemStatus(i) === "full").length,
      estimated, actual, outstanding, budget, remaining: budget - actual,
    };
  });
}

export function totals(items: Item[], overallBudget: number) {
  const total = items.length;
  const purchased = items.filter((i) => itemStatus(i) === "full").length;
  const partial = items.filter((i) => itemStatus(i) === "partial").length;
  const outstanding = total - purchased;
  const estimated = items.reduce((s, i) => s + estimatedCost(i), 0);
  const spent = items.reduce((s, i) => s + actualCost(i), 0);
  const outstandingEst = items.reduce((s, i) => s + outstandingCost(i), 0);
  return {
    total, purchased, partial, outstanding,
    completion: total ? Math.round((purchased / total) * 100) : 0,
    estimated, spent, outstandingEst,
    remaining: overallBudget - spent,
    projected: spent + outstandingEst,
    level: budgetLevel(spent, overallBudget),
    projectedLevel: budgetLevel(spent + outstandingEst, overallBudget),
  };
}

/** Whole days from today (local) to the due date; negative when passed. */
export function daysUntil(due: string | null, now = new Date()): number | null {
  if (!due) return null;
  const [y, m, d] = due.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}
