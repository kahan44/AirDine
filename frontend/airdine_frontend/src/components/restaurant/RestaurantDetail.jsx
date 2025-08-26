 // src/components/restaurant/RestaurantDetail.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRestaurant } from "../../hooks/useRestaurants";
import { menuAPI, reviewsAPI } from "../../services/api";
import ReviewModal from "../reviews/ReviewModal";
import FavoriteButton from "../favorites/FavoriteButton";
import OffersList from "../offers/OffersList";
import BookingModal from "../bookings/BookingModal";
import ErrorBoundary from "../common/ErrorBoundary";
import {
    ChefHat,
    ArrowLeft,
    Star,
    Clock,
    MapPin,
    Phone,
    Globe,
    Calendar,
    Users,
    DollarSign,
    Award,
    Utensils,
    Camera,
    Home,
    MessageCircle,
    ThumbsUp,
    Filter,
    SortAsc,
    Loader,
    CheckCircle,
    AlertCircle,
    Info,
    ExternalLink,
    Navigation,
    Leaf,
    Zap,
    Flame,
    Edit3,
    Trash2,
    Plus,
} from "lucide-react";

// Review Component
const ReviewCard = ({ review, onEdit, onDelete, isOwner = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            setIsDeleting(true);
            try {
                await onDelete(review.id);
            } catch (error) {
                console.error('Error deleting review:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return dateString;
        }
    };
    
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {review.user_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h4 className="font-semibold text-gray-900">{review.user_name || 'Anonymous'}</h4>
                            <div className="flex items-center space-x-3 mt-1">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                                i < (review.rating || 4)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                    {formatDate(review.created_at)}
                                </span>
                                {review.updated_at !== review.created_at && (
                                    <span className="text-xs text-gray-400">(edited)</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Action buttons for owner */}
                        {isOwner && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => onEdit(review)}
                                    className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                                    title="Edit review"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                    title="Delete review"
                                >
                                    {isDeleting ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    {review.title && (
                        <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                    )}

                    {/* Comment */}
                    <p className={`text-gray-700 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {review.comment}
                    </p>
                    
                    {/* Read more/less button */}
                    {review.comment?.length > 150 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-orange-500 text-sm mt-2 hover:text-orange-600 transition-colors font-medium"
                        >
                            {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Menu Item Component
const MenuItemCard = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="relative h-52 overflow-hidden">
                {!imageError && item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 via-red-50 to-orange-100 flex items-center justify-center">
                        <Utensils className="h-16 w-16 text-orange-400" />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <span className="bg-white/95 backdrop-blur-sm text-orange-600 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                        ${item.price}
                    </span>
                </div>
                {item.is_featured && (
                    <div className="absolute top-4 left-4">
                        <span className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                            Featured
                        </span>
                    </div>
                )}
            </div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                    {item.is_spicy && (
                        <Flame className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" title="Spicy" />
                    )}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.category_name || 'Main Course'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {item.is_vegetarian && (
                            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                <Leaf className="h-3 w-3 mr-1" />
                                Veg
                            </div>
                        )}
                        {item.is_vegan && (
                            <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                <Leaf className="h-3 w-3 mr-1" />
                                Vegan
                            </div>
                        )}
                        {item.is_gluten_free && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                GF
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    
    // Menu state
    const [menuData, setMenuData] = useState(null);
    const [menuLoading, setMenuLoading] = useState(false);
    const [menuError, setMenuError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Reviews state
    const [reviewsData, setReviewsData] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    // Use the restaurant hook to fetch data from Django backend
    const { restaurant, loading, error, refetch } = useRestaurant(id);

    // Use the restaurant data directly from the backend
    const restaurantData = restaurant;

    // Fetch menu data
    const fetchMenuData = useCallback(async () => {
        if (!id) return;
        
        setMenuLoading(true);
        setMenuError(null);
        
        try {
            const response = await menuAPI.getRestaurantMenu(id);
            setMenuData(response);
            
            // Set first category as selected by default
            const categories = Object.keys(response.categories || {});
            if (categories.length > 0) {
                setSelectedCategory(categories[0]);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            setMenuError(error.message || 'Failed to load menu');
        } finally {
            setMenuLoading(false);
        }
    }, [id]);

    // Fetch reviews data
    const fetchReviewsData = useCallback(async () => {
        if (!id) return;
        
        console.log('Fetching reviews for restaurant:', id);
        setReviewsLoading(true);
        setReviewsError(null);
        
        try {
            const response = await reviewsAPI.getRestaurantReviews(id);
            console.log('Reviews data fetched:', response);
            setReviewsData(response);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviewsError(error.message || 'Failed to load reviews');
        } finally {
            setReviewsLoading(false);
        }
    }, [id]);

    // Handle review submission
    const handleReviewSubmit = async (reviewData) => {
        setReviewSubmitting(true);
        setReviewsError(null);

        try {
            console.log('Submitting review data:', reviewData);
            console.log('Restaurant ID:', id);
            
            if (editingReview) {
                // Update existing review
                console.log('Updating review ID:', editingReview.id);
                await reviewsAPI.updateReview(editingReview.id, reviewData);
            } else {
                // Create new review
                console.log('Creating new review for restaurant:', id);
                const result = await reviewsAPI.createReview(id, reviewData);
                console.log('Review created successfully:', result);
            }
            
            // Refresh reviews data
            console.log('Refreshing reviews data...');
            await fetchReviewsData();
            
            // Close modal
            setShowReviewModal(false);
            setEditingReview(null);
            console.log('Review submission completed successfully');
        } catch (error) {
            console.error('Error submitting review:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            });
            setReviewsError(error.message || 'Failed to submit review');
        } finally {
            setReviewSubmitting(false);
        }
    };

    // Handle review edit
    const handleReviewEdit = (review) => {
        setEditingReview(review);
        setShowReviewModal(true);
    };

    // Handle review delete
    const handleReviewDelete = async (reviewId) => {
        try {
            await reviewsAPI.deleteReview(reviewId);
            await fetchReviewsData();
        } catch (error) {
            console.error('Error deleting review:', error);
            setReviewsError(error.message || 'Failed to delete review');
        }
    };

    // Handle write new review or update existing review
    const handleWriteReview = () => {
        if (!user) {
            alert('Please log in to write a review');
            return;
        }
        
        // If user already has a review, set it for editing
        if (reviewsData?.user_review) {
            setEditingReview(reviewsData.user_review);
        } else {
            setEditingReview(null);
        }
        
        setShowReviewModal(true);
    };

    // Handle book table
    const handleBookTable = () => {
        if (!user) {
            alert('Please log in to book a table');
            return;
        }
        setShowBookingModal(true);
    };

    // Fetch menu when restaurant ID changes or when menu tab is selected
    useEffect(() => {
        if (activeTab === 'menu' && id) {
            fetchMenuData();
        }
    }, [activeTab, id, fetchMenuData]);

    // Fetch reviews when restaurant ID changes or when reviews tab is selected
    useEffect(() => {
        if (activeTab === 'reviews' && id) {
            fetchReviewsData();
        }
    }, [activeTab, id, fetchReviewsData]);

    // Reset image states when restaurant data changes
    useEffect(() => {
        if (restaurantData?.image) {
            setImageError(false);
            setImageLoading(true);
        } else {
            setImageError(false);
            setImageLoading(false);
        }
    }, [restaurantData?.id, restaurantData?.image]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'menu', label: 'Menu', icon: Utensils },
        { id: 'reviews', label: 'Reviews', icon: MessageCircle },
    ];

    const handleBack = () => {
        navigate(-1);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: restaurantData.name,
                    text: `Check out ${restaurantData.name} - ${restaurantData.description}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading restaurant details...</p>
                </div>
            </div>
        );
    }

    if (error || !restaurantData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error ? 'Error Loading Restaurant' : 'Restaurant Not Found'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error 
                            ? `Failed to load restaurant details: ${error}`
                            : 'The restaurant you\'re looking for doesn\'t exist or has been removed.'
                        }
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleBack}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Go Back
                        </button>
                        {error && (
                            <button
                                onClick={refetch}
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <Link
                                to="/user/dashboard"
                                className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
                                title="Back to Dashboard"
                            >
                                <Home className="h-5 w-5" />
                            </Link>
                            <div className="flex items-center space-x-2">
                                <ChefHat className="h-8 w-8 text-orange-500" />
                                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                    AirDine
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleBookTable}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                            >
                                <Calendar className="h-4 w-4" />
                                <span>Book Table</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden bg-gray-200">
                {restaurantData?.image && !imageError ? (
                    <div className="relative w-full h-full">
                        {/* Image */}
                        <img
                            src={restaurantData.image}
                            alt={restaurantData.name || 'Restaurant'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                setImageError(true);
                            }}
                            onLoad={() => {
                                setImageLoading(false);
                            }}
                        />
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <div className="text-center">
                            <Utensils className="h-24 w-24 text-orange-500 mx-auto mb-4" />
                            <p className="text-orange-600 font-medium">
                                {imageError ? 'Image failed to load' : loading ? 'Loading...' : 'No image available'}
                            </p>
                            {imageError && restaurantData?.image && (
                                <p className="text-sm text-orange-500 mt-2 max-w-md break-words">
                                    URL: {restaurantData.image}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {/* Restaurant Info Overlay - Always visible */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300 ${
                    restaurantData?.image && !imageError ? 'text-white' : 'text-gray-800'
                }`}>
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-end justify-between">
                            <div className="flex-1">
                                <h1 className={`text-4xl font-bold mb-2 ${
                                    restaurantData?.image && !imageError ? 'drop-shadow-lg' : ''
                                }`}>
                                    {restaurantData?.name || 'Loading...'}
                                </h1>
                                <div className={`flex items-center space-x-4 ${
                                    restaurantData?.image && !imageError ? 'text-white/90 drop-shadow' : 'text-gray-600'
                                }`}>
                                    <span className="flex items-center space-x-1">
                                        <Star className={`h-5 w-5 fill-current ${
                                            restaurantData?.image && !imageError ? 'text-yellow-400 drop-shadow' : 'text-yellow-500'
                                        }`} />
                                        <span className="font-semibold">{restaurantData?.rating || '0.0'}</span>
                                        <span>({restaurantData?.total_reviews || 0} reviews)</span>
                                    </span>
                                    <span>•</span>
                                    <span>{restaurantData?.cuisine || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{restaurantData?.price_range || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FavoriteButton
                                    restaurantId={restaurantData?.id}
                                    restaurantName={restaurantData?.name}
                                    size="large"
                                    variant="default"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${restaurantData.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`font-medium ${restaurantData.is_open ? 'text-green-700' : 'text-red-700'}`}>
                                    {restaurantData.is_open ? 'Open Now' : 'Closed'}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600">
                                    {restaurantData.opening_time && restaurantData.closing_time 
                                        ? `${restaurantData.opening_time} - ${restaurantData.closing_time}`
                                        : "Hours not available"
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href={`tel:${restaurantData.phone}`}
                                className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 transition-colors"
                            >
                                <Phone className="h-4 w-4" />
                                <span>Call</span>
                            </a>
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(restaurantData.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 transition-colors"
                            >
                                <Navigation className="h-4 w-4" />
                                <span>Directions</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="flex flex-col xl:flex-row gap-8">
                        {/* Main Content - Takes up more space */}
                        <div className="flex-1 space-y-8">
                            {/* About */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Info className="h-6 w-6 text-orange-500" />
                                    <h2 className="text-2xl font-bold text-gray-900">About This Restaurant</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {restaurantData.description}
                                </p>
                            </div>

                            {/* Contact & Hours in Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Contact Info */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Phone className="h-5 w-5 text-orange-500" />
                                        <h3 className="text-xl font-bold text-gray-900">Contact</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <a
                                            href={`tel:${restaurantData.phone}`}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                                        >
                                            <Phone className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                                            <span className="text-gray-700 group-hover:text-orange-700">{restaurantData.phone}</span>
                                        </a>
                                        <div className="flex items-start space-x-3 p-3 rounded-lg">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <span className="text-gray-700 leading-relaxed">{restaurantData.address}</span>
                                        </div>
                                        {restaurantData.website && (
                                            <a
                                                href={restaurantData.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                                            >
                                                <Globe className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                                                <span className="text-orange-500 hover:text-orange-600 transition-colors">Visit Website</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Clock className="h-5 w-5 text-blue-500" />
                                        <h3 className="text-xl font-bold text-gray-900">Hours</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { day: 'Monday', hours: '11:00 AM - 8:30 PM', isToday: false },
                                            { day: 'Tuesday', hours: '11:00 AM - 8:30 PM', isToday: false },
                                            { day: 'Wednesday', hours: '11:00 AM - 8:30 PM', isToday: false },
                                            { day: 'Thursday', hours: '11:00 AM - 8:30 PM', isToday: false },
                                            { day: 'Friday', hours: '11:00 AM - 8:30 PM', isToday: false },
                                            { day: 'Saturday', hours: '11:00 AM - 8:30 PM', isToday: false },
                                            { day: 'Sunday', hours: '11:00 AM - 8:30 PM', isToday: false },
                                        ].map((schedule, index) => (
                                            <div key={index} className={`flex justify-between items-center p-2 rounded-lg text-sm ${
                                                schedule.isToday 
                                                    ? 'bg-orange-50 text-orange-800 font-medium' 
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}>
                                                <span>{schedule.day}</span>
                                                <span className={schedule.isToday ? 'font-semibold' : ''}>{schedule.hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Smaller width */}
                        <div className="xl:w-80 space-y-6">
                            {/* Special Offers */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Award className="h-5 w-5 text-purple-500" />
                                        <h3 className="text-lg font-bold text-gray-900">Special Offers</h3>
                                    </div>
                                    <Link
                                        to={`/offers?restaurant=${restaurantData.id}`}
                                        className="text-sm text-orange-500 hover:text-orange-600 transition-colors font-medium"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <OffersList restaurantId={restaurantData.id} variant="compact" />
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleBookTable}
                                        className="flex items-center justify-center space-x-2 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors font-medium group"
                                    >
                                        <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        <span>Book Table</span>
                                    </button>
                                    <a
                                        href={`tel:${restaurantData.phone}`}
                                        className="flex items-center justify-center space-x-2 w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors font-medium group"
                                    >
                                        <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        <span>Call Now</span>
                                    </a>
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(restaurantData.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center space-x-2 w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium group"
                                    >
                                        <Navigation className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        <span>Get Directions</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={fetchMenuData}
                                    disabled={menuLoading}
                                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <span>{menuLoading ? 'Loading...' : 'Refresh'}</span>
                                </button>
                            </div>
                        </div>

                        {menuLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Loader className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-3" />
                                    <p className="text-gray-600">Loading menu...</p>
                                </div>
                            </div>
                        ) : menuError ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Menu</h3>
                                <p className="text-gray-600 mb-4">{menuError}</p>
                                <button
                                    onClick={fetchMenuData}
                                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : menuData && Object.keys(menuData.categories || {}).length > 0 ? (
                            <div>
                                {/* Category Filter */}
                                <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                            selectedCategory === null
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        All Items ({menuData.total_items})
                                    </button>
                                    {Object.keys(menuData.categories).map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                selectedCategory === category
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {category} ({menuData.categories[category].length})
                                        </button>
                                    ))}
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-8">
                                    {selectedCategory ? (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedCategory}</h3>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {menuData.categories[selectedCategory].map((item) => (
                                                    <MenuItemCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        Object.entries(menuData.categories).map(([category, items]) => (
                                            <div key={category}>
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>
                                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                                    {items.map((item) => (
                                                        <MenuItemCard key={item.id} item={item} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Menu Available</h3>
                                <p className="text-gray-600">This restaurant hasn't uploaded their menu yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Reviews 
                                    {reviewsData && (
                                        <span className="text-lg font-normal text-gray-600 ml-2">
                                            ({reviewsData.total_reviews})
                                        </span>
                                    )}
                                </h2>
                                {reviewsData && reviewsData.average_rating > 0 && (
                                    <div className="flex items-center mt-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${
                                                        i < Math.round(reviewsData.average_rating)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">
                                            {reviewsData.average_rating} out of 5
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={fetchReviewsData}
                                    disabled={reviewsLoading}
                                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <span>{reviewsLoading ? 'Loading...' : 'Refresh'}</span>
                                </button>
                                {user && (
                                    <button 
                                        onClick={handleWriteReview}
                                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>
                                            {reviewsData?.user_review ? 'Update Review' : 'Write Review'}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Error Message */}
                        {reviewsError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-700">{reviewsError}</p>
                            </div>
                        )}

                        {reviewsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Loader className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-3" />
                                    <p className="text-gray-600">Loading reviews...</p>
                                </div>
                            </div>
                        ) : reviewsData && reviewsData.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {/* User's own review first */}
                                {reviewsData.user_review && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Review</h3>
                                        <ReviewCard 
                                            review={reviewsData.user_review} 
                                            onEdit={handleReviewEdit}
                                            onDelete={handleReviewDelete}
                                            isOwner={true}
                                        />
                                        <div className="border-t border-gray-200 mt-6 pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Reviews</h3>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Other reviews */}
                                {reviewsData.reviews
                                    .filter(review => !reviewsData.user_review || review.id !== reviewsData.user_review.id)
                                    .map((review) => (
                                        <ReviewCard 
                                            key={review.id} 
                                            review={review}
                                            onEdit={handleReviewEdit}
                                            onDelete={handleReviewDelete}
                                            isOwner={review.is_owner}
                                        />
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                                <p className="text-gray-600 mb-4">
                                    Be the first to share your experience at this restaurant!
                                </p>
                                {user && (
                                    <button 
                                        onClick={handleWriteReview}
                                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        Write First Review
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => {
                    setShowReviewModal(false);
                    setEditingReview(null);
                    setReviewsError(null);
                }}
                onSubmit={handleReviewSubmit}
                review={editingReview}
                restaurantName={restaurantData?.name || ''}
                isLoading={reviewSubmitting}
                error={reviewsError}
            />

            {/* Booking Modal */}
            <ErrorBoundary>
                <BookingModal
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    restaurantId={id}
                    restaurantName={restaurantData?.name || ''}
                />
            </ErrorBoundary>

        </div>
    );
};

export default RestaurantDetail;
