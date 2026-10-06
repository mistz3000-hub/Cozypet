-- Cozypet: บัญชีผู้ใช้และข้อมูลทดลอง (PROMPT.md หัวข้อ 13, D13)
-- ไม่มี secret ในไฟล์นี้ · RLS ทุกตาราง · ไม่ใช้ service role ในแอป

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  locale text not null default 'th' check (locale in ('th', 'en')),
  run_number int check (run_number between 1 and 100),
  mascot text not null default 'cat' check (mascot in ('cat', 'dog')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (key in ('demoSession', 'findingSessions', 'userListings', 'careRequests',
    'conversations', 'handoffs', 'saved', 'donationOrders', 'caretakerPlace', 'searchHistory')),
  value jsonb not null check (pg_column_size(value) <= 262144),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.profiles enable row level security;
alter table public.user_state enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all
  to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "own state" on public.user_state;
create policy "own state" on public.user_state for all
  to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- updated_at อัตโนมัติ
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch before update on public.user_state
  for each row execute function public.touch_updated_at();

-- สร้าง profiles เมื่อมีผู้ใช้ใหม่: ชื่อจาก metadata (display_name / full_name / name) หรือส่วนหน้าของอีเมล
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  dn text;
begin
  dn := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Cozypet'
  );
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, left(dn, 40), new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ลบบัญชีของตัวเองเท่านั้น (ข้อมูลใน profiles/user_state ลบตาม on delete cascade)
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
