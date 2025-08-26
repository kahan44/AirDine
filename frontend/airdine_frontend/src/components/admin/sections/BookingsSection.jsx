import React, { useMemo, useState } from 'react';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';

const BookingsSection = ({ bookings, onReload, onSuccess, onError, adminAPI }) => {
  const [filter, setFilter] = useState('all');
  const [rowAction, setRowAction] = useState({});
  const [sortBy, setSortBy] = useState('date');

  const filtered = useMemo(() => {
    let result = filter === 'all' ? bookings : bookings.filter(b => (b.status || '').toLowerCase() === filter);
    
    // Sort bookings
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.booking_date || 0) - new Date(a.booking_date || 0);
      }
      return 0;
    });
    
    return result;
  }, [bookings, filter, sortBy]);

  const filterOptions = [
    { id: 'all', label: 'All Bookings', count: bookings.length, color: 'bg-gray-100 text-gray-700' },
    { 
      id: 'pending', 
      label: 'Pending', 
      count: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
      color: 'bg-yellow-100 text-yellow-700'
    },
    { 
      id: 'confirmed', 
      label: 'Confirmed', 
      count: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
      color: 'bg-blue-100 text-blue-700'
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      count: bookings.filter(b => b.status?.toLowerCase() === 'completed').length,
      color: 'bg-green-100 text-green-700'
    },
  ];

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle };
      case 'completed':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg overflow-hidden">
      {/* Enhanced header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking Management</h2>
              <p className="text-gray-600">{filtered.length} of {bookings.length} bookings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
              <Filter className="w-4 h-4 text-gray-500 ml-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-transparent text-sm focus:outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {filterOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                filter === option.id 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option.label}</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs ${
                filter === option.id ? 'bg-white/20' : option.color
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced bookings list */}
      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'No bookings to display.' : `No ${filter} bookings at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => {
              const date = booking.booking_date ? new Date(booking.booking_date) : null;
              const timeStr = booking.time_slot_time || booking.time || booking.slot_time || booking.booking_time || '';
              const ref = booking.booking_reference || booking.reference || booking.id;
              const name = booking.customer_name || booking.user_name || booking.user_email || 'Guest';
              const contact = booking.customer_phone || booking.user_phone || '';
              const party = booking.party_size || booking.guests || booking.guest_count || 1;
              const status = (booking.status || '').toLowerCase();
              const statusConfig = getStatusConfig(status);
              const acting = rowAction[booking.id];

              return (
                <div key={booking.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Booking info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{name}</p>
                          <p className="text-sm text-gray-500 font-mono">#{ref}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {date ? date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            }) : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {timeStr ? new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], {
                              hour: '2-digit', 
                              minute: '2-digit'
                            }) : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {contact && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{contact}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{party} guest{party !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and actions */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${statusConfig.color}`}>
                        <statusConfig.icon className="w-4 h-4 inline mr-1" />
                        {(status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1)}
                      </span>

                      <div className="flex items-center gap-2">
                        {status === 'pending' && (
                          <button
                            disabled={!!acting}
                            onClick={async () => {
                              try {
                                setRowAction(a => ({...a, [booking.id]: 'confirm'}));
                                await adminAPI.updateBookingStatus(booking.id, 'confirmed');
                                await onReload();
                                onSuccess('Booking confirmed successfully');
                              } catch(e) {
                                onError(e.message || 'Failed to confirm booking');
                              } finally {
                                setRowAction(a => ({...a, [booking.id]: undefined}));
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {acting === 'confirm' ? 'Confirming...' : 'Confirm'}
                          </button>
                        )}

                        {['pending', 'confirmed'].includes(status) && (
                          <button
                            disabled={!!acting}
                            onClick={async () => {
                              try {
                                setRowAction(a => ({...a, [booking.id]: 'complete'}));
                                await adminAPI.updateBookingStatus(booking.id, 'completed');
                                await onReload();
                                onSuccess('Booking marked as completed');
                              } catch(e) {
                                onError(e.message || 'Failed to complete booking');
                              } finally {
                                setRowAction(a => ({...a, [booking.id]: undefined}));
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {acting === 'complete' ? 'Completing...' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsSection;
