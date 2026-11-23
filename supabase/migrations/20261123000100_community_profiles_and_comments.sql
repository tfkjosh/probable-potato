-- Community foundation: public profiles and comments for Shopify products and editorial posts.
-- Authentication is handled by Supabase Auth. Every exposed table has explicit grants and RLS.

begin;

create table if not exists public.community_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  display_name text not null default 'Member',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_profiles_username_format
    check (username is null or username ~ '^[a-z0-9_]{3,24}$'),
  constraint community_profiles_display_name_length
    check (char_length(btrim(display_name)) between 1 and 60)
);

create unique index if not exists community_profiles_username_unique
  on public.community_profiles (lower(username))
  where username is not null;

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null
    check (content_type in ('product', 'post')),
  content_id text not null
    check (char_length(btrim(content_id)) between 1 and 255),
  author_id uuid not null
    references public.community_profiles (id) on delete cascade,
  body text not null
    check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_comments_content_created_idx
  on public.community_comments (content_type, content_id, created_at desc);

create index if not exists community_comments_author_created_idx
  on public.community_comments (author_id, created_at desc);

alter table public.community_profiles enable row level security;
alter table public.community_comments enable row level security;

-- Remove broad default privileges, then grant only the operations the app needs.
revoke all on table public.community_profiles from anon, authenticated;
revoke all on table public.community_comments from anon, authenticated;

grant select on table public.community_profiles to anon, authenticated;
grant update (username, display_name, avatar_url)
  on table public.community_profiles to authenticated;

grant select on table public.community_comments to anon, authenticated;
grant insert (content_type, content_id, author_id, body)
  on table public.community_comments to authenticated;
grant update (body) on table public.community_comments to authenticated;
grant delete on table public.community_comments to authenticated;

create policy "Community profiles are publicly readable"
  on public.community_profiles
  for select
  to anon, authenticated
  using (true);

create policy "Users can update their own community profile"
  on public.community_profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Community comments are publicly readable"
  on public.community_comments
  for select
  to anon, authenticated
  using (true);

create policy "Signed-in users can comment as themselves"
  on public.community_comments
  for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Users can edit their own comments"
  on public.community_comments
  for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Users can delete their own comments"
  on public.community_comments
  for delete
  to authenticated
  using ((select auth.uid()) = author_id);

create or replace function public.set_community_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_community_updated_at() from public, anon, authenticated;

create trigger set_community_profiles_updated_at
  before update on public.community_profiles
  for each row execute function public.set_community_updated_at();

create trigger set_community_comments_updated_at
  before update on public.community_comments
  for each row execute function public.set_community_updated_at();

create or replace function public.handle_new_community_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
  requested_display_name text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  if requested_username !~ '^[a-z0-9_]{3,24}$' then
    requested_username := null;
  end if;

  requested_display_name := left(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Member'
    ),
    60
  );

  begin
    insert into public.community_profiles (id, username, display_name, avatar_url)
    values (
      new.id,
      requested_username,
      requested_display_name,
      nullif(new.raw_user_meta_data ->> 'avatar_url', '')
    )
    on conflict (id) do nothing;
  exception
    when unique_violation then
      -- A duplicate requested username must never block account creation.
      insert into public.community_profiles (id, display_name, avatar_url)
      values (
        new.id,
        requested_display_name,
        nullif(new.raw_user_meta_data ->> 'avatar_url', '')
      )
      on conflict (id) do nothing;
  end;

  return new;
end;
$$;

revoke all on function public.handle_new_community_user() from public, anon, authenticated;

create trigger on_auth_user_created_community_profile
  after insert on auth.users
  for each row execute function public.handle_new_community_user();

commit;
