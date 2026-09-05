# Afya Drop

A clinical decision-support AI assistant for medical personnel across Africa. Clinicians sign in with
email OTP or Google in the **Afya Drop Mobile App**, ask diagnosis/treatment questions (and attach lab
report photos), and get answers generated **strictly from their country's national clinical
guidelines** and other reference documents uploaded by admins.

Monetised with prepaid credits (1 credit = 100 UGX, min 1,000 UGX) paid via **PesaPal**.

## Stack
- **Supabase** — Auth (email OTP + Google OAuth) + PostgreSQL + pgvector (users, wallets, credits, payments, documents, chunks, Q&A log)
- **Vercel** — Next.js website: register, buy credits, admin document upload
- **Railway** — two Node.js/TypeScript services:
  - `services/backend` — profile management, wallets, credits, PesaPal IPN, document ingestion, retrieval, in-app Q&A routing (only service that talks to Supabase). Verifies the Supabase Auth JWT on every protected route.
  - `services/ai-service` — Groq clinical answering + embeddings (no DB access — Option A)

## Repo layout
```
services/
  ai-service/     Groq clinical Q&A + embeddings
  backend/        profile, credits/PesaPal, RAG ingestion + retrieval, in-app Q&A routing
web/
  frontend/       Next.js (register, login, dashboard, admin upload)
supabase/
  schema.sql      tables, pgvector, RPC functions, auth.users trigger
```

## Run locally
```bash
npm install

# Terminal 1 — AI service (needs GROQ_API_KEY)
npm run dev:ai

# Terminal 2 — backend (needs Supabase + PesaPal + service URLs)
npm run dev:backend

# Terminal 3 — website
npm run dev:web
```

Copy each service's `.env.example` to `.env` and fill in the values. For the frontend, also set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Supabase Auth setup
1. In the Supabase dashboard, enable **Email** provider with OTP (magic link/6-digit code) sign-in.
2. Enable the **Google** provider under Authentication → Providers, using OAuth credentials from the
   Google Cloud Console. Add `https://<your-site>/auth/callback` as an authorized redirect URI (and
   `http://localhost:3000/auth/callback` for local dev).
3. Run `supabase/schema.sql` (fresh project) or the migration files (existing project) so that a
   `public.users` profile row is auto-created for every `auth.users` sign-up.

## The Q&A flow
1. Clinician signs in with email OTP or Google in the Afya Drop app and asks a clinical question, optionally attaching a lab report photo.
2. The app calls backend `POST /qa/ask` with a Supabase session bearer token.
3. Backend verifies the user + balance, embeds the question, runs a pgvector search over the country's guideline chunks.
4. Backend sends `{question, context, image_url}` → ai-service `/api/ai/answer`.
5. Groq answers strictly from the context (differentials, workup, treatment + doses, red flags, referral) with a decision-support disclaimer.
6. On success, 1 credit is deducted, the Q&A is logged, and the answer is returned to the app.

## Deploy
See the **Deployment Plan** section of `mvp for afyadrop.txt`.

## Credits
Country flag icons in `web/frontend/public/flags/` are from [flag-icons](https://github.com/lipis/flag-icons) by Panayiotis Lipiridis, MIT licensed.
