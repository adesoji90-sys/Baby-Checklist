export type Priority = "essential" | "important" | "after_delivery" | "later";
export type Status = "not" | "partial" | "full";

export interface Category { id: string; name: string; sort_order: number; budget: number | null }
export interface Item {
  id: string; category_id: string; name: string;
  quantity_required: number; quantity_purchased: number;
  est_unit_price: number; actual_unit_price: number | null;
  brand: string | null; vendor: string | null; purchase_date: string | null;
  priority: Priority; notes: string | null; image_path: string | null;
  created_at: string; updated_at: string;
}
export interface Settings { baby_nickname: string; due_date: string | null; overall_budget: number; currency: string }
export interface Member { email: string; display_name: string; role: "daddy" | "mummy" }
