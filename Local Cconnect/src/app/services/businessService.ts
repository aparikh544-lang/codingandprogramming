import { Business } from '../types';
import { supabase } from '../utils/supabase';

// Cache the API key in memory for the session
let cachedApiKey: string | null = null;

// ============================================================================
// 🔑 DEFAULT YELP API KEY CONFIGURATION
// ============================================================================
// Replace the value below with your actual Yelp API key to enable the app
// for all users without requiring them to enter their own key.
//
// Get a free Yelp API key at: https://www.yelp.com/developers/v3/manage_app
// 
// For production apps, use an environment variable instead:
// const DEFAULT_API_KEY = import.meta.env.VITE_YELP_API_KEY;
// ============================================================================
const DEFAULT_API_KEY = 'Ds5GqgzDjqeJjpUIjHAUxaYAmVYgflAoxzj48khXuwP1qaPG4I4-UfK-mwVcMUBHIlXPlk8bd-nAY0nV8eP3TiKhOq3UbVaTt7X8R9mLKLYZWHGP9hVYpVgwAKiOaXYx'; // 👈 Paste your Yelp API key here!

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

  // Use default shared API key as final fallback
  if (DEFAULT_API_KEY && DEFAULT_API_KEY !== 'YOUR_DEFAULT_YELP_API_KEY_HERE') {
    console.log('✓ Using default shared API key');
    cachedApiKey = DEFAULT_API_KEY;
    return DEFAULT_API_KEY;
  }

  console.warn('No API key found - please set DEFAULT_API_KEY in businessService.ts');
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
    
    let yelpBusinesses: Business[] = [];
    
    // Fetch from Yelp API if key is available
    if (apiKey) {
      // Map our categories to Yelp categories - using comprehensive lists
      const categoryMap: Record<string, string> = {
        'Food': 'restaurants,food,coffee,cafes,bakeries,bars,nightlife,desserts,icecream,pizza,sandwiches,breakfast_brunch,burgers,mexican,italian,chinese,thai,japanese,sushi,korean,vietnamese,indian',
        'Retail': 'shopping,fashion,shoppingcenters,departmentstores,outlet_stores,vintage,thriftstores,bookstores,electronics,homedecor,furniture,jewelry,cosmetics,drugstores,convenience,grocery,flowers,petstore,toys,sportgoods,bicycles,arts_crafts',
        'Services': 'homeservices,auto,beautysvc,hair,spas,massage,barbers,nails,skincare,makeupartists,tattooparlors,dentists,lawyers,accountants,realestate,photographers,eventservices,florists,pet_services,gyms,fitness,yoga,pilates,mobilephonerepair,dryclean,laundry,locksmiths,plumbing,electricians,contractors'
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

      if (response.ok) {
        const data = await response.json();
        console.log('Received businesses from Yelp:', data.businesses?.length);

        // Transform Yelp data to our Business format
        yelpBusinesses = data.businesses.map((biz: any) => {
          // Determine category based on Yelp categories
          let category = 'Services'; // Default to Services
          const categories = biz.categories.map((cat: any) => cat.alias);
          
          // Check for Food category first (most specific)
          if (categories.some((c: string) => 
            c.includes('restaurant') || c.includes('food') || c.includes('cafe') || 
            c.includes('coffee') || c.includes('bakeries') || c.includes('bar') || 
            c.includes('dessert') || c.includes('pizza') || c.includes('sandwich')
          )) {
            category = 'Food';
          } 
          // Check for Retail category
          else if (categories.some((c: string) => 
            c.includes('shopping') || c.includes('retail') || c.includes('store') || 
            c.includes('shop') || c.includes('boutique') || c.includes('market') || 
            c.includes('pharmacy') || c.includes('drugstore') || c.includes('grocery') ||
            c.includes('bookstore') || c.includes('electronics') || c.includes('fashion') ||
            c.includes('jewelry') || c.includes('furniture') || c.includes('flowers')
          )) {
            category = 'Retail';
          }
          // Everything else is Services (spa, salon, gym, lawyer, dentist, auto, etc.)

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
      } else {
        console.error('Yelp API error:', await response.json());
      }
    }

    // Fetch user-created businesses from Supabase
    let userBusinesses: Business[] = [];
    try {
      console.log('Fetching user-created businesses from Supabase');
      const { data, error } = await supabase
        .from('user_businesses')
        .select('*');

      if (error) {
        console.error('Error fetching user businesses:', error);
      } else if (data && data.length > 0) {
        console.log('Received user-created businesses:', data.length);
        
        // Transform user businesses to Business format
        userBusinesses = data.map((biz: any) => ({
          id: `user-${biz.id}`,
          name: biz.name,
          category: biz.category,
          description: biz.description,
          address: biz.address,
          phone: biz.phone || 'N/A',
          image: biz.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          rating: 0,
          reviewCount: 0,
          hasDeal: false,
          deal: undefined,
          distance: null,
          url: biz.website || undefined
        }));

        // Filter by category if specified
        if (category && category !== 'All') {
          userBusinesses = userBusinesses.filter(b => b.category === category);
        }
      }
    } catch (error) {
      console.error('Exception fetching user businesses:', error);
    }

    // Combine both lists (user businesses first, then Yelp)
    const allBusinesses = [...userBusinesses, ...yelpBusinesses];
    console.log('Total businesses (user + Yelp):', allBusinesses.length);
    
    return allBusinesses;
  } catch (error: any) {
    console.error('Error fetching nearby businesses:', error);
    throw error;
  }
}