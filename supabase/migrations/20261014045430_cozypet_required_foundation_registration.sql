-- D32: registration is mandatory for foundation writes, including direct Data API writes.
-- Existing rows remain readable. The next write must supply a demo number.
create function cozy_private.validate_foundation_registration()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  number text := new.payload ->> 'registrationNumber';
begin
  if new.payload ? 'registrationNumber' and
     (jsonb_typeof(new.payload -> 'registrationNumber') <> 'string' or char_length(number) > 60) then
    raise exception using errcode = '23514', message = 'invalid foundation registration number';
  end if;
  if new.payload ->> 'organisationType' = 'foundation' and
     nullif(btrim(number, E' \t\n\r\f' || chr(11)), '') is null then
    raise exception using errcode = '23514', message = 'foundation registration number required';
  end if;
  return new;
end;
$$;

revoke all on function cozy_private.validate_foundation_registration() from public, anon, authenticated;
create trigger shelter_foundation_registration
before insert or update on public.shelter_places
for each row execute function cozy_private.validate_foundation_registration();
