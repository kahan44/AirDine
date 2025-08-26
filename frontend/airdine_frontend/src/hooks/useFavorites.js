// src/hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await favoritesAPI.getFavorites();
      if (response.success) {
        setFavorites(response.favorites || []);
      } else {
        setError(response.error || 'Failed to fetch favorites');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Failed to fetch favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToFavorites = useCallback(async (restaurantId) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const response = await favoritesAPI.addToFavorites(restaurantId);
      if (response.success) {
        await fetchFavorites(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to add to favorites');
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      throw err;
    }
  }, [user, fetchFavorites]);

  const removeFromFavorites = useCallback(async (restaurantId) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const response = await favoritesAPI.removeFromFavorites(restaurantId);
      if (response.success) {
        await fetchFavorites(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to remove from favorites');
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      throw err;
    }
  }, [user, fetchFavorites]);

  const toggleFavorite = useCallback(async (restaurantId) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const response = await favoritesAPI.toggleFavorite(restaurantId);
      if (response.success) {
        await fetchFavorites(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to toggle favorite');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, [user, fetchFavorites]);

  const isFavorited = useCallback((restaurantId) => {
    return favorites.some(fav => fav.restaurant?.id === restaurantId);
  }, [favorites]);

  const getFavoriteCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    refetch: fetchFavorites
  };
};

export const useFavoriteStatus = (restaurantId) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const checkStatus = useCallback(async () => {
    if (!user || !restaurantId) {
      setIsFavorited(false);
      return;
    }

    setLoading(true);
    try {
      const response = await favoritesAPI.checkFavoriteStatus(restaurantId);
      if (response.success) {
        setIsFavorited(response.is_favorited);
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setIsFavorited(false);
    } finally {
      setLoading(false);
    }
  }, [user, restaurantId]);

  const toggle = useCallback(async () => {
    if (!user || !restaurantId) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    try {
      const response = await favoritesAPI.toggleFavorite(restaurantId);
      if (response.success) {
        setIsFavorited(response.is_favorited);
        return response;
      } else {
        throw new Error(response.error || 'Failed to toggle favorite');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, restaurantId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isFavorited,
    loading,
    toggle,
    refresh: checkStatus
  };
};
