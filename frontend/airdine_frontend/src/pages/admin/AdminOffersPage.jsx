import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Ticket,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import RedemptionModal from '../../components/admin/RedemptionModal';
import { adminAPI } from '../../services/api';

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);
  const [redemptionError, setRedemptionError] = useState(null);
  const [activeTab, setActiveTab] = useState('offers');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
  const [offersResponse, activationsResponse] = await Promise.all([
        adminAPI.getOffers(),
        adminAPI.getOfferActivations()
      ]);
  // adminAPI methods already return data payloads, not axios responses
  setOffers(offersResponse.results || offersResponse);
  setActivations(activationsResponse.results || activationsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemCode = async (activationCode) => {
    setRedeeming(true);
    setRedemptionError(null);
    
    try {
  const result = await adminAPI.redeemOfferCode(activationCode);
  setRedemptionResult(result);
      // Refresh activations list
  const activationsResponse = await adminAPI.getOfferActivations();
  setActivations(activationsResponse.results || activationsResponse);
    } catch (error) {
      console.error('Error redeeming code:', error);
      setRedemptionError(
        error.response?.data?.error || 
        'Failed to redeem code. Please try again.'
      );
    } finally {
      setRedeeming(false);
    }
  };

  const openRedemptionModal = () => {
    setShowRedemptionModal(true);
    setRedemptionResult(null);
    setRedemptionError(null);
  };

  const closeRedemptionModal = () => {
    setShowRedemptionModal(false);
    setRedemptionResult(null);
    setRedemptionError(null);
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && offer.is_active;
    if (filterStatus === 'inactive') return matchesSearch && !offer.is_active;
    
    return matchesSearch;
  });

  const filteredActivations = activations.filter(activation => {
    const matchesSearch = activation.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activation.offer_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activation.activation_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'pending') return matchesSearch && activation.status === 'pending';
    if (filterStatus === 'redeemed') return matchesSearch && activation.status === 'redeemed';
    if (filterStatus === 'expired') return matchesSearch && activation.status === 'expired';
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'redeemed': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'redeemed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading offers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant offers and redemptions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openRedemptionModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            <Ticket className="w-4 h-4" />
            Redeem Code
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Offers</p>
              <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Offers</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.filter(o => o.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending Codes</p>
              <p className="text-2xl font-bold text-gray-900">
                {activations.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Redeemed</p>
              <p className="text-2xl font-bold text-gray-900">
                {activations.filter(a => a.status === 'redeemed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'offers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Offers ({offers.length})
            </button>
            <button
              onClick={() => setActiveTab('activations')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Activations ({activations.length})
            </button>
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={activeTab === 'offers' ? 'Search offers...' : 'Search activations...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {activeTab === 'offers' ? (
                  <>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </>
                ) : (
                  <>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="expired">Expired</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'offers' ? (
            <div className="space-y-4">
              {filteredOffers.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No offers found</p>
                </div>
              ) : (
                filteredOffers.map((offer) => (
                  <div key={offer.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            offer.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {offer.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Discount: {offer.discount_text}</span>
                          {offer.minimum_order_amount && (
                            <span>Min Order: ${offer.minimum_order_amount}</span>
                          )}
                          <span>Valid until: {new Date(offer.valid_until).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No activations found</p>
                </div>
              ) : (
                filteredActivations.map((activation) => (
                  <div key={activation.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-lg font-bold text-gray-900">
                            {activation.activation_code}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activation.status)}`}>
                            {getStatusIcon(activation.status)}
                            {activation.status.charAt(0).toUpperCase() + activation.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Customer</p>
                            <p className="font-medium text-gray-900">{activation.user_email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Offer</p>
                            <p className="font-medium text-gray-900">{activation.offer_title}</p>
                            <p className="text-blue-600">{activation.offer_discount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {activation.status === 'redeemed' ? 'Redeemed At' : 'Activated At'}
                            </p>
                            <p className="font-medium text-gray-900">
                              {new Date(activation.activated_at).toLocaleString()}
                            </p>
                            {activation.status === 'pending' && (
                              <p className="text-orange-600 text-xs">
                                Expires: {new Date(activation.expires_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Redemption Modal */}
      <RedemptionModal
        isOpen={showRedemptionModal}
        onClose={closeRedemptionModal}
        onRedeem={handleRedeemCode}
      />
    </div>
  );
};

export default AdminOffersPage;
