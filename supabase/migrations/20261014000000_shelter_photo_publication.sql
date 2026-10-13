-- Unattached images and draft edits stay private until included in a published payload.
drop policy "read own or published shelter photos" on storage.objects;
create policy "read own or published shelter photos" on storage.objects for select to anon,authenticated using(
  bucket_id='community-shelters' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(
    select 1 from public.shelter_places p where p.owner_id::text=(storage.foldername(name))[1]
    and p.id::text=(storage.foldername(name))[2] and p.status in ('published','paused') and (
      exists(select 1 from jsonb_array_elements(p.payload->'photos') photo where photo->>'storagePath'=name)
      or exists(select 1 from jsonb_array_elements(p.payload->'pets') pet where pet->'photo'->>'storagePath'=name)
    )
  ))
);
