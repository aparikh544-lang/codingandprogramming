import { Link } from 'react-router';
import { Star, Heart, MapPin, Phone, Tag, ExternalLink } from 'lucide-react';
import { Business } from '../types';
import { storage } from '../utils/storage';
import { useState } from 'react';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const [isFavorited, setIsFavorited] = useState(storage.isFavorite(business.id));

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const newState = storage.toggleFavorite(business.id);
    setIsFavorited(newState);
  };

  return (
    <Link to={`/business/${business.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
          {business.hasDeal && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Deal
            </div>
          )}
          {business.distance && (
            <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {business.distance} mi
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{business.name}</h3>
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mt-1">
                {business.category}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {business.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{business.address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Phone className="w-4 h-4" />
            <span>{business.phone}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{business.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500 text-sm">({business.reviewCount} reviews)</span>
            </div>
            {business.url && (
              <ExternalLink className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}