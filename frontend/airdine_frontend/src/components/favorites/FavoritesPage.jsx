// src/components/favorites/FavoritesPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../common/PageHeader";
import {
    Heart,
    Star,
    MapPin,
    Clock,
    Utensils,
    Search,
    Filter,
    Loader,
    AlertCircle,
    RefreshCw,
    Trash2,
    Eye,
    ExternalLink,
    Grid,
    List,
    SortAsc,
    SortDesc,
} from "lucide-react";

const FavoritesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { 
        favorites, 
        loading, 
        error, 
        removeFromFavorites, 
        refetch 
    } = useFavorites();
    
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'cuisine', 'date_added'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCuisine, setFilterCuisine] = useState('');
    const [removingId, setRemovingId] = useState(null);

    // Handle restaurant card click
    const handleRestaurantClick = (restaurantId) => {
        navigate(`/restaurants/${restaurantId}`);
    };

    // Handle remove from favorites
    const handleRemoveFromFavorites = async (restaurantId, restaurantName) => {
        if (!confirm(`Remove ${restaurantName} from your favorites?`)) {
            return;
        }

        setRemovingId(restaurantId);
        try {
            await removeFromFavorites(restaurantId);
        } catch (err) {
            console.error('Error removing from favorites:', err);
            alert('Failed to remove from favorites. Please try again.');
        } finally {
            setRemovingId(null);
        }
    };

    // Filter and sort favorites
    const getFilteredAndSortedFavorites = () => {
        let filtered = [...favorites];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(fav => 
                fav.restaurant?.name?.toLowerCase().includes(query) ||
                fav.restaurant?.cuisine?.toLowerCase().includes(query) ||
                fav.restaurant?.address?.toLowerCase().includes(query)
            );
        }

        // Filter by cuisine
        if (filterCuisine) {
            filtered = filtered.filter(fav => 
                fav.restaurant?.cuisine?.toLowerCase() === filterCuisine.toLowerCase()
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.restaurant?.name || '';
                    bValue = b.restaurant?.name || '';
                    break;
                case 'rating':
                    aValue = parseFloat(a.restaurant?.rating || 0);
                    bValue = parseFloat(b.restaurant?.rating || 0);
                    break;
                case 'cuisine':
                    aValue = a.restaurant?.cuisine || '';
                    bValue = b.restaurant?.cuisine || '';
                    break;
                case 'date_added':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                default:
                    return 0;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return filtered;
    };

    // Get unique cuisines for filter
    const getUniqueCuisines = () => {
        const cuisines = favorites
            .map(fav => fav.restaurant?.cuisine)
            .filter(cuisine => cuisine)
            .filter((cuisine, index, arr) => arr.indexOf(cuisine) === index)
            .sort();
        return cuisines;
    };

    const filteredFavorites = getFilteredAndSortedFavorites();
    const uniqueCuisines = getUniqueCuisines();

    // Restaurant Card Component
    const RestaurantCard = ({ favorite, viewMode }) => {
        const restaurant = favorite.restaurant;
        if (!restaurant) return null;

        const isRemoving = removingId === restaurant.id;

        if (viewMode === 'list') {
            return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="flex">
                        {/* Image */}
                        <div 
                            className="w-32 h-32 flex-shrink-0 cursor-pointer"
                            onClick={() => handleRestaurantClick(restaurant.id)}
                        >
                            {restaurant.image ? (
                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center hidden">
                                <Utensils className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                                <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleRestaurantClick(restaurant.id)}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors mb-1">
                                        {restaurant.name}
                                    </h3>
                                    
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-sm text-gray-600 ml-1">
                                                {restaurant.rating || 4.5}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({restaurant.total_reviews} reviews)
                                            </span>
                                        </div>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{restaurant.cuisine}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{restaurant.price_range}</span>
                                    </div>

                                    <div className="flex items-center text-gray-500 text-sm mb-2">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span className="truncate">{restaurant.address}</span>
                                    </div>

                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>
                                            {restaurant.opening_time && restaurant.closing_time 
                                                ? `${restaurant.opening_time} - ${restaurant.closing_time}`
                                                : "Hours not available"
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 ml-4">
                                    <Link
                                        to={`/restaurants/${restaurant.id}`}
                                        className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleRemoveFromFavorites(restaurant.id, restaurant.name)}
                                        disabled={isRemoving}
                                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Remove from Favorites"
                                    >
                                        {isRemoving ? (
                                            <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Grid view
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                {/* Image */}
                <div 
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => handleRestaurantClick(restaurant.id)}
                >
                    {restaurant.image ? (
                        <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center hidden">
                        <Utensils className="h-12 w-12 text-orange-500" />
                    </div>

                    {/* Remove button */}
                    <div className="absolute top-3 right-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromFavorites(restaurant.id, restaurant.name);
                            }}
                            disabled={isRemoving}
                            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                            title="Remove from Favorites"
                        >
                            {isRemoving ? (
                                <Loader className="h-4 w-4 text-red-500 animate-spin" />
                            ) : (
                                <Heart className="h-4 w-4 text-red-500 fill-current" />
                            )}
                        </button>
                    </div>

                    {/* Price range */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium">
                            {restaurant.price_range}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div 
                    className="p-4 cursor-pointer"
                    onClick={() => handleRestaurantClick(restaurant.id)}
                >
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors mb-2">
                        {restaurant.name}
                    </h3>

                    <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                                {restaurant.rating || 4.5}
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
                        <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
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
                            title="View Details"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please log in to view your favorites.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        <span>Sign In</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="mb-6">
                    <PageHeader
                        title="My Favorites"
                        subtitle="Restaurants you've saved for later"
                        icon={Heart}
                        actions={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={refetch}
                                    disabled={loading}
                                    className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="text-sm font-medium">Refresh</span>
                                </button>
                                <Link
                                    to="/user/dashboard"
                                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                <span className="text-red-700">{error}</span>
                            </div>
                            <button
                                onClick={refetch}
                                className="text-red-600 hover:text-red-800 font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters and Controls */}
                {favorites.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search favorites..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Cuisine Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={filterCuisine}
                                    onChange={(e) => setFilterCuisine(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="">All Cuisines</option>
                                    {uniqueCuisines.map(cuisine => (
                                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="flex space-x-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="name">Name</option>
                                    <option value="rating">Rating</option>
                                    <option value="cuisine">Cuisine</option>
                                    <option value="date_added">Date Added</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                                >
                                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* View Mode */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                        viewMode === 'grid' 
                                            ? 'bg-orange-500 text-white' 
                                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Grid className="h-4 w-4" />
                                    <span>Grid</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-orange-500 text-white' 
                                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                    <span>List</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && favorites.length === 0 && (
                    <div className="text-center py-12">
                        <Loader className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Favorites</h3>
                        <p className="text-gray-500">Please wait while we fetch your favorite restaurants...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && favorites.length === 0 && !error && (
                    <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-2">No Favorites Yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Start exploring restaurants and add them to your favorites to see them here.
                        </p>
                        <Link
                            to="/restaurants"
                            className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            <Search className="h-4 w-4" />
                            <span>Find Restaurants</span>
                        </Link>
                    </div>
                )}

                {/* No Results */}
                {!loading && favorites.length > 0 && filteredFavorites.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                        <p className="text-gray-500 mb-4">
                            No favorites match your current search and filter criteria.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setFilterCuisine('');
                            }}
                            className="text-orange-500 hover:text-orange-600 font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Favorites Grid/List */}
                {!loading && filteredFavorites.length > 0 && (
                    <div className={
                        viewMode === 'grid' 
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4"
                    }>
                        {filteredFavorites.map((favorite) => (
                            <RestaurantCard
                                key={favorite.id}
                                favorite={favorite}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                )}

                {/* Results Summary */}
                {!loading && filteredFavorites.length > 0 && (
                    <div className="mt-8 text-center text-gray-500">
                        Showing {filteredFavorites.length} of {favorites.length} favorite restaurant{filteredFavorites.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
