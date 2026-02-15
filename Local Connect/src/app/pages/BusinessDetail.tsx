import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { MapPin, Phone, Star, Heart, ArrowLeft, Tag } from 'lucide-react';
import Navigation from '../components/Navigation';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import { Business, Review } from '../types';
import { storage } from '../utils/storage';
import { initialReviews } from '../data/mockData';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  const loadData = () => {
    const businesses = storage.getBusinesses();
    const foundBusiness = businesses.find((b) => b.id === id);
    setBusiness(foundBusiness || null);

    let storedReviews = storage.getReviews();
    if (storedReviews.length === 0) {
      storage.setReviews(initialReviews);
      storedReviews = initialReviews;
    }

    const businessReviews = storedReviews.filter((r) => r.businessId === id);
    setReviews(businessReviews);

    if (id) {
      setIsFavorited(storage.isFavorite(id));
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleFavorite = () => {
    if (id) {
      const newState = storage.toggleFavorite(id);
      setIsFavorited(newState);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    // Remove the review
    const allReviews = storage.getReviews();
    const updatedReviews = allReviews.filter(r => r.id !== reviewId);
    storage.setReviews(updatedReviews);

    // Update business rating and review count
    if (id) {
      const businesses = storage.getBusinesses();
      const businessIndex = businesses.findIndex(b => b.id === id);
      
      if (businessIndex !== -1) {
        const businessReviews = updatedReviews.filter(r => r.businessId === id);
        
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

    // Reload all data to reflect changes
    loadData();
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">Business not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Businesses
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-80">
            <img
              src={business.image}
              alt={business.name}
              className="w-full h-full object-cover"
            />
            {business.hasDeal && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Special Deal Available
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded">
                  {business.category}
                </span>
              </div>
              <button
                onClick={handleFavorite}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Heart
                  className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
              </button>
            </div>

            <p className="text-gray-700 mb-6">{business.description}</p>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{business.rating.toFixed(1)}</span>
                <span className="text-gray-500">({business.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{business.address}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{business.phone}</span>
              </div>
            </div>

            {business.hasDeal && business.deal && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1">Current Deal</h3>
                    <p className="text-orange-800">{business.deal}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Reviews ({reviews.length})</h2>
          <div className="space-y-4 mb-8">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} onDelete={handleDeleteReview} />)
            )}
          </div>

          <ReviewForm businessId={business.id} onReviewSubmitted={loadData} />
        </div>
      </div>
    </div>
  );
}