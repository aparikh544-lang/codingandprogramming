import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  TrendingUp, Eye, MousePointer, Phone, ExternalLink, 
  Calendar, Users, Star, ArrowUp, ArrowDown, Crown
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

interface AnalyticsData {
  views: number;
  clicks: number;
  phoneClicks: number;
  websiteClicks: number;
  favorites: number;
  avgTimeOnPage: number;
  conversionRate: number;
  viewsThisWeek: number[];
  clicksThisWeek: number[];
}

export default function BusinessAnalyticsPage() {
  const { businessId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadBusinessAndAnalytics();
  }, [businessId, user]);

  const loadBusinessAndAnalytics = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Load business details
      const { data: businessData, error: businessError } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('id', businessId?.replace('user-', ''))
        .single();

      if (businessError) throw businessError;

      // Check if user owns this business
      if (businessData.user_id !== user.id) {
        alert('You do not have permission to view these analytics');
        navigate('/profile');
        return;
      }

      setBusiness(businessData);

      // Load or generate analytics (mock data for now)
      // In production, you'd track this in a separate analytics table
      const mockAnalytics: AnalyticsData = {
        views: Math.floor(Math.random() * 500) + 200,
        clicks: Math.floor(Math.random() * 100) + 50,
        phoneClicks: Math.floor(Math.random() * 30) + 10,
        websiteClicks: Math.floor(Math.random() * 40) + 15,
        favorites: Math.floor(Math.random() * 50) + 20,
        avgTimeOnPage: Math.floor(Math.random() * 60) + 30,
        conversionRate: Math.random() * 15 + 5,
        viewsThisWeek: Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 20),
        clicksThisWeek: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5)
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      alert('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!business || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Analytics not found</p>
        </div>
      </div>
    );
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxViews = Math.max(...analytics.viewsThisWeek);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">{business.name}</h1>
            {business.featured && (
              <Crown className="w-6 h-6 text-yellow-500" />
            )}
          </div>
          <p className="text-gray-600">Analytics Dashboard - Last 30 Days</p>
          {!business.featured && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                🔒 <strong>Upgrade to Featured</strong> to unlock detailed analytics, photo galleries, and priority support!
                <button 
                  onClick={() => navigate('/create-business')}
                  className="ml-2 text-yellow-700 underline hover:text-yellow-900"
                >
                  Upgrade Now
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Eye className="w-6 h-6" />}
            label="Total Views"
            value={analytics.views.toLocaleString()}
            change={12.5}
            color="blue"
          />
          <MetricCard
            icon={<MousePointer className="w-6 h-6" />}
            label="Total Clicks"
            value={analytics.clicks.toLocaleString()}
            change={8.3}
            color="green"
          />
          <MetricCard
            icon={<Phone className="w-6 h-6" />}
            label="Phone Calls"
            value={analytics.phoneClicks.toLocaleString()}
            change={15.7}
            color="purple"
          />
          <MetricCard
            icon={<Star className="w-6 h-6" />}
            label="Favorites"
            value={analytics.favorites.toLocaleString()}
            change={5.2}
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Views This Week</h3>
            <div className="flex items-end justify-between h-48 gap-2">
              {analytics.viewsThisWeek.map((views, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blue-100 rounded-t-lg relative" style={{ height: `${(views / maxViews) * 100}%`, minHeight: '20px' }}>
                    <div className="absolute -top-6 left-0 right-0 text-center text-xs font-medium text-gray-700">
                      {views}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{days[index]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement</h3>
            <div className="space-y-4">
              <EngagementBar
                label="Phone Clicks"
                value={analytics.phoneClicks}
                total={analytics.clicks}
                color="bg-purple-500"
              />
              <EngagementBar
                label="Website Visits"
                value={analytics.websiteClicks}
                total={analytics.clicks}
                color="bg-blue-500"
              />
              <EngagementBar
                label="Favorites"
                value={analytics.favorites}
                total={analytics.views}
                color="bg-yellow-500"
              />
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-2xl font-bold text-green-600">{analytics.conversionRate.toFixed(1)}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Views to Actions</p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Time on Page</p>
              <p className="text-2xl font-bold">{analytics.avgTimeOnPage}s</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Click-Through Rate</p>
              <p className="text-2xl font-bold">{((analytics.clicks / analytics.views) * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Engagement Score</p>
              <p className="text-2xl font-bold text-green-600">
                {((analytics.clicks + analytics.favorites) / analytics.views * 100).toFixed(0)}/100
              </p>
            </div>
          </div>
        </div>

        {/* Premium Upsell */}
        {!business.featured && (
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Crown className="w-12 h-12 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Unlock Premium Analytics</h3>
                <p className="text-gray-700 mb-4">
                  Get access to advanced insights, photo galleries, verified badges, and much more for just $49.99/month.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Real-time analytics & notifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Photo gallery (up to 10 images)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Verified business badge</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Top placement in search results</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Priority customer support</span>
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/create-business')}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
                >
                  Upgrade to Featured - $49.99/month
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  change, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  change: number; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold mb-2">{value}</p>
      <div className="flex items-center gap-1 text-sm">
        {change >= 0 ? (
          <>
            <ArrowUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600">+{change}%</span>
          </>
        ) : (
          <>
            <ArrowDown className="w-4 h-4 text-red-600" />
            <span className="text-red-600">{change}%</span>
          </>
        )}
        <span className="text-gray-500">vs last month</span>
      </div>
    </div>
  );
}

function EngagementBar({ 
  label, 
  value, 
  total, 
  color 
}: { 
  label: string; 
  value: number; 
  total: number; 
  color: string;
}) {
  const percentage = (value / total) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
