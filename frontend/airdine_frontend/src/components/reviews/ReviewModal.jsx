// src/components/reviews/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Star, Loader, AlertCircle } from 'lucide-react';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  review = null, 
  restaurantName,
  isLoading = false,
  error = null 
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // Initialize form data when review prop changes
  useEffect(() => {
    if (review) {
      setFormData({
        rating: review.rating || 0,
        title: review.title || '',
        comment: review.comment || ''
      });
    } else {
      setFormData({
        rating: 0,
        title: '',
        comment: ''
      });
    }
  }, [review]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      return;
    }
    onSubmit(formData);
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {review ? 'Edit Review' : 'Write a Review'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Restaurant Name */}
        <div className="px-6 pt-4">
          <p className="text-gray-600 text-sm mb-4">
            Reviewing: <span className="font-medium text-gray-900">{restaurantName}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0">
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  disabled={isLoading}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      rating <= (hoveredRating || formData.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {formData.rating === 0 
                  ? 'Select a rating' 
                  : `${formData.rating} star${formData.rating !== 1 ? 's' : ''}`
                }
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Give your review a title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your experience..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || formData.rating === 0 || !formData.comment.trim()}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>{review ? 'Updating...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>{review ? 'Update Review' : 'Submit Review'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
