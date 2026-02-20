-- ============================================================================
-- Add 'featured' column to user_businesses table
-- This enables the Featured Business Listings monetization feature
-- ============================================================================

-- Add the featured column (defaults to false for existing businesses)
ALTER TABLE user_businesses
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add an index for better query performance when filtering featured businesses
CREATE INDEX IF NOT EXISTS idx_user_businesses_featured 
ON user_businesses(featured) 
WHERE featured = true;

-- Optional: Add a comment explaining the column
COMMENT ON COLUMN user_businesses.featured IS 'Premium feature - Business pays $40/month to appear at top of search results';
