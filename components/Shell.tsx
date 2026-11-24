"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Sprout, Flag, FolderOpen, LayoutDashboard, ListChecks, LogOut, MoreHorizontal, Settings as Cog, ShoppingBasket, Wallet, X } from "lucide-react";
import { useData } from "./DataProvider";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "./ThemeToggle";
import { useItemModals } from "./useItemModals";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/items", label: "All Shopping Items", short: "Items", icon: ListChecks },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/priorities", label: "Shopping Priorities", short: "Priorities", icon: Flag },
  { href: "/budget", label: "Budget and Expenses", short: "Budget", icon: Wallet },
  { href: "/shopping-list", label: "Shopping List", short: "List", icon: ShoppingBasket },
  { href: "/settings", label: "Settings", icon: Cog },
];
const MOBILE_MAIN = ["/", "/items", "/shopping-list", "/budget"];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter();
  const { me, settings, error } = useData();
  const [more, setMore] = useState(false);
  const m = useItemModals();
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  async function logout() { await createClient().auth.signOut(); router.replace("/login"); router.refresh(); }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sand-100 bg-cream-50 p-5 lg:flex">
        <div className="mb-8 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-600"><Sprout size={22} /></span><div><h1 className="text-xl leading-tight">Our Baby<br />Checklist</h1><p className="mt-0.5 text-xs text-ink-mute">Preparing for {settings.baby_nickname}</p></div></div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active(href) ? "bg-sage-100 font-medium text-sage-700" : "text-ink-soft hover:bg-sand-100"}`}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sand-100 pt-4">
          <p className="mb-2 px-1 text-sm text-ink-soft">Signed in as <b className="text-ink">{me?.display_name ?? "…"}</b></p>
          <button onClick={logout} className="btn-ghost w-full"><LogOut size={16} />Log out</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
      <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-sand-100 bg-cream/85 px-4 py-3 backdrop-blur sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-100 text-sage-600"><Sprout size={18} /></span><span className="font-serif text-lg">Our Baby Checklist</span></Link>
        <p className="hidden text-sm text-ink-soft lg:block">Preparing for <b className="font-semibold text-ink">{settings.baby_nickname}</b></p>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button onClick={() => m.add()} className="btn-primary rounded-full px-4" aria-label="Add item"><Plus size={18} /><span className="hidden sm:inline">Add item</span></button>
        </div>
      </header>
      <main className="px-4 pb-28 pt-6 sm:px-8 lg:px-10 lg:pb-10 lg:pt-8">
        {error && <div role="alert" className="no-print mb-4 rounded-xl bg-clay-100 p-3 text-sm text-clay-600">Could not load data: {error}. Check that the SQL files were run and your account is listed in parents.sql.</div>}
        <div className="mx-auto max-w-6xl animate-rise">{children}</div>
      </main>
      </div>
      {m.node}

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-sand-100 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.filter((n) => MOBILE_MAIN.includes(n.href)).map(({ href, label, short, icon: Icon }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${active(href) ? "text-sage-700" : "text-ink-mute"}`}>
              <Icon size={20} />{short ?? label}
            </Link>
          ))}
          <button onClick={() => setMore(true)} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-ink-mute"><MoreHorizontal size={20} />More</button>
        </div>
      </nav>

      {more && (
        <div className="no-print fixed inset-0 z-40 flex items-end bg-black/45 animate-fade lg:hidden" onClick={() => setMore(false)}>
          <div className="w-full animate-sheet rounded-t-3xl bg-cream-50 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><p className="text-sm text-ink-soft">Signed in as <b className="text-ink">{me?.display_name}</b></p><button aria-label="Close" onClick={() => setMore(false)}><X size={20} /></button></div>
            {NAV.filter((n) => !MOBILE_MAIN.includes(n.href)).map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMore(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-ink hover:bg-sand-100"><Icon size={18} />{label}</Link>
            ))}
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-clay-600 hover:bg-clay-100"><LogOut size={18} />Log out</button>
          </div>
        </div>
      )}
    </div>
  );
}
