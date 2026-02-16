import { Star, CheckCircle, Trash2 } from 'lucide-react';
import { Review } from '../types';
import { useAuth } from '../context/AuthContext';

interface ReviewCardProps {
  review: Review;
  onDelete?: (reviewId: string) => void;
}

export default function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const { user } = useAuth();
  const canDelete = user && user.name === review.userName;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      onDelete?.(review.id);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{review.userName}</span>
            {review.verified && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
          </div>
          <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          {canDelete && onDelete && (
            <button
              onClick={handleDelete}
              className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
}