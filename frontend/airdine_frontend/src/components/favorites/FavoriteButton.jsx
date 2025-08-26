// src/components/favorites/FavoriteButton.jsx
import React, { useState } from 'react';
import { Heart, Loader } from 'lucide-react';
import { useFavoriteStatus } from '../../hooks/useFavorites';
import { useAuth } from '../../context/AuthContext';

const FavoriteButton = ({ 
    restaurantId, 
    restaurantName,
    className = "",
    size = "medium", // "small", "medium", "large"
    variant = "default", // "default", "minimal", "card"
    showText = false 
}) => {
    const { user } = useAuth();
    const { isFavorited, loading, toggle } = useFavoriteStatus(restaurantId);
    const [actionLoading, setActionLoading] = useState(false);

    const handleToggle = async (e) => {
        e.stopPropagation();
        
        if (!user) {
            alert('Please log in to add favorites');
            return;
        }

        setActionLoading(true);
        try {
            await toggle();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Failed to update favorites. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    // Size classes
    const sizeClasses = {
        small: {
            button: "w-6 h-6",
            icon: "h-3 w-3",
            text: "text-xs"
        },
        medium: {
            button: "w-8 h-8",
            icon: "h-4 w-4", 
            text: "text-sm"
        },
        large: {
            button: "w-10 h-10",
            icon: "h-5 w-5",
            text: "text-base"
        }
    };

    // Variant styles
    const variantClasses = {
        default: "bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200",
        minimal: "bg-transparent hover:bg-gray-100",
        card: "bg-white/80 backdrop-blur-sm hover:bg-white"
    };

    const currentSize = sizeClasses[size];
    const currentVariant = variantClasses[variant];
    const isLoading = loading || actionLoading;

    if (showText) {
        return (
            <button
                onClick={handleToggle}
                disabled={isLoading || !user}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${currentVariant} ${className}`}
                title={isFavorited ? `Remove ${restaurantName} from favorites` : `Add ${restaurantName} to favorites`}
            >
                {isLoading ? (
                    <Loader className={`${currentSize.icon} text-orange-500 animate-spin`} />
                ) : (
                    <Heart 
                        className={`${currentSize.icon} transition-colors ${
                            isFavorited 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-600'
                        }`} 
                    />
                )}
                <span className={`font-medium ${currentSize.text} ${
                    isFavorited ? 'text-red-600' : 'text-gray-700'
                }`}>
                    {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading || !user}
            className={`${currentSize.button} rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 ${currentVariant} ${className}`}
            title={isFavorited ? `Remove ${restaurantName} from favorites` : `Add ${restaurantName} to favorites`}
        >
            {isLoading ? (
                <Loader className={`${currentSize.icon} text-orange-500 animate-spin`} />
            ) : (
                <Heart 
                    className={`${currentSize.icon} transition-colors ${
                        isFavorited 
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-600 hover:text-red-500'
                    }`} 
                />
            )}
        </button>
    );
};

export default FavoriteButton;
