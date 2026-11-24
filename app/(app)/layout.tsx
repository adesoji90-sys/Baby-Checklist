import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DataProvider from "@/components/DataProvider";
import Shell from "@/components/Shell";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <SetupNotice />;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  // Authorisation: must be one of the two allowed family accounts (also enforced by RLS in the database).
  const { data: member } = await sb.from("allowed_emails").select("email").eq("email", (user.email ?? "").toLowerCase()).maybeSingle();
  if (!member) { await sb.auth.signOut(); redirect("/login?error=unauthorised"); }
  return <DataProvider email={user.email!}><Shell>{children}</Shell></DataProvider>;
}
