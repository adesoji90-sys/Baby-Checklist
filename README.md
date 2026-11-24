# Our Baby Checklist

A private baby shopping planner and budget tracker for two parents (Daddy and Mummy).
Next.js 15 · TypeScript · Tailwind CSS · Supabase (Auth, Postgres with RLS, private Storage, Realtime).

## Setup (about 15 minutes)

1. **Create a Supabase project** at supabase.com (free tier is fine).
2. **Lock down sign-ups:** Authentication → Sign In / Providers → Email → turn **off** "Allow new users to sign up". (Even if this were left on, Row Level Security would show a stranger nothing.)
3. **Create the two accounts:** Authentication → Users → *Add user* → create Daddy and Mummy with email + password (tick "Auto confirm user").
4. **Run the SQL** in the SQL editor, in this order:
   1. `supabase/schema.sql`: tables, Row Level Security, realtime, private image bucket
   2. `supabase/parents.sql`: **edit the two emails first** so they match the accounts from step 3 (lowercase)
   3. `supabase/seed.sql`: the 10 categories and 104 starter items (safe to run once)
5. **Connect the app:** Project Settings → API. Copy the URL and `anon` public key:
   ```
   cp .env.example .env.local   # then fill in both values
   ```
6. **Run it:**
   ```
   npm install
   npm run dev        # http://localhost:3000
   ```
   To deploy (e.g. Vercel), add the same two environment variables there.

## How security works
- `middleware.ts` rejects any request without a valid Supabase session; the app layout also confirms the account is one of the two in `allowed_emails`.
- **Row Level Security** on every table allows access only when `is_family()` is true (the JWT email is in `allowed_emails`). Logged-out and unlisted users get nothing, whatever the frontend does.
- Product pictures live in a **private** bucket, shown through 1-hour signed URLs, and storage policies use the same family check.
- Only the **anon** key is used in the app. Never put the `service_role` key in it.

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
