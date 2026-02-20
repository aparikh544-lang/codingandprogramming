import { useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

interface ReviewFormProps {
  businessId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ businessId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const reviews = storage.getReviews();
    const newReview = {
      id: `r${Date.now()}`,
      businessId,
      userName: user.name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    reviews.push(newReview);
    storage.setReviews(reviews);

    // Update business rating
    const businesses = storage.getBusinesses();
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      const businessReviews = reviews.filter(r => r.businessId === businessId);
      const avgRating = businessReviews.reduce((sum, r) => sum + r.rating, 0) / businessReviews.length;
      business.rating = Math.round(avgRating * 10) / 10;
      business.reviewCount = businessReviews.length;
      storage.setBusinesses(businesses);
    }

    // Reset form
    setRating(0);
    setComment('');
    onReviewSubmitted();
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
        <h3 className="font-semibold text-lg mb-2">Sign in to leave a review</h3>
        <p className="text-gray-600 mb-4">You must be logged in to write a review</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold text-lg mb-4">Write a Review</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Review *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Share your experience..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0 || !comment.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Submit Review
      </button>
    </form>
  );
}