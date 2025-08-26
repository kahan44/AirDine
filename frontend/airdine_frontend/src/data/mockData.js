// src/data/mockData.js
export const mockRestaurants = [
    {
        id: 1,
        name: "The Golden Spoon",
        cuisine_type: "Italian",
        rating: 4.5,
        review_count: 324,
        price_range: "$$$",
        address: "123 Main St, City Center",
        phone: "+1 (555) 123-4567",
        website: "https://thegoldenspoon.com",
        delivery_time: "30-45 min",
        opening_hours: "9:00 AM - 10:00 PM",
        is_open: true,
        description: "Experience authentic Italian cuisine in an elegant atmosphere. Our passionate chefs create traditional dishes with a modern twist, using only the finest ingredients.",
        features: ["Free WiFi", "Outdoor Seating", "Live Music", "Private Dining"],
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 2,
        name: "Sakura Sushi",
        cuisine_type: "Japanese",
        rating: 4.7,
        review_count: 198,
        price_range: "$$$$",
        address: "456 Oak Ave, Downtown",
        phone: "+1 (555) 234-5678",
        website: "https://sakurasushi.com",
        delivery_time: "25-40 min",
        opening_hours: "11:00 AM - 11:00 PM",
        is_open: true,
        description: "Fresh sushi and traditional Japanese dishes in a modern setting. Our master chefs prepare each dish with precision and artistry.",
        features: ["Sushi Bar", "Private Rooms", "Sake Selection", "Takeout"],
        image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 3,
        name: "Burger Haven",
        cuisine_type: "American",
        rating: 4.2,
        review_count: 156,
        price_range: "$$",
        address: "789 Elm St, Midtown",
        phone: "+1 (555) 345-6789",
        website: "https://burgerhaven.com",
        delivery_time: "20-35 min",
        opening_hours: "10:00 AM - 12:00 AM",
        is_open: true,
        description: "Gourmet burgers made with locally sourced ingredients. From classic cheeseburgers to creative specialty combinations.",
        features: ["Drive-Thru", "Family Friendly", "Vegetarian Options", "Late Night"],
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 4,
        name: "Spice Garden",
        cuisine_type: "Indian",
        rating: 4.6,
        review_count: 289,
        price_range: "$$",
        address: "321 Pine St, Little India",
        phone: "+1 (555) 456-7890",
        website: "https://spicegarden.com",
        delivery_time: "35-50 min",
        opening_hours: "11:30 AM - 10:30 PM",
        is_open: true,
        description: "Authentic Indian cuisine with traditional spices and cooking methods. Vegetarian and vegan options available.",
        features: ["Vegetarian Friendly", "Spice Levels", "Buffet Lunch", "Catering"],
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 5,
        name: "Le Petit Bistro",
        cuisine_type: "French",
        rating: 4.8,
        review_count: 412,
        price_range: "$$$$",
        address: "567 Rose Ave, French Quarter",
        phone: "+1 (555) 567-8901",
        website: "https://lepetitbistro.com",
        delivery_time: "40-55 min",
        opening_hours: "5:00 PM - 11:00 PM",
        is_open: false,
        description: "Classic French cuisine in an intimate bistro setting. Wine pairings and seasonal menu available.",
        features: ["Wine Bar", "Romantic Atmosphere", "Chef's Table", "Reservations Required"],
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
];

export const mockStats = {
    total_restaurants: 5,
    featured_restaurants: 3,
    top_rated_restaurants: 2
};

export const getMockRecommendedRestaurants = () => {
    return Promise.resolve({
        results: mockRestaurants.slice(0, 3)
    });
};

export const getMockFeaturedRestaurants = () => {
    return Promise.resolve({
        results: mockRestaurants.slice(1, 4)
    });
};

export const getMockRestaurantStats = () => {
    return Promise.resolve(mockStats);
};
