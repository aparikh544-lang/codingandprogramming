# Supabase Setup Instructions - Business Claims Feature

## NEW: Create Claimed Businesses Table

This allows users to **claim ownership** of existing Yelp businesses instead of creating duplicates.

Run this SQL in your Supabase SQL Editor:

```sql
-- Create table for claimed Yelp businesses
CREATE TABLE IF NOT EXISTS claimed_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  yelp_id TEXT NOT NULL UNIQUE, -- The Yelp business ID
  business_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  -- Optional: Allow users to override/enhance Yelp data
  custom_description TEXT,
  custom_image TEXT,
  custom_website TEXT,
  custom_phone TEXT,
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE claimed_businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all claimed businesses (public listing)
CREATE POLICY "Anyone can read claimed businesses"
  ON claimed_businesses
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own claims
CREATE POLICY "Users can insert own claim"
  ON claimed_businesses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own claims
CREATE POLICY "Users can update own claim"
  ON claimed_businesses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own claims
CREATE POLICY "Users can delete own claim"
  ON claimed_businesses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claimed_businesses_user_id 
ON claimed_businesses(user_id);

CREATE INDEX IF NOT EXISTS idx_claimed_businesses_yelp_id 
ON claimed_businesses(yelp_id);

CREATE INDEX IF NOT EXISTS idx_claimed_businesses_featured 
ON claimed_businesses(featured) 
WHERE featured = true;
```

## How This Works

### User Workflow:
1. User tries to create a business (e.g., "Starbucks at 123 Main St")
2. System detects it already exists in Yelp data
3. Modal shows: "This business already exists - Claim it instead!"
4. User clicks "Claim This Business"
5. Record added to `claimed_businesses` table with:
   - `user_id`: Who claimed it
   - `yelp_id`: Original Yelp business ID
   - `business_name` & `business_address`: For reference
6. Business now appears in user's profile as "Claimed Business"
7. User can edit featured/verified status and custom fields

### Benefits:
- ✅ **No duplicates** - Can't create if already exists
- ✅ **Ownership tracking** - Who owns which Yelp business
- ✅ **Enhanced data** - Users can add custom descriptions/images
- ✅ **Premium features** - Can make claimed businesses featured/verified
- ✅ **One per user** - Enforced by business limit (1 business OR 1 claim)

## How to Run This:

1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL code above
5. Click "Run" (or Ctrl/Cmd + Enter)

That's it! The claiming feature will now work.

---

# Original: Create User Businesses Table

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
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
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

-- Add index for featured businesses (better performance)
CREATE INDEX IF NOT EXISTS idx_user_businesses_featured 
ON user_businesses(featured) 
WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_user_businesses_verified 
ON user_businesses(verified) 
WHERE verified = true;
```

## 🔧 If Your Table Already Exists

If you already created the table before, just run this to add the `verified` column:

```sql
-- Add verified column to existing table
ALTER TABLE user_businesses
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_businesses_verified 
ON user_businesses(verified) 
WHERE verified = true;
```
