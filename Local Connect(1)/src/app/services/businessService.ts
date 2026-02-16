import { Business } from '../types';
import { supabase } from '../utils/supabase';

// Cache the API key in memory for the session
let cachedApiKey: string | null = null;

async function getApiKey(userId?: string): Promise<string | null> {
  // Return cached key if available
  if (cachedApiKey) {
    return cachedApiKey;
  }

  // Try to fetch from Supabase table if user is logged in
  if (userId) {
    try {
      console.log('Fetching API key from Supabase table for user:', userId);
      
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = not found, which is ok
          console.error('Error fetching API key from database:', error);
        }
      } else if (data?.api_key) {
        cachedApiKey = data.api_key;
        console.log('✓ API key loaded from database');
        return data.api_key;
      }
    } catch (error) {
      console.error('Failed to fetch API key from database:', error);
    }
  }

  // Fall back to localStorage for backward compatibility
  const localKey = localStorage.getItem('YELP_API_KEY');
  if (localKey) {
    cachedApiKey = localKey;
    console.log('✓ API key loaded from localStorage');
    return localKey;
  }

  console.warn('No API key found in database or localStorage');
  return null;
}

// Clear the cached API key (useful when saving a new key)
export function clearApiKeyCache() {
  cachedApiKey = null;
}

export async function fetchNearbyBusinesses(
  latitude: number,
  longitude: number,
  category?: string,
  userId?: string
): Promise<Business[]> {
  try {
    // Get API key from Supabase table or localStorage
    const apiKey = await getApiKey(userId);
    if (!apiKey) {
      throw new Error('Please add your Yelp API key in Settings');
    }

    // Map our categories to Yelp categories
    const categoryMap: Record<string, string> = {
      'Food': 'restaurants,food',
      'Retail': 'shopping',
      'Services': 'homeservices,auto,beautysvc'
    };

    const yelpCategory = category && category !== 'All' ? categoryMap[category] || '' : '';
    
    // Build Yelp API URL - search within ~5 miles (8000 meters)
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: '8000',
      limit: '20',
      sort_by: 'best_match'
    });

    if (yelpCategory) {
      params.set('categories', yelpCategory);
    }

    const yelpUrl = `https://api.yelp.com/v3/businesses/search?${params.toString()}`;
    console.log('Fetching directly from Yelp API');

    const response = await fetch(yelpUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    console.log('Yelp response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Yelp API error:', error);
      throw new Error(error.error?.description || 'Failed to fetch businesses from Yelp');
    }

    const data = await response.json();
    console.log('Received businesses:', data.businesses?.length);

    // Transform Yelp data to our Business format
    const businesses: Business[] = data.businesses.map((biz: any) => {
      // Determine category based on Yelp categories
      let category = 'Services';
      const categories = biz.categories.map((cat: any) => cat.alias);
      
      if (categories.some((c: string) => c.includes('restaurant') || c.includes('food'))) {
        category = 'Food';
      } else if (categories.some((c: string) => c.includes('shopping') || c.includes('retail'))) {
        category = 'Retail';
      }

      return {
        id: biz.id,
        name: biz.name,
        category,
        description: biz.categories.map((cat: any) => cat.title).join(', '),
        address: biz.location.address1 + (biz.location.city ? `, ${biz.location.city}` : ''),
        phone: biz.display_phone || biz.phone || 'N/A',
        image: biz.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        rating: biz.rating || 0,
        reviewCount: biz.review_count || 0,
        hasDeal: false,
        deal: undefined,
        distance: biz.distance ? (biz.distance * 0.000621371).toFixed(1) : null,
        url: biz.url
      };
    });

    return businesses;
  } catch (error: any) {
    console.error('Error fetching nearby businesses:', error);
    throw error;
  }
}