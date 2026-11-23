# Community foundation

This folder contains the first database milestone for the storefront's community features.

## Scope

- Public community profiles backed by Supabase Auth users.
- Comments attached to Shopify products or editorial posts.
- Profile and comment ownership enforced by PostgreSQL Row Level Security (RLS).
- No likes or follows in this migration. Those are intentionally deferred until the profile/comment permission boundary is tested.

A comment targets a stable content reference:
- `content_type = 'product'`: `content_id` is the Shopify product GID.
- `content_type = 'post'`: `content_id` is the editorial post slug.

## Create the Supabase project

1. Create a Supabase project and keep its database credentials private.
2. Open **SQL Editor** in the Supabase dashboard.
3. Paste and run the migration at `supabase/migrations/20261123000100_community_profiles_and_comments.sql`.
4. In **Authentication → Providers**, enable the sign-in provider(s) you want to offer.
5. In **Authentication → URL Configuration**, set the local site URL to `http://localhost:3000`. Add your production URL and any exact auth callback URLs when the app integration is implemented.

The migration creates a profile automatically whenever a Supabase Auth user is created. It also enables RLS and restricts database grants. Anonymous visitors can read public profiles and comments; only signed-in users can create comments, and users can edit or delete only their own comments.

## Environment variables for the upcoming app integration

The Next.js integration will use the Supabase SSR client and these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Add the real values to `.env.local` and your deployment provider's environment settings. Do not commit them. A Supabase publishable key is intended for public app configuration; RLS is the data-access boundary. Never put a Supabase secret/service-role key in browser code or a `NEXT_PUBLIC_*` variable.

## Security notes

- The profile ID references `auth.users.id`; clients cannot create a profile for another user.
- Comment inserts must use the signed-in user's own auth UUID as `author_id`.
- Column-level grants prevent users from changing comment ownership or its content target when editing.
- Profile updates cannot change the profile ID or timestamps.
- Likes and follows are deliberately not included until these policies have been exercised with separate users and anonymous access.

## Validation status

This migration has been reviewed against Supabase's current RLS guidance but has not yet been applied to a live Supabase project or tested with real auth users. The next step is to run it in the project's SQL Editor, then exercise anonymous reads and two-user ownership boundaries before adding the Next.js auth/data layer.
