import React, { useState } from 'react';
import { 
  Plus, 
  Gift, 
  Calendar, 
  Percent, 
  DollarSign,
  Users,
  Star,
  Edit3,
  Power,
  PowerOff,
  X,
  Tag,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Ticket
} from 'lucide-react';
import RedemptionModal from '../RedemptionModal';

const defaultOffer = {
  title: '',
  description: '',
  offer_type: 'percentage',
  discount_percentage: '',
  discount_amount: '',
  valid_from: '',
  valid_until: '',
  valid_days: [],
  minimum_order_amount: '',
  maximum_discount_amount: '',
  max_uses: '',
  max_uses_per_user: 1,
  is_active: true,
  is_featured: false,
  terms_and_conditions: '',
  image: '',
};

const dayOptions = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

// Modal Component
const OfferModal = ({ isOpen, onClose, onSubmit, saving, editData = null }) => {
  const [form, setForm] = useState(editData || defaultOffer);

  // Update form when editData changes
  React.useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm({...defaultOffer});
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    if (!editData) {
      setForm({...defaultOffer});
    }
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!editData;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-white/60 shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
        {/* Modal Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${isEditing ? 'from-blue-500 to-indigo-500' : 'from-green-500 to-emerald-500'} flex items-center justify-center text-white`}>
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Update Offer' : 'Create New Offer'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Modify your promotional offer details' : 'Set up a new promotional offer for your restaurant'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6" id="offerForm">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Tag className="w-3 h-3 text-white" />
                  </div>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Title *</label>
                    <input 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm" 
                      placeholder="e.g., Weekend Special" 
                      value={form.title} 
                      onChange={(e) => setForm({...form, title: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Offer Type *</label>
                    <select 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm" 
                      value={form.offer_type} 
                      onChange={(e) => setForm({...form, offer_type: e.target.value})}
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Off</option>
                      <option value="bogo">Buy 1 Get 1</option>
                      <option value="combo">Combo Deal</option>
                      <option value="special">Special Offer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Description *</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm resize-none" 
                    placeholder="Describe your offer in detail..." 
                    rows={3}
                    value={form.description} 
                    onChange={(e) => setForm({...form, description: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              {/* Discount Details */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-100/50 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                    <Percent className="w-3 h-3 text-white" />
                  </div>
                  Discount Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.offer_type === 'percentage' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Discount Percentage (%) *</label>
                      <input 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        max="100"
                        placeholder="e.g., 20" 
                        value={form.discount_percentage} 
                        onChange={(e) => setForm({...form, discount_percentage: e.target.value})} 
                        required
                      />
                    </div>
                  )}
                  {form.offer_type === 'fixed' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Discount Amount ($) *</label>
                      <input 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="e.g., 10.00" 
                        value={form.discount_amount} 
                        onChange={(e) => setForm({...form, discount_amount: e.target.value})} 
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Minimum Order Amount ($) {(form.offer_type === 'percentage' || form.offer_type === 'fixed') ? '*' : ''}
                    </label>
                    <input 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="e.g., 25.00" 
                      value={form.minimum_order_amount} 
                      onChange={(e) => setForm({...form, minimum_order_amount: e.target.value})} 
                      required={form.offer_type === 'percentage' || form.offer_type === 'fixed'}
                    />
                  </div>
                  {form.offer_type === 'percentage' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Maximum Discount Amount ($) *</label>
                      <input 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="e.g., 50.00" 
                        value={form.maximum_discount_amount} 
                        onChange={(e) => setForm({...form, maximum_discount_amount: e.target.value})} 
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Validity Period */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-100/50 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  Validity Period
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Valid From *</label>
                    <input 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm" 
                      type="datetime-local" 
                      value={form.valid_from} 
                      onChange={(e) => setForm({...form, valid_from: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Valid Until *</label>
                    <input 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm" 
                      type="datetime-local" 
                      value={form.valid_until} 
                      onChange={(e) => setForm({...form, valid_until: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Valid Days</label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map(d => (
                      <label 
                        key={d} 
                        className={`px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                          form.valid_days.includes(d) 
                            ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-sm' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={form.valid_days.includes(d)} 
                          onChange={(e) => {
                            const set = new Set(form.valid_days);
                            if (e.target.checked) set.add(d); else set.delete(d);
                            setForm({...form, valid_days: Array.from(set)});
                          }} 
                        />
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-100/50 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  Usage Limits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Maximum Total Uses</label>
                    <input 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm" 
                      type="number" 
                      placeholder="Leave empty for unlimited" 
                      value={form.max_uses} 
                      onChange={(e) => setForm({...form, max_uses: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Max Uses per User</label>
                    <input 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm" 
                      type="number" 
                      placeholder="1" 
                      value={form.max_uses_per_user} 
                      onChange={(e) => setForm({...form, max_uses_per_user: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-100/50 rounded-2xl p-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                    <ImageIcon className="w-3 h-3 text-white" />
                  </div>
                  Additional Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Image URL</label>
                    <input 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white shadow-sm" 
                      placeholder="https://example.com/offer-image.jpg" 
                      value={form.image} 
                      onChange={(e) => setForm({...form, image: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Terms & Conditions</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white shadow-sm resize-none" 
                      placeholder="Enter terms and conditions for this offer..." 
                      rows={4}
                      value={form.terms_and_conditions} 
                      onChange={(e) => setForm({...form, terms_and_conditions: e.target.value})} 
                    />
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="inline-flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                        checked={form.is_active} 
                        onChange={(e) => setForm({...form, is_active: e.target.checked})} 
                      />
                      <span className="text-sm font-semibold text-gray-700">Active</span>
                    </label>
                    <label className="inline-flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                        checked={form.is_featured} 
                        onChange={(e) => setForm({...form, is_featured: e.target.checked})} 
                      />
                      <span className="text-sm font-semibold text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer - Fixed */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="offerForm"
            disabled={saving}
            className={`px-6 py-3 bg-gradient-to-r ${isEditing ? 'from-blue-500 to-indigo-500' : 'from-green-500 to-emerald-500'} text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEditing ? 'Update Offer' : 'Create Offer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const OffersSection = ({ offers, onReload, onSuccess, onError, adminAPI }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);

  const handleCreateOffer = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData };
      
      // Remove fields that shouldn't be sent to backend
      delete payload.id;
      delete payload.restaurant;
      delete payload.restaurant_name;
      delete payload.restaurant_cuisine;
      delete payload.restaurant_image;
      delete payload.restaurant_rating;
      delete payload.restaurant_address;
      delete payload.discount_text;
      delete payload.savings_text;
      delete payload.is_valid;
      delete payload.is_time_valid;
      delete payload.is_day_valid;
      delete payload.current_uses;
      delete payload.created_at;
      delete payload.updated_at;
      
      // Convert numeric fields properly
      ['discount_percentage','discount_amount','minimum_order_amount','maximum_discount_amount','max_uses','max_uses_per_user'].forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) {
          payload[k] = null;
        } else {
          const num = parseFloat(payload[k]);
          payload[k] = isNaN(num) ? null : num;
        }
      });
      
      // Ensure valid_days is always an array
      if (!payload.valid_days || !Array.isArray(payload.valid_days)) {
        payload.valid_days = [];
      }
      
      // Convert datetime fields to ISO format - these are required fields
      ['valid_from', 'valid_until'].forEach(k => {
        if (payload[k]) {
          try {
            // Convert datetime-local format back to ISO for backend
            const localDate = new Date(payload[k]);
            const isoString = localDate.toISOString();
            console.log(`Converting ${k}: ${payload[k]} (local) -> ${isoString} (ISO)`);
            payload[k] = isoString;
          } catch (e) {
            console.warn(`Invalid date format for ${k}:`, payload[k]);
            // If date is invalid, don't send this update
            throw new Error(`Invalid ${k} date format`);
          }
        } else {
          // These fields are required, so throw error if empty
          throw new Error(`${k.replace('_', ' ')} is required`);
        }
      });
      
      // Ensure string fields are not undefined
      ['title', 'description', 'offer_type', 'terms_and_conditions', 'image'].forEach(k => {
        if (payload[k] === undefined) {
          payload[k] = '';
        }
      });
      
      // Ensure boolean fields are proper booleans
      payload.is_active = Boolean(payload.is_active);
      payload.is_featured = Boolean(payload.is_featured);
      
      // Validate required fields
      if (!payload.title || !payload.description || !payload.offer_type) {
        throw new Error('Title, description, and offer type are required');
      }
      
      // Validate offer type specific required fields
      if (payload.offer_type === 'percentage') {
        if (!payload.discount_percentage || payload.discount_percentage <= 0) {
          throw new Error('Discount percentage is required and must be greater than 0');
        }
        if (!payload.minimum_order_amount || payload.minimum_order_amount <= 0) {
          throw new Error('Minimum order amount is required for percentage discounts');
        }
        if (!payload.maximum_discount_amount || payload.maximum_discount_amount <= 0) {
          throw new Error('Maximum discount amount is required for percentage discounts');
        }
      }
      
      if (payload.offer_type === 'fixed') {
        if (!payload.discount_amount || payload.discount_amount <= 0) {
          throw new Error('Discount amount is required and must be greater than 0');
        }
        if (!payload.minimum_order_amount || payload.minimum_order_amount <= 0) {
          throw new Error('Minimum order amount is required for fixed amount discounts');
        }
      }
      
      console.log('Sending payload:', payload); // Debug log
      
      if (editingOffer) {
        // Update existing offer
        await adminAPI.updateOffer(editingOffer.id, payload);
        onSuccess('Offer updated successfully');
      } else {
        // Create new offer
        await adminAPI.createOffer(payload);
        onSuccess('Offer created successfully');
      }
      
      await onReload();
      setEditingOffer(null);
    } catch (e) {
      console.error('Error details:', e.response?.data || e.message);
      onError(e.response?.data?.detail || e.message || `Failed to ${editingOffer ? 'update' : 'create'} offer`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (offer) => {
    try {
      await adminAPI.updateOffer(offer.id, { is_active: !offer.is_active });
      await onReload();
      onSuccess(offer.is_active ? 'Offer deactivated' : 'Offer activated');
    } catch (e) {
      onError(e.message || 'Failed to update offer');
    }
  };

  const handleEditOffer = (offer) => {
    // Helper function to format datetime for datetime-local input
    const formatDateTimeLocal = (dateString) => {
      if (!dateString) return '';
      
      try {
        // Create a Date object from the ISO string (handles timezone automatically)
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', dateString);
          return '';
        }
        
        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        // This uses the user's local timezone, not UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log(`Converting ${dateString} to ${formattedDateTime} (local time)`);
        return formattedDateTime;
        
      } catch (error) {
        console.error('Error formatting datetime:', error, dateString);
        return '';
      }
    };

    // Format the offer data for the form
    const editData = {
      ...offer,
      // Format datetime fields properly for datetime-local input
      // Convert from backend format (ISO string) to format expected by datetime-local input
      valid_from: formatDateTimeLocal(offer.valid_from),
      valid_until: formatDateTimeLocal(offer.valid_until),
      // Ensure numeric fields are strings for form inputs
      discount_percentage: offer.discount_percentage ? offer.discount_percentage.toString() : '',
      discount_amount: offer.discount_amount ? offer.discount_amount.toString() : '',
      minimum_order_amount: offer.minimum_order_amount ? offer.minimum_order_amount.toString() : '',
      maximum_discount_amount: offer.maximum_discount_amount ? offer.maximum_discount_amount.toString() : '',
      max_uses: offer.max_uses ? offer.max_uses.toString() : '',
      max_uses_per_user: offer.max_uses_per_user ? offer.max_uses_per_user.toString() : '1',
      // Ensure valid_days is an array
      valid_days: Array.isArray(offer.valid_days) ? offer.valid_days : [],
      // Ensure boolean fields are properly set
      is_active: Boolean(offer.is_active),
      is_featured: Boolean(offer.is_featured),
      // Ensure string fields are not null
      title: offer.title || '',
      description: offer.description || '',
      terms_and_conditions: offer.terms_and_conditions || '',
      image: offer.image || '',
    };
    
    console.log('Edit data prepared:', editData); // Debug log
    setEditingOffer(editData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const handleRedeemCode = async (activationCode) => {
    try {
      const response = await adminAPI.redeemOfferCode(activationCode);
      onSuccess('Offer code redeemed successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to redeem code';
      onError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getOfferTypeIcon = (type) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'bogo': return <Gift className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getOfferTypeColor = (type) => {
    switch (type) {
      case 'percentage': return 'from-blue-500 to-indigo-500';
      case 'fixed': return 'from-green-500 to-emerald-500';
      case 'bogo': return 'from-purple-500 to-pink-500';
      case 'combo': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatValidityDays = (days) => {
    if (!days || days.length === 0) return 'All days';
    if (days.length === 7) return 'Every day';
    if (days.length <= 3) {
      return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
    }
    return `${days.length} days/week`;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Promotional Offers</h2>
                <p className="text-gray-600">Create and manage special deals for your customers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {offers.filter(o => o.is_active).length} Active
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {offers.length} Total
                </span>
              </div>
              <button
                onClick={() => {
                  setEditingOffer(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New Offer</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg">
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white mx-auto mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start attracting more customers by creating your first promotional offer
                </p>
                <button
                  onClick={() => {
                    setEditingOffer(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:opacity-90 transition-opacity mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Offer
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {offers.map(offer => (
                <div 
                  key={offer.id} 
                  className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Offer Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getOfferTypeColor(offer.offer_type)} flex items-center justify-center text-white flex-shrink-0`}>
                          {getOfferTypeIcon(offer.offer_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{offer.title}</h3>
                            {offer.is_featured && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                                <Star className="w-3 h-3" />
                                Featured
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-xl text-xs font-medium ${
                        offer.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="p-6 space-y-4">
                    {/* Discount Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {offer.discount_text || (
                            offer.offer_type === 'percentage' 
                              ? `${offer.discount_percentage}% OFF`
                              : offer.offer_type === 'fixed'
                              ? `$${offer.discount_amount} OFF`
                              : offer.offer_type.toUpperCase()
                          )}
                        </p>
                        {offer.minimum_order_amount && (
                          <p className="text-sm text-gray-600">
                            Min. order: ${offer.minimum_order_amount}
                          </p>
                        )}
                      </div>
                      {offer.maximum_discount_amount && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Max discount</p>
                          <p className="font-semibold text-gray-900">${offer.maximum_discount_amount}</p>
                        </div>
                      )}
                    </div>

                    {/* Validity Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatValidityDays(offer.valid_days)}</span>
                      </div>
                      {(offer.valid_from_time || offer.valid_until_time) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {offer.valid_from_time || '00:00'} - {offer.valid_until_time || '23:59'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Usage Stats */}
                    {(offer.max_uses || offer.current_uses) && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            Used: {offer.current_uses || 0}
                            {offer.max_uses && ` / ${offer.max_uses}`}
                          </span>
                        </div>
                        {offer.max_uses && (
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(((offer.current_uses || 0) / offer.max_uses) * 100, 100)}%`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Validity Period */}
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <span>Valid from {new Date(offer.valid_from).toLocaleDateString()}</span>
                        <span>until {new Date(offer.valid_until).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Offer Actions */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditOffer(offer)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      {offer.is_active && (
                        <button
                          onClick={() => setIsRedemptionModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors"
                        >
                          <Ticket className="w-4 h-4" />
                          <span className="hidden sm:inline">Redeem Code</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(offer)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-white ${
                          offer.is_active 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {offer.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        <span className="hidden sm:inline">
                          {offer.is_active ? 'Deactivate' : 'Activate'}
                        </span>
                      </button>
                      {offer.is_active && (
                        <div className="flex items-center gap-1 ml-auto text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Offer Creation Modal */}
      <OfferModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateOffer}
        saving={saving}
        editData={editingOffer}
      />

      {/* Redemption Modal */}
      <RedemptionModal
        isOpen={isRedemptionModalOpen}
        onClose={() => setIsRedemptionModalOpen(false)}
        onRedeem={handleRedeemCode}
      />
    </>
  );
};

export default OffersSection;
