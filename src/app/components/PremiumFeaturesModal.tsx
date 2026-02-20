import { 
  Crown, X, Check, TrendingUp, Images, Shield, Clock, 
  Users, Star, Zap, Award, Sparkles, BarChart3 
} from 'lucide-react';
import { useState } from 'react';

interface PremiumFeaturesModalProps {
  onClose: () => void;
  onSelect: (options: { featured: boolean; verified: boolean }) => void;
}

export default function PremiumFeaturesModal({ onClose, onSelect }: PremiumFeaturesModalProps) {
  const [featured, setFeatured] = useState(false);
  const [verified, setVerified] = useState(false);

  const features = [
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Top Placement",
      description: "Always appear first in search results",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Track views, clicks, and engagement",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Images className="w-6 h-6" />,
      title: "Photo Gallery",
      description: "Showcase up to 10 business photos",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Badge",
      description: "Build trust with a verified checkmark",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      description: "Display your operating hours",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Media Links",
      description: "Connect all your social profiles",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Custom Badge",
      description: "Add 'Family Owned', 'Local Favorite', etc.",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Premium Styling",
      description: "Eye-catching gold border & highlights",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance Reports",
      description: "Weekly email reports with insights",
      color: "bg-teal-100 text-teal-600"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Featured Badge",
      description: "Gold crown displayed on your listing",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "3x More Visibility",
      description: "Get seen by significantly more customers",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Enhanced Profile",
      description: "Rich, detailed business page",
      color: "bg-red-100 text-red-600"
    }
  ];

  const handleApply = () => {
    onSelect({ featured, verified });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-10 h-10 text-white" />
            <h2 className="text-3xl font-bold text-white">Premium Features</h2>
          </div>
          <p className="text-white/90">Everything you need to stand out and grow</p>
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <p className="text-white text-sm">
              ✨ <strong>Free for now!</strong> We're building an amazing platform and want you to try everything.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">All Premium Features:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Selection Options */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Features for Your Business:</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-900">Featured Business</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Top placement in search results, gold crown badge, premium styling, and enhanced visibility
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-4 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Verified Business</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Display verification badge to build trust and credibility with customers
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* What's Included Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2">What You'll Get:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {featured && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Top search placement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Gold crown badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Premium styling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Analytics dashboard</span>
                  </div>
                </>
              )}
              {verified && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Verified badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Trust indicator</span>
                  </div>
                </>
              )}
              {!featured && !verified && (
                <div className="col-span-2 text-center text-gray-500 text-sm py-4">
                  Select features above to see what's included
                </div>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">💡 Why Use Premium Features?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl mb-2">👀</div>
                <p className="font-semibold text-sm mb-1">More Visibility</p>
                <p className="text-xs text-gray-600">Stand out from competitors and get noticed first</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl mb-2">🤝</div>
                <p className="font-semibold text-sm mb-1">Build Trust</p>
                <p className="text-xs text-gray-600">Verified badges help customers trust your business</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl mb-2">📈</div>
                <p className="font-semibold text-sm mb-1">Track Growth</p>
                <p className="text-xs text-gray-600">See how your business performs with analytics</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {featured || verified ? 'Apply Selected Features' : 'Continue Without Premium'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            ✨ All features are free while we're in beta • More features coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
