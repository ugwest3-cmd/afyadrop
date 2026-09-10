-- Run this SQL in your Supabase SQL Editor to create the bucket for lab images

-- 1. Create the public bucket "lab-reports"
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lab-reports',
  'lab-reports',
  true, -- Needs to be public so the AI can read the URL
  5242880, -- 5MB limit
  '{image/jpeg, image/png, image/webp}' -- Only images
) on conflict (id) do nothing;

-- 2. Allow authenticated users to upload files to this bucket
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'lab-reports' );

-- 3. Allow everyone to view/read the images
create policy "Allow public read"
on storage.objects for select
to public
using ( bucket_id = 'lab-reports' );
