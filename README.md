# Afya Drop

A clinical decision-support AI assistant for medical personnel in Uganda. Clinicians ask
diagnosis/treatment questions over WhatsApp and get answers generated **strictly from the
Uganda Clinical Guidelines (UCG)** and other reference documents uploaded by admins.

Monetised with prepaid credits (1 credit = 100 UGX, min 1,000 UGX) paid via **PesaPal**.

## Stack
- **Supabase** — PostgreSQL + pgvector (users, wallets, credits, payments, documents, chunks, Q&A log)
- **Vercel** — Next.js website: register, buy credits, admin document upload
- **Railway** — three Node.js/TypeScript services:
  - `services/backend` — auth, wallets, credits, PesaPal IPN, document ingestion, retrieval, Q&A routing (only service that talks to Supabase)
  - `services/ai-service` — Groq clinical answering + embeddings (no DB access — Option A)
  - `services/baileys` — WhatsApp Web session on the main business number

## Repo layout
```
services/
  ai-service/     Groq clinical Q&A + embeddings
  backend/        registration, credits/PesaPal, RAG ingestion + retrieval, WhatsApp Q&A routing
  baileys/        WhatsApp Web (Baileys) session <-> backend
web/
  frontend/       Next.js (register, dashboard, admin upload)
supabase/
  schema.sql      tables, pgvector, RPC functions
```

## Run locally
```bash
npm install

# Terminal 1 — AI service (needs GROQ_API_KEY)
npm run dev:ai

# Terminal 2 — backend (needs Supabase + PesaPal + service URLs)
npm run dev:backend

# Terminal 3 — Baileys WhatsApp (scan QR on first run)
npm run dev:baileys

# Terminal 4 — website
npm run dev:web
```

Copy each service's `.env.example` to `.env` and fill in the values.

## The Q&A flow
1. Clinician WhatsApps a clinical question to the main number.
2. Baileys forwards `{phone, text}` → backend `/qa/from-whatsapp`.
3. Backend verifies the user + balance, embeds the question, runs a pgvector search over UCG chunks.
4. Backend sends `{question, context}` → ai-service `/api/ai/answer`.
5. Groq answers strictly from the context (differentials, workup, treatment + doses, red flags, referral) with a decision-support disclaimer.
6. On success, 1 credit is deducted, the Q&A is logged, and the answer is sent back on WhatsApp.

## Deploy
See the **Deployment Plan** section of `mvp for afyadrop.txt`.

## Credits
Country flag icons in `web/frontend/public/flags/` are from [flag-icons](https://github.com/lipis/flag-icons) by Panayiotis Lipiridis, MIT licensed.
