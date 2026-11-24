create extension if not exists pgcrypto;

create table if not exists public.literkowo_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_norm text not null unique,
  password_salt text not null,
  password_hash text not null,
  password_iterations integer not null check (password_iterations >= 200000),
  created_at timestamptz not null default now()
);

create table if not exists public.literkowo_sessions (
  token_hash text primary key,
  user_id uuid not null references public.literkowo_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists literkowo_sessions_user_idx on public.literkowo_sessions(user_id);
create index if not exists literkowo_sessions_expiry_idx on public.literkowo_sessions(expires_at);

create table if not exists public.literkowo_progress (
  user_id uuid primary key references public.literkowo_users(id) on delete cascade,
  data_json jsonb not null default '{"completed":[],"words":[],"stars":0}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.literkowo_rate_limits (
  bucket text not null,
  ip_hash text not null,
  window_start bigint not null,
  attempts integer not null default 0,
  primary key (bucket, ip_hash, window_start)
);

alter table public.literkowo_users enable row level security;
alter table public.literkowo_sessions enable row level security;
alter table public.literkowo_progress enable row level security;
alter table public.literkowo_rate_limits enable row level security;

revoke all on public.literkowo_users, public.literkowo_sessions, public.literkowo_progress, public.literkowo_rate_limits from anon, authenticated;
grant all on public.literkowo_users, public.literkowo_sessions, public.literkowo_progress, public.literkowo_rate_limits to service_role;

create or replace function public.literkowo_create_account(
  p_username text, p_username_norm text, p_salt text, p_hash text, p_iterations integer
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare new_id uuid;
begin
  insert into public.literkowo_users(username, username_norm, password_salt, password_hash, password_iterations)
  values (p_username, p_username_norm, p_salt, p_hash, p_iterations)
  returning id into new_id;
  insert into public.literkowo_progress(user_id) values (new_id);
  return new_id;
end;
$$;

create or replace function public.literkowo_consume_rate_limit(
  p_bucket text, p_ip_hash text, p_window_start bigint, p_limit integer
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare current_attempts integer;
begin
  insert into public.literkowo_rate_limits(bucket, ip_hash, window_start, attempts)
  values (p_bucket, p_ip_hash, p_window_start, 1)
  on conflict (bucket, ip_hash, window_start)
  do update set attempts = public.literkowo_rate_limits.attempts + 1
  returning attempts into current_attempts;
  return current_attempts <= p_limit;
end;
$$;

revoke all on function public.literkowo_create_account(text,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.literkowo_consume_rate_limit(text,text,bigint,integer) from public, anon, authenticated;
grant execute on function public.literkowo_create_account(text,text,text,text,integer) to service_role;
grant execute on function public.literkowo_consume_rate_limit(text,text,bigint,integer) to service_role;
