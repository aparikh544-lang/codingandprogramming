# Supabase Setup Instructions

## Create User Businesses Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create table for user-created businesses
CREATE TABLE IF NOT EXISTS user_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Food', 'Retail', 'Services')),
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  image TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all businesses (public listing)
CREATE POLICY "Anyone can read businesses"
  ON user_businesses
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own businesses
CREATE POLICY "Users can insert own business"
  ON user_businesses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own businesses
CREATE POLICY "Users can update own business"
  ON user_businesses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own businesses
CREATE POLICY "Users can delete own business"
  ON user_businesses
  FOR DELETE
  USING (auth.uid() = user_id);
```

## How to Run This:

1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL code above
5. Click "Run" (or Ctrl/Cmd + Enter)

That's it! Your business creation feature will now work.
