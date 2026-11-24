export default function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center p-6">
      <div className="card p-8">
        <h1 className="text-2xl">Supabase is not configured yet</h1>
        <p className="mt-3 text-ink-soft">This app needs its backend before anything can work. Nothing is being faked.</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>Create a Supabase project and run <code>supabase/schema.sql</code>, <code>parents.sql</code>, then <code>seed.sql</code>.</li>
          <li>Copy <code>.env.example</code> to <code>.env.local</code> and fill in the project URL and anon key.</li>
          <li>Restart the app. Full steps are in <code>README.md</code>.</li>
        </ol>
      </div>
    </div>
  );
}
