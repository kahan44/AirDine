// src/components/admin/sections/MenuSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  EyeOff,
  Star,
  Utensils,
  Tag,
  DollarSign,
  Clock,
  ChefHat,
  Leaf,
  Flame,
  Shield,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const MenuSection = ({ onSuccess, onError, adminAPI }) => {
  const [menu, setMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_spicy: false,
    is_available: true,
    is_featured: false,
    display_order: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    setLoading(true);
    try {
      const [menuData, categoriesData] = await Promise.all([
        adminAPI.getMenu(),
        adminAPI.getMenuCategories()
      ]);
      setMenu(menuData);
      setCategories(categoriesData);
    } catch (error) {
      onError('Failed to load menu data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_spicy: false,
      is_available: true,
      is_featured: false,
      display_order: 0
    });
    setEditingItem(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image || '',
      category: item.category || '',
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_gluten_free: item.is_gluten_free,
      is_spicy: item.is_spicy,
      is_available: item.is_available,
      is_featured: item.is_featured,
      display_order: item.display_order
    });
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price || !formData.description.trim()) {
      onError('Please fill in all required fields (name, description, price)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        category: formData.category || null
      };

      if (editingItem) {
        await adminAPI.updateMenuItem(editingItem.id, payload);
        onSuccess('Menu item updated successfully');
      } else {
        await adminAPI.createMenuItem(payload);
        onSuccess('Menu item created successfully');
      }
      
      setShowModal(false);
      resetForm();
      loadMenuData();
    } catch (error) {
      onError('Failed to save menu item: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteMenuItem(item.id);
      onSuccess('Menu item deleted successfully');
      loadMenuData();
    } catch (error) {
      onError('Failed to delete menu item: ' + (error.message || 'Unknown error'));
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await adminAPI.updateMenuItem(item.id, {
        ...item,
        is_available: !item.is_available
      });
      onSuccess(`Menu item ${!item.is_available ? 'enabled' : 'disabled'} successfully`);
      loadMenuData();
    } catch (error) {
      onError('Failed to update menu item: ' + (error.message || 'Unknown error'));
    }
  };

  const toggleFeatured = async (item) => {
    try {
      await adminAPI.updateMenuItem(item.id, {
        ...item,
        is_featured: !item.is_featured
      });
      onSuccess(`Menu item ${!item.is_featured ? 'featured' : 'unfeatured'} successfully`);
      loadMenuData();
    } catch (error) {
      onError('Failed to update menu item: ' + (error.message || 'Unknown error'));
    }
  };

  // Filter and search logic
  const getFilteredItems = () => {
    if (!menu) return [];
    
    let allItems = [];
    Object.values(menu.categories || {}).forEach(categoryItems => {
      allItems = [...allItems, ...categoryItems];
    });

    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || 
                            (item.category_name && item.category_name.toLowerCase() === filterCategory.toLowerCase()) ||
                            (filterCategory === 'uncategorized' && !item.category_name);
      
      const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'available' && item.is_available) ||
                          (filterStatus === 'unavailable' && !item.is_available) ||
                          (filterStatus === 'featured' && item.is_featured);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-8 bg-gradient-to-r from-orange-200 to-red-200 rounded-xl w-64"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-48"></div>
              </div>
              <div className="h-12 bg-gradient-to-r from-orange-200 to-red-200 rounded-xl w-40"></div>
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Menu Items Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 animate-pulse"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
                  <div className="h-10 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  Menu Management
                </h2>
                <p className="text-gray-600 text-lg">
                  {menu ? (
                    <span className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-orange-500" />
                      {menu.total_items} total items across {Object.keys(menu.categories || {}).length} categories
                    </span>
                  ) : (
                    'Manage your restaurant menu items with ease'
                  )}
                </p>
              </div>
              
              {/* Quick Stats */}
              {menu && (
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100/80 text-green-700 rounded-xl">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {filteredItems.filter(item => item.is_available).length} Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100/80 text-yellow-700 rounded-xl">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {filteredItems.filter(item => item.is_featured).length} Featured
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100/80 text-blue-700 rounded-xl">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {filteredItems.filter(item => item.is_vegetarian).length} Vegetarian
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 font-semibold text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  Add Menu Item
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filter & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Search */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Enhanced Category Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <Utensils className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-300" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="uncategorized">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Status Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-500 transition-colors duration-300" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="featured">Featured</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Results Summary */}
          {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all') && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Showing {filteredItems.length} of {Object.values(menu?.categories || {}).flat().length} items
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
            onToggleAvailability={() => toggleAvailability(item)}
            onToggleFeatured={() => toggleFeatured(item)}
          />
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
          <div className="p-12 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <Utensils className="w-12 h-12 text-orange-500" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'No matching items found' 
                : 'No menu items yet'
              }
            </h3>
            
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your filters or search term to find what you\'re looking for'
                : 'Start building your menu by adding your first delicious item'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 font-semibold"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-500 font-semibold overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Add Your First Menu Item
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <MenuItemModal
          isEdit={!!editingItem}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          saving={saving}
        />
      )}
    </div>
  );
};

