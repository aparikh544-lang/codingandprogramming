import { Business, Review } from '../types';

export const initialBusinesses: Business[] = [
  {
    id: '1',
    name: "Sophie's Artisan Bakery",
    category: 'Food',
    description: 'Fresh baked goods and pastries made daily with locally sourced ingredients.',
    address: '123 Main Street',
    phone: '(555) 123-4567',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    rating: 4.8,
    reviewCount: 42,
    hasDeal: true,
    deal: '15% off all pastries before 9 AM'
  },
  {
    id: '2',
    name: 'Green Leaf Bookstore',
    category: 'Retail',
    description: 'Independent bookstore featuring local authors and rare finds.',
    address: '456 Oak Avenue',
    phone: '(555) 234-5678',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    rating: 4.9,
    reviewCount: 67,
    hasDeal: false
  },
  {
    id: '3',
    name: 'Urban Bike Repair',
    category: 'Services',
    description: 'Expert bicycle repair and maintenance services for all bike types.',
    address: '789 Elm Street',
    phone: '(555) 345-6789',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
    rating: 4.7,
    reviewCount: 28,
    hasDeal: true,
    deal: 'Free safety inspection with any repair'
  },
  {
    id: '4',
    name: 'The Daily Grind Coffee',
    category: 'Food',
    description: 'Specialty coffee roasted in-house with a cozy atmosphere.',
    address: '321 Maple Drive',
    phone: '(555) 456-7890',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
    rating: 4.6,
    reviewCount: 95,
    hasDeal: true,
    deal: 'Buy one coffee, get a pastry half off'
  },
  {
    id: '5',
    name: 'Vintage Threads Boutique',
    category: 'Retail',
    description: 'Curated selection of vintage and sustainable fashion.',
    address: '654 Pine Road',
    phone: '(555) 567-8901',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    rating: 4.5,
    reviewCount: 33,
    hasDeal: false
  },
  {
    id: '6',
    name: 'Harmony Yoga Studio',
    category: 'Services',
    description: 'Welcoming yoga studio offering classes for all skill levels.',
    address: '987 Cedar Lane',
    phone: '(555) 678-9012',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    rating: 4.9,
    reviewCount: 81,
    hasDeal: true,
    deal: 'First class free for new students'
  },
  {
    id: '7',
    name: "Maria's Tacos",
    category: 'Food',
    description: 'Authentic Mexican street food with family recipes passed down for generations.',
    address: '147 Birch Street',
    phone: '(555) 789-0123',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    rating: 4.8,
    reviewCount: 124,
    hasDeal: true,
    deal: 'Taco Tuesday: $2 tacos all day'
  },
  {
    id: '8',
    name: 'Tech Haven Repairs',
    category: 'Services',
    description: 'Computer and phone repair services with same-day turnaround.',
    address: '258 Walnut Avenue',
    phone: '(555) 890-1234',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    rating: 4.4,
    reviewCount: 52,
    hasDeal: false
  }
];

export const initialReviews: Review[] = [
  {
    id: 'r1',
    businessId: '1',
    userName: 'Emily R.',
    rating: 5,
    comment: 'Best croissants in town! The atmosphere is lovely and the staff is so friendly.',
    date: '2026-02-01',
    verified: true
  },
  {
    id: 'r2',
    businessId: '1',
    userName: 'James K.',
    rating: 4,
    comment: 'Great pastries, though sometimes they run out early. Get there before 10 AM!',
    date: '2026-01-28',
    verified: true
  },
  {
    id: 'r3',
    businessId: '2',
    userName: 'Sarah M.',
    rating: 5,
    comment: 'Amazing selection of books. The owner really knows their stuff and gives great recommendations.',
    date: '2026-02-05',
    verified: true
  },
  {
    id: 'r4',
    businessId: '7',
    userName: 'Carlos D.',
    rating: 5,
    comment: 'Authentic tacos just like back home. The salsa verde is incredible!',
    date: '2026-02-10',
    verified: true
  }
];
