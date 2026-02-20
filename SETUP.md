# LocalConnect Setup Instructions

## 🚀 Quick Setup (5 minutes)

### 1. Configure Yelp API Key

To enable real business data from Yelp, you need to add your API key:

1. **Get a free Yelp API key:**
   - Go to [Yelp Developers](https://www.yelp.com/developers/v3/manage_app)
   - Sign up (free, no credit card needed)
   - Click "Create New App"
   - Fill in app details:
     - App Name: `LocalConnect`
     - Industry: `Web Development`
   - Copy your 128-character API Key

2. **Add the API key to your app:**
   - Open `/src/app/services/businessService.ts`
   - Find line 18: `const DEFAULT_API_KEY = 'YOUR_DEFAULT_YELP_API_KEY_HERE';`
   - Replace `YOUR_DEFAULT_YELP_API_KEY_HERE` with your actual API key
   - Save the file

3. **Done!** All users will now see real Yelp business data without needing to enter their own key.

---

## ✨ Features

- **Real-time location tracking** with GPS
- **Yelp business data** (restaurants, retail stores, services)
- **Category filtering** (Food, Retail, Services)
- **User reviews** with authentication
- **Business creation** - users can add their own businesses
- **Favorites/bookmarking**
- **Deals & coupons page**
- **Cross-device sync** via Supabase

---

## 🔐 For Production

For production deployments, use an environment variable instead:

```typescript
// In businessService.ts
const DEFAULT_API_KEY = import.meta.env.VITE_YELP_API_KEY;
```

Then set `VITE_YELP_API_KEY` in your deployment environment (Vercel, Netlify, etc.).

---

## 📝 Notes

- The app works in "demo mode" with mock data if no API key is configured
- Users must log in to access real location features
- Geolocation requires HTTPS (works on localhost and production)
