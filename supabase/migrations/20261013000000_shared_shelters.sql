-- D29: real account ownership, public mock shelters and private inquiries.
alter table public.profiles add column if not exists account_role text not null default 'supporter' check (account_role in ('supporter','shelter'));
alter table public.user_state drop constraint if exists user_state_key_check;
alter table public.user_state add constraint user_state_key_check check (key in ('demoSession','findingSessions','userListings','careRequests','conversations','handoffs','saved','donationOrders','caretakerPlace','searchHistory','businessState'));

create table public.shelter_places (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  registration_demo_id text not null unique default ('DEMO-REG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 1600000),
  status text not null default 'draft' check (status in ('draft','published','paused','archived')),
  version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (coalesce((payload->>'capacityTotal')::int between 1 and 1000,false)),
  check (coalesce((payload->>'currentCount')::int between 0 and (payload->>'capacityTotal')::int,false)),
  check (coalesce((payload->'location'->>'lat')::numeric between 13.49 and 13.96 and (payload->'location'->>'lng')::numeric between 100.32 and 100.94,false))
);
create index shelter_places_public on public.shelter_places(status,updated_at desc);
create index shelter_places_owner on public.shelter_places(owner_id);
create schema if not exists cozy_private;
revoke all on schema cozy_private from public,anon,authenticated;
-- API validation is repeated at the database boundary: authenticated REST clients cannot bypass it.
create function cozy_private.validate_shelter_payload() returns trigger language plpgsql set search_path='' as $$
declare d jsonb:=new.payload; item jsonb; media jsonb; k text;
begin
  if not d ?& array['name','organisationType','districtId','location','address','description','speciesAccepted','careModes','capacityTotal','currentCount','foodDays','acceptsEmergency','hours','conditions','donationsEnabled','donationNeeds','contactInstructions','photos','pets'] then raise exception 'invalid shelter'; end if;
  foreach k in array array['name','districtId','address','description','hours','conditions','donationNeeds','contactInstructions'] loop
    if jsonb_typeof(d->k)<>'string' then raise exception 'invalid text'; end if;
  end loop;
  if char_length(d->>'name') not between 2 and 80 or char_length(d->>'address')>250 or char_length(d->>'description')>1200 or char_length(d->>'conditions')>800 or char_length(d->>'hours')>160 or char_length(d->>'donationNeeds')>600 or char_length(d->>'contactInstructions')>400 then raise exception 'invalid text length'; end if;
  if d->>'organisationType' not in ('foundation','shelter','independent') or jsonb_typeof(d->'acceptsEmergency')<>'boolean' or jsonb_typeof(d->'donationsEnabled')<>'boolean' then raise exception 'invalid type'; end if;
  foreach k in array array['capacityTotal','currentCount','foodDays'] loop
    if jsonb_typeof(d->k)<>'number' or (d->>k)!~'^[0-9]+$' then raise exception 'invalid number'; end if;
  end loop;
  if (d->>'foodDays')::int not between 0 and 365 or (d ? 'litterDays' and (jsonb_typeof(d->'litterDays')<>'number' or (d->>'litterDays')!~'^[0-9]+$' or (d->>'litterDays')::int not between 0 and 365)) then raise exception 'invalid supplies'; end if;
  if jsonb_typeof(d->'speciesAccepted')<>'array' or jsonb_array_length(d->'speciesAccepted') not between 1 and 3 or jsonb_typeof(d->'careModes')<>'array' or jsonb_array_length(d->'careModes')>2 or jsonb_typeof(d->'photos')<>'array' or jsonb_array_length(d->'photos')>3 or jsonb_typeof(d->'pets')<>'array' or jsonb_array_length(d->'pets')>6 then raise exception 'invalid arrays'; end if;
  for item in select value from jsonb_array_elements(d->'speciesAccepted') loop if item#>>'{}' not in ('cat','dog','other') then raise exception 'invalid species'; end if; end loop;
  for item in select value from jsonb_array_elements(d->'careModes') loop if item#>>'{}' not in ('foster','adopt') then raise exception 'invalid care'; end if; end loop;
  for item in select value from jsonb_array_elements(d->'pets') loop
    if not item ?& array['id','name','species','breed','age','status','description'] or (item->>'id')!~'^[0-9a-f-]{36}$' or jsonb_typeof(item->'name')<>'string' or char_length(item->>'name') not between 1 and 40 or jsonb_typeof(item->'breed')<>'string' or char_length(item->>'breed')>80 or jsonb_typeof(item->'age')<>'string' or char_length(item->>'age')>40 or jsonb_typeof(item->'description')<>'string' or char_length(item->>'description')>300 or item->>'species' not in ('cat','dog','other') or item->>'status' not in ('available','foster','adopted') then raise exception 'invalid pet'; end if;
  end loop;
  for media in select value from jsonb_array_elements(d->'photos') union all select value->'photo' from jsonb_array_elements(d->'pets') where value ? 'photo' loop
    if not media ?& array['src','alt','storagePath'] or jsonb_typeof(media->'src')<>'string' or char_length(media->>'src')>4096 or jsonb_typeof(media->'alt')<>'string' or char_length(media->>'alt')>120 or (media->>'storagePath')!~('^'||new.owner_id::text||'/'||new.id::text||'/[0-9a-f-]{36}\.(webp|jpg|png)$') then raise exception 'invalid photo ownership'; end if;
  end loop;
  if new.status in ('published','paused') and (char_length(trim(d->>'address'))=0 or char_length(trim(d->>'description'))=0 or jsonb_array_length(d->'photos')=0) then raise exception 'incomplete publication'; end if;
  return new;
end; $$;
create trigger shelter_validate before insert or update on public.shelter_places for each row execute function cozy_private.validate_shelter_payload();
revoke all on function cozy_private.validate_shelter_payload() from public,anon,authenticated;
alter table public.shelter_places enable row level security;
create policy "read published or own shelters" on public.shelter_places for select to anon,authenticated using (status in ('published','paused') or owner_id=(select auth.uid()));
create policy "create own shelters" on public.shelter_places for insert to authenticated with check (owner_id=(select auth.uid()));
create policy "edit own shelters" on public.shelter_places for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
revoke all on public.shelter_places from anon,authenticated;
grant select on public.shelter_places to anon,authenticated;
grant insert(owner_id,payload,status),update(payload,status) on public.shelter_places to authenticated;

create table public.shelter_updates (
  id bigint generated always as identity primary key, place_id uuid not null references public.shelter_places(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade, version bigint not null, status text not null, created_at timestamptz not null default now()
);
alter table public.shelter_updates enable row level security;
create index shelter_updates_owner on public.shelter_updates(owner_id);
create index shelter_updates_place on public.shelter_updates(place_id);
create policy "own shelter update history" on public.shelter_updates for select to authenticated using (owner_id=(select auth.uid()));
revoke all on public.shelter_updates from anon,authenticated;
grant select on public.shelter_updates to authenticated;
create function cozy_private.stamp_shelter_update() returns trigger language plpgsql set search_path='' as $$
begin
  if TG_OP='UPDATE' then new.version=old.version+1; new.updated_at=now(); end if;
  return new;
end; $$;
create function cozy_private.log_shelter_update() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.shelter_updates(place_id,owner_id,version,status) values(new.id,new.owner_id,new.version,new.status); return new; end; $$;
create trigger shelter_stamp before update on public.shelter_places for each row execute function cozy_private.stamp_shelter_update();
create trigger shelter_log after insert or update on public.shelter_places for each row execute function cozy_private.log_shelter_update();
revoke all on function cozy_private.stamp_shelter_update(),cozy_private.log_shelter_update() from public,anon,authenticated;

create table public.shelter_inquiries (
  id uuid primary key default gen_random_uuid(), place_id uuid not null references public.shelter_places(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade, sender_name text not null check(char_length(sender_name) between 1 and 40),
  type text not null check(type in ('intake','adopt','contact')), body text not null check(char_length(body) between 1 and 1000),
  reply text not null default '' check(char_length(reply)<=1000), status text not null default 'pending' check(status in ('pending','replied','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index shelter_inquiries_place on public.shelter_inquiries(place_id,created_at desc);
create index shelter_inquiries_sender on public.shelter_inquiries(sender_id);
alter table public.shelter_inquiries enable row level security;
create policy "read own or incoming inquiries" on public.shelter_inquiries for select to authenticated using(sender_id=(select auth.uid()) or exists(select 1 from public.shelter_places p where p.id=place_id and p.owner_id=(select auth.uid())));
create policy "send own inquiries" on public.shelter_inquiries for insert to authenticated with check(sender_id=(select auth.uid()) and exists(select 1 from public.shelter_places p where p.id=place_id and p.status='published'));
create policy "reply to own shelter inquiries" on public.shelter_inquiries for update to authenticated using(exists(select 1 from public.shelter_places p where p.id=place_id and p.owner_id=(select auth.uid()))) with check(exists(select 1 from public.shelter_places p where p.id=place_id and p.owner_id=(select auth.uid())));
revoke all on public.shelter_inquiries from anon,authenticated;
grant select on public.shelter_inquiries to authenticated;
grant insert(place_id,sender_id,sender_name,type,body),update(reply,status) on public.shelter_inquiries to authenticated;
create trigger inquiry_touch before update on public.shelter_inquiries for each row execute function public.touch_updated_at();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('community-shelters','community-shelters',false,160000,array['image/jpeg','image/png','image/webp']);
create policy "read own or published shelter photos" on storage.objects for select to anon,authenticated using(
  bucket_id='community-shelters' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.shelter_places p where p.owner_id::text=(storage.foldername(name))[1] and p.id::text=(storage.foldername(name))[2] and p.status in ('published','paused')))
);
create policy "upload photos to own shelter" on storage.objects for insert to authenticated with check(
  bucket_id='community-shelters' and (storage.foldername(name))[1]=(select auth.uid())::text and exists(select 1 from public.shelter_places p where p.id::text=(storage.foldername(name))[2] and p.owner_id=(select auth.uid()))
);
create policy "remove own shelter photos" on storage.objects for delete to authenticated using(bucket_id='community-shelters' and (storage.foldername(name))[1]=(select auth.uid())::text);
