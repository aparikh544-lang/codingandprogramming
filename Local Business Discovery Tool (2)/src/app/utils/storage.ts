import { Business, Review } from '../types';

const BUSINESSES_KEY = 'local-businesses';
const REVIEWS_KEY = 'local-reviews';
const FAVORITES_KEY = 'local-favorites';

export const storage = {
  getBusinesses: (): Business[] => {
    const data = localStorage.getItem(BUSINESSES_KEY);
    return data ? JSON.parse(data) : [];
  },

  setBusinesses: (businesses: Business[]) => {
    localStorage.setItem(BUSINESSES_KEY, JSON.stringify(businesses));
  },

  getReviews: (): Review[] => {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? JSON.parse(data) : [];
  },

  setReviews: (reviews: Review[]) => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  },

  getFavorites: (): string[] => {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  },

  setFavorites: (favorites: string[]) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  },

  toggleFavorite: (businessId: string): boolean => {
    const favorites = storage.getFavorites();
    const index = favorites.indexOf(businessId);
    
    if (index > -1) {
      favorites.splice(index, 1);
      storage.setFavorites(favorites);
      return false;
    } else {
      favorites.push(businessId);
      storage.setFavorites(favorites);
      return true;
    }
  },

  isFavorite: (businessId: string): boolean => {
    return storage.getFavorites().includes(businessId);
  }
};