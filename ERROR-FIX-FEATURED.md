# 🔴 ERROR FIX: "Could not find 'featured' column"

## What You're Seeing
```
❌ Could not find the 'featured' column of 'user_businesses' in the schema cache
```

This error appears when trying to create a business with the Featured checkbox enabled.

---

## ✅ The Fix (Copy & Paste This SQL)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your LocalConnect project  
3. Click **"SQL Editor"** in left sidebar
4. Click **"+ New query"**

### Step 2: Run This SQL
```sql
ALTER TABLE user_businesses
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_businesses_featured 
ON user_businesses(featured) 
WHERE featured = true;
```

### Step 3: Click Run
- Hit the green **"Run"** button
- You should see: "Success. No rows returned"
- Done! ✅

---

## 🧪 Test It Now

1. Go back to your LocalConnect app
2. Click **"Create Business"**
3. Fill out the form
4. Check **"Make this a Featured Business"**
5. Click **"Create Business"**
6. ✅ Should work now!

---

## 🎯 What This Does

The SQL command adds a new column called `featured` to your database table. This column tracks which businesses are paying for premium placement ($40/month feature).

**Before Fix:**
```
user_businesses table:
- id
- name
- category
- description
- address
- phone
- image
- website
```

**After Fix:**
```
user_businesses table:
- id
- name
- category
- description
- address
- phone
- image
- website
- featured ⭐ (NEW!)
```

---

## ⚠️ Common Issues

### "Table 'user_businesses' does not exist"
**Fix:** You need to create the table first
- See `supabase-setup-instructions.md`
- Run the full table creation SQL first

### "Permission denied"
**Fix:** Make sure you're logged into the correct Supabase project
- Check you have admin/owner access
- Try logging out and back in

### "Column already exists"
**Fix:** That's actually good! It means the column is already there
- The error is likely something else
- Check the full error message in browser console (F12)

---

## 📍 Where to Find SQL Editor

**Visual Guide:**

```
Supabase Dashboard
├── 📊 Home
├── 🗂️ Table Editor
├── 🔐 Authentication
├── 📁 Storage
├── </> SQL Editor  ← YOU ARE HERE
├── 📡 Database
└── ⚙️ Settings
```

1. Look for **</> SQL Editor** icon in left sidebar
2. Usually below "Storage" and above "Database"
3. Green icon with code brackets

---

## 🎉 After the Fix Works

Once you run the SQL successfully:

✅ **Featured businesses will:**
- Appear at top of search results
- Show gold crown badge (👑)
- Have premium gradient styling
- Be worth $40/month to business owners!

✅ **You can:**
- Create businesses with featured toggle
- Start charging for premium placement
- Make recurring revenue
- Scale to 100+ businesses

---

## 💰 Why This Matters

This one database column enables your entire monetization strategy:

```
1 column = $40/month per business
10 businesses = $400/month
50 businesses = $2,000/month  
100 businesses = $4,000/month ($48k/year!)
```

---

## 📚 More Help

- **FEATURED-LISTINGS-README.md** - Complete overview
- **MONETIZATION.md** - How to make money
- **supabase-setup-instructions.md** - Full database setup

---

## Still Stuck?

1. Make sure Supabase project is connected
2. Verify table name is `user_businesses` (lowercase, underscore)
3. Try refreshing Supabase dashboard
4. Check browser console for detailed errors (F12)
5. Screenshot the error and check against troubleshooting above

---

**This is the only blocker before you can start making money! Get it done! 🚀**
