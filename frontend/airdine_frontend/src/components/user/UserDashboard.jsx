// src/components/user/UserDashboard.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { 
    useRecommendedRestaurants, 
    useFeaturedRestaurants, 
    useRestaurantStats,
    useRestaurantSearch 
} from "../../hooks/useRestaurants";
import FavoriteButton from "../favorites/FavoriteButton";
import FeaturedOffersWidget from "../offers/FeaturedOffersWidget";
import { bookingAPI } from "../../services/api";
import {
    ChefHat,
    Search,
    Calendar,
    User,
    Bell,
    LogOut,
    Menu,
    X,
    MapPin,
    Clock,
    Star,
    Heart,
    Utensils,
    Coffee,
    EggFried,
    Fish,
    Cake,
    ArrowRight,
    Plus,
    Filter,
    Bookmark,
    Settings,
    CreditCard,
    Gift,
    Zap,
    TrendingUp,
    Loader,
    ExternalLink,
    Eye,
    Flame,
} from "lucide-react";

// Restaurant Card Component for better reusability
const RestaurantCard = ({ restaurant, onNavigate, isLoading, size = "large" }) => {
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        if (onNavigate) {
            onNavigate(restaurant.id);
        } else {
            navigate(`/restaurants/${restaurant.id}`);
        }
    }, [restaurant.id, onNavigate, navigate]);

    if (size === "small") {
        return (
            <div 
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                onClick={handleClick}
            >
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {!imageError && restaurant.image ? (
                        <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                            <Utensils className="h-6 w-6 text-orange-500" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{restaurant.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">
                                {restaurant.rating || 4.5}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{restaurant.cuisine}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <FavoriteButton
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        variant="minimal"
                        size="small"
                    />
                    {isLoading && (
                        <Loader className="h-4 w-4 text-orange-500 animate-spin" />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group">
            <div className="relative h-48 overflow-hidden" onClick={handleClick}>
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
                
                {/* Favorite button */}
                <div className="absolute top-3 right-3">
                    <FavoriteButton
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        variant="card"
                        size="medium"
                    />
                </div>

                {/* Price range */}
                <div className="absolute bottom-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium">
                        {restaurant.price_range || "$$"}
                    </span>
                </div>

                {/* Open status */}
                {restaurant.is_open && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                            Open
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4" onClick={handleClick}>
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                    </h3>
                    {isLoading && (
                        <Loader className="h-4 w-4 text-orange-500 animate-spin" />
                    )}
                </div>

                <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                            {restaurant.rating || 4.5}
                        </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{restaurant.cuisine}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">30-45 min</span>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{restaurant.address || restaurant.location}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {restaurant.opening_time && restaurant.closing_time 
                                ? `${restaurant.opening_time} - ${restaurant.closing_time}`
                                : "9:00 AM - 10:00 PM"
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

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [navigatingToRestaurant, setNavigatingToRestaurant] = useState(null);
    
    // Use hooks for restaurant data
    const { 
        restaurants: recommendedRestaurants, 
        loading: recommendedLoading, 
        error: recommendedError,
        refetch: refetchRecommended 
    } = useRecommendedRestaurants();
    
    const { 
        restaurants: featuredRestaurants, 
        loading: featuredLoading, 
        error: featuredError,
        refetch: refetchFeatured 
    } = useFeaturedRestaurants();
    
    const { 
        stats: restaurantStats, 
        loading: statsLoading, 
        error: statsError,
        refetch: refetchStats 
    } = useRestaurantStats();

    const { search, results: searchResults, loading: searchLoading } = useRestaurantSearch();

    // Aggregate loading and error states
    const loading = recommendedLoading || featuredLoading || statsLoading;
    const hasError = recommendedError || featuredError || statsError;

    // Recent bookings state (pending + confirmed)
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentBookingsLoading, setRecentBookingsLoading] = useState(false);
    const [recentBookingsError, setRecentBookingsError] = useState("");

    // Fetch recent bookings for the current user
    useEffect(() => {
        let isMounted = true;
        const fetchRecent = async () => {
            try {
                setRecentBookingsLoading(true);
                setRecentBookingsError("");
                const all = await bookingAPI.getBookings();
                // Keep only pending and confirmed, newest first, limit to 4
                const filtered = all
                    .filter(b => b.status === "pending" || b.status === "confirmed")
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 4);
                if (isMounted) setRecentBookings(filtered);
            } catch (e) {
                // Fail quietly in dashboard; keep widget robust
                if (isMounted) setRecentBookingsError(e?.message || "");
            } finally {
                if (isMounted) setRecentBookingsLoading(false);
            }
        };
        fetchRecent();
        return () => { isMounted = false; };
    }, []);

    const formatBookingDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const formatBookingTime = (timeString) =>
        new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    // Handle restaurant navigation with loading state
    const handleRestaurantNavigation = useCallback(async (restaurantId) => {
        setNavigatingToRestaurant(restaurantId);
        
        // Add a small delay to show loading state
        setTimeout(() => {
            navigate(`/restaurants/${restaurantId}`);
            setNavigatingToRestaurant(null);
        }, 300);
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            // Use window.location for a clean redirect to home
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if logout fails, navigate to home
            window.location.href = "/";
        }
    };

    // Handle search functionality
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            await search(searchQuery);
            navigate("/restaurants", {
                state: { searchResults: searchResults, query: searchQuery },
            });
        } catch (err) {
            console.error("Search error:", err);
        }
    };

    // Retry function for failed API calls
    const handleRetry = () => {
        refetchRecommended();
        refetchFeatured();
        refetchStats();
    };

    // Quick actions data
    const quickActions = [
        {
            label: "Find Restaurants",
            description: "Browse nearby restaurants",
            icon: Search,
            action: "/restaurants",
            color: "orange",
        },
        {
            label: "My Bookings",
            description: "View your reservations",
            icon: Calendar,
            action: "/bookings",
            color: "blue",
        },
        {
            label: "Favorites",
            description: "Your saved places",
            icon: Heart,
            action: "/favorites",
            color: "red",
        },
        {
            label: "Special Offers",
            description: "Deals & discounts",
            icon: Gift,
            action: "/offers",
            color: "purple",
        },
        {
            label: "Profile",
            description: "Account settings",
            icon: User,
            action: "/profile",
            color: "gray",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <ChefHat className="h-8 w-8 text-orange-500" />
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                AirDine
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/restaurants"
                                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors"
                            >
                                <Search className="h-4 w-4" />
                                <span>Find Restaurants</span>
                            </Link>
                            <Link
                                to="/bookings"
                                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors"
                            >
                                <Calendar className="h-4 w-4" />
                                <span>My Bookings</span>
                            </Link>
                            <Link
                                to="/favorites"
                                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors"
                            >
                                <Heart className="h-4 w-4" />
                                <span>Favorites</span>
                            </Link>
                            <Link
                                to="/profile"
                                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </div>

                        {/* User Section */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.first_name?.[0]?.toUpperCase()}
                                    {user?.last_name?.[0]?.toUpperCase()}
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden lg:inline">Logout</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-700 hover:text-orange-500 transition-colors"
                            >
                                {isMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMenuOpen && (
                        <div className="md:hidden border-t border-gray-100">
                            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
                                <Link
                                    to="/restaurants"
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-500"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Search className="h-4 w-4" />
                                    <span>Find Restaurants</span>
                                </Link>
                                <Link
                                    to="/bookings"
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-500"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span>My Bookings</span>
                                </Link>
                                <Link
                                    to="/favorites"
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-500"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Heart className="h-4 w-4" />
                                    <span>Favorites</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-500"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-3 py-2 text-red-500 w-full text-left"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-orange-50 via-white to-red-50 py-16 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Welcome,{" "}
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                {user?.first_name}!
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Discover amazing restaurants, book tables, and enjoy
                            incredible dining experiences.
                        </p>
                    </div>

                    {/* Error message */}
                    {hasError && (
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Failed to load some data. Please try again.</span>
                                    <button
                                        onClick={handleRetry}
                                        className="ml-4 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.action}
                                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50 hover:border-orange-200"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-${action.color}-100 to-${action.color}-200 group-hover:from-${action.color}-200 group-hover:to-${action.color}-300 transition-all duration-300 group-hover:scale-110`}>
                                    <action.icon className={`h-7 w-7 text-${action.color}-600`} />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-orange-600 transition-colors">
                                    {action.label}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {action.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Recent Bookings */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Recent Bookings
                                    </h2>
                                </div>
                                <Link
                                    to="/bookings"
                                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    View All
                                </Link>
                            </div>

                            {recentBookingsLoading ? (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="animate-pulse flex items-center space-x-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                            <div className="w-16 h-6 bg-gray-200 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : recentBookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        No recent bookings
                                    </h3>
                                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                                        Pending and confirmed reservations will appear here.
                                    </p>
                                    <Link
                                        to="/restaurants"
                                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Search className="h-4 w-4" />
                                        <span className="font-semibold">Find Restaurants</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {recentBookings.map((b) => (
                                        <Link key={b.id} to="/bookings" className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-orange-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                                                    <Utensils className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-orange-700">
                                                        {b.restaurant_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatBookingDate(b.booking_date)} • {formatBookingTime(b.time_slot_time)} • {b.party_size} guests
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recommended Restaurants */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <Utensils className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Recommended for You
                                        </h2>
                                        {loading && (
                                            <p className="text-sm text-gray-500 mt-1">Loading recommendations...</p>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to="/restaurants"
                                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    View All
                                </Link>
                            </div>

                            {recommendedRestaurants.length > 0 ? (
                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {recommendedRestaurants.slice(0, 3).map((restaurant) => (
                                        <RestaurantCard
                                            key={restaurant.id}
                                            restaurant={restaurant}
                                            onNavigate={handleRestaurantNavigation}
                                            isLoading={navigatingToRestaurant === restaurant.id}
                                        />
                                    ))}
                                </div>
                            ) : loading ? (
                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="bg-gray-200 rounded-2xl h-48 mb-4"></div>
                                            <div className="space-y-3">
                                                <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                                                <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Utensils className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        No recommendations yet
                                    </h3>
                                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                                        Explore restaurants to get personalized recommendations!
                                    </p>
                                    <Link
                                        to="/restaurants"
                                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Search className="h-4 w-4" />
                                        <span className="font-semibold">Browse Restaurants</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Featured Offers & Popular Cuisines Row */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Featured Offers */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50">
                                <FeaturedOffersWidget />
                            </div>

                            {/* Popular Cuisines */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <Utensils className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Popular Cuisines
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <Link
                                        to="/restaurants?cuisine=Italian"
                                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all duration-200 group border border-amber-100 hover:border-amber-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                                            <Coffee className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            Italian
                                        </span>
                                    </Link>
                                    <Link
                                        to="/restaurants?cuisine=Seafood"
                                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all duration-200 group border border-red-100 hover:border-red-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                            <Fish className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                                            Seafood
                                        </span>
                                    </Link>
                                    <Link
                                        to="/restaurants?cuisine=Japanese"
                                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 group border border-purple-100 hover:border-purple-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                            <EggFried className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                            Japanese
                                        </span>
                                    </Link>
                                    <Link
                                        to="/restaurants?cuisine=Indian"
                                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl hover:from-pink-100 hover:to-rose-100 transition-all duration-200 group border border-pink-100 hover:border-pink-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                                            <Flame className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                                            Indian
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Compact Sidebar */}
                    <div className="space-y-6">
                        {/* Restaurant Stats */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-5 border border-white/50">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Quick Stats
                                </h3>
                                {loading && (
                                    <Loader className="h-4 w-4 text-orange-500 animate-spin ml-auto" />
                                )}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                            <Utensils className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                Total
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Restaurants
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        {restaurantStats.total_restaurants || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                                            <Star className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                Featured
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Places
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                        {restaurantStats.featured_restaurants || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                Top Rated
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                4.5+ stars
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        {restaurantStats.top_rated_restaurants || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Featured Restaurants - Compact */}
                        {(featuredRestaurants.length > 0 || loading) && (
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-5 border border-white/50">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <Star className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Featured
                                    </h3>
                                    {loading && (
                                        <Loader className="h-4 w-4 text-orange-500 animate-spin ml-auto" />
                                    )}
                                </div>

                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="animate-pulse flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {featuredRestaurants.slice(0, 2).map((restaurant) => (
                                            <RestaurantCard
                                                key={restaurant.id}
                                                restaurant={restaurant}
                                                onNavigate={handleRestaurantNavigation}
                                                isLoading={navigatingToRestaurant === restaurant.id}
                                                size="small"
                                            />
                                        ))}
                                    </div>
                                )}

                                {!loading && featuredRestaurants.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <Link
                                            to="/restaurants?featured=true"
                                            className="block text-center bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            View All →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-12 -translate-y-12"></div>
                    
                    <div className="max-w-3xl mx-auto relative">
                        <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                            Ready to discover your next favorite restaurant?
                        </h2>
                        <p className="text-orange-100 mb-8 text-lg leading-relaxed">
                            Browse through hundreds of restaurants, read reviews, and book your perfect dining experience with just a few clicks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/restaurants"
                                className="inline-flex items-center justify-center space-x-3 bg-white text-orange-600 px-10 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                            >
                                <Search className="h-6 w-6" />
                                <span>Browse Restaurants</span>
                            </Link>
                            <Link
                                to="/offers"
                                className="inline-flex items-center justify-center space-x-3 bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all duration-200 border border-white/30"
                            >
                                <Gift className="h-6 w-6" />
                                <span>View Special Offers</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
