# Supabase setup and account data

Bleuprint is wired to Supabase Auth and Supabase Postgres. The repository intentionally contains placeholders only. Add real values in the hosting provider's environment-variable settings or in a local `.env.local` file; never commit them.

## 1. Create a Supabase project

Create a project in the Supabase dashboard. Copy the project URL and the anon/publishable key into:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Keep `GEMINI_API_KEY` server-side only. Keep `SUPABASE_SERVICE_ROLE_KEY` unset unless a reviewed server-side feature specifically needs it. A service-role key bypasses Row Level Security.

## 2. Configure authentication

In Supabase Dashboard → Authentication → Providers, enable Email. Configure the site URL and allowed redirect URLs for local development and the deployed domain, including:

- `http://localhost:3000/**`
- `https://YOUR-DOMAIN/**`

Use the actual domain when it exists. Decide whether email confirmation is required before enabling public signups. Test signup, confirmation, login, logout, and password reset before inviting users.

**Password handling:** Bleuprint must not store plaintext passwords or put password values in its own `profiles` table. The signup and login screens use Supabase Auth; Supabase manages password credentials and authentication tokens. The app's profile table stores the Auth user ID and email address only. Never log passwords, session tokens, or API keys.

## 3. Configure the database

The migration at `supabase/migrations/0001_initial_schema.sql` is a proposed initial schema for a new, empty project. Review it against the current application queries and apply it through Supabase's migration workflow only after confirming it will not overwrite or conflict with existing data.

It enables Row Level Security and defines owner-scoped policies for profiles, projects, constraints, artifacts, and chat messages. Verify the policies in the Supabase dashboard and test access using two separate accounts. Do not rely on the UI to enforce data isolation.

## 4. Configure deployment secrets

Add the same placeholder variable names in the hosting provider's project settings. Set the real values there after creating the Supabase and Gemini projects. Redeploy after adding or changing environment variables.

## 5. Pre-launch checks

- [ ] Signup and email confirmation work on the deployed domain.
- [ ] Login, logout, and password reset work.
- [ ] Each user sees only their own projects and project artifacts.
- [ ] RLS is enabled and tested on every user-owned table.
- [ ] No service-role key or Gemini key appears in browser bundles, logs, or Git history.
- [ ] AI endpoints have rate limits, quotas, and spend controls before public access.
