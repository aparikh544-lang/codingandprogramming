// Calculate distance between two coordinates in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Convert distance to miles
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

// Format distance for display
export function formatDistance(km: number): string {
  const miles = kmToMiles(km);
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)} ft`; // Convert to feet for very short distances
  }
  return `${miles.toFixed(1)} mi`;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get GPS accuracy quality indicator
export function getAccuracyQuality(accuracyMeters: number | null): {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  color: string;
  description: string;
} {
  if (accuracyMeters === null) {
    return {
      quality: 'unknown',
      color: 'gray',
      description: 'Unknown'
    };
  }

  if (accuracyMeters <= 10) {
    return {
      quality: 'excellent',
      color: 'green',
      description: 'Excellent GPS signal'
    };
  } else if (accuracyMeters <= 50) {
    return {
      quality: 'good',
      color: 'blue',
      description: 'Good GPS signal'
    };
  } else if (accuracyMeters <= 100) {
    return {
      quality: 'fair',
      color: 'yellow',
      description: 'Fair GPS signal'
    };
  } else {
    return {
      quality: 'poor',
      color: 'red',
      description: 'Poor GPS signal'
    };
  }
}
