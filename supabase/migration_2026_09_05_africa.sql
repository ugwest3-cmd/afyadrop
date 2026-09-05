-- ============================================================
-- Afya Drop — MIGRATION (run this if you ALREADY ran the old schema.sql)
-- Adds: multi-country support, user suspension, country-filtered retrieval.
-- Safe to run once. Uses IF NOT EXISTS / OR REPLACE so it won't error on re-run.
-- ============================================================

-- 1) Users: add country + suspended
alter table public.users
  add column if not exists country text not null default 'UG',
  add column if not exists suspended boolean not null default false;

-- 2) Documents: add country
alter table public.documents
  add column if not exists country text not null default 'UG';

-- 3) Replace the retrieval function with the country-filtered version.
--    (must DROP first because the return signature changed)
drop function if exists public.match_document_chunks(vector, int, float);

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

-- 4) Helpful index for per-country document filtering
create index if not exists documents_country_idx on public.documents (country);
create index if not exists users_country_idx on public.users (country);
