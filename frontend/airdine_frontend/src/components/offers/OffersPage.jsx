// src/components/offers/OffersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOffers } from '../../hooks/useOffers';
import OfferCard from './OfferCard';
import { offersAPI } from '../../services/api';
import { Loader2, Gift, AlertCircle, Search, Filter, SortDesc, ArrowLeft } from 'lucide-react';
import PageHeader from "../common/PageHeader";

const OffersPage = () => {
    const { offers, loading, error } = useOffers();
    const [redeemedOffers, setRedeemedOffers] = useState([]);
    const [activeTab, setActiveTab] = useState('available');
    const [redeemedLoading, setRedeemedLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('discount'); // discount, expiry, restaurant
    const [filterBy, setFilterBy] = useState('all'); // all, active, expired

    // Load redeemed offers when component mounts
    useEffect(() => {
        loadRedeemedOffers();
    }, []);

    const loadRedeemedOffers = async () => {
        try {
            setRedeemedLoading(true);
            const response = await offersAPI.getRedeemedOffers();
            console.log('Redeemed offers response:', response);
            setRedeemedOffers(response.results || response.data || []);
        } catch (error) {
            console.error('Error loading redeemed offers:', error);
            setRedeemedOffers([]);
        } finally {
            setRedeemedLoading(false);
        }
    };

    // Filter and sort offers based on active tab
    const filteredAndSortedOffers = React.useMemo(() => {
        // Choose the right dataset based on active tab
        const currentOffers = activeTab === 'available' ? (offers || []) : redeemedOffers;
        
        if (!currentOffers) return [];

        let filtered = currentOffers.filter(offer => {
            // Search filter
            const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (offer.restaurant_name && offer.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (offer.restaurant?.name && offer.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter - only apply to available offers
            if (activeTab === 'available') {
                const matchesFilter = filterBy === 'all' || 
                                    (filterBy === 'active' && offer.is_active) ||
                                    (filterBy === 'expired' && !offer.is_active);
                return matchesSearch && matchesFilter;
            } else {
                // For redeemed offers, just apply search filter
                return matchesSearch;
            }
        });

        // Sort offers
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'discount':
                    return (b.discount_percent || 0) - (a.discount_percent || 0);
                case 'expiry':
                    return new Date(a.valid_until) - new Date(b.valid_until);
                case 'restaurant':
                    const aName = a.restaurant_name || a.restaurant?.name || '';
                    const bName = b.restaurant_name || b.restaurant?.name || '';
                    return aName.localeCompare(bName);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [offers, redeemedOffers, activeTab, searchTerm, sortBy, filterBy]);

    if (loading || (activeTab === 'redeemed' && redeemedLoading)) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">
                                Loading {activeTab === 'available' ? 'available' : 'redeemed'} offers...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Offers</h2>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <PageHeader
                        title="My Offers"
                        subtitle="Manage your available and redeemed offers"
                        icon={Gift}
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

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
                        <button
                            onClick={() => setActiveTab('available')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'available'
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Available Offers ({offers?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('redeemed')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'redeemed'
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Redeemed Offers ({redeemedOffers.length})
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab} offers...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter - only show for available offers */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                                disabled={activeTab === 'redeemed'}
                            >
                                <option value="all">All Offers</option>
                                {activeTab === 'available' && (
                                    <>
                                        <option value="active">Active Only</option>
                                        <option value="expired">Expired Only</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                            >
                                <option value="discount">By Discount</option>
                                {activeTab === 'available' && <option value="expiry">By Expiry</option>}
                                <option value="restaurant">By Restaurant</option>
                                {activeTab === 'redeemed' && <option value="usage">By Usage Date</option>}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results summary */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-gray-600">
                        Showing {filteredAndSortedOffers.length} of {
                            activeTab === 'available' ? (offers?.length || 0) : redeemedOffers.length
                        } {activeTab} offers
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                            Clear search
                        </button>
                    )}
                </div>

                {/* Offers Grid */}
                {filteredAndSortedOffers.length === 0 ? (
                    <div className="text-center py-20">
                        <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            {searchTerm ? `No ${activeTab} offers found` : `No ${activeTab} offers available`}
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm 
                                ? 'Try adjusting your search or filters' 
                                : activeTab === 'available' 
                                    ? 'Check back later for exciting deals!'
                                    : 'You haven\'t redeemed any offers yet.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAndSortedOffers.map((offer) => (
                            <OfferCard 
                                key={offer.id} 
                                offer={offer} 
                                variant={activeTab === 'redeemed' ? 'redeemed' : 'default'}
                                showUsageInfo={activeTab === 'redeemed'}
                            />
                        ))}
                    </div>
                )}

                {/* Terms and Conditions */}
                <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                        Terms and Conditions
                    </h3>
                    <div className="space-y-3 text-gray-600">
                        <div className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                1
                            </span>
                            <p>
                                User must be physically present at the respective restaurant mentioned in the offer to use the offer.
                            </p>
                        </div>
                        <div className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                2
                            </span>
                            <p>
                                Some offers contain limited amount of user access and may become unavailable once the limit is reached.
                            </p>
                        </div>
                        <div className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                3
                            </span>
                            <p>
                                Once an offer is activated and not used within the given time period, it will expire and cannot be redeemed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffersPage;