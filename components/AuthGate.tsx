"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isConfigured } from "@/lib/supabase/client";
import DataProvider from "./DataProvider";
import Shell from "./Shell";
import SetupNotice from "./SetupNotice";

/**
 * Static hosting has no server, so the sign-in check happens in the browser.
 * This only decides what the page SHOWS. The data itself is protected by Supabase
 * Row Level Security, which refuses every request unless the signed-in email is one of the two allowed parents.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const configured = isConfigured();

  useEffect(() => {
    if (!configured) return;
    const sb = createClient(); let alive = true;
    async function check() {
      const { data: { user } } = await sb.auth.getUser();
      if (!alive) return;
      if (!user?.email) { router.replace("/login/"); return; }
      const { data: member } = await sb.from("allowed_emails").select("email").eq("email", user.email.toLowerCase()).maybeSingle();
      if (!alive) return;
      if (!member) { await sb.auth.signOut(); router.replace("/login/?error=unauthorised"); return; }
      setEmail(user.email);
    }
    check();
    const { data: sub } = sb.auth.onAuthStateChange((ev: string) => { if (ev === "SIGNED_OUT") { setEmail(null); router.replace("/login/"); } });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [configured, router]);

  if (!configured) return <SetupNotice />;
  if (!email) return <div className="flex min-h-screen items-center justify-center text-sm text-ink-soft">Checking sign-in…</div>;
  return <DataProvider email={email}><Shell>{children}</Shell></DataProvider>;
}
