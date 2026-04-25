-- Add image columns to posts
alter table posts
  add column featured_image text,
  add column featured_image_alt text;

-- Public storage bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Anyone can read (public bucket)
create policy "Public can read blog images"
on storage.objects for select
using (bucket_id = 'blog-images');

-- Only service role can upload / delete
create policy "Service role can manage blog images"
on storage.objects for all
using (bucket_id = 'blog-images' and auth.role() = 'service_role');
