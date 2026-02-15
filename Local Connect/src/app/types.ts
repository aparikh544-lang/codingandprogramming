export interface Business {
  id: string;
  name: string;
  category: 'Food' | 'Retail' | 'Services';
  description: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  reviewCount: number;
  hasDeal: boolean;
  deal?: string;
  distance?: string | null;
  url?: string;
}

export interface Review {
  id: string;
  businessId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}