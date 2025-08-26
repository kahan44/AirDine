import React, { useState } from 'react';
import {
  X,
  Ticket,
  CheckCircle,
  AlertCircle,
  User,
  Clock,
  Gift,
  Loader2
} from 'lucide-react';

const RedemptionModal = ({ 
  isOpen, 
  onClose, 
  onRedeem 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Code must be 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await onRedeem(code.toUpperCase());
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Redeem Offer Code
              </h3>
              <p className="text-sm text-gray-600">
                Enter customer's activation code
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Input */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Activation Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                  autoComplete="off"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the code shown on customer's phone
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={code.length !== 6 || loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Redeem Code'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Code Redeemed Successfully!
                </h4>
                <p className="text-gray-600">
                  The offer has been applied to the customer's order
                </p>
              </div>

              {/* Details */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Customer</p>
                    <p className="font-semibold text-green-800">
                      {result?.activation?.user_email || 'Customer'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Offer</p>
                    <p className="font-semibold text-green-800">
                      {result?.activation?.offer_title || 'Offer'}
                    </p>
                    <p className="text-sm text-green-600">
                      {result?.activation?.offer_discount || 'Discount'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Activated</p>
                    <p className="font-semibold text-green-800">
                      {result?.activation?.activated_at ? 
                        new Date(result.activation.activated_at).toLocaleString() : 
                        'Just now'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedemptionModal;
