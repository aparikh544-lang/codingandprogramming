import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import BusinessCard from '../components/BusinessCard';
import { Business } from '../types';
import { storage } from '../utils/storage';
import { Tag } from 'lucide-react';

export default function DealsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const storedBusinesses = storage.getBusinesses();
    const businessesWithDeals = storedBusinesses.filter((b) => b.hasDeal);
    setBusinesses(businessesWithDeals);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold">Special Deals & Coupons</h1>
          </div>
          <p className="text-gray-600">Save money while supporting local businesses</p>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No active deals at the moment.</p>
            <p className="text-gray-400">Check back soon for new offers!</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              {businesses.length} {businesses.length === 1 ? 'deal' : 'deals'} available
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
