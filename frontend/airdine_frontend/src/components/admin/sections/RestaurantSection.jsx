import React, { useState, useEffect } from 'react';
import { 
  Save,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Star,
  Utensils,
  Check,
  X
} from 'lucide-react';

const RestaurantSection = ({ restaurant, onSave, saving }) => {
  const [local, setLocal] = useState(restaurant || {});
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocal(restaurant || {});
    setHasChanges(false);
  }, [restaurant]);

  useEffect(() => {
    const hasChanged = JSON.stringify(local) !== JSON.stringify(restaurant || {});
    setHasChanges(hasChanged);
  }, [local, restaurant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(local);
    setHasChanges(false);
  };

  const handleInputChange = (field, value) => {
    setLocal(prev => ({ ...prev, [field]: value }));
  };

  const priceRangeLabels = {
    '$': '$ - Budget Friendly',
    '$$': '$$ - Moderate',
    '$$$': '$$$ - Upscale',
    '$$$$': '$$$$ - Fine Dining'
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Restaurant Profile</h2>
              <p className="text-gray-600">Manage your restaurant information and settings</p>
            </div>
          </div>
          
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-xl">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-800 font-medium">Unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main form fields */}
          <div className="xl:col-span-3 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    value={local.name || ''}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter restaurant name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                  <input
                    type="text"
                    value={local.cuisine || ''}
                    onChange={e => handleInputChange('cuisine', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., Italian, Asian, American"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={local.description || ''}
                    onChange={e => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe your restaurant's atmosphere, specialties, and unique features..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={local.phone || ''}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={local.email || ''}
                      onChange={e => handleInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="restaurant@example.com"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={local.address || ''}
                      onChange={e => handleInputChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Full restaurant address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Details */}
            <div className="bg-green-50/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                Operating Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={local.opening_time || ''}
                    onChange={e => handleInputChange('opening_time', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={local.closing_time || ''}
                    onChange={e => handleInputChange('closing_time', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={local.price_range || '$$'}
                    onChange={e => handleInputChange('price_range', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    {Object.entries(priceRangeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Image & Status */}
            <div className="bg-purple-50/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Image & Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Image URL</label>
                  <input
                    type="url"
                    value={local.image || ''}
                    onChange={e => {
                      handleInputChange('image', e.target.value);
                      setImagePreviewError(false);
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/restaurant-image.jpg"
                  />
                </div>
                
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!local.is_active}
                      onChange={e => handleInputChange('is_active', e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      Restaurant Active
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!local.is_featured}
                      onChange={e => handleInputChange('is_featured', e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Featured Restaurant
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar with preview and actions */}
          <div className="xl:col-span-1 space-y-6">
            {/* Image Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Image Preview</h4>
              <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {local.image && !imagePreviewError ? (
                  <img
                    alt="Restaurant preview"
                    src={local.image}
                    className="w-full h-full object-cover"
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {imagePreviewError ? 'Failed to load' : 'No image'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${local.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {local.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Featured:</span>
                  <span className={`font-medium ${local.is_featured ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {local.is_featured ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-medium text-gray-900">{local.price_range || '$$'}</span>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className={`w-full mt-6 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  hasChanges && !saving
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {hasChanges ? 'Save Changes' : 'No Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RestaurantSection;
