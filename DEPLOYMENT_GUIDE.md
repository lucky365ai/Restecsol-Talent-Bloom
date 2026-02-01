# Complet Deployment Guide (Netlify + Supabase)

Follow these steps to deploy your app to Netlify.

## Phase 1: Database Setup (Supabase)

**Crucial**: If you haven't already, you must create the tables in your Supabase project.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/tgcyedsgcljsjrwaafri).
2.  Click **SQL Editor** (left sidebar) -> **New query**.
3.  Run this SQL:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  talent text,
  sub_talent text,
  level text,
  theme_key text default 'unknown',
  theme_mode text default 'system',
  cursor_emoji text
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Create lessons table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  content text,
  sort_order integer,
  user_id uuid references auth.users(id)
);
alter table public.lessons enable row level security;
create policy "Users can view their own lessons" on lessons for select using (auth.uid() = user_id);

-- Create lesson_progress table
create table public.lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  lesson_id uuid references public.lessons(id),
  state text default 'Not Started',
  time_spent_seconds integer default 0,
  score integer,
  completed_at timestamp with time zone
);
alter table public.lesson_progress enable row level security;
create policy "Users can view their own progress" on lesson_progress for select using (auth.uid() = user_id);
create policy "Users can insert progress" on lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can update progress" on lesson_progress for update using (auth.uid() = user_id);
```

## Phase 2: Deploy to Netlify

1.  **Log in**: Go to [netlify.com](https://netlify.com) and log in with GitHub.
2.  **Add New Site**: Click **"Add new site"** -> **"Import from an existing project"**.
3.  **Connect to GitHub**: Authorize and select `Restecsol-Talent-Bloom`.
4.  **Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
5.  **Environment Variables** (Click "Show advanced" or "Environment variables"):
    *   Add these 3 keys (copy values from your local `.env`):
        *   `VITE_SUPABASE_PROJECT_ID`: `tgcyedsgcljsjrwaafri`
        *   `VITE_SUPABASE_URL`: `https://tgcyedsgcljsjrwaafri.supabase.co`
        *   `VITE_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_gyxbq3hzpm6VX_dIvK7Htw__P5Rxr7l`
6.  **Deploy**: Click **"Deploy site"**.

## Phase 3: Final Config

1.  **Get Live URL**: Copy your Netlify URL (e.g., `https://funny-pika.netlify.app`).
2.  **Update Supabase**:
    *   Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
    *   **Site URL**: Paste your Netlify URL.
    *   **Redirect URLs**: Paste your Netlify URL (and maybe add `/**` at the end).
    *   Click **Save**.

The app is now live on Netlify!
