# Supabase Setup Guide

## 1. Create a Supabase project
Go to supabase.com and create a new project.

## 2. Run this SQL in the SQL Editor

### Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  emp_no TEXT UNIQUE,
  emp_name TEXT,
  dept TEXT,
  designation TEXT,
  level TEXT,
  cost_centre TEXT,
  employee_type TEXT,
  mobile_no TEXT,
  role TEXT DEFAULT 'employee',
  PRIMARY KEY (id)
);

### Requests table
CREATE TABLE requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emp_no TEXT,
  emp_name TEXT,
  dept TEXT,
  mobile_set_name TEXT,
  model TEXT,
  serial_no TEXT,
  cost NUMERIC,
  mobile_no TEXT,
  agency TEXT,
  place TEXT,
  last_reim_date DATE,
  mobile_purchase_date DATE,
  attachment_name TEXT,
  attachment_url TEXT,
  status TEXT DEFAULT 'Pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

## 3. RLS Policies — run in SQL Editor

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Requests: anyone logged in can insert
CREATE POLICY "Authenticated users can insert"
ON requests FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Requests: anyone logged in can read
CREATE POLICY "Authenticated users can read"
ON requests FOR SELECT
USING (auth.role() = 'authenticated');

-- Requests: only admin can update status
CREATE POLICY "Admin can update request status"
ON requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

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