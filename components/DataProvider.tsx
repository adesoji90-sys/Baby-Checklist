"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Item, Member, Settings } from "@/lib/types";
import { num } from "@/lib/calc";

interface Ctx {
  loading: boolean; error: string; settings: Settings; categories: Category[]; items: Item[];
  members: Member[]; me: Member | null; reload: () => Promise<void>;
}
const DEFAULT: Settings = { baby_nickname: "Baby", due_date: null, overall_budget: 0, currency: "NGN" };
const C = createContext<Ctx | null>(null);
export const useData = () => { const v = useContext(C); if (!v) throw new Error("DataProvider missing"); return v; };

export default function DataProvider({ children, email }: { children: React.ReactNode; email: string }) {
  const sb = useMemo(() => createClient(), []);
  const [state, setState] = useState({ loading: true, error: "", settings: DEFAULT, categories: [] as Category[], items: [] as Item[], members: [] as Member[] });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const reload = useCallback(async () => {
    const [s, c, i, m] = await Promise.all([
      sb.from("settings").select("*").eq("id", 1).maybeSingle(),
      sb.from("categories").select("*").order("sort_order").order("name"),
      sb.from("items").select("*").order("created_at"),
      sb.from("allowed_emails").select("*"),
    ]);
    const err = s.error || c.error || i.error || m.error;
    if (err) { setState((p) => ({ ...p, loading: false, error: err.message })); return; }
    const norm = (it: Item): Item => ({ ...it, est_unit_price: num(it.est_unit_price), actual_unit_price: it.actual_unit_price == null ? null : num(it.actual_unit_price) });
    setState({
      loading: false, error: "",
      settings: s.data ? { ...s.data, overall_budget: num(s.data.overall_budget) } : DEFAULT,
      categories: (c.data ?? []).map((x: Category) => ({ ...x, budget: x.budget == null ? null : num(x.budget) })),
      items: (i.data ?? []).map(norm), members: (m.data ?? []) as Member[],
    });
  }, [sb]);

  useEffect(() => {
    reload();
    const refresh = () => { clearTimeout(timer.current); timer.current = setTimeout(reload, 150); };
    const ch = sb.channel("family-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, refresh)
      .subscribe();
    const onVis = () => { if (document.visibilityState === "visible") reload(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { sb.removeChannel(ch); document.removeEventListener("visibilitychange", onVis); clearTimeout(timer.current); };
  }, [sb, reload]);

  const me = state.members.find((m) => m.email === email.toLowerCase()) ?? null;
  return <C.Provider value={{ ...state, me, reload }}>{children}</C.Provider>;
}
