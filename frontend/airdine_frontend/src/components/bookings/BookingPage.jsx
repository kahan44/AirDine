// Enhanced Booking Page Component with status tabs and modern styling
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowLeft, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  Phone,
  Mail,
  Star,
  Tag,
  CreditCard,
  Loader,
  User,
  Utensils
} from 'lucide-react';
import { bookingAPI } from '../../services/api';
import PageHeader from "../common/PageHeader";
import { Link as RouterLink } from 'react-router-dom';

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeTab]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getBookings();
      setBookings(response);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (activeTab === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === activeTab));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setCancelingId(bookingId);
    try {
      await bookingAPI.cancelBooking(bookingId);
      // Remove the booking from the list since it's deleted from database
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + error.message);
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'completed':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <Star className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const canCancelBooking = (booking) => {
    return booking.status === 'pending' && booking.can_cancel;
  };

  const getBookingCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
    };
  };

  const counts = getBookingCounts();

  const tabs = [
    { id: 'all', label: 'All Bookings', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-6">
          <PageHeader
            title="My Bookings"
            subtitle="Manage your restaurant reservations"
            icon={Calendar}
            actions={
              <RouterLink
                to="/user/dashboard"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Dashboard
              </RouterLink>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Bookings</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchBookings}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <Calendar className="h-24 w-24 text-orange-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Bookings Yet</h2>
              <p className="text-gray-600 mb-8">
                You haven't made any restaurant reservations yet. Start exploring our amazing restaurants!
              </p>
              <Link
                to="/restaurants"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Utensils className="h-5 w-5 mr-2" />
                Browse Restaurants
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header with Action Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Reservations</h2>
                <p className="text-gray-600 mt-1">Manage your restaurant bookings</p>
              </div>
              <Link
                to="/restaurants"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Make New Booking
              </Link>
            </div>

            {/* Status Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <nav className="flex space-x-1" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    } px-4 py-3 font-medium text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 min-w-0 flex-1 justify-center`}
                  >
                    <span className="truncate">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`${
                        activeTab === tab.id
                          ? 'bg-white text-orange-500'
                          : 'bg-gray-200 text-gray-600'
                      } px-2 py-1 text-xs rounded-full font-bold`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab === 'all' ? '' : activeTab} bookings found
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? "You don't have any bookings yet." 
                    : `You don't have any ${activeTab} bookings.`}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {booking.restaurant_name}
                            </h3>
                            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 font-medium">
                            Reservation #{booking.booking_reference}
                          </p>
                        </div>
                        
                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelingId === booking.id}
                            className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            {cancelingId === booking.id ? (
                              <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(booking.booking_date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Time</p>
                            <p className="font-semibold text-gray-900">{formatTime(booking.time_slot_time)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Users className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Party Size</p>
                            <p className="font-semibold text-gray-900">{booking.party_size} guests</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900 font-medium">{booking.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{booking.customer_phone}</span>
                        </div>
                      </div>

                      {/* Pricing Info */}
                      {booking.final_amount > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-5 w-5 text-orange-500" />
                              <span className="font-medium text-gray-900">Total Amount</span>
                            </div>
                            <div className="text-right">
                              {booking.discount_amount > 0 && (
                                <p className="text-sm text-gray-600 line-through">${booking.original_amount}</p>
                              )}
                              <p className="text-xl font-bold text-gray-900">${booking.final_amount}</p>
                              {booking.offer_title && (
                                <p className="text-sm text-orange-600 font-medium">{booking.offer_title} applied</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Special Requests */}
                      {booking.special_requests && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-blue-900 mb-2">Special Requests</h4>
                          <p className="text-blue-800 text-sm">{booking.special_requests}</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <span>Created on {new Date(booking.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {booking.confirmed_at && (
                          <span className="text-green-600 font-medium">
                            Confirmed on {new Date(booking.confirmed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
