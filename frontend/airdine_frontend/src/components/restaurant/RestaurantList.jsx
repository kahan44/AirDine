// src/components/restaurant/RestaurantList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRestaurants, useFeaturedRestaurants } from "../../hooks/useRestaurants";
import FavoriteButton from "../favorites/FavoriteButton";
import PageHeader from "../common/PageHeader";
import {
    Search,
    Filter,
    SortAsc,
    Star,
    Clock,
    MapPin,
    Heart,
    Eye,
    Utensils,
    Loader,
    AlertCircle,
} from "lucide-react";

// Restaurant Card Component
const RestaurantCard = ({ restaurant }) => {
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();
    
    const handleCardClick = () => {
        navigate(`/restaurants/${restaurant.id}`);
    };
    
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group">
            <div className="relative h-48 overflow-hidden" onClick={handleCardClick}>
                {!imageError && restaurant.image ? (
                    <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <Utensils className="h-12 w-12 text-orange-500" />
                    </div>
                )}
                
                {/* Featured Badge */}
                {restaurant.is_featured && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                            Featured
                        </span>
                    </div>
                )}

                {/* Favorite Button */}
                <div className="absolute top-3 right-3">
                    <FavoriteButton
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        variant="card"
                        size="medium"
                    />
                </div>

                {/* Price Range */}
                <div className="absolute bottom-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium">
                        {restaurant.price_range || "$$"}
                    </span>
                </div>

                {/* Open/Closed Status */}
                {restaurant.is_open !== undefined && (
                    <div className="absolute bottom-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            restaurant.is_open 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                        }`}>
                            {restaurant.is_open ? 'Open' : 'Closed'}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4" onClick={handleCardClick}>
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                    </h3>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                            {restaurant.rating || 4.5}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                            ({restaurant.total_reviews || 0} reviews)
                        </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{restaurant.cuisine}</span>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{restaurant.address}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {restaurant.opening_time && restaurant.closing_time 
                                ? `${restaurant.opening_time} - ${restaurant.closing_time}`
                                : "Hours not available"
                            }
                        </span>
                    </div>
                    <Link
                        to={`/restaurants/${restaurant.id}`}
                        className="text-orange-500 hover:text-orange-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Eye className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const RestaurantList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const featured = searchParams.get('featured') === 'true';
    
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        cuisine: "",
        price_range: "",
        search: ""
    });
    const [isInitialized, setIsInitialized] = useState(false);

    const handleFilterChange = useCallback((key, value) => {
        console.log('Filter change:', { key, value });
        
        setFilters(prevFilters => {
            // Only update if the value actually changed
            if (prevFilters[key] === value) {
                return prevFilters;
            }
            
            const newFilters = {
                ...prevFilters,
                [key]: value
            };
            
            console.log('New filters:', newFilters);
            
            // Update URL to reflect current filters
            const params = new URLSearchParams();
            if (newFilters.cuisine) params.set('cuisine', newFilters.cuisine);
            if (newFilters.price_range) params.set('price_range', newFilters.price_range);
            if (newFilters.search) params.set('search', newFilters.search);
            
            // Update the URL without causing a page reload
            const newUrl = `/restaurants${params.toString() ? `?${params.toString()}` : ''}`;
            console.log('Updating URL to:', newUrl);
            window.history.replaceState({}, '', newUrl);
            
            return newFilters;
        });
    }, []); // Empty dependency array since we're using functional updates

    // Initialize filters from URL parameters on component mount
    useEffect(() => {
        const cuisineParam = searchParams.get('cuisine');
        const priceRangeParam = searchParams.get('price_range');
        const searchParam = searchParams.get('search');
        
        console.log('Initializing filters from URL:', { 
            cuisineParam, 
            priceRangeParam, 
            searchParam 
        });
        
        setFilters({
            cuisine: cuisineParam || "",
            price_range: priceRangeParam || "",
            search: searchParam || ""
        });
        
        if (searchParam) {
            setSearchQuery(searchParam);
        }
        
        setIsInitialized(true);
    }, [searchParams]);

    // Debounced search effect - only run when searchQuery changes and component is mounted
    useEffect(() => {
        if (!isInitialized) return;

        const timeoutId = setTimeout(() => {
            // Only update if the search value actually changed from what's in filters
            if (searchQuery !== filters.search) {
                handleFilterChange('search', searchQuery);
            }
        }, 1000); // 500ms delay for search

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isInitialized]); // Removed handleFilterChange and searchParams from dependencies

    // Use appropriate hook based on featured parameter
    const { 
        restaurants, 
        loading, 
        error, 
        refetch 
    } = featured ? useFeaturedRestaurants() : useRestaurants(isInitialized ? filters : null);

    const clearFilters = useCallback(() => {
        setFilters({
            cuisine: "",
            price_range: "",
            search: ""
        });
        setSearchQuery("");
        
        // Update URL to remove all filters
        window.history.replaceState({}, '', '/restaurants');
    }, []);

    const pageTitle = featured 
        ? 'Featured Restaurants' 
        : filters.cuisine 
            ? `${filters.cuisine} Restaurants`
            : 'All Restaurants';
    const pageSubtitle = featured 
        ? 'Discover our handpicked selection of outstanding restaurants'
        : filters.cuisine
            ? `Explore ${filters.cuisine} restaurants in your area`
            : 'Explore all available restaurants in your area';

    if (loading || !isInitialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">
                        {!isInitialized ? 'Initializing...' : 'Loading restaurants...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Error Loading Restaurants
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={refetch}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <PageHeader
                        title={pageTitle}
                        subtitle={pageSubtitle}
                        icon={Utensils}
                        actions={
                            <Link
                                to="/user/dashboard"
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Dashboard
                            </Link>
                        }
                    />
                </div>

                {/* Search and Filters */}
                {!featured && (
                    <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
                        <div className="mb-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="text"
                                            placeholder="Search restaurants..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        {loading && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <Loader className="h-4 w-4 text-orange-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cuisine Type
                                </label>
                                <select
                                    value={filters.cuisine}
                                    onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">All Cuisines</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Asian">Asian</option>
                                    <option value="French">French</option>
                                    <option value="Desserts">Desserts</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="Japanese">Japanese</option>
                                    <option value="Indian">Indian</option>
                                    <option value="Mexican">Mexican</option>
                                    <option value="American">American</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price Range
                                </label>
                                <select
                                    value={filters.price_range}
                                    onChange={(e) => handleFilterChange('price_range', e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">All Prices</option>
                                    <option value="$">$ - Budget</option>
                                    <option value="$$">$$ - Moderate</option>
                                    <option value="$$$">$$$ - Expensive</option>
                                    <option value="$$$$">$$$$ - Very Expensive</option>
                                </select>
                            </div>

                            {(filters.cuisine || filters.price_range || filters.search) && (
                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        {restaurants?.length || 0} restaurants found
                    </p>
                </div>

                {/* Restaurant Grid */}
                {restaurants && restaurants.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {restaurants.map((restaurant) => (
                            <RestaurantCard 
                                key={restaurant.id} 
                                restaurant={restaurant} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No restaurants found
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {featured 
                                ? "No featured restaurants available at the moment."
                                : "Try adjusting your search criteria or filters."
                            }
                        </p>
                        {!featured && (
                            <button
                                onClick={clearFilters}
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantList;
