create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  category text not null,
  status text not null default 'draft',
  meta_description text,
  tags text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
before update on posts
for each row execute function update_updated_at();

alter table posts enable row level security;
alter table categories enable row level security;

create policy "Public can read published posts"
on posts for select
using (status = 'published');

create policy "Public can read categories"
on categories for select
using (true);

create policy "Service role full access to posts"
on posts for all
using (auth.role() = 'service_role');

create policy "Service role full access to categories"
on categories for all
using (auth.role() = 'service_role');
