"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sprout } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NatureArt from "@/components/NatureArt";
import { createClient, isConfigured } from "@/lib/supabase/client";
import SetupNotice from "@/components/SetupNotice";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "unauthorised" ? "That account is not authorised for this family app." : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) { setError("Incorrect email or password."); setBusy(false); return; }
    router.replace("/"); router.refresh();
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-cream to-sage-100 p-5">
      <div className="absolute right-4 top-4 z-10"><ThemeToggle /></div>
      <NatureArt className="pointer-events-none absolute bottom-0 right-0 w-full max-w-3xl opacity-90" />
      <form onSubmit={submit} className="card relative w-full max-w-sm animate-rise rounded-3xl p-7">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-600"><Sprout size={22} /></div>
        <h1 className="text-center text-3xl">Our Baby Checklist</h1>
        <p className="mb-6 mt-1 text-center text-sm text-ink-soft">Private. Just for the two of us.</p>
        <div className="space-y-4">
          <div><label htmlFor="email">Email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label htmlFor="pw">Password</label><input id="pw" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-clay-100 px-3 py-2 text-sm text-clay-600">{error}</p>}
        <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
export default function LoginPage() {
  if (!isConfigured()) return <SetupNotice />;
  return <Suspense><Form /></Suspense>;
}
