## 🚨 Quick Fix: Database Update Required

### The Issue
Your Supabase database table needs a new column called `featured` to support the Featured Business Listings monetization feature.

---

## ✅ Solution (Takes 2 Minutes)

### Option 1: SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your LocalConnect project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar (looks like </> icon)
   - Click **"New query"** button

3. **Copy & Paste This SQL**
```sql
-- Add featured column to user_businesses table
ALTER TABLE user_businesses
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_businesses_featured 
ON user_businesses(featured) 
WHERE featured = true;
```

4. **Click "Run"**
   - Press the green "Run" button (or Ctrl/Cmd + Enter)
   - You should see: ✅ "Success. No rows returned"

5. **Done!**
   - Go back to your app and try creating a business again
   - The "featured" checkbox will now work!

---

### Option 2: Table Editor (Visual Method)

1. **Open Table Editor**
   - In Supabase Dashboard, click **"Table Editor"**
   - Select the **"user_businesses"** table

2. **Add New Column**
   - Click the **"+"** button to add a new column
   - Fill in these details:
     - **Name:** `featured`
     - **Type:** `boolean` (or `bool`)
     - **Default value:** `false`
     - **Nullable:** Unchecked (NOT NULL)

3. **Save**
   - Click **"Save"** or **"Add column"**
   - The column is now added!

4. **Test**
   - Go back to your app
   - Try creating a business with the Featured checkbox
   - It should work now! ✅

---

## 🎯 What This Does

- Adds a `featured` column to track which businesses are premium (featured)
- Sets default to `false` for all existing businesses
- Adds a database index to make featured business queries faster
- Enables the $40/month monetization feature!

---

## ⚠️ Troubleshooting

**"Table 'user_businesses' does not exist"**
- You need to create the table first
- See `supabase-setup-instructions.md` for full setup

**"Permission denied"**
- Make sure you're logged into the correct Supabase project
- You need admin/owner permissions to alter tables

**Still not working?**
- Make sure your Supabase project is connected
- Check that the table name is exactly `user_businesses` (lowercase, with underscore)
- Try refreshing the Supabase dashboard page

---

## 🎉 After It's Fixed

Once you run the SQL, you can:
1. ✅ Create businesses with the Featured toggle
2. ⭐ Featured businesses appear at the top of search
3. 💰 Start charging $40/month for featured placement
4. 📈 Scale your revenue!

---

**Need more help?** Check out:
- `MONETIZATION.md` - Full monetization guide
- `supabase-setup-instructions.md` - Complete database setup