// Enhanced Menu Item Card Component
const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability, onToggleFeatured }) => {
  return (
    <div className="group relative bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-red-200/30"></div>
            <ChefHat className="w-16 h-16 text-orange-400 relative z-10" />
          </div>
        )}
        
        {/* Enhanced Status Indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.is_featured && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
          {!item.is_available && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
              Unavailable
            </span>
          )}
        </div>

        {/* Modern Transparent Floating Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-3 group-hover:translate-x-0">
          <button
            onClick={onToggleAvailability}
            className={`group/toggle p-3 rounded-xl backdrop-blur-xl border shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3 ${
              item.is_available 
                ? 'bg-white/90 hover:bg-emerald-50/90 border-emerald-200/60 text-emerald-600 hover:text-emerald-700 shadow-emerald-500/10' 
                : 'bg-white/90 hover:bg-gray-50/90 border-gray-200/60 text-gray-600 hover:text-gray-700 shadow-gray-500/10'
            }`}
            title={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
          >
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-300 ${
              item.is_available ? 'bg-emerald-500/5' : 'bg-gray-500/5'
            }`}></div>
            {item.is_available ? 
              <Eye className="w-4.5 h-4.5 relative z-10" /> : 
              <EyeOff className="w-4.5 h-4.5 relative z-10" />
            }
          </button>
          
          <button
            onClick={onToggleFeatured}
            className={`group/feature p-3 rounded-xl backdrop-blur-xl border shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3 ${
              item.is_featured 
                ? 'bg-white/90 hover:bg-amber-50/90 border-amber-200/60 text-amber-600 hover:text-amber-700 shadow-amber-500/10' 
                : 'bg-white/90 hover:bg-gray-50/90 border-gray-200/60 text-gray-600 hover:text-gray-700 shadow-gray-500/10'
            }`}
            title={item.is_featured ? 'Remove from featured' : 'Mark as featured'}
          >
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 ${
              item.is_featured ? 'bg-amber-500/5' : 'bg-gray-500/5'
            }`}></div>
            <Star className={`w-4.5 h-4.5 relative z-10 ${item.is_featured ? 'fill-current' : ''} transition-transform duration-300 group-hover/feature:scale-110`} />
          </button>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/50">
            <div className="text-xl font-bold text-orange-600">
              ${parseFloat(item.price).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">
            {item.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Category */}
        {item.category_name && (
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-semibold rounded-xl border border-blue-200">
              <Tag className="w-3 h-3" />
              {item.category_name}
            </span>
          </div>
        )}

        {/* Enhanced Dietary Badges */}
        <div className="flex flex-wrap gap-2">
          {item.is_vegetarian && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs rounded-xl border border-green-200">
              <Leaf className="w-3 h-3" />
              Vegetarian
            </span>
          )}
          {item.is_vegan && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs rounded-xl border border-green-200">
              <Leaf className="w-3 h-3" />
              Vegan
            </span>
          )}
          {item.is_gluten_free && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 text-xs rounded-xl border border-blue-200">
              <Shield className="w-3 h-3" />
              Gluten Free
            </span>
          )}
          {item.is_spicy && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-xs rounded-xl border border-red-200">
              <Flame className="w-3 h-3" />
              Spicy
            </span>
          )}
        </div>

        {/* Modern Transparent Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onEdit}
            className="flex-1 group/edit relative overflow-hidden bg-white/80 backdrop-blur-sm border border-blue-200/60 text-blue-600 hover:text-blue-700 rounded-xl py-3.5 px-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:bg-blue-50/80 hover:border-blue-300/60"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/edit:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Edit</span>
            </div>
          </button>
          <button
            onClick={onDelete}
            className="group/delete relative overflow-hidden bg-white/80 backdrop-blur-sm border border-red-200/60 text-red-600 hover:text-red-700 rounded-xl py-3.5 px-4 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:bg-red-50/80 hover:border-red-300/60"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform duration-300" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Menu Item Modal Component
const MenuItemModal = ({ isEdit, formData, setFormData, categories, onSave, onClose, saving }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white/98 to-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 border-b border-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isEdit ? 'Update your menu item details' : 'Create a delicious new addition to your menu'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="group p-3 hover:bg-red-100 rounded-2xl transition-all duration-300"
            >
              <X className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900"
                  placeholder="Enter menu item name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900 resize-none"
                placeholder="Describe your delicious menu item..."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleChange('image', e.target.value)}
                className="w-full px-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 text-gray-900"
                placeholder="https://example.com/delicious-food.jpg"
              />
            </div>
          </div>

          {/* Dietary Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Dietary Information</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'is_vegetarian', label: 'Vegetarian', icon: Leaf, color: 'green' },
                { key: 'is_vegan', label: 'Vegan', icon: Leaf, color: 'emerald' },
                { key: 'is_gluten_free', label: 'Gluten Free', icon: Shield, color: 'blue' },
                { key: 'is_spicy', label: 'Spicy', icon: Flame, color: 'red' },
              ].map(({ key, label, icon: Icon, color }) => (
                <label key={key} className={`group relative flex items-center gap-3 p-4 bg-white/80 border-2 border-gray-200 rounded-2xl hover:border-${color}-300 cursor-pointer transition-all duration-300 ${formData[key] ? `border-${color}-400 bg-${color}-50` : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className={`w-5 h-5 text-${color}-500 border-gray-300 rounded-lg focus:ring-${color}-500 transition-all duration-300`}
                  />
                  <Icon className={`w-5 h-5 ${formData[key] ? `text-${color}-600` : 'text-gray-400'} transition-colors duration-300`} />
                  <span className={`text-sm font-semibold ${formData[key] ? `text-${color}-700` : 'text-gray-700'} transition-colors duration-300`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Options */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Status & Visibility</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <label className={`group relative flex items-center gap-4 p-6 bg-white/80 border-2 border-gray-200 rounded-2xl hover:border-green-300 cursor-pointer transition-all duration-300 ${formData.is_available ? 'border-green-400 bg-green-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => handleChange('is_available', e.target.checked)}
                  className="w-5 h-5 text-green-500 border-gray-300 rounded-lg focus:ring-green-500"
                />
                <Eye className={`w-6 h-6 ${formData.is_available ? 'text-green-600' : 'text-gray-400'} transition-colors duration-300`} />
                <div>
                  <span className={`text-lg font-semibold ${formData.is_available ? 'text-green-700' : 'text-gray-700'} transition-colors duration-300`}>Available</span>
                  <p className="text-sm text-gray-500">Item is visible and can be ordered</p>
                </div>
              </label>

              <label className={`group relative flex items-center gap-4 p-6 bg-white/80 border-2 border-gray-200 rounded-2xl hover:border-yellow-300 cursor-pointer transition-all duration-300 ${formData.is_featured ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                  className="w-5 h-5 text-yellow-500 border-gray-300 rounded-lg focus:ring-yellow-500"
                />
                <Star className={`w-6 h-6 ${formData.is_featured ? 'text-yellow-600 fill-current' : 'text-gray-400'} transition-colors duration-300`} />
                <div>
                  <span className={`text-lg font-semibold ${formData.is_featured ? 'text-yellow-700' : 'text-gray-700'} transition-colors duration-300`}>Featured</span>
                  <p className="text-sm text-gray-500">Highlight this item to customers</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="p-8 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    {isEdit ? 'Update Item' : 'Create Item'}
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuSection;
