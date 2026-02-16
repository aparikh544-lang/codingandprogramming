import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, RefreshCw, Navigation2, Zap, ZapOff } from 'lucide-react';
import Navigation from '../components/Navigation';
import BusinessCard from '../components/BusinessCard';
import CategoryFilter from '../components/CategoryFilter';
import SortDropdown from '../components/SortDropdown';
import { Business } from '../types';
import { storage } from '../utils/storage';
import { initialBusinesses } from '../data/mockData';
import { useLocation } from '../hooks/useLocation';
import { fetchNearbyBusinesses } from '../services/businessService';
import { useAuth } from '../context/AuthContext';
import { calculateDistance, formatDistance, getAccuracyQuality } from '../utils/distance';

export default function HomePage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [useRealLocation, setUseRealLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Real-time tracking state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [lastRefreshLocation, setLastRefreshLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMoved, setDistanceMoved] = useState(0);
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
  
  const REFRESH_THRESHOLD_KM = 0.8; // ~0.5 miles

  // Handle location changes for real-time tracking
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    if (!lastRefreshLocation) return;
    
    const distance = calculateDistance(
      lastRefreshLocation.lat,
      lastRefreshLocation.lng,
      lat,
      lng
    );
    
    setDistanceMoved(distance);
    
    // If moved more than threshold, prompt for refresh
    if (distance >= REFRESH_THRESHOLD_KM && !showRefreshPrompt) {
      console.log(`📍 Moved ${formatDistance(distance)} - prompting for refresh`);
      setShowRefreshPrompt(true);
    }
  }, [lastRefreshLocation, showRefreshPrompt]);

  const location = useLocation({
    enableTracking: autoRefreshEnabled,
    onLocationChange: handleLocationChange
  });

  useEffect(() => {
    // Check if we should try to use real location
    if (!location.loading && location.latitude && location.longitude && !location.error) {
      loadRealBusinesses();
    } else if (!location.loading && location.error) {
      // If location failed due to permissions policy or other error, show manual entry
      console.log('Location unavailable, showing manual entry option');
      setShowManualEntry(true);
      loadMockBusinesses();
    } else if (!location.loading) {
      // Fall back to mock data if location failed or is unavailable
      loadMockBusinesses();
    }
  }, [location.loading]);

  const loadMockBusinesses = () => {
    let storedBusinesses = storage.getBusinesses();
    if (storedBusinesses.length === 0) {
      storage.setBusinesses(initialBusinesses);
      storedBusinesses = initialBusinesses;
    }
    setBusinesses(storedBusinesses);
    setUseRealLocation(false);
  };

  const loadRealBusinesses = async () => {
    if (!location.latitude || !location.longitude) {
      loadMockBusinesses();
      return;
    }

    setLoadingBusinesses(true);
    try {
      const nearbyBusinesses = await fetchNearbyBusinesses(
        location.latitude,
        location.longitude,
        selectedCategory,
        user?.id
      );
      setBusinesses(nearbyBusinesses);
      // Save real businesses to storage so they can be accessed on detail pages
      storage.setBusinesses(nearbyBusinesses);
      setUseRealLocation(true);
      setLastRefreshLocation({ lat: location.latitude, lng: location.longitude });
    } catch (error) {
      console.error('Failed to load real businesses:', error);
      loadMockBusinesses();
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const loadBusinessesWithManualLocation = async () => {
    const lat = parseFloat(manualLocation.lat);
    const lng = parseFloat(manualLocation.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude');
      return;
    }

    setLoadingBusinesses(true);
    setShowManualEntry(false);
    try {
      const nearbyBusinesses = await fetchNearbyBusinesses(
        lat,
        lng,
        selectedCategory,
        user?.id
      );
      setBusinesses(nearbyBusinesses);
      // Save real businesses to storage so they can be accessed on detail pages
      storage.setBusinesses(nearbyBusinesses);
      setUseRealLocation(true);
      setLastRefreshLocation({ lat, lng });
    } catch (error) {
      console.error('Failed to load real businesses:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to load businesses'}`);
      loadMockBusinesses();
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const loadNYCDemo = async () => {
    const lat = 40.7128;
    const lng = -74.0060;

    setManualLocation({ lat: lat.toString(), lng: lng.toString() });
    setLoadingBusinesses(true);
    setShowManualEntry(false);
    try {
      const nearbyBusinesses = await fetchNearbyBusinesses(
        lat,
        lng,
        selectedCategory,
        user?.id
      );
      setBusinesses(nearbyBusinesses);
      // Save real businesses to storage so they can be accessed on detail pages
      storage.setBusinesses(nearbyBusinesses);
      setUseRealLocation(true);
      setLastRefreshLocation({ lat, lng });
    } catch (error) {
      console.error('Failed to load real businesses:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to load businesses'}`);
      loadMockBusinesses();
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    
    if (useRealLocation && location.latitude && location.longitude) {
      setLoadingBusinesses(true);
      try {
        const nearbyBusinesses = await fetchNearbyBusinesses(
          location.latitude,
          location.longitude,
          category,
          user?.id
        );
        setBusinesses(nearbyBusinesses);
        // Save real businesses to storage so they can be accessed on detail pages
        storage.setBusinesses(nearbyBusinesses);
      } catch (error) {
        console.error('Failed to filter businesses:', error);
      } finally {
        setLoadingBusinesses(false);
      }
    }
  };

  const filteredAndSortedBusinesses = businesses
    .filter((business) => {
      const matchesCategory = !useRealLocation ? (selectedCategory === 'All' || business.category === selectedCategory) : true;
      const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           business.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'reviews-desc':
          return b.reviewCount - a.reviewCount;
        case 'reviews-asc':
          return a.reviewCount - b.reviewCount;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Local Businesses</h1>
          <p className="text-gray-600">Support your community and find amazing local spots</p>
        </div>

        {location.loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-800">Getting your location...</span>
            </div>
          </div>
        )}

        {location.error && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-orange-800 font-medium">{location.error}</p>
                  <p className="text-orange-700 text-sm">Showing sample businesses instead.</p>
                  <p className="text-orange-700 text-sm mt-2">
                    <strong>To enable:</strong> Click the lock icon 🔒 in your address bar → Allow Location → Refresh
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Enter Location
                </button>
                <button
                  onClick={location.retry}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
                >
                  Retry
                </button>
              </div>
            </div>
            
            {showManualEntry && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-orange-300">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Enter your coordinates manually</strong> (Find them at <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">latlong.net</a>)
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      placeholder="e.g., 40.7128"
                      value={manualLocation.lat}
                      onChange={(e) => setManualLocation({ ...manualLocation, lat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      placeholder="e.g., -74.0060"
                      value={manualLocation.lng}
                      onChange={(e) => setManualLocation({ ...manualLocation, lng: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadBusinessesWithManualLocation}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Find Businesses
                  </button>
                  <button
                    onClick={loadNYCDemo}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Use NYC (Demo)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {useRealLocation && location.latitude && location.longitude && (
          <div className="space-y-4 mb-6">
            {/* Location status card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="text-green-800 font-medium block">
                      Showing real businesses within 5 miles
                    </span>
                    {location.accuracy && (
                      <span className={`text-xs text-${getAccuracyQuality(location.accuracy).color}-600`}>
                        {getAccuracyQuality(location.accuracy).description} (±{Math.round(location.accuracy)}m)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    autoRefreshEnabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={autoRefreshEnabled ? 'Disable live tracking' : 'Enable live tracking'}
                >
                  {autoRefreshEnabled ? (
                    <>
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">Live Tracking ON</span>
                    </>
                  ) : (
                    <>
                      <ZapOff className="w-4 h-4" />
                      <span className="text-sm">Enable Live Tracking</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Real-time tracking indicator */}
            {autoRefreshEnabled && location.isTracking && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Navigation2 className="w-5 h-5 text-blue-600 animate-pulse" />
                  <div>
                    <span className="text-blue-800 font-medium block">
                      🔴 Live tracking active
                    </span>
                    <span className="text-blue-700 text-sm">
                      We'll notify you when you move {formatDistance(REFRESH_THRESHOLD_KM)} or more
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Refresh prompt when user has moved */}
            {showRefreshPrompt && distanceMoved >= REFRESH_THRESHOLD_KM && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Navigation2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <span className="text-purple-800 font-medium block">
                        You've moved {formatDistance(distanceMoved)}!
                      </span>
                      <span className="text-purple-700 text-sm">
                        Refresh to see businesses in your new location
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        loadRealBusinesses();
                        setShowRefreshPrompt(false);
                        setDistanceMoved(0);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                    >
                      Refresh Now
                    </button>
                    <button
                      onClick={() => setShowRefreshPrompt(false)}
                      className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors whitespace-nowrap"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {loadingBusinesses ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Loading nearby businesses...</p>
          </div>
        ) : filteredAndSortedBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No businesses found matching your criteria.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Showing {filteredAndSortedBusinesses.length} {filteredAndSortedBusinesses.length === 1 ? 'business' : 'businesses'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}