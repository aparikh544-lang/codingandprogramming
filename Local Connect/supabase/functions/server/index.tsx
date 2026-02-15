import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Signup endpoint
app.post('/make-server-62d44e75/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error('Signup endpoint error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Nearby businesses endpoint using Yelp API
app.get('/make-server-62d44e75/nearby-businesses', async (c) => {
  try {
    const latitude = c.req.query('latitude');
    const longitude = c.req.query('longitude');
    const category = c.req.query('category') || '';
    const clientApiKey = c.req.query('apiKey') || '';

    console.log('Nearby businesses request:', { latitude, longitude, category });

    if (!latitude || !longitude) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }

    // Try to get API key from client first, then fall back to server env
    const yelpApiKey = clientApiKey || Deno.env.get('YELP_API_KEY');
    if (!yelpApiKey) {
      console.error('YELP_API_KEY not configured');
      return c.json({ error: 'API key not configured' }, 500);
    }

    console.log('Yelp API key found, length:', yelpApiKey.length);

    // Map our categories to Yelp categories
    const categoryMap: Record<string, string> = {
      'Food': 'restaurants,food',
      'Retail': 'shopping',
      'Services': 'homeservices,auto,beautysvc'
    };

    const yelpCategory = category ? categoryMap[category] || '' : '';
    
    // Build Yelp API URL - search within ~5 miles (8000 meters)
    const params = new URLSearchParams({
      latitude,
      longitude,
      radius: '8000',
      limit: '20',
      sort_by: 'best_match'
    });

    if (yelpCategory) {
      params.set('categories', yelpCategory);
    }

    const yelpUrl = `https://api.yelp.com/v3/businesses/search?${params.toString()}`;
    console.log('Fetching from Yelp:', yelpUrl);

    const response = await fetch(yelpUrl, {
      headers: {
        'Authorization': `Bearer ${yelpApiKey}`,
        'Accept': 'application/json'
      }
    });

    console.log('Yelp response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Yelp API error response:', response.status, errorText);
      return c.json({ 
        error: 'Failed to fetch businesses from Yelp',
        details: errorText,
        status: response.status
      }, response.status);
    }

    const data = await response.json();
    console.log('Yelp returned businesses:', data.businesses?.length || 0);

    // Transform Yelp data to our Business format
    const businesses = data.businesses.map((biz: any) => {
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
        distance: biz.distance ? (biz.distance * 0.000621371).toFixed(1) : null, // Convert meters to miles
        url: biz.url
      };
    });

    return c.json({ businesses });
  } catch (error: any) {
    console.error('Nearby businesses endpoint error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Save API key endpoint (requires authentication)
app.post('/make-server-62d44e75/api-key', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return c.json({ error: 'No authorization header provided' }, 401);
    }

    // Extract JWT token from "Bearer <token>"
    const jwt = authHeader.replace('Bearer ', '');
    console.log('=== SAVE API KEY DEBUG ===');
    console.log('JWT length:', jwt.length);
    console.log('JWT first 20 chars:', jwt.substring(0, 20));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Anon Key exists:', !!supabaseAnonKey);
    console.log('Anon Key length:', supabaseAnonKey.length);
    
    if (!supabaseAnonKey) {
      console.error('SUPABASE_ANON_KEY not set in environment');
      return c.json({ error: 'Server configuration error' }, 500);
    }
    
    // Create Supabase client with anon key and pass JWT as options
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    });

    console.log('Calling getUser...');
    // Get the user from the JWT in the Authorization header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('getUser returned - user:', !!user, 'error:', !!authError);
    
    if (authError) {
      console.error('Authorization error while saving API key:', authError);
      console.error('Auth error details:', JSON.stringify(authError));
      console.error('Auth error name:', authError.name);
      console.error('Auth error message:', authError.message);
      console.error('Auth error status:', authError.status);
      return c.json({ error: `Authorization failed: ${authError.message}` }, 401);
    }

    if (!user?.id) {
      console.error('No user ID found in token');
      return c.json({ error: 'User not found in token' }, 401);
    }

    console.log(`Saving API key for user ${user.id}`);

    const { apiKey } = await c.req.json();
    
    if (!apiKey || typeof apiKey !== 'string') {
      return c.json({ error: 'API key is required' }, 400);
    }

    if (apiKey.length < 100) {
      return c.json({ error: 'Invalid API key. Yelp API keys are 128 characters long.' }, 400);
    }

    // Store API key in KV store with user ID as part of the key
    const kvKey = `user_api_key:${user.id}`;
    await kv.set(kvKey, apiKey);

    console.log(`✓ API key saved successfully for user ${user.id}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Save API key endpoint error:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: `Server error: ${error.message}` || 'Internal server error' }, 500);
  }
});

// Get API key endpoint (requires authentication)
app.get('/make-server-62d44e75/api-key', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return c.json({ error: 'No authorization header provided' }, 401);
    }

    // Extract JWT token from "Bearer <token>"
    const jwt = authHeader.replace('Bearer ', '');
    console.log('Getting API key - JWT length:', jwt.length);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    // Create Supabase client with anon key and pass JWT as options
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    });

    // Get the user from the JWT in the Authorization header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authorization error while getting API key:', authError);
      console.error('Auth error details:', JSON.stringify(authError));
      return c.json({ error: `Authorization failed: ${authError.message}` }, 401);
    }

    if (!user?.id) {
      console.error('No user found in token');
      return c.json({ error: 'User not found' }, 401);
    }

    console.log(`Getting API key for user ${user.id}`);

    // Get API key from KV store
    const kvKey = `user_api_key:${user.id}`;
    const apiKey = await kv.get(kvKey);

    if (!apiKey) {
      console.log(`No API key found for user ${user.id}`);
      return c.json({ apiKey: null });
    }

    console.log(`API key retrieved for user ${user.id}`);

    return c.json({ apiKey });
  } catch (error: any) {
    console.error('Get API key endpoint error:', error);
    return c.json({ error: `Server error: ${error.message}` || 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);