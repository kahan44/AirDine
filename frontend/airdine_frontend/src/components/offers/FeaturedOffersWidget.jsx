// src/components/offers/FeaturedOffersWidget.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedOffers } from '../../hooks/useOffers';
import OfferCard from './OfferCard';
import { Loader2, Gift, AlertCircle, ArrowRight } from 'lucide-react';

const FeaturedOffersWidget = () => {
    const { featuredOffers, loading, error } = useFeaturedOffers();

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Loading featured offers...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm mb-1">Failed to load offers</p>
                        <p className="text-gray-500 text-xs">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!featuredOffers || featuredOffers.length === 0) {
        return (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <div className="text-center py-8">
                    <Gift className="h-8 w-8 text-orange-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Featured Offers</h3>
                    <p className="text-gray-600 text-sm">
                        No featured offers available right now. Check back soon for exciting deals!
                    </p>
                </div>
            </div>
        );
    }

    // Show maximum 3 offers in the widget
    const displayOffers = featuredOffers.slice(0, 3);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-lg">Featured Offers</h3>
                        <p className="text-orange-100 text-sm">Don't miss these amazing deals!</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                        <Gift className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Offers */}
            <div className="p-4 space-y-3">
                {displayOffers.map((offer) => (
                    <OfferCard 
                        key={offer.id} 
                        offer={offer} 
                        variant="compact"
                    />
                ))}
            </div>

            {/* Footer */}
            {featuredOffers.length > 3 && (
                <div className="border-t border-gray-100 p-4">
                    <Link 
                        to="/offers"
                        className="flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
                    >
                        <span>View All {featuredOffers.length} Offers</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FeaturedOffersWidget;