import { AlertCircle, ExternalLink, ArrowRight, CheckCircle, Crown } from 'lucide-react';

interface DuplicateBusinessWarningProps {
  duplicates: Array<{
    id: string;
    name: string;
    address: string;
    source: 'user' | 'yelp';
    yelpId?: string;
  }>;
  onClose: () => void;
  onClaimYelpBusiness: (yelpId: string, businessName: string, businessAddress: string) => void;
}

export default function DuplicateBusinessWarning({
  duplicates,
  onClose,
  onClaimYelpBusiness
}: DuplicateBusinessWarningProps) {
  const yelpBusinesses = duplicates.filter(d => d.source === 'yelp');
  const userBusinesses = duplicates.filter(d => d.source === 'user');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-yellow-900 mb-2">⚠️ This Business Already Exists!</h2>
            <p className="text-sm text-gray-700 mb-4">
              We found <strong>{duplicates.length}</strong> existing business{duplicates.length > 1 ? 'es' : ''} with a similar name and/or address.
              <strong className="text-red-600"> You cannot create duplicates.</strong>
            </p>

            {/* Yelp Businesses - Can be claimed */}
            {yelpBusinesses.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ✅ Available to Claim ({yelpBusinesses.length})
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  These businesses are from Yelp. Click "Claim" to take ownership!
                </p>
                <div className="space-y-3">
                  {yelpBusinesses.map((dup, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{dup.name}</p>
                          <p className="text-sm text-gray-600">📍 {dup.address}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full mt-2">
                            From Yelp API
                          </span>
                        </div>
                        <button
                          onClick={() => onClaimYelpBusiness(dup.yelpId || dup.id, dup.name, dup.address)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
                        >
                          <Crown className="w-4 h-4" />
                          Claim This!
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Businesses - Already owned */}
            {userBusinesses.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  🔒 Already Owned ({userBusinesses.length})
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  These businesses are already owned by other users.
                </p>
                <div className="space-y-3">
                  {userBusinesses.map((dup, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-70">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{dup.name}</p>
                          <p className="text-sm text-gray-600">📍 {dup.address}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-2">
                            User-Created Business
                          </span>
                        </div>
                        <a
                          href={`/business/user-${dup.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          View <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-800 mb-2">
                <strong>💡 Why can't I create a new listing?</strong>
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Duplicate businesses confuse customers and hurt your credibility. Instead:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>✅ <strong>Claim</strong> Yelp businesses to take ownership</li>
                <li>✅ Add your own description, photos, and branding</li>
                <li>✅ Enable featured placement and verified badges</li>
                <li>✅ Maintain one authoritative listing</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                ← Go Back
              </button>
              {yelpBusinesses.length === 0 && userBusinesses.length > 0 && (
                <p className="text-xs text-center text-gray-600 italic">
                  💡 This business is already listed. If you own it, contact support to claim ownership.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}