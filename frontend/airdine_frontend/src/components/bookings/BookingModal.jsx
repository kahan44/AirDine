import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BookingModal = ({ isOpen, onClose, restaurantId, restaurantName }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 2,
    special_requests: '',
    customer_name: '',
    customer_phone: '',
    customer_email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [timeSlots, setTimeSlots] = useState([
    { time: '11:00' }, { time: '11:30' }, { time: '12:00' }, { time: '12:30' }, 
    { time: '13:00' }, { time: '13:30' }, { time: '18:00' }, { time: '18:30' }, 
    { time: '19:00' }, { time: '19:30' }, { time: '20:00' }, { time: '20:30' }
  ]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [dateInfo, setDateInfo] = useState({
    today: '',
    min_date: '',
    max_date: '',
    valid_dates: []
  });

  // Fetch date info when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDateInfo();
    }
  }, [isOpen]);

  const fetchDateInfo = async () => {
    try {
      const dateInfo = await bookingAPI.getBookingDateInfo();
      setDateInfo(dateInfo);
    } catch (error) {
      console.error('Error fetching date info:', error);
      // Fallback to client-side calculation if server fails
      const today = new Date().toISOString().split('T')[0];
      const maxDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDateInfo({
        today: today,
        min_date: today,
        max_date: maxDate,
        valid_dates: []
      });
    }
  };

  // Fetch available time slots when date changes
  useEffect(() => {
    if (formData.date && restaurantId) {
      fetchTimeSlots();
    }
  }, [formData.date, restaurantId]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        date: '',
        time: '',
        guests: 2,
        special_requests: '',
        customer_name: '',
        customer_phone: '',
        customer_email: ''
      });
      setError('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Auto-fill customer details from user profile
  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        customer_phone: user.phone || '',
        customer_email: user.email || ''
      }));
    }
  }, [isOpen, user]);

  const fetchTimeSlots = async () => {
    setLoadingTimeSlots(true);
    try {
      const slots = await bookingAPI.getRestaurantTimeSlots(restaurantId, formData.date);
      console.log('API response for time slots:', slots);
      
      // Ensure we always set an array
      if (Array.isArray(slots)) {
        setTimeSlots(slots);
      } else if (slots && Array.isArray(slots.time_slots)) {
        setTimeSlots(slots.time_slots);
      } else if (slots && Array.isArray(slots.data)) {
        setTimeSlots(slots.data);
      } else {
        console.warn('API returned non-array time slots:', slots);
        setTimeSlots([
          { time: '11:00' }, { time: '11:30' }, { time: '12:00' }, { time: '12:30' }, 
          { time: '13:00' }, { time: '13:30' }, { time: '18:00' }, { time: '18:30' }, 
          { time: '19:00' }, { time: '19:30' }, { time: '20:00' }, { time: '20:30' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Fallback to default time slots
      setTimeSlots([
        { time: '11:00' }, { time: '11:30' }, { time: '12:00' }, { time: '12:30' }, 
        { time: '13:00' }, { time: '13:30' }, { time: '18:00' }, { time: '18:30' }, 
        { time: '19:00' }, { time: '19:30' }, { time: '20:00' }, { time: '20:30' }
      ]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Find the selected time slot to get its ID
      const selectedTimeSlot = timeSlots.find(slot => 
        (slot.time || slot) === formData.time
      );
      
      if (!selectedTimeSlot || !selectedTimeSlot.id) {
        setError('Please select a valid time slot.');
        return;
      }

      const bookingData = {
        restaurant_id: restaurantId,
        time_slot_id: selectedTimeSlot.id,
        booking_date: formData.date,
        party_size: formData.guests,
        special_requests: formData.special_requests,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email
      };

      await bookingAPI.createBooking(bookingData);
      setIsSuccess(true);
      
      // Refresh time slots to show updated availability
      if (formData.date) {
        fetchTimeSlots();
      }
      
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset form
        setFormData({
          date: '',
          time: '',
          guests: 2,
          special_requests: '',
          customer_name: '',
          customer_phone: '',
          customer_email: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Enhanced Header - Fixed at top */}
        <div className="relative bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 border-b border-gray-200/50 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Book a Table
              </h2>
              <p className="text-gray-600 mt-1">Reserve your perfect dining experience</p>
            </div>
            <button
              onClick={onClose}
              className="group p-2 hover:bg-red-100 rounded-xl transition-all duration-300 flex-shrink-0"
            >
              <X className="h-6 w-6 text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{isSuccess ? (
            <div className="text-center py-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600 text-lg">
                Your table has been reserved at <span className="font-semibold text-orange-600">{restaurantName}</span>
              </p>
            </div>
          ) : (
            <>
              {restaurantName && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{restaurantName}</h3>
                      <p className="text-orange-600 font-medium text-sm">Table Reservation</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Enhanced Date and Time */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">When would you like to dine?</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Select Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={dateInfo.min_date}
                        max={dateInfo.max_date}
                        required
                        className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Select Time
                      </label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        disabled={loadingTimeSlots}
                        className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900 disabled:opacity-50 appearance-none cursor-pointer"
                      >
                        <option value="">
                          {loadingTimeSlots ? 'Loading times...' : 'Select time'}
                        </option>
                        {Array.isArray(timeSlots) && timeSlots.map(slot => (
                          <option key={slot.id || slot.time || slot} value={slot.time || slot}>
                            {slot.time || slot} {slot.available_slots !== undefined ? `(${slot.available_slots} available)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Enhanced Guests */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Party Size</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Number of Guests
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enhanced Customer Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-gray-900"
                    />
                  </div>
                </div>

                {/* Enhanced Special Requests */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleChange}
                      placeholder="Any special requests, dietary requirements, or occasion details?"
                      rows="3"
                      className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-gray-900 resize-none"
                    />
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Enhanced Submit Button with Cancel */}
                <div className="mt-6 pt-4 border-t border-gray-200/50">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:shadow-lg hover:scale-105 transform min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Booking...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          <span>Confirm Booking</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
