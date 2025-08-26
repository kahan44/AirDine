// src/utils/apiTest.js
import { restaurantAPI } from '../services/api';

export const testBackendConnection = async () => {
    console.log('🔍 Testing Django backend connection...');
    
    try {
        // Test basic restaurants endpoint
        console.log('📡 Testing /restaurants/ endpoint...');
        const restaurants = await restaurantAPI.getRestaurants();
        console.log('✅ Restaurants data:', restaurants);
        
        if (restaurants && (restaurants.results || restaurants.length)) {
            const restaurantList = restaurants.results || restaurants;
            console.log(`✅ Found ${restaurantList.length} restaurants`);
            
            // Test individual restaurant endpoint
            if (restaurantList.length > 0) {
                const firstRestaurant = restaurantList[0];
                console.log(`📡 Testing individual restaurant endpoint for ID: ${firstRestaurant.id}`);
                
                const individualRestaurant = await restaurantAPI.getRestaurantById(firstRestaurant.id);
                console.log('✅ Individual restaurant data:', individualRestaurant);
                
                return {
                    success: true,
                    restaurants: restaurantList,
                    testRestaurant: individualRestaurant
                };
            }
        }
        
        return {
            success: true,
            restaurants: [],
            message: 'No restaurants found in database'
        };
        
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};

export const checkBackendStatus = async () => {
    console.log('🏥 Checking Django backend status...');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/restaurants/');
        
        if (response.ok) {
            console.log('✅ Django backend is running');
            const data = await response.json();
            console.log('📊 Response data:', data);
            return { running: true, data };
        } else {
            console.log(`❌ Backend responded with status: ${response.status}`);
            return { running: false, status: response.status };
        }
    } catch (error) {
        console.log('❌ Cannot connect to Django backend:', error.message);
        return { running: false, error: error.message };
    }
};
