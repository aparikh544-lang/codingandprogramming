import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Store, MapPin, Phone, Image as ImageIcon, FileText, Tag, AlertCircle, Crown, Info, Lock, Search, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';
import PremiumFeaturesModal from '../components/PremiumFeaturesModal';
import DuplicateBusinessWarning from '../components/DuplicateBusinessWarning';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { storage } from '../utils/storage';

export default function CreateBusinessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [existingBusinessCount, setExistingBusinessCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [potentialDuplicates, setPotentialDuplicates] = useState<any[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [userConfirmedDuplicate, setUserConfirmedDuplicate] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food' as 'Food' | 'Retail' | 'Services',
    description: '',
    address: '',
    phone: '',
    image: '',
    website: '',
    featured: false,
    verified: false
  });

  // Check if user already has a business
  useEffect(() => {
    const checkBusinessLimit = async () => {
      if (!user) {
        setCheckingLimit(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_businesses')
          .select('id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking business limit:', error);
        } else {
          setExistingBusinessCount(data?.length || 0);
        }
      } catch (err) {
        console.error('Exception checking business limit:', err);
      } finally {
        setCheckingLimit(false);
      }
    };

    checkBusinessLimit();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a business');
      return;
    }

    // Validation
    if (!formData.name || !formData.category || !formData.description || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if user has reached the business limit
    if (existingBusinessCount >= 1) {
      setError('You have reached the maximum number of businesses you can create. Each Business Owner Plan subscription includes 1 business only.');
      return;
    }

    // Check for potential duplicates (only if user hasn't confirmed)
    if (!userConfirmedDuplicate) {
      setCheckingDuplicates(true);
      setError('');
      try {
        // Search user-created businesses
        const { data: userBusinesses, error: userError } = await supabase
          .from('user_businesses')
          .select('*');

        if (userError) {
          console.error('Error checking for duplicates:', userError);
        }

        // Also check localStorage businesses (mock/Yelp data)
        const localBusinesses = storage.getBusinesses();

        // Combine and search for similar names/addresses
        const allDuplicates = [];
        
        // Check user businesses
        if (userBusinesses) {
          for (const biz of userBusinesses) {
            const nameSimilar = biz.name.toLowerCase().includes(formData.name.toLowerCase()) || 
                               formData.name.toLowerCase().includes(biz.name.toLowerCase());
            const addressSimilar = biz.address.toLowerCase().includes(formData.address.toLowerCase()) ||
                                  formData.address.toLowerCase().includes(biz.address.toLowerCase());
            
            if (nameSimilar && addressSimilar) {
              allDuplicates.push({
                id: biz.id,
                name: biz.name,
                address: biz.address,
                source: 'user' as const
              });
            }
          }
        }

        // Check local businesses (Yelp/mock data)
        for (const biz of localBusinesses) {
          const nameSimilar = biz.name.toLowerCase().includes(formData.name.toLowerCase()) || 
                             formData.name.toLowerCase().includes(biz.name.toLowerCase());
          const addressSimilar = biz.address.toLowerCase().includes(formData.address.toLowerCase()) ||
                                formData.address.toLowerCase().includes(biz.address.toLowerCase());
          
          if (nameSimilar && addressSimilar) {
            allDuplicates.push({
              id: biz.id,
              name: biz.name,
              address: biz.address,
              source: 'yelp' as const,
              yelpId: biz.id
            });
          }
        }

        setPotentialDuplicates(allDuplicates);

        if (allDuplicates.length > 0) {
          setShowDuplicateWarning(true);
          setCheckingDuplicates(false);
          return;
        }
      } catch (err) {
        console.error('Exception checking for duplicates:', err);
      } finally {
        setCheckingDuplicates(false);
      }
    }

    await createBusiness();
  };

  const createBusiness = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('user_businesses')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          address: formData.address,
          phone: formData.phone || 'N/A',
          image: formData.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          website: formData.website || null,
          featured: formData.featured,
          verified: formData.verified
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      alert(formData.featured 
        ? '✨ Featured business created successfully!' 
        : 'Business created successfully!');
      navigate('/');
    } catch (err: any) {
      console.error('Error creating business:', err);
      
      // Check if error is about missing columns
      if (err.message && err.message.includes('column')) {
        setError('Database schema error. Please ensure the verified column exists in user_businesses table. See supabase-setup-instructions.md');
      } else {
        setError('Failed to create business: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimYelpBusiness = async (yelpId: string, businessName: string, businessAddress: string) => {
    setLoading(true);
    setError('');

    try {
      // Check if this Yelp business is already claimed
      const { data: existingClaim, error: checkError } = await supabase
        .from('claimed_businesses')
        .select('*')
        .eq('yelp_id', yelpId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking existing claim:', checkError);
        throw new Error('Failed to check if business is already claimed');
      }

      if (existingClaim) {
        setError('This business has already been claimed by another user.');
        setLoading(false);
        return;
      }

      // Check if user already has a business or claim (1 max total)
      if (existingBusinessCount >= 1) {
        setError('You have reached the maximum number of businesses you can own. Each Business Owner Plan subscription includes 1 business only.');
        setLoading(false);
        return;
      }

      // Claim the business
      const { error: claimError } = await supabase
        .from('claimed_businesses')
        .insert({
          user_id: user.id,
          yelp_id: yelpId,
          business_name: businessName,
          business_address: businessAddress,
          featured: formData.featured,
          verified: formData.verified
        });

      if (claimError) {
        throw new Error(claimError.message);
      }

      alert('🎉 Business claimed successfully! You can now edit it from your profile.');
      navigate('/profile');
    } catch (err: any) {
      console.error('Error claiming business:', err);
      setError('Failed to claim business: ' + err.message);
    } finally {
      setLoading(false);
      setShowDuplicateWarning(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <h1 className="text-2xl font-bold">Login Required</h1>
            </div>
            <p className="text-gray-600 mb-4">
              You must be logged in to create a business listing.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In to Continue
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Store className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Create a Business</h1>
          </div>

          {/* Business Limit Notice - Show if checking or if they have a business */}
          {checkingLimit ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">Checking your business limit...</p>
            </div>
          ) : existingBusinessCount >= 1 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Business Limit Reached</h3>
                  <p className="text-sm text-red-800 mb-3">
                    You already have <strong>1 business</strong> created. Each subscription includes <strong>1 business slot only</strong>.
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>💡 Why only 1 business?</strong> This ensures quality listings, prevents spam, and keeps business owners accountable for accurate information.
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    <strong>Plan:</strong> Business Owner Plan - $5/month (Currently FREE during beta)
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/profile')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View My Business
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 border border-blue-300 rounded-lg p-1 mb-6">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Store className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">Business Owner Plan - $5/month</h3>
                    <div className="bg-green-50 border border-green-300 rounded-lg px-3 py-2 mb-3 inline-block">
                      <p className="text-sm font-bold text-green-700">🎉 FREE During Beta - No Payment Required!</p>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Create <strong>1 business listing</strong> with premium features included:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3 ml-4">
                      <li>✅ Featured placement with gold crown badge</li>
                      <li>✅ Verified business badge option</li>
                      <li>✅ Full analytics dashboard</li>
                      <li>✅ Top search results placement</li>
                      <li>✅ Premium styling & enhanced profile</li>
                    </ul>
                    <p className="text-xs text-gray-600 italic">
                      * Normally $5/month • Limited to 1 business per account • Helps maintain platform quality and prevent spam
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm mb-6">
            Add your business to LocalConnect and get discovered by local customers! 
            All businesses get featured placement with premium benefits.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Business Name"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Retail">Retail & Shopping</option>
                  <option value="Services">Services</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your business..."
                  rows={4}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, City, State"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Photo URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg (optional)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for a default image
              </p>
            </div>

            {/* Premium Features Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Premium Features (Free for Now!)</h3>
                    <button 
                      type="button"
                      onClick={() => setShowPremiumModal(true)}
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      See all features →
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    Enable premium features for your business to stand out and get more visibility!
                  </p>

                  {/* Featured Toggle */}
                  <label className="flex items-start cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Featured Business</span>
                      <p className="text-xs text-gray-600">
                        Top placement in search results with gold crown badge
                      </p>
                    </div>
                  </label>

                  {/* Verified Toggle */}
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Verified Business</span>
                      <p className="text-xs text-gray-600">
                        Display verification badge to build trust with customers
                      </p>
                    </div>
                  </label>

                  <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">✨ What You Get:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• 📊 Analytics Dashboard - Track views & engagement</li>
                      <li>• 🖼️ Photo Gallery - Showcase multiple images</li>
                      <li>• ✅ Trust Badges - Featured & verified marks</li>
                      <li>• 👑 Top Placement - Appear first in searches</li>
                      <li>• 📈 More Visibility - Get discovered easier</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Business...' : 'Create Business'}
            </button>
          </form>
        </div>
      </div>

      {/* Premium Features Modal */}
      {showPremiumModal && (
        <PremiumFeaturesModal
          onClose={() => setShowPremiumModal(false)}
          onSelect={(options) => {
            setFormData({ 
              ...formData, 
              featured: options.featured,
              verified: options.verified 
            });
            setShowPremiumModal(false);
          }}
        />
      )}

      {/* Duplicate Business Warning */}
      {showDuplicateWarning && (
        <DuplicateBusinessWarning
          duplicates={potentialDuplicates}
          onClose={() => setShowDuplicateWarning(false)}
          onClaimYelpBusiness={handleClaimYelpBusiness}
        />
      )}
    </div>
  );
}