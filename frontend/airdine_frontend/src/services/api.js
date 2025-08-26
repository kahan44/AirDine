// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Restaurant API endpoints
export const restaurantAPI = {
  // Get all restaurants with optional filters
  getRestaurants: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.price_range) params.append('price_range', filters.price_range);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/restaurants/${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to view restaurants.');
      }
      throw error;
    }
  },

  // Get a single restaurant by ID (alternative method name for compatibility)
  getRestaurant: async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to view restaurant details.');
      } else if (error.response?.status === 404) {
        throw new Error('Restaurant not found. Please check the restaurant ID.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      }
      throw error;
    }
  },

  // Get recommended restaurants
  getRecommendedRestaurants: async () => {
    try {
      // Try specific recommended endpoint first, fallback to general restaurants
      const response = await api.get('/restaurants/recommended/');
      return response.data;
    } catch (error) {
      console.warn('Recommended endpoint not available, using general restaurants list');
      try {
        const response = await api.get('/restaurants/');
        const restaurants = response.data.results || response.data;
        return { results: restaurants.slice(0, 6) }; // Return first 6 as recommended
      } catch (fallbackError) {
        console.error('Error fetching recommended restaurants:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get featured restaurants
  getFeaturedRestaurants: async () => {
    try {
      // Try specific featured endpoint first, fallback to general restaurants
      const response = await api.get('/restaurants/featured/');
      return response.data;
    } catch (error) {
      console.warn('Featured endpoint not available, using general restaurants list');
      try {
        const response = await api.get('/restaurants/');
        const restaurants = response.data.results || response.data;
        return { results: restaurants.slice(2, 8) }; // Return different subset as featured
      } catch (fallbackError) {
        console.error('Error fetching featured restaurants:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get individual restaurant details
  async getRestaurantById(id) {
    try {
      const response = await api.get(`/restaurants/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant by ID:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to view restaurant details.');
      } else if (error.response?.status === 404) {
        throw new Error('Restaurant not found. Please check the restaurant ID.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      } else {
        throw new Error(`Failed to load restaurant: ${error.message}`);
      }
    }
  },

  // Search restaurants
  async searchRestaurants(query) {
    try {
      const response = await api.get(`/restaurants/search/?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      throw error; // Re-throw the error instead of falling back to mock data
    }
  },

  // Get restaurant stats
  getRestaurantStats: async () => {
    try {
      const response = await api.get('/restaurants/stats/');
      return response.data;
    } catch (error) {
      console.warn('Restaurant stats endpoint not available, calculating from restaurants list');
      try {
        const response = await api.get('/restaurants/');
        const restaurants = response.data.results || response.data;
        
        // Calculate basic stats from restaurant list
        const totalRestaurants = restaurants.length;
        const featuredRestaurants = restaurants.filter(r => r.is_featured || r.rating >= 4.5).length;
        const topRatedRestaurants = restaurants.filter(r => r.rating >= 4.5).length;
        
        return {
          total_restaurants: totalRestaurants,
          featured_restaurants: featuredRestaurants,
          top_rated_restaurants: topRatedRestaurants
        };
      } catch (fallbackError) {
        console.error('Error fetching restaurant stats:', fallbackError);
        throw fallbackError;
      }
    }
  },
};

// Auth API endpoints (you can add these if you don't have them already)
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile/update/', profileData);
    return response.data;
  },
};

// Menu API endpoints
export const menuAPI = {
  // Get restaurant menu with all items organized by category
  getRestaurantMenu: async (restaurantId) => {
    try {
      const response = await api.get(`/menu/restaurant/${restaurantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant menu:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to view menu.');
      } else if (error.response?.status === 404) {
        throw new Error('Menu not found for this restaurant.');
      }
      throw error;
    }
  },

  // Get restaurant menu summary (categories and counts)
  getRestaurantMenuSummary: async (restaurantId) => {
    try {
      const response = await api.get(`/menu/restaurant/${restaurantId}/summary/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant menu summary:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to view menu.');
      } else if (error.response?.status === 404) {
        throw new Error('Menu not found for this restaurant.');
      }
      throw error;
    }
  },

  // Get specific menu item details
  getMenuItem: async (itemId) => {
    try {
      const response = await api.get(`/menu/item/${itemId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      if (error.response?.status === 404) {
        throw new Error('Menu item not found.');
      }
      throw error;
    }
  },

  // Get all menu categories
  getMenuCategories: async () => {
    try {
      const response = await api.get('/menu/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      throw error;
    }
  },
};

// Reviews API endpoints
export const reviewsAPI = {
  // Get all reviews for a restaurant
  getRestaurantReviews: async (restaurantId) => {
    try {
      const response = await api.get(`/reviews/restaurant/${restaurantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant reviews:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 404) {
        throw new Error('Restaurant not found.');
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.error || 'Internal server error while fetching reviews.';
        throw new Error(errorMessage);
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Failed to load reviews');
    }
  },

  // Create a new review
  createReview: async (restaurantId, reviewData) => {
    try {
      const response = await api.post(`/reviews/restaurant/${restaurantId}/create/`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to write a review.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Invalid review data.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to create review');
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 403) {
        throw new Error('You can only update your own reviews.');
      } else if (error.response?.status === 404) {
        throw new Error('Review not found.');
      }
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 403) {
        throw new Error('You can only delete your own reviews.');
      } else if (error.response?.status === 404) {
        throw new Error('Review not found.');
      }
      throw error;
    }
  },

  // Get user's own reviews
  getUserReviews: async () => {
    try {
      const response = await api.get('/reviews/user/my-reviews/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw error;
    }
  },
};

// Favorites API
export const favoritesAPI = {
  // Get user's favorite restaurants
  getFavorites: async () => {
    try {
      const response = await api.get('/favorites/');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw error;
    }
  },

  // Add restaurant to favorites
  addToFavorites: async (restaurantId) => {
    try {
      const response = await api.post('/favorites/add/', {
        restaurant_id: restaurantId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 400) {
        const message = error.response.data?.errors?.restaurant_id?.[0] || 
                       error.response.data?.errors?.non_field_errors?.[0] ||
                       'Restaurant is already in favorites.';
        throw new Error(message);
      }
      throw error;
    }
  },

  // Remove restaurant from favorites
  removeFromFavorites: async (restaurantId) => {
    try {
      const response = await api.delete(`/favorites/remove/${restaurantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 404) {
        throw new Error('Restaurant not found in favorites.');
      }
      throw error;
    }
  },

  // Toggle favorite status
  toggleFavorite: async (restaurantId) => {
    try {
      const response = await api.post('/favorites/toggle/', {
        restaurant_id: restaurantId
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 400) {
        const message = error.response.data?.errors?.restaurant_id?.[0] || 
                       'Invalid restaurant ID.';
        throw new Error(message);
      }
      throw error;
    }
  },

  // Check if restaurant is favorited
  checkFavoriteStatus: async (restaurantId) => {
    try {
      const response = await api.get(`/favorites/check/${restaurantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 404) {
        return { success: true, is_favorited: false };
      }
      throw error;
    }
  },
};

// Offers API
export const offersAPI = {
  // Get all offers
  getAllOffers: async () => {
    try {
      const response = await api.get('/offers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching offers:', error);
      const message = error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch offers';
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error(message);
    }
  },

  // Get offers for a specific restaurant
  getRestaurantOffers: async (restaurantId) => {
    try {
      const response = await api.get(`/offers/restaurant/${restaurantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant offers:', error);
      const message = error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch restaurant offers';
      if (error.response?.status === 404) {
        return { success: true, data: [] }; // Return empty array if no offers found
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error(message);
    }
  },

  // Get featured offers
  getFeaturedOffers: async () => {
    try {
      const response = await api.get('/offers/featured/');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured offers:', error);
      const message = error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch featured offers';
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error(message);
    }
  },

  // Get offer details by ID
  getOfferById: async (offerId) => {
    try {
      const response = await api.get(`/offers/${offerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching offer details:', error);
      const message = error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch offer details';
      if (error.response?.status === 404) {
        throw new Error('Offer not found.');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error(message);
    }
  },

  // Activate an offer and get activation code
  activateOffer: async (offerId) => {
    try {
      const response = await api.post(`/offers/${offerId}/activate/`);
      return response;
    } catch (error) {
      console.error('Error activating offer:', error);
      const message = error.response?.data?.error || 'Failed to activate offer';
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 400) {
        throw new Error(message);
      }
      throw new Error(message);
    }
  },

  // Get user's offer activations
  getUserActivations: async () => {
    try {
      const response = await api.get('/offers/activations/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user activations:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error('Failed to fetch activations');
    }
  },

  // Get user's redeemed offers
  getRedeemedOffers: async () => {
    try {
      const response = await api.get('/offers/redeemed/');
      return response.data;
    } catch (error) {
      console.error('Error fetching redeemed offers:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error('Failed to fetch redeemed offers');
    }
  },
};

// Booking API
export const bookingAPI = {
  // Get user's bookings
  getBookings: async () => {
    try {
      const response = await api.get('/bookings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch bookings');
    }
  },

  // Get upcoming bookings
  getUpcomingBookings: async () => {
    try {
      const response = await api.get('/bookings/upcoming/');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch upcoming bookings');
    }
  },

  // Get booking statistics
  getBookingStatistics: async () => {
    try {
      const response = await api.get('/bookings/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch booking statistics');
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 404) {
        throw new Error('Booking not found.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch booking details');
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings/', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          // Handle validation errors
          const firstErrorKey = Object.keys(errorData)[0];
          const firstError = errorData[firstErrorKey];
          if (Array.isArray(firstError)) {
            throw new Error(firstError[0]);
          } else {
            throw new Error(firstError || 'Invalid booking data.');
          }
        }
        throw new Error('Invalid booking data.');
      }
      throw new Error(error.response?.data?.error || 'Failed to create booking');
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel/`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Cannot cancel this booking.');
      } else if (error.response?.status === 404) {
        throw new Error('Booking not found.');
      }
      throw new Error(error.response?.data?.error || 'Failed to cancel booking');
    }
  },

  // Get restaurant time slots
  getRestaurantTimeSlots: async (restaurantId, date) => {
    try {
      const response = await api.get(`/bookings/restaurant/${restaurantId}/time-slots/?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Invalid date or restaurant.');
      } else if (error.response?.status === 404) {
        throw new Error('Restaurant not found.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch available time slots');
    }
  },

  // Get valid booking date information from server
  getBookingDateInfo: async () => {
    try {
      const response = await api.get('/bookings/date-info/');
      return response.data;
    } catch (error) {
      console.error('Error fetching booking date info:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch date information');
    }
  },

  // Get booking history
  getBookingHistory: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/history/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking history:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 404) {
        throw new Error('Booking not found.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch booking history');
    }
  },
};

// Admin API
export const adminAPI = {
  async me() {
    const res = await api.get('/staff/me/');
    return res.data;
  },
  async getOverview() {
    const res = await api.get('/staff/dashboard/overview/');
    return res.data;
  },
  async getBookings(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await api.get(`/staff/dashboard/bookings/${qs}`);
    return res.data;
  },
  async updateBookingStatus(bookingId, status, notes='') {
    const res = await api.post(`/staff/dashboard/bookings/${bookingId}/status/`, { status, notes });
    return res.data;
  },
  async getReviews() {
    const res = await api.get('/staff/dashboard/reviews/');
    return res.data;
  },
  async getOffers() {
    const res = await api.get('/staff/dashboard/offers/');
    return res.data;
  },
  async createOffer(data) {
    const res = await api.post('/staff/dashboard/offers/', data);
    return res.data;
  },
  async updateOffer(id, data) {
    const res = await api.put(`/staff/dashboard/offers/${id}/`, data);
    return res.data;
  },
  async deleteOffer(id) {
    const res = await api.delete(`/staff/dashboard/offers/${id}/`);
    return res.data;
  },
  async getRestaurant() {
    const res = await api.get('/staff/dashboard/restaurant/');
    return res.data;
  },
  async updateRestaurant(data) {
    const res = await api.put('/staff/dashboard/restaurant/', data);
    return res.data;
  },
  
  // Offer redemption endpoints
  async redeemOfferCode(activationCode) {
    const res = await api.post('/staff/dashboard/offers/redeem/', { activation_code: activationCode });
    return res.data;
  },
  
  async getOfferActivations(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await api.get(`/staff/dashboard/offers/activations/${qs}`);
    return res.data;
  },

  // Menu management endpoints
  async getMenu() {
    const res = await api.get('/menu/admin/menu/');
    return res.data;
  },
  
  async getMenuSummary() {
    const res = await api.get('/menu/admin/menu/summary/');
    return res.data;
  },
  
  async createMenuItem(data) {
    const res = await api.post('/menu/admin/menu/', data);
    return res.data;
  },
  
  async updateMenuItem(id, data) {
    const res = await api.put(`/menu/admin/menu/${id}/`, data);
    return res.data;
  },
  
  async deleteMenuItem(id) {
    const res = await api.delete(`/menu/admin/menu/${id}/`);
    return res.data;
  },
  
  async getMenuCategories() {
    const res = await api.get('/menu/categories/');
    return res.data;
  },
};

export default api;