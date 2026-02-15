import { useState, useEffect } from 'react';
import { Save, Key, AlertCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { clearApiKeyCache } from '../services/businessService';
import { supabase } from '../utils/supabase';

export default function SettingsPage() {
  const { user, session } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && session?.access_token) {
      loadApiKey();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const loadApiKey = async () => {
    if (!session?.access_token) return;

    try {
      console.log('=== LOADING API KEY FROM SUPABASE TABLE ===');
      console.log('User ID:', user?.id);

      const { data, error } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No API key found yet - this is ok
          console.log('No API key found for user (this is normal for first time)');
        } else {
          console.error('Error loading API key:', error);
          setError(`Failed to load API key: ${error.message}`);
        }
      } else if (data?.api_key) {
        setApiKey(data.api_key);
        console.log('✓ API key loaded successfully');
      }
    } catch (error) {
      console.error('Exception while loading API key:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !session?.access_token) {
      setError('You must be logged in to save an API key');
      return;
    }

    if (apiKey.length < 100) {
      setError('Invalid API key. Yelp API keys are 128 characters long.');
      return;
    }

    setError('');
    setSaved(false);

    try {
      console.log('=== SAVING API KEY TO SUPABASE TABLE ===');
      console.log('User ID:', user?.id);
      console.log('API key length:', apiKey.length);

      // Try to upsert (insert or update) the API key
      const { error: upsertError } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          api_key: apiKey,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('Error saving API key:', upsertError);
        throw new Error(upsertError.message);
      }

      console.log('✓ API key saved successfully to database');

      // Clear the cached API key so it gets refreshed next time
      clearApiKeyCache();

      setSaved(true);
      
      setTimeout(() => {
        alert('API Key saved to your account! It will now work on all your devices.');
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      console.error('Error saving API key:', error);
      setError(error.message || 'Failed to save API key');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <h1 className="text-2xl font-bold">Login Required</h1>
            </div>
            <p className="text-gray-600 mb-4">
              You must be logged in to manage your API key settings. Your API key will be securely stored in your account and work on all your devices.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In to Continue
            </a>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-center">Loading your settings...</p>
          </div>
        ) : (
          <>
            {error && !apiKey && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">No API key found</p>
                    <p className="text-xs text-yellow-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Key className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold">API Settings</h1>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Yelp API Key</h2>
                <p className="text-gray-600 text-sm mb-4">
                  To use real location-based business discovery, you need a free Yelp API key.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How to get your free API key:</h3>
                  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                    <li>Go to <a href="https://www.yelp.com/developers/v3/manage_app" target="_blank" rel="noopener noreferrer" className="underline font-medium">Yelp Developers</a></li>
                    <li>Sign up (free, no credit card needed)</li>
                    <li>Click "Create New App"</li>
                    <li>Fill in app details (name: LocalConnect, industry: Web Development)</li>
                    <li>Copy your 128-character API Key</li>
                    <li>Paste it below</li>
                  </ol>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (128 characters)
                </label>
                <textarea
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Yelp API key here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Characters: {apiKey.length} / 128
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="w-5 h-5" />
                {saved ? 'Saved!' : 'Save API Key'}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✓ Secure & Synced</h3>
              <p className="text-sm text-green-800">
                Your API key is securely stored in your account and will work on all your devices automatically!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}