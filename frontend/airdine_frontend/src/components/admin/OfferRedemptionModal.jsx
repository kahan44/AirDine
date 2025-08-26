import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Ticket, 
  User,
  Clock,
  Gift
} from 'lucide-react';

const OfferRedemptionModal = ({ 
  isOpen, 
  onClose, 
  onRedeem, 
  redeeming, 
  redemptionResult,
  error 
}) => {
  const [activationCode, setActivationCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activationCode.trim().length === 6) {
      onRedeem(activationCode.trim().toUpperCase());
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setActivationCode(value);
    }
  };

  const closeModal = () => {
    setActivationCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-white/60 shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Redeem Offer Code
              </h3>
              <p className="text-sm text-gray-600">
                Verify customer activation code
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!redemptionResult && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Input */}
              <div>
                <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Activation Code
                </label>
                <input
                  type="text"
                  id="activationCode"
                  value={activationCode}
                  onChange={handleCodeChange}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-character code provided by the customer
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activationCode.length !== 6 || redeeming}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {redeeming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Redeem Code'
                  )}
                </button>
              </div>
            </form>
          )}

          {redemptionResult && (
            <div className="space-y-6">
              {/* Success State */}
              {redemptionResult.success && (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Code Redeemed Successfully!
                    </h4>
                    <p className="text-gray-600">
                      The offer has been activated for the customer.
                    </p>
                  </div>

                  {/* Activation Details */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-700">Customer</p>
                        <p className="font-semibold text-green-800">
                          {redemptionResult.activation.user_email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-700">Offer</p>
                        <p className="font-semibold text-green-800">
                          {redemptionResult.activation.offer_title}
                        </p>
                        <p className="text-sm text-green-600">
                          {redemptionResult.activation.offer_discount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-700">Activated At</p>
                        <p className="font-semibold text-green-800">
                          {new Date(redemptionResult.activation.activated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferRedemptionModal;
