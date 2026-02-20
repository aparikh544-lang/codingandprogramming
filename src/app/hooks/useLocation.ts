import { useState, useEffect, useRef } from 'react';
import { LocationState } from '../types';

interface UseLocationOptions {
  enableTracking?: boolean; // Enable continuous location tracking
  onLocationChange?: (lat: number, lng: number) => void; // Callback when location changes
}

export function useLocation(options: UseLocationOptions = {}) {
  const { enableTracking = false, onLocationChange } = options;
  
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null
  });
  
  const [accuracy, setAccuracy] = useState<number | null>(null); // GPS accuracy in meters
  const watchIdRef = useRef<number | null>(null);
  const previousLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const requestLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        loading: false,
        error: 'Geolocation is not supported by your browser'
      });
      return;
    }

    // Check if the page is served over HTTPS (required for geolocation)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('Geolocation requires HTTPS');
    }

    console.log('Requesting geolocation permission...');
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✓ Location permission granted:', position.coords.latitude, position.coords.longitude);
        const { latitude, longitude, accuracy: posAccuracy } = position.coords;
        
        setLocation({
          latitude,
          longitude,
          loading: false,
          error: null
        });
        setAccuracy(posAccuracy);
        
        previousLocationRef.current = { lat: latitude, lng: longitude };
        
        // Start continuous tracking if enabled
        if (enableTracking) {
          startWatchingPosition();
        }
      },
      (error) => {
        // This is expected in many environments - not a critical error
        console.log('ℹ️ Geolocation not available:', error.message);
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. This preview environment blocks automatic location.';
            console.log('💡 Tip: Use "Enter Location" button to manually enter coordinates, or try the NYC Demo button.');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your device location settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }

        setLocation({
          latitude: null,
          longitude: null,
          loading: false,
          error: errorMessage
        });
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 15000, // Increased to 15 seconds
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  const startWatchingPosition = () => {
    if (!navigator.geolocation) return;
    
    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    console.log('🔄 Starting real-time location tracking...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: posAccuracy } = position.coords;
        
        console.log('📍 Location update:', latitude, longitude, `(accuracy: ${posAccuracy}m)`);
        
        setLocation({
          latitude,
          longitude,
          loading: false,
          error: null
        });
        setAccuracy(posAccuracy);
        
        // Call the callback if location changed significantly
        if (onLocationChange && previousLocationRef.current) {
          const prevLat = previousLocationRef.current.lat;
          const prevLng = previousLocationRef.current.lng;
          
          // Only trigger callback if location changed by more than ~10 meters
          const distance = calculateDistance(prevLat, prevLng, latitude, longitude);
          if (distance > 0.01) { // ~10 meters
            onLocationChange(latitude, longitude);
          }
        }
        
        previousLocationRef.current = { lat: latitude, lng: longitude };
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true, // Use high accuracy for tracking
        timeout: 10000,
        maximumAge: 0 // Always get fresh location for tracking
      }
    );
  };

  const stopWatchingPosition = () => {
    if (watchIdRef.current !== null) {
      console.log('⏸️ Stopping location tracking...');
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      requestLocation();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopWatchingPosition();
    };
  }, []);

  // Handle tracking state changes
  useEffect(() => {
    if (enableTracking && location.latitude && location.longitude && !location.error) {
      startWatchingPosition();
    } else {
      stopWatchingPosition();
    }

    return () => stopWatchingPosition();
  }, [enableTracking, location.latitude, location.longitude]);

  return { 
    ...location, 
    accuracy,
    retry: requestLocation,
    isTracking: watchIdRef.current !== null
  };
}

// Helper function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}