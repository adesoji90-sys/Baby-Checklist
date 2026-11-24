"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useData } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { num } from "@/lib/calc";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "GHS", "ZAR", "KES", "CAD"];

function Msg({ m }: { m: { ok: boolean; t: string } | null }) {
  return m ? <p role="status" className={`rounded-xl px-3 py-2 text-sm ${m.ok ? "bg-sage-100 text-sage-700" : "bg-clay-100 text-clay-600"}`}>{m.t}</p> : null;
}

export default function SettingsPage() {
  const { settings, me, members, reload } = useData();
  const router = useRouter(); const sb = createClient();
  const [f, setF] = useState({ nick: "", due: "", budget: "", cur: "NGN" });
  const [name, setName] = useState(""); const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [m1, setM1] = useState<{ ok: boolean; t: string } | null>(null); const [m2, setM2] = useState(m1); const [m3, setM3] = useState(m1);
  useEffect(() => setF({ nick: settings.baby_nickname, due: settings.due_date ?? "", budget: String(settings.overall_budget), cur: settings.currency }), [settings]);
  useEffect(() => setName(me?.display_name ?? ""), [me]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (num(f.budget) < 0) return setM1({ ok: false, t: "Budget cannot be negative." });
    const { error } = await sb.from("settings").update({ baby_nickname: f.nick.trim() || "Baby", due_date: f.due || null, overall_budget: num(f.budget), currency: f.cur }).eq("id", 1);
    if (error) return setM1({ ok: false, t: error.message });
    await reload(); setM1({ ok: true, t: "Saved. Your partner will see this straight away." });
  }
  async function saveName(e: React.FormEvent) {
    e.preventDefault(); if (!me) return;
    const { error } = await sb.from("allowed_emails").update({ display_name: name.trim() || me.display_name }).eq("email", me.email);
    if (error) return setM2({ ok: false, t: error.message });
    await reload(); setM2({ ok: true, t: "Name updated." });
  }
  async function savePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setM3({ ok: false, t: "Use at least 8 characters." });
    if (pw !== pw2) return setM3({ ok: false, t: "The passwords don’t match." });
    const { error } = await sb.auth.updateUser({ password: pw });
    if (error) return setM3({ ok: false, t: error.message });
    setPw(""); setPw2(""); setM3({ ok: true, t: "Password changed." });
  }
  async function logout() { await sb.auth.signOut(); router.replace("/login/"); }

  return (
    <>
      <PageHeader title="Settings" sub="Shared settings are saved for both of you." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={saveSettings} className="card space-y-4 p-5">
          <h2 className="text-xl">Baby &amp; budget</h2>
          <div><label>Baby’s nickname</label><input value={f.nick} onChange={(e) => setF({ ...f, nick: e.target.value })} /></div>
          <div><label>Estimated delivery date</label><input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label>Overall shopping budget</label><input type="number" min={0} step="any" inputMode="decimal" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} /></div>
            <div><label>Currency</label><select value={f.cur} onChange={(e) => setF({ ...f, cur: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          </div>
          <Msg m={m1} /><button className="btn-primary w-full">Save</button>
          <p className="text-xs text-ink-mute">Changing currency only changes how amounts are displayed; it does not convert existing prices. Edit categories on the <Link className="underline" href="/categories">Categories</Link> page and quantities on <Link className="underline" href="/items">All Shopping Items</Link>.</p>
        </form>
        <div className="space-y-6">
          <form onSubmit={saveName} className="card space-y-4 p-5">
            <h2 className="text-xl">Your account</h2>
            <div><label>Signed in as</label><input value={me?.email ?? ""} disabled /></div>
            <div><label>Display name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <Msg m={m2} /><button className="btn-soft w-full">Update name</button>
            <p className="text-xs text-ink-mute">Authorised accounts: {members.map((x) => `${x.display_name} (${x.email})`).join(" · ")}. Emails are managed in Supabase.</p>
          </form>
          <form onSubmit={savePw} className="card space-y-4 p-5">
            <h2 className="text-xl">Change password</h2>
            <div><label>New password</label><input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <div><label>Confirm new password</label><input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
            <Msg m={m3} /><button className="btn-soft w-full">Change password</button>
          </form>
          <button onClick={logout} className="btn-ghost w-full"><LogOut size={16} />Log out</button>
        </div>
      </div>
    </>
  );
}
