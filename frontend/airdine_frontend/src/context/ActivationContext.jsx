import React, { createContext, useContext, useState, useEffect } from 'react';

const ActivationContext = createContext();

export const useActivation = () => {
  const context = useContext(ActivationContext);
  if (!context) {
    throw new Error('useActivation must be used within ActivationProvider');
  }
  return context;
};

export const ActivationProvider = ({ children }) => {
  const [activatedOffers, setActivatedOffers] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('airdine_activated_offers');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out expired offers
        const now = new Date();
        const valid = {};
        
        Object.entries(parsed).forEach(([offerId, data]) => {
          if (data.expiresAt && new Date(data.expiresAt) > now) {
            valid[offerId] = data;
          }
        });
        
        setActivatedOffers(valid);
      }
    } catch (error) {
      console.error('Error loading activated offers:', error);
      localStorage.removeItem('airdine_activated_offers');
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('airdine_activated_offers', JSON.stringify(activatedOffers));
  }, [activatedOffers]);

  const activateOffer = (offerId, activationData) => {
    if (!activationData?.activation) return;

    const { activation } = activationData;
    const offerData = {
      offerId: parseInt(offerId),
      code: activation.activation_code,
      expiresAt: activation.expires_at,
      activatedAt: activation.created_at || new Date().toISOString(),
      offerTitle: activation.offer_title,
      restaurantName: activation.restaurant_name
    };

    setActivatedOffers(prev => ({
      ...prev,
      [offerId]: offerData
    }));
  };

  const isOfferActivated = (offerId) => {
    const data = activatedOffers[offerId];
    if (!data) return false;

    // Check if expired
    if (data.expiresAt && new Date(data.expiresAt) <= new Date()) {
      // Remove expired offer
      setActivatedOffers(prev => {
        const updated = { ...prev };
        delete updated[offerId];
        return updated;
      });
      return false;
    }

    return true;
  };

  const getActivatedOffer = (offerId) => {
    if (!isOfferActivated(offerId)) return null;
    return activatedOffers[offerId];
  };

  const getTimeRemaining = (offerId) => {
    const data = activatedOffers[offerId];
    if (!data?.expiresAt) return 0;

    const now = new Date();
    const expires = new Date(data.expiresAt);
    return Math.max(0, Math.floor((expires - now) / 1000));
  };

  return (
    <ActivationContext.Provider
      value={{
        activateOffer,
        isOfferActivated,
        getActivatedOffer,
        getTimeRemaining
      }}
    >
      {children}
    </ActivationContext.Provider>
  );
};

export default ActivationContext;
