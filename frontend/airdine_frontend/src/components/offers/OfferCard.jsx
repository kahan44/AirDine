// src/components/offers/OfferCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Tag, MapPin, Timer, CheckCircle, Copy, Check, User, Phone, Calendar } from 'lucide-react';
import { useActivation } from '../../context/ActivationContext';
import { offersAPI } from '../../services/api';

const OfferCard = ({ offer, variant = 'default', showUsageInfo = false }) => {
    // Always call ALL hooks at the top level - never conditionally
    const navigate = useNavigate();
    const { activateOffer, isOfferActivated, getActivatedOffer, getTimeRemaining } = useActivation();
    const [timeLeft, setTimeLeft] = useState(0);
    const [activationStep, setActivationStep] = useState('offer'); // 'offer', 'confirm', 'loading', 'activated'
    const [copied, setCopied] = useState(false);
    
    // Early returns only after ALL hooks are declared
    if (!offer) return null;

    // Calculate derived state
    const hasBackendActivation = offer.user_activation && offer.user_activation.activation_code;
    const isActivated = isOfferActivated(offer.id) || hasBackendActivation;
    const activatedData = getActivatedOffer(offer.id) || offer.user_activation;

    // Timer effect - runs for all variants
    useEffect(() => {
        if (isActivated && activatedData) {
            const updateTimer = () => {
                let remaining = 0;
                
                if (hasBackendActivation) {
                    // Calculate remaining time from backend data
                    const expiresAt = new Date(activatedData.expires_at);
                    const now = new Date();
                    remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
                } else {
                    // Use local context timer
                    remaining = getTimeRemaining(offer.id);
                }
                
                setTimeLeft(remaining);
                
                // If timer expires, handle expiration
                if (remaining <= 0 && activationStep === 'activated') {
                    setActivationStep('offer'); // Reset to allow new activation
                }
                
                return remaining > 0;
            };

            updateTimer();
            const interval = setInterval(() => {
                if (!updateTimer()) {
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isActivated, offer.id, getTimeRemaining, hasBackendActivation, activatedData, activationStep]);

    // Handle activation flow
    const handleUseOffer = () => {
        if (isActivated) return;
        setActivationStep('confirm');
    };

    const handleConfirmActivation = async () => {
        setActivationStep('loading');

        try {
            const response = await offersAPI.activateOffer(offer.id);
            const activationData = response.data;
            activateOffer(offer.id, activationData);
            setActivationStep('activated');
        } catch (error) {
            console.error('Activation failed:', error);
            setActivationStep('offer'); // Reset on error
            // You might want to show an error message to the user here
        }
    };

    const handleCopyCode = async () => {
        const codeToShare = activatedData?.activation_code || activatedData?.code;
        if (codeToShare) {
            await navigator.clipboard.writeText(codeToShare);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDiscountColor = (offerType) => {
        switch(offerType) {
            case 'percentage': return 'bg-red-500';
            case 'fixed': return 'bg-orange-500';
            case 'bogo': return 'bg-green-500';
            case 'combo': return 'bg-blue-500';
            case 'special': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    // Get discount display text based on offer type
    const getDiscountDisplay = (offer) => {
        // Use Django's discount_text if available, otherwise build it
        if (offer.discount_text) {
            return offer.discount_text;
        }
        
        // Fallback logic if discount_text is not available
        switch(offer.offer_type) {
            case 'percentage':
                return offer.discount_percentage ? `${offer.discount_percentage}% OFF` : 'DISCOUNT';
            case 'fixed':
                return offer.discount_amount ? `$${offer.discount_amount} OFF` : 'DISCOUNT';
            case 'bogo':
                return 'Buy 1 Get 1 FREE';
            case 'combo':
                return 'Combo Deal';
            case 'special':
                return 'Special Offer';
            default:
                return 'OFFER';
        }
    };

    const discountDisplay = getDiscountDisplay(offer);

    // Conditional rendering based on variant - AFTER all hooks
    if (variant === 'compact') {
        return (
            <div className="group relative bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border border-orange-200 rounded-xl p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-300/20 to-red-400/20 rounded-full -mr-8 -mt-8"></div>
                
                <div className="relative flex items-start justify-between">
                    <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`${getDiscountColor(offer.offer_type)} text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap`}>
                                {discountDisplay}
                            </span>
                            {(offer.restaurant_name || offer.restaurant?.name) && (
                                <span className="text-gray-600 text-xs bg-white px-2 py-1 rounded-full">• {offer.restaurant_name || offer.restaurant?.name}</span>
                            )}
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-orange-600 transition-colors">
                            {offer.title}
                        </h4>
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                            {offer.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Until {formatDate(offer.valid_until)}</span>
                            </div>
                            {offer.maximum_discount_amount && offer.offer_type === 'percentage' && (
                                <div className="flex items-center gap-1 text-green-600 font-semibold">
                                    <span>Save ${offer.maximum_discount_amount}</span>
                                </div>
                            )}
                            {offer.discount_amount && offer.offer_type === 'fixed' && (
                                <div className="flex items-center gap-1 text-green-600 font-semibold">
                                    <span>Save ${offer.discount_amount}</span>
                                </div>
                            )}
                            {offer.offer_type === 'bogo' && (
                                <div className="flex items-center gap-1 text-green-600 font-semibold">
                                    <span>Get FREE item</span>
                                </div>
                            )}
                            {(offer.offer_type === 'combo' || offer.offer_type === 'special') && (
                                <div className="flex items-center gap-1 text-blue-600 font-semibold">
                                    <span>Special Deal</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                        {offer.is_active ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                        ) : (
                            <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm"></div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    if (variant === 'redeemed') {
        return (
            <div className="group relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gray-600 text-white font-bold px-3 py-2 rounded-xl shadow-lg min-w-fit">
                        <div className="text-xs font-black leading-tight text-center whitespace-nowrap">Redeemed</div>
                    </div>
                </div>
                <div className="relative p-6 pt-16">
                    <div className="mb-4">
                        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{offer.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{offer.description}</p>
                    </div>
                    {(offer.restaurant_name || offer.restaurant?.name) && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                            <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{offer.restaurant_name || offer.restaurant?.name}</p>
                            </div>
                        </div>
                    )}
                    {/* Usage information */}
                    {showUsageInfo && (
                        <div className="space-y-2 mb-4">
                            {offer.status === 'used' && offer.usage_count > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="h-4 w-4" />
                                    <span>Used {offer.usage_count} time{offer.usage_count > 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {offer.expired_count > 0 && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                    <Timer className="h-4 w-4" />
                                    <span>Expired {offer.expired_count} time{offer.expired_count > 1 ? 's' : ''} without use</span>
                                </div>
                            )}
                            {offer.last_used && offer.status === 'used' && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Last used: {new Date(offer.last_used).toLocaleDateString()}</span>
                                </div>
                            )}
                            {offer.expired_at && offer.status === 'expired' && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Expired: {new Date(offer.expired_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 text-sm font-medium">Valid until {formatDate(offer.valid_until)}</span>
                        </div>
                        <button 
                            className={`px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed ${
                                offer.status === 'expired' 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-gray-300 text-gray-600'
                            }`}
                            disabled
                        >
                            {offer.status === 'expired' ? 'Expired' : 'Redeemed'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default/available offer rendering - FIXED HEIGHT AND LAYOUT
    return (
        <div className="group relative bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-2xl shadow-lg border border-orange-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-[480px] flex flex-col">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-400/20 to-orange-500/20 rounded-full -ml-12 -mb-12"></div>
            
            {/* Fixed Top Section - Header */}
            <div className="flex-shrink-0 relative">
                {/* Discount Badge - Floating */}
                <div className="absolute top-4 left-4 z-10">
                    <div className={`${getDiscountColor(offer.offer_type)} text-white font-bold px-3 py-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 min-w-fit`}>
                        <div className="text-xs font-black leading-tight text-center whitespace-nowrap">
                            {discountDisplay}
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                    {isActivated && timeLeft > 0 ? (
                        <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                            ✓ Active
                        </span>
                    ) : isActivated && timeLeft <= 0 ? (
                        <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                            ⏰ Expired
                        </span>
                    ) : offer.is_active ? (
                        <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                            ✓ Available
                        </span>
                    ) : (
                        <span className="bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                            Expired
                        </span>
                    )}
                </div>
                
                {/* Spacer for badges */}
                <div className="h-16"></div>
            </div>

            {/* Main Content Area - Fixed Height with Internal Scroll */}
            <div className="flex-1 px-6 pb-4 flex flex-col min-h-0">
                {/* Basic Offer Info - Always Visible */}
                <div className="flex-shrink-0 mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {offer.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {offer.description}
                    </p>
                </div>

                {/* Scrollable Details Area */}
                <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
                    {/* Restaurant Info */}
                    {(offer.restaurant_name || offer.restaurant?.name) && (
                        <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-100">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 text-sm truncate">{offer.restaurant_name || offer.restaurant?.name}</p>
                                {offer.restaurant_cuisine && (
                                    <p className="text-gray-500 text-xs truncate">{offer.restaurant_cuisine}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Savings Info */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">$</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-green-800 font-semibold text-xs">
                                    {offer.offer_type === 'bogo' ? 'Get FREE item' : 
                                     offer.offer_type === 'combo' ? 'Combo savings' : 
                                     'Save up to'}
                                </p>
                                <p className="text-green-900 font-bold text-sm">
                                    {offer.offer_type === 'percentage' && offer.maximum_discount_amount ? 
                                        `$${Math.round(offer.maximum_discount_amount)}` :
                                     offer.offer_type === 'fixed' && offer.discount_amount ? 
                                        `$${Math.round(offer.discount_amount)}` :
                                     offer.offer_type === 'bogo' ? 
                                        'Worth 50%' :
                                     offer.offer_type === 'combo' ? 
                                        'Great Deal' :
                                        'Special Price'
                                    }
                                </p>
                            </div>
                        </div>
                        {offer.minimum_order_amount && (
                            <div className="text-right flex-shrink-0">
                                <p className="text-green-600 text-xs">Min order</p>
                                <p className="text-green-800 font-semibold text-sm">${offer.minimum_order_amount}</p>
                            </div>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    {offer.terms_and_conditions && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                            <h4 className="text-blue-800 font-semibold text-xs mb-1 flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                Terms & Conditions
                            </h4>
                            <p className="text-blue-700 text-xs leading-relaxed line-clamp-2">{offer.terms_and_conditions}</p>
                        </div>
                    )}

                    {/* Remaining Uses Info */}
                    {offer.remaining_uses !== undefined && offer.remaining_uses !== null && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-3 w-3 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-purple-800 font-semibold text-sm">
                                        {offer.remaining_uses > 0 
                                            ? `${offer.remaining_uses} use${offer.remaining_uses > 1 ? 's' : ''} remaining`
                                            : 'No uses remaining'
                                        }
                                    </p>
                                    <p className="text-purple-600 text-xs">
                                        You can activate this offer {offer.remaining_uses > 0 ? `${offer.remaining_uses} more time${offer.remaining_uses > 1 ? 's' : ''}` : 'no more times'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Fixed Section - Validity and Actions */}
                <div className="flex-shrink-0 mt-4">
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-orange-100">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-gray-600 text-sm font-medium">
                                Until {formatDate(offer.valid_until)}
                            </span>
                        </div>
                        
                        {/* Timer display for activated offers */}
                        {isActivated && timeLeft > 0 && (
                            <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold border border-orange-200">
                                <Timer className="h-3 w-3" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Area - Fixed Height */}
                    <div className="h-16 flex items-center">
                        {/* Use Offer Button */}
                        {activationStep === 'offer' && !isActivated && (
                            <button
                                type="button"
                                onClick={handleUseOffer}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-md"
                            >
                                Use Offer
                            </button>
                        )}

                        {/* Expired State */}
                        {activationStep === 'offer' && isActivated && timeLeft <= 0 && (
                            <div className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-semibold text-sm text-center">
                                Offer Expired - Moved to Redeemed
                            </div>
                        )}

                        {/* Confirm Buttons */}
                        {activationStep === 'confirm' && !isActivated && (
                            <div className="w-full flex gap-2">
                                <button
                                    onClick={() => setActivationStep('offer')}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-3 rounded-lg transition-all duration-200 border border-gray-200 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmActivation}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                                >
                                    ✓ Activate
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {activationStep === 'loading' && (
                            <div className="w-full flex items-center justify-center py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-orange-200 rounded-full animate-spin border-t-orange-500"></div>
                                    <span className="text-gray-600 font-medium text-sm">Activating...</span>
                                </div>
                            </div>
                        )}

                        {/* Activated State - Compact */}
                        {(isActivated || activationStep === 'activated') && (
                            <div className="w-full">
                                <div className={`flex items-center justify-between p-3 rounded-lg ${timeLeft > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${timeLeft > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                            <span className="text-white text-xs">🎫</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <code className={`font-mono font-bold text-sm ${timeLeft > 0 ? 'text-green-700' : 'text-red-700'} ${timeLeft <= 0 ? 'opacity-50' : ''} block truncate`}>
                                                {activatedData?.activation_code || activatedData?.code || 'LOADING...'}
                                            </code>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {timeLeft > 0 && (
                                            <>
                                                <span className="text-green-600 font-bold text-xs">{formatTime(timeLeft)}</span>
                                                <button
                                                    onClick={handleCopyCode}
                                                    className="p-2 bg-white hover:bg-green-50 border border-green-300 rounded-lg transition-all duration-200 transform hover:scale-105"
                                                    title="Copy code"
                                                >
                                                    {copied ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 text-green-600" />
                                                    )}
                                                </button>
                                            </>
                                        )}
                                        {timeLeft <= 0 && (
                                            <span className="text-red-600 font-bold text-xs">EXPIRED</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferCard;