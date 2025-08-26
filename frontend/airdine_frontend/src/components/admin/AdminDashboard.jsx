// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '../common/PageHeader';
import { 
  BarChart3, 
  ClipboardList, 
  Gift, 
  MessageSquare, 
  Utensils, 
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  LogOut,
  User
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import OverviewSection from './sections/OverviewSection';
import BookingsSection from './sections/BookingsSection';
import ReviewsSection from './sections/ReviewsSection';
import OffersSection from './sections/OffersSection';
import RestaurantSection from './sections/RestaurantSection';
import MenuSection from './sections/MenuSection';

// StatCard moved to parts/StatCard and used inside OverviewSection

// Enhanced notification component
const NotificationToast = ({ type, message, onClose }) => {
  const isSuccess = type === 'success';
  const isError = type === 'error';
  
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 ease-in-out ${
      message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`p-4 rounded-xl shadow-lg backdrop-blur-sm border ${
        isSuccess 
          ? 'bg-green-50/90 border-green-200 text-green-800' 
          : 'bg-red-50/90 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isSuccess ? 'hover:bg-green-100' : 'hover:bg-red-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [tab, setTab] = useState('overview');
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const [ov, bks, rvs, ofs, rest] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getBookings(),
        adminAPI.getReviews(),
        adminAPI.getOffers(),
        adminAPI.getRestaurant(),
      ]);
      setOverview(ov);
      setBookings(bks);
      setReviews(rvs);
      setOffers(ofs);
      setRestaurant(rest);
      setLastUpdated(new Date());
      
      if (isRefresh) {
        setSuccess('Data refreshed successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError(e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    loadData(true);
  }, []);

  const clearNotifications = useCallback(() => {
    setSuccess('');
    setError('');
  }, []);

  const handleLogout = useCallback(() => {
    // Clear all stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    
    // Clear any session storage as well
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userType');
    
    // Show logout success message briefly
    setSuccess('Logged out successfully');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }, []);

  useEffect(() => { loadData(); }, []);

  // Auto-clear notifications
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(clearNotifications, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearNotifications]);

  const reloadBookings = async () => {
    const updated = await adminAPI.getBookings();
    setBookings(updated);
  };

  const reloadOffers = async () => {
    const updated = await adminAPI.getOffers();
    setOffers(updated);
  };

  // Tab configuration with enhanced styling
  const tabs = [
    {
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      description: 'Dashboard overview and analytics'
    },
    {
      id: 'bookings', 
      label: 'Bookings', 
      icon: ClipboardList,
      color: 'from-blue-500 to-indigo-500',
      description: 'Manage reservations and bookings'
    },
    {
      id: 'menu', 
      label: 'Menu', 
      icon: Utensils,
      color: 'from-green-500 to-emerald-500',
      description: 'Manage menu items and categories'
    },
    {
      id: 'reviews', 
      label: 'Reviews', 
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      description: 'Customer feedback and ratings'
    },
    {
      id: 'offers', 
      label: 'Offers', 
      icon: Gift,
      color: 'from-indigo-500 to-purple-500',
      description: 'Promotions and special deals'
    },
    {
      id: 'restaurant', 
      label: 'Restaurant', 
      icon: Settings,
      color: 'from-amber-500 to-orange-500',
      description: 'Restaurant profile and settings'
    },
  ];

  const currentTab = tabs.find(t => t.id === tab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/30">
      {/* Enhanced notification system */}
      <NotificationToast 
        type="success" 
        message={success} 
        onClose={() => setSuccess('')} 
      />
      <NotificationToast 
        type="error" 
        message={error} 
        onClose={() => setError('')} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                  <Utensils className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {overview?.restaurant?.name || 'Admin Dashboard'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage your restaurant operations and analytics
                  </p>
                  {lastUpdated && (
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>
                
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {overview?.stats?.total_bookings || 0} Total Bookings
                  </span>
                </div>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Admin
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Enhanced skeleton loader */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg">
              <div className="animate-pulse p-8">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-red-200 shadow-lg p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => loadData()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced tabs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-3 mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`group relative px-4 py-3 lg:px-6 lg:py-4 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                      tab === t.id 
                        ? `bg-gradient-to-r ${t.color} text-white shadow-lg scale-[1.02]` 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-transparent'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3">
                      <t.icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-300 ${
                        tab === t.id ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      <span className="text-xs lg:text-sm whitespace-nowrap leading-tight">
                        {t.label}
                      </span>
                    </div>
                    
                    {tab === t.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content with enhanced transitions */}
            <div className="space-y-6">
              {currentTab && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentTab.color} flex items-center justify-center text-white`}>
                      <currentTab.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{currentTab.label}</h2>
                      <p className="text-gray-600 text-sm">{currentTab.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="animate-in fade-in duration-300">
                {tab === 'overview' && <OverviewSection overview={overview} reviews={reviews} />}

                {tab === 'bookings' && (
                  <BookingsSection
                    bookings={bookings}
                    onReload={reloadBookings}
                    onSuccess={(msg) => {
                      setSuccess(msg);
                      setTimeout(() => setSuccess(''), 3000);
                    }}
                    onError={(msg) => {
                      setError(msg);
                      setTimeout(() => setError(''), 5000);
                    }}
                    adminAPI={adminAPI}
                  />
                )}

                {tab === 'menu' && (
                  <MenuSection
                    onSuccess={(msg) => {
                      setSuccess(msg);
                      setTimeout(() => setSuccess(''), 3000);
                    }}
                    onError={(msg) => {
                      setError(msg);
                      setTimeout(() => setError(''), 5000);
                    }}
                    adminAPI={adminAPI}
                  />
                )}

                {tab === 'reviews' && <ReviewsSection reviews={reviews} />}

                {tab === 'offers' && (
                  <OffersSection
                    offers={offers}
                    onReload={reloadOffers}
                    onSuccess={(msg) => {
                      setSuccess(msg);
                      setTimeout(() => setSuccess(''), 3000);
                    }}
                    onError={(msg) => {
                      setError(msg);
                      setTimeout(() => setError(''), 5000);
                    }}
                    adminAPI={adminAPI}
                  />
                )}

                {tab === 'restaurant' && restaurant && (
                  <RestaurantSection
                    restaurant={restaurant}
                    saving={savingRestaurant}
                    onSave={async (payload) => {
                      setSavingRestaurant(true);
                      try {
                        const saved = await adminAPI.updateRestaurant(payload);
                        setRestaurant(saved);
                        setSuccess('Restaurant profile updated successfully');
                        setTimeout(() => setSuccess(''), 3000);
                      } catch (e) {
                        setError(e.message || 'Failed to save restaurant profile');
                        setTimeout(() => setError(''), 5000);
                      } finally {
                        setSavingRestaurant(false);
                      }
                    }}
                  />
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
