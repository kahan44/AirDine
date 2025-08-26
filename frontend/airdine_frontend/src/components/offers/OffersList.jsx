// src/components/offers/OffersList.jsx
import React from 'react';
import { useRestaurantOffers } from '../../hooks/useOffers';
import OfferCard from './OfferCard';
import { Loader2, Gift, AlertCircle } from 'lucide-react';

const OffersList = ({ restaurantId, variant = 'default' }) => {
    const { offers, loading, error } = useRestaurantOffers(restaurantId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
                    <p className="text-gray-600">Loading offers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Failed to load offers</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!offers || offers.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Available</h3>
                    <p className="text-gray-600">
                        This restaurant doesn't have any active offers at the moment.
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Check back later for exciting deals!
                    </p>
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Special Offers</h3>
                    <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                        {offers.length} Available
                    </span>
                </div>
                <div className="space-y-3">
                    {offers.map((offer) => (
                        <OfferCard 
                            key={offer.id} 
                            offer={offer} 
                            variant="compact"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-full">
                        <Gift className="h-8 w-8 text-orange-600" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Discover amazing deals and exclusive discounts from your favorite restaurants
                </p>
                <div className="mt-4">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg">
                        {offers.length} Offer{offers.length !== 1 ? 's' : ''} Available
                    </span>
                </div>
            </div>

            {/* Offers Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                ))}
            </div>
        </div>
    );
};

export default OffersList;