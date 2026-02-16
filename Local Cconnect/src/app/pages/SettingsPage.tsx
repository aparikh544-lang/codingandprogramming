import { useState, useEffect } from 'react';
import { Save, User, Bell, Eye, AlertCircle, Check } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    locationSharing: true,
    autoRefresh: false,
    showDistance: true,
    defaultCategory: 'All',
    savedSuccessfully: false
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('user_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // Save preferences to localStorage
    const toSave = { ...preferences };
    delete toSave.savedSuccessfully;
    localStorage.setItem('user_preferences', JSON.stringify(toSave));
    
    setPreferences(prev => ({ ...prev, savedSuccessfully: true }));
    
    setTimeout(() => {
      setPreferences(prev => ({ ...prev, savedSuccessfully: false }));
    }, 3000);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof preferences]
    }));
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
              You must be logged in to access settings.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In to Continue
            </a>
          </div>
        ) : (
          <>
            {/* Account Info Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold">Account Information</h1>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={user.email || 'Not available'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="text"
                    value={user.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about deals and new businesses</p>
                  </div>
                  <button
                    onClick={() => togglePreference('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Display & Privacy Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold">Display & Privacy</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Location Sharing</h3>
                    <p className="text-sm text-gray-600">Allow the app to use your GPS location</p>
                  </div>
                  <button
                    onClick={() => togglePreference('locationSharing')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.locationSharing ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.locationSharing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Auto-Refresh on Movement</h3>
                    <p className="text-sm text-gray-600">Automatically refresh businesses when you move</p>
                  </div>
                  <button
                    onClick={() => togglePreference('autoRefresh')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Show Distance</h3>
                    <p className="text-sm text-gray-600">Display distance to businesses on cards</p>
                  </div>
                  <button
                    onClick={() => togglePreference('showDistance')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.showDistance ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.showDistance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Default Category Filter</label>
                  <select
                    value={preferences.defaultCategory}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultCategory: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Retail">Retail</option>
                    <option value="Services">Services</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">The default category shown when you open the app</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                preferences.savedSuccessfully
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {preferences.savedSuccessfully ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🎉 No API Key Needed!</h3>
              <p className="text-sm text-blue-800">
                LocalConnect now works out-of-the-box with real Yelp data. Just log in and start exploring businesses near you!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}