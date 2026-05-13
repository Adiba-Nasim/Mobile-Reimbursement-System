# Supabase Setup Guide

## 1. Create a Supabase project
Go to supabase.com and create a new project.

## 2. Run this SQL in the SQL Editor

-- TABLE 1: profiles
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  emp_no       text unique not null,
  name         text not null,
  email        text unique not null,
  phone        text unique not null,
  dept         text not null,
  designation  text,
  cost_centre  text,
  level        text,
  emp_type     text,
  role         text default 'employee',
  created_at   timestamptz default now()
);

-- TABLE 2: requests
create table requests (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references profiles(id) on delete cascade,
  emp_no               text,
  emp_name             text,
  designation          text,
  level                text,
  dept                 text,
  cost_centre          text,
  emp_type             text,
  mobile_set_name      text,
  model                text,
  serial_no            text,
  place                text,
  cost                 numeric(10,2),
  mobile_no            text,
  agency               text,
  mobile_purchase_date date,
  last_reim_date       date,
  attachment_name      text,
  attachment_url       text,
  status               text default 'Pending',
  submitted_at         timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table requests enable row level security;

create policy "Own profile"
  on profiles for all
  using (auth.uid() = id);

create policy "Own requests select"
  on requests for select
  using (auth.uid() = user_id);

create policy "Own requests insert"
  on requests for insert
  with check (auth.uid() = user_id);

create policy "Admin all"
  on requests for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- STORAGE
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true);

create policy "Allow uploads"
  on storage.objects for insert
  with check (bucket_id = 'attachments');

create policy "Allow public read"
  on storage.objects for select
  using (bucket_id = 'attachments');

create policy "Allow insert on signup"
  on profiles for insert
  with check (auth.uid() = id);

## 4. Storage bucket
- Go to Storage → Create bucket → name it `attachments`
- Set it to public

## 5. Set admin user
After signing up with your admin account, run:
UPDATE profiles SET role = 'admin' WHERE emp_no = 'your_emp_no';

## 6. Environment variables
Create a .env file:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

## 7. Auth URL configuration
In Supabase → Authentication → URL Configuration:
- Site URL: http://localhost:5173 (local) or your Vercel URL
- Redirect URLs: http://localhost:5173/**, https://your-app.vercel.app/**