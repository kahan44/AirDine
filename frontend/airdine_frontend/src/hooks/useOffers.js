// src/hooks/useOffers.js
import { useState, useEffect } from 'react';
import { offersAPI } from '../services/api';

// Hook to fetch all offers
export const useOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching all offers from API...');
                const response = await offersAPI.getAllOffers();
                console.log('All offers response:', response);
                // Django REST framework returns the array directly, not wrapped in {data: [...]}
                setOffers(response.data || response || []);
            } catch (err) {
                console.error('Error fetching offers:', err);
                setError(err.message || 'Failed to fetch offers');
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    return { offers, loading, error };
};

// Hook to fetch offers for a specific restaurant
export const useRestaurantOffers = (restaurantId) => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!restaurantId) {
            setOffers([]);
            setLoading(false);
            return;
        }

        const fetchRestaurantOffers = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log(`Fetching offers for restaurant ID: ${restaurantId}`);
                const response = await offersAPI.getRestaurantOffers(restaurantId);
                console.log('Restaurant offers response:', response);
                // Django REST framework returns the array directly, not wrapped in {data: [...]}
                setOffers(response.data || response || []);
            } catch (err) {
                console.error('Error fetching restaurant offers:', err);
                setError(err.message || 'Failed to fetch restaurant offers');
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantOffers();
    }, [restaurantId]);

    return { offers, loading, error };
};

// Hook to fetch featured offers
export const useFeaturedOffers = () => {
    const [featuredOffers, setFeaturedOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedOffers = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching featured offers from API...');
                const response = await offersAPI.getFeaturedOffers();
                console.log('Featured offers response:', response);
                // Django REST framework returns the array directly, not wrapped in {data: [...]}
                setFeaturedOffers(response.data || response || []);
            } catch (err) {
                console.error('Error fetching featured offers:', err);
                setError(err.message || 'Failed to fetch featured offers');
                setFeaturedOffers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedOffers();
    }, []);

    return { featuredOffers, loading, error };
};