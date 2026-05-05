create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  plan text not null default 'free',
  paystack_customer_code text,
  paystack_subscription_code text,
  paystack_plan_code text,
  paystack_reference text,
  paystack_email_token text,
  subscription_status text default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  authors text[] not null default '{}',
  source_file_name text not null,
  storage_path text not null,
  mime_type text not null default 'application/pdf',
  page_count integer not null default 0,
  status text not null default 'processing',
  simple_summary text,
  key_findings jsonb not null default '[]'::jsonb,
  methodology text,
  limitations text,
  important_definitions jsonb not null default '[]'::jsonb,
  possible_exam_questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists document_pages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  page_number integer not null,
  text_content text not null,
  token_estimate integer not null default 0,
  created_at timestamptz not null default now(),
  unique (document_id, page_number)
);

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  page_id uuid references document_pages(id) on delete set null,
  page_number integer not null,
  chunk_index integer not null,
  content text not null,
  token_estimate integer not null default 0,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, page_number, chunk_index)
);

create index if not exists document_chunks_document_page_idx
  on document_chunks (document_id, page_number);

create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists document_notes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, user_id)
);
