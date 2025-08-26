// src/hooks/useRestaurants.js
import { useState, useEffect, useCallback } from 'react';
import { restaurantAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Custom hook for managing restaurant data
export const useRestaurants = (filters = {}) => {
    const { isAuthenticated } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchRestaurants = useCallback(async (resetList = true) => {
        console.log('Fetching restaurants with filters:', filters);
        
        // Don't fetch if filters is null (not initialized yet)
        if (filters === null) {
            console.log('Filters not initialized yet, skipping fetch');
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const data = await restaurantAPI.getRestaurants(filters);
            console.log('API response:', data);
            
            if (resetList) {
                setRestaurants(data.results || data);
            } else {
                setRestaurants(prev => [...prev, ...(data.results || data)]);
            }
            
            setHasMore(!!data.next);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]); // Removed isAuthenticated dependency

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    return {
        restaurants,
        loading,
        error,
        hasMore,
        refetch: () => fetchRestaurants(true),
        loadMore: () => fetchRestaurants(false),
    };
};

// Custom hook for recommended restaurants
export const useRecommendedRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRecommended = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await restaurantAPI.getRecommendedRestaurants();
            setRestaurants(data.results || data);
        } catch (err) {
            console.error('Error fetching recommended restaurants:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecommended();
    }, [fetchRecommended]);

    return {
        restaurants,
        loading,
        error,
        refetch: fetchRecommended,
    };
};

// Custom hook for featured restaurants
export const useFeaturedRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFeatured = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await restaurantAPI.getFeaturedRestaurants();
            setRestaurants(data.results || data);
        } catch (err) {
            console.error('Error fetching featured restaurants:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeatured();
    }, [fetchFeatured]);

    return {
        restaurants,
        loading,
        error,
        refetch: fetchFeatured,
    };
};

// Custom hook for restaurant statistics
export const useRestaurantStats = () => {
    const [stats, setStats] = useState({
        total_restaurants: 0,
        featured_restaurants: 0,
        top_rated_restaurants: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await restaurantAPI.getRestaurantStats();
            setStats(data);
        } catch (err) {
            console.error('Error fetching restaurant stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
    };
};

// Custom hook for single restaurant
export const useRestaurant = (restaurantId) => {
    const { isAuthenticated } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRestaurant = useCallback(async () => {
        if (!restaurantId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await restaurantAPI.getRestaurantById(restaurantId);
            setRestaurant(data);
        } catch (err) {
            console.error('Error fetching restaurant:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [restaurantId]); // Removed isAuthenticated dependency

    useEffect(() => {
        fetchRestaurant();
    }, [fetchRestaurant]);

    return {
        restaurant,
        loading,
        error,
        refetch: fetchRestaurant,
    };
};

// Custom hook for restaurant search
export const useRestaurantSearch = () => {
    const { isAuthenticated } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const search = useCallback(async (query) => {
        if (!isAuthenticated || !query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await restaurantAPI.searchRestaurants(query);
            setResults(data.results || data);
        } catch (err) {
            console.error('Error searching restaurants:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const clearResults = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    return {
        results,
        loading,
        error,
        search,
        clearResults,
    };
};