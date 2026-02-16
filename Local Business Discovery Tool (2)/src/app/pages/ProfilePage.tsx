import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Star, Heart, LogOut } from 'lucide-react';
import Navigation from '../components/Navigation';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { Review } from '../types';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const loadUserData = () => {
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
  };

  useEffect(() => {
    loadUserData();
  }, [user, navigate]);

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
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
          </div>
        </div>

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