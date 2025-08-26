import React, { useState, useEffect } from 'react';
import {
  X,
  Gift,
  Clock,
  Copy,
  CheckCircle,
  AlertCircle,
  Store,
  Loader2
} from 'lucide-react';

const ActivationModal = ({ 
  isOpen, 
  onClose, 
  offer, 
  onSuccess 
}) => {
  const [step, setStep] = useState('confirm'); // confirm, loading, success
  const [activationData, setActivationData] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setActivationData(null);
      setError(null);
      setTimeLeft(0);
      setCopied(false);
    }
  }, [isOpen]);

  // Timer for activated offers
  useEffect(() => {
    if (activationData?.activation?.expires_at) {
      const updateTimer = () => {
        const now = new Date();
        const expires = new Date(activationData.activation.expires_at);
        const remaining = Math.max(0, Math.floor((expires - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          return false; // Stop timer
        }
        return true; // Continue timer
      };

      updateTimer();
      const interval = setInterval(() => {
        if (!updateTimer()) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activationData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleActivate = async () => {
    if (!offer?.id) return;

    setStep('loading');
    setError(null);

    try {
      // Call API to activate offer
      const response = await fetch(`http://127.0.0.1:8000/api/offers/${offer.id}/activate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate offer');
      }

      const data = await response.json();
      setActivationData(data);
      setStep('success');

      // Notify parent of success
      if (onSuccess) {
        onSuccess(data);
      }

    } catch (err) {
      console.error('Activation error:', err);
      setError(err.message || 'Failed to activate offer');
      setStep('confirm');
    }
  };

  const handleCopy = async () => {
    const code = activationData?.activation?.activation_code;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Copy failed:', fallbackErr);
      }

      document.body.removeChild(textArea);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {step === 'success' ? 'Offer Activated!' : 'Activate Offer'}
              </h3>
              <p className="text-sm text-gray-600">
                {step === 'success' ? 'Ready to use at restaurant' : 'Get your activation code'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Offer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{offer?.title}</h4>
                    <p className="text-sm text-gray-600">{offer?.restaurant_name}</p>
                    <p className="text-lg font-bold text-orange-600 mt-1">
                      {offer?.discount_text}
                    </p>
                    {offer?.minimum_order_amount && (
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum order: ${offer.minimum_order_amount}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Important Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Important</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• You'll receive a 6-digit activation code</li>
                      <li>• Code expires in 30 minutes</li>
                      <li>• Show the code to restaurant staff</li>
                      <li>• Each code can only be used once</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                >
                  Activate Now
                </button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Activating Offer
              </h4>
              <p className="text-gray-600">
                Generating your activation code...
              </p>
            </div>
          )}

          {step === 'success' && activationData && (
            <div className="space-y-6">
              {/* Success Icon */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Activation Successful!
                </h4>
                <p className="text-gray-600">
                  Show this code to restaurant staff
                </p>
              </div>

              {/* Activation Code */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Activation Code</p>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-orange-600 tracking-wider font-mono">
                    {activationData?.activation?.activation_code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-orange-600" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600">Copied to clipboard!</p>
                )}
              </div>

              {/* Timer */}
              {timeLeft > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div className="text-center">
                      <p className="text-sm text-amber-700">Expires in</p>
                      <p className="text-2xl font-bold text-amber-800 font-mono">
                        {formatTime(timeLeft)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">Code has expired</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900">How to redeem:</h5>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Visit {offer?.restaurant_name}</li>
                  <li>Place your order (min. ${offer?.minimum_order_amount || '0'})</li>
                  <li>Show this code to the staff</li>
                  <li>Enjoy your discount!</li>
                </ol>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
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

export default ActivationModal;
