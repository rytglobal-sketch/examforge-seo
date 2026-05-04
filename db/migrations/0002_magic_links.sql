alter table users
  alter column password_hash drop not null;

create table if not exists auth_magic_links (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  intent text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_magic_links_email_idx
  on auth_magic_links (lower(email), intent);

create index if not exists auth_magic_links_expires_idx
  on auth_magic_links (expires_at);
