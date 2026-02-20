-- Enhanced schema for premium business features
-- Run this in your Supabase SQL Editor to add premium features

-- 1. Add premium columns to user_businesses table
ALTER TABLE user_businesses 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_badge TEXT,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free' CHECK (premium_tier IN ('free', 'featured', 'premium', 'enterprise'));

-- 2. Create analytics tracking table
CREATE TABLE IF NOT EXISTS business_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES user_businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'click', 'phone_click', 'website_click', 'favorite', 'unfavorite'
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_business_date 
ON business_analytics(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
ON business_analytics(business_id, event_type);

-- 3. Create premium features table (for future expansion)
CREATE TABLE IF NOT EXISTS premium_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES user_businesses(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create payments/subscriptions table
CREATE TABLE IF NOT EXISTS business_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES user_businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL, -- 'featured', 'premium', 'enterprise'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create payment transactions table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES business_subscriptions(id),
  business_id UUID REFERENCES user_businesses(id),
  user_id UUID REFERENCES auth.users(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded'
  payment_method TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- Analytics: Business owners can see their own analytics
CREATE POLICY "Business owners can view their analytics"
ON business_analytics FOR SELECT
USING (
  business_id IN (
    SELECT id FROM user_businesses WHERE user_id = auth.uid()
  )
);

-- Analytics: Allow inserts for tracking (anyone can track)
CREATE POLICY "Anyone can track analytics"
ON business_analytics FOR INSERT
WITH CHECK (true);

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view their subscriptions"
ON business_subscriptions FOR SELECT
USING (user_id = auth.uid());

-- Payments: Users can view their own payments
CREATE POLICY "Users can view their payments"
ON payments FOR SELECT
USING (user_id = auth.uid());

-- 8. Create helpful views

-- View for business performance summary
CREATE OR REPLACE VIEW business_performance AS
SELECT 
  b.id,
  b.name,
  b.featured,
  b.premium_tier,
  COUNT(DISTINCT CASE WHEN a.event_type = 'view' THEN a.id END) as total_views,
  COUNT(DISTINCT CASE WHEN a.event_type = 'click' THEN a.id END) as total_clicks,
  COUNT(DISTINCT CASE WHEN a.event_type = 'phone_click' THEN a.id END) as phone_clicks,
  COUNT(DISTINCT CASE WHEN a.event_type = 'website_click' THEN a.id END) as website_clicks,
  COUNT(DISTINCT CASE WHEN a.event_type = 'favorite' THEN a.id END) as favorites,
  CASE 
    WHEN COUNT(CASE WHEN a.event_type = 'view' THEN 1 END) > 0 
    THEN ROUND((COUNT(CASE WHEN a.event_type IN ('click', 'phone_click', 'website_click') THEN 1 END)::numeric / 
                COUNT(CASE WHEN a.event_type = 'view' THEN 1 END)::numeric * 100), 2)
    ELSE 0 
  END as conversion_rate
FROM user_businesses b
LEFT JOIN business_analytics a ON b.id = a.business_id 
  AND a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY b.id, b.name, b.featured, b.premium_tier;

-- 9. Create function to track analytics
CREATE OR REPLACE FUNCTION track_business_event(
  p_business_id UUID,
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO business_analytics (business_id, event_type, user_id, session_id)
  VALUES (p_business_id, p_event_type, p_user_id, p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Example data structure for JSONB columns

-- business_hours format:
-- {
--   "monday": {"open": "09:00", "close": "17:00", "closed": false},
--   "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
--   "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
--   "thursday": {"open": "09:00", "close": "17:00", "closed": false},
--   "friday": {"open": "09:00", "close": "17:00", "closed": false},
--   "saturday": {"open": "10:00", "close": "15:00", "closed": false},
--   "sunday": {"open": null, "close": null, "closed": true}
-- }

-- social_media format:
-- {
--   "facebook": "https://facebook.com/yourbusiness",
--   "instagram": "@yourbusiness",
--   "twitter": "@yourbusiness",
--   "linkedin": "company/yourbusiness"
-- }

-- gallery format (array of image URLs):
-- [
--   "https://example.com/image1.jpg",
--   "https://example.com/image2.jpg",
--   "https://example.com/image3.jpg"
-- ]

-- 11. Useful queries

-- Get top performing businesses
-- SELECT * FROM business_performance 
-- ORDER BY total_views DESC 
-- LIMIT 10;

-- Get featured businesses that are expiring soon
-- SELECT id, name, featured_until 
-- FROM user_businesses 
-- WHERE featured = true 
--   AND featured_until < NOW() + INTERVAL '7 days'
-- ORDER BY featured_until;

-- Calculate revenue for current month
-- SELECT 
--   SUM(amount) as total_revenue,
--   COUNT(*) as payment_count,
--   COUNT(DISTINCT user_id) as unique_customers
-- FROM payments
-- WHERE status = 'succeeded'
--   AND created_at >= DATE_TRUNC('month', NOW());

COMMENT ON TABLE business_analytics IS 'Tracks all user interactions with businesses';
COMMENT ON TABLE business_subscriptions IS 'Manages premium subscriptions and billing';
COMMENT ON TABLE payments IS 'Records all payment transactions';
COMMENT ON VIEW business_performance IS 'Aggregated performance metrics for businesses';
