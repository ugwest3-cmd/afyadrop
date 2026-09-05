-- Afya Drop MVP schema (Supabase / PostgreSQL)
-- The African medical assistant: clinical decision-support (RAG over each
-- country's national clinical guidelines). Run in the Supabase SQL editor.
-- NOTE: if you already ran an older version, run migration_2026_09_05_africa.sql instead.

create extension if not exists "pgcrypto";
create extension if not exists "vector";   -- pgvector for embeddings

-- ============ USERS ============
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,              -- E.164, e.g. +2567XXXXXXXX
  country text not null default 'UG',      -- ISO country code (UG, KE, NG, ...) — determines which guideline is used
  qualification text not null,             -- Pharmacist, Nurse, Clinical Officer, Doctor, ...
  licence_number text not null,            -- practising licence number
  phone_verified boolean not null default false,
  role text not null default 'clinician',  -- clinician | admin
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

-- OTP codes for phone verification during registration
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists otp_codes_phone_idx on public.otp_codes (phone);

-- ============ WALLETS & CREDITS ============
create table if not exists public.wallets (
  user_id uuid primary key references public.users(id) on delete cascade,
  balance_credits integer not null default 0 check (balance_credits >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('purchase','spend','refund','bonus')),
  credits integer not null,
  amount_ugx integer,
  reference text,
  created_at timestamptz not null default now()
);
create index if not exists credit_tx_user_idx on public.credit_transactions (user_id);

-- ============ PAYMENTS (PesaPal) ============
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  credits integer not null,
  amount_ugx integer not null,
  pesapal_tracking_id text,
  pesapal_merchant_ref text,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists payments_user_idx on public.payments (user_id);

-- ============ REFERENCE DOCUMENTS (national clinical guidelines, etc.) ============
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,                     -- e.g. "Uganda Clinical Guidelines 2023"
  country text not null default 'UG',      -- ISO country code this guideline applies to
  source_type text not null default 'ucg', -- ucg | guideline | formulary | other
  file_path text,                          -- Supabase Storage path of the original file
  status text not null default 'processing', -- processing | ready | failed
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- Chunked + embedded passages of each document for retrieval
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null,
  source_label text,                       -- e.g. "UCG 2023 — p.114"
  content text not null,
  embedding vector(1536)                   -- adjust dim to your embedding model
);
create index if not exists chunks_doc_idx on public.document_chunks (document_id);
create index if not exists chunks_embedding_idx
  on public.document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============ Q&A LOG (each clinical question costs 1 credit) ============
create table if not exists public.qa_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  question text not null,
  answer text,
  grounded boolean not null default false,  -- was any context retrieved?
  created_at timestamptz not null default now()
);
create index if not exists qa_logs_user_idx on public.qa_logs (user_id);

-- ============ ROW LEVEL SECURITY ============
alter table public.users enable row level security;
alter table public.otp_codes enable row level security;
alter table public.wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.qa_logs enable row level security;

-- Backend uses the SERVICE ROLE key (bypasses RLS). Add user policies later
-- only if you expose direct client access.

-- ============ FUNCTIONS ============
-- Atomic credit spend (1 credit per clinical question).
create or replace function public.spend_credit(p_user uuid, p_reference text default null)
returns integer
language plpgsql security definer
as $$
declare new_balance integer;
begin
  update public.wallets
     set balance_credits = balance_credits - 1, updated_at = now()
   where user_id = p_user and balance_credits >= 1
  returning balance_credits into new_balance;
  if not found then return -1; end if;
  insert into public.credit_transactions (user_id, type, credits, reference)
  values (p_user, 'spend', -1, p_reference);
  return new_balance;
end;
$$;

-- Add credits after a successful PesaPal payment.
create or replace function public.add_credits(p_user uuid, p_credits integer, p_amount_ugx integer, p_reference text default null)
returns integer
language plpgsql security definer
as $$
declare new_balance integer;
begin
  insert into public.wallets (user_id, balance_credits)
  values (p_user, p_credits)
  on conflict (user_id)
  do update set balance_credits = public.wallets.balance_credits + p_credits, updated_at = now()
  returning balance_credits into new_balance;
  insert into public.credit_transactions (user_id, type, credits, amount_ugx, reference)
  values (p_user, 'purchase', p_credits, p_amount_ugx, p_reference);
  return new_balance;
end;
$$;

-- Semantic search over guideline chunks, filtered to a single country.
create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_count int default 6,
  match_threshold float default 0.0,
  match_country text default null
)
returns table (id uuid, source_label text, content text, similarity float)
language sql stable
as $$
  select c.id, c.source_label, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where c.embedding is not null
    and d.status = 'ready'
    and (match_country is null or d.country = match_country)
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
