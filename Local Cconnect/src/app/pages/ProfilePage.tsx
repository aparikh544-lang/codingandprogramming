import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Star, Heart, LogOut, Store, Trash2, AlertCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { Review, Business } from '../types';
import { supabase } from '../utils/supabase';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [userBusinesses, setUserBusinesses] = useState<any[]>([]);
  const [deletingBusinessId, setDeletingBusinessId] = useState<string | null>(null);

  const loadUserData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get user's reviews
    const allReviews = storage.getReviews();
    const reviews = allReviews.filter(r => r.userName === user.name);
    setUserReviews(reviews);

    // Get favorite count
    const favorites = storage.getFavorites();
    setFavoriteCount(favorites.length);

    // Fetch user's created businesses from Supabase
    try {
      const { data, error } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user businesses:', error);
      } else {
        setUserBusinesses(data || []);
      }
    } catch (error) {
      console.error('Exception fetching user businesses:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user, navigate]);

  const handleDeleteBusiness = async (businessId: string, businessName: string) => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingBusinessId(businessId);

    try {
      const { error } = await supabase
        .from('user_businesses')
        .delete()
        .eq('id', businessId);

      if (error) {
        throw new Error(error.message);
      }

      alert('Business deleted successfully!');
      // Reload user data to reflect changes
      loadUserData();
    } catch (err: any) {
      console.error('Error deleting business:', err);
      alert('Failed to delete business: ' + err.message);
    } finally {
      setDeletingBusinessId(null);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    // Remove the review
    const allReviews = storage.getReviews();
    const reviewToDelete = allReviews.find(r => r.id === reviewId);
    const updatedReviews = allReviews.filter(r => r.id !== reviewId);
    storage.setReviews(updatedReviews);

    // Update business rating and review count
    if (reviewToDelete) {
      const businesses = storage.getBusinesses();
      const businessIndex = businesses.findIndex(b => b.id === reviewToDelete.businessId);
      
      if (businessIndex !== -1) {
        const businessReviews = updatedReviews.filter(r => r.businessId === reviewToDelete.businessId);
        
        if (businessReviews.length > 0) {
          const avgRating = businessReviews.reduce((sum, r) => sum + r.rating, 0) / businessReviews.length;
          businesses[businessIndex].rating = Math.round(avgRating * 10) / 10;
          businesses[businessIndex].reviewCount = businessReviews.length;
        } else {
          // No reviews left, reset to default
          businesses[businessIndex].rating = 0;
          businesses[businessIndex].reviewCount = 0;
        }
        
        storage.setBusinesses(businesses);
      }
    }

    // Reload user data to reflect changes
    loadUserData();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{userReviews.length}</p>
                  <p className="text-gray-600">Reviews Written</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{favoriteCount}</p>
                  <p className="text-gray-600">Favorites</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{userBusinesses.length}</p>
                  <p className="text-gray-600">Businesses Created</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Created Businesses */}
        {userBusinesses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Store className="w-6 h-6 text-green-600" />
                Your Businesses
              </h2>
              <button
                onClick={() => navigate('/create-business')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Another
              </button>
            </div>
            <div className="space-y-4">
              {userBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{business.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {business.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{business.description}</p>
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <span>📍 {business.address}</span>
                        {business.phone && <span>📞 {business.phone}</span>}
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            🌐 {business.website}
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteBusiness(business.id, business.name)}
                      disabled={deletingBusinessId === business.id}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete business"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {deletingBusinessId === business.id ? 'Deleting...' : 'Delete'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {userReviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-4">Your Recent Reviews</h2>
            <div className="space-y-4">
              {userReviews.slice(0, 5).map((review) => {
                const businesses = storage.getBusinesses();
                const business = businesses.find(b => b.id === review.businessId);
                
                return (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold mb-2">{business?.name || 'Business'}</h3>
                    <ReviewCard review={review} onDelete={handleDeleteReview} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}