# 💰 Monetization Setup Guide

## Current Status: Demo Mode ✨

Your LocalConnect app now has a **fully functional featured business payment system** in demo mode!

### What's Working Now:

1. ✅ **Payment UI** - Beautiful Stripe-style payment form
2. ✅ **Featured Business Logic** - Premium businesses show at top with gold crown badge
3. ✅ **Radius Filtering** - Featured businesses only show if within 5 miles of search location
4. ✅ **Test Mode** - Use test card `4242 4242 4242 4242` to simulate payments

### Pricing:
- **Free Listings**: Basic business listings (no payment required)
- **Featured Listings**: $49.99/month for premium placement

---

## 🚀 How to Accept Real Payments

To start accepting **real money**, follow these steps:

### Step 1: Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete your account verification
3. Get your **API keys** from the Stripe Dashboard

### Step 2: Add Stripe Backend

You'll need a backend server to process payments securely. Here's what you need:

#### Option A: Supabase Edge Functions (Recommended)

Create a Supabase Edge Function to handle payment intents:

```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    const { amount, userId, businessName } = await req.json();

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        businessName,
        product: 'featured_listing'
      }
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Option B: Your Own Backend

Create an Express.js or similar backend:

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-payment-intent', async (req, res) => {
  const { amount, userId, businessName } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: { userId, businessName, product: 'featured_listing' }
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});
```

### Step 3: Update the Frontend

Replace the demo payment logic in `/src/app/components/StripePaymentForm.tsx`:

```typescript
// Instead of simulating payment, call your backend:
const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: amount,
    userId: user.id,
    businessName: businessData.name
  })
});

const { clientSecret } = await response.json();

// Use Stripe.js to confirm the payment
const stripe = await loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: cardholderName }
  }
});

if (result.error) {
  // Handle error
} else {
  // Payment successful!
  onPaymentSuccess();
}
```

### Step 4: Add Webhooks (Important!)

Set up Stripe webhooks to handle successful payments:

```typescript
// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Update your database to mark the business as featured
    await supabase
      .from('user_businesses')
      .update({ featured: true, featured_until: /* 30 days from now */ })
      .eq('id', paymentIntent.metadata.businessId);
  }

  res.json({ received: true });
});
```

---

## 💡 Business Ideas

### Pricing Tiers

Consider offering multiple tiers:

- **Free**: Basic listing
- **Featured ($49.99/mo)**: Top placement + gold badge
- **Premium ($99.99/mo)**: Featured + photo gallery + priority support
- **Enterprise ($249.99/mo)**: Premium + analytics + API access

### Additional Revenue Streams

1. **Sponsored Search Results**: Charge per click or impression
2. **Banner Ads**: Sell ad space to businesses
3. **Lead Generation**: Charge for customer inquiries/calls
4. **Premium Analytics**: Sell business insights dashboard
5. **Bulk Discounts**: Offer annual subscriptions at discount
6. **Local Ad Network**: Partner with multiple locations

---

## 📊 Tracking Revenue

Add a database table to track payments:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  business_id UUID REFERENCES user_businesses(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_id TEXT,
  status TEXT, -- 'pending', 'succeeded', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Next Steps

1. [X] Sign up for Stripe account
2. [ ] Set up backend/edge function
3. [ ] Add Stripe.js integration to frontend
4. [ ] Configure webhooks
5. [ ] Test with Stripe test mode
6. [ ] Go live!

---

## 🆘 Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe + React Guide](https://stripe.com/docs/stripe-js/react)

---

**Remember**: You're currently in demo mode. To actually charge cards, you MUST set up a backend payment processing system. Never expose your Stripe secret key in the frontend!
