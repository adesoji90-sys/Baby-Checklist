# Our Baby Checklist

A private baby shopping planner and budget tracker for two parents (Daddy and Mummy).
Next.js 15 · TypeScript · Tailwind CSS · Supabase (Auth, Postgres with RLS, private Storage, Realtime).

## Setup (free: GitHub Pages + Supabase free plan)

The app is a **static site**. GitHub Pages serves it for free, and Supabase (free plan) provides login, database and picture storage.

### A. Supabase (about 10 minutes)
1. Create a free project at supabase.com.
2. Authentication → Providers → Email: turn **off** "Allow new users to sign up".
3. Authentication → Users → *Add user*: create Daddy and Mummy (email + password, tick "Auto confirm user").
4. SQL Editor: run, in order, `supabase/schema.sql`, then `supabase/parents.sql` (**edit the two emails first**, lowercase, in the SQL editor only; do not commit them), then `supabase/seed.sql`.
5. Project Settings → API: copy the **Project URL** and the **anon public** key. (Never use `service_role`.)

### B. GitHub Pages
1. Put this project in a GitHub repository (the workflow file `.github/workflows/deploy.yml` must be included; it is a hidden folder).
   *GitHub Pages is free only for **public** repositories* on the free plan (private-repo Pages needs a paid plan). That is fine here: the code contains no secrets, and your data is protected by Supabase login and Row Level Security, not by hiding the code.
2. Repository → Settings → Secrets and variables → Actions → *New repository secret*: add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Repository → Settings → Pages → Source: **GitHub Actions**.
4. Push to `main` (or Actions → "Deploy to GitHub Pages" → Run workflow). After about 2 minutes the site is at `https://YOUR-USER.github.io/REPO-NAME/`.
5. Supabase → Authentication → URL Configuration: set Site URL to that address.

### Run locally (optional)
```
cp .env.example .env.local   # fill in URL + anon key
npm install
npm run dev                  # http://localhost:3000
```

## How security works
- Hosting is static, so the page files are public, but they contain **no family data**.
- All data and pictures live in Supabase. **Row Level Security** only allows a request when the signed-in email is one of the two in `allowed_emails`. Anyone else, or anyone not signed in, gets nothing, whatever the frontend does.
- The pictures bucket is private and shown through short-lived signed links.
- The anon key in the built site is public by design; it can do nothing without a valid parent login. Never put the `service_role` key anywhere in this project.
- The app also checks sign-in in the browser to decide whether to show the pages or send you to the login screen.

## Free-plan notes
- Supabase pauses free projects after about a week with no activity. Opening the app regularly avoids this; if it pauses, click *Restore* in the Supabase dashboard (data is kept).
- Free limits (500 MB database, 1 GB storage) are far more than a baby list needs.

## Notes
- Sample prices are **editable estimates, not verified market prices**. Edit anything.
- Purchases: *Record purchase* adds the quantity you bought now to what is already bought, so partial purchases and "to go" counts update automatically.
- Spending = quantity purchased × actual unit price. Estimated = quantity required × estimated unit price.
- The PDF uses "NGN" instead of ₦ because the PDF library's built-in fonts lack that glyph. The screen and print view use ₦.
- Changing currency in Settings changes display only; it does not convert prices.
- A parent can change their display name and password in-app. Email addresses are managed in Supabase (and `allowed_emails`).
- Tests: `npm test` (budget and quantity maths). Regenerate seed: `node scripts/gen-seed.mjs`.

## Theme (light / dark)
- Nature palette defined once as CSS variables in `app/globals.css` (light = ivory/forest green/sunshine yellow, dark = deep forest charcoal). Tailwind colours read those variables, so every page follows the theme.
- Sun/moon switch is in the header (and on the login page). First visit follows the device setting; a manual choice is saved in `localStorage` and overrides it. Printing always uses the light theme.
- Fonts: Lora (headings) and DM Sans (body), loaded from Google Fonts in `app/layout.tsx`; system serif/sans fonts are the fallback.
