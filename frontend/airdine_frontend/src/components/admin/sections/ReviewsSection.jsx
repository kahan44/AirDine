import React, { useState } from 'react';
import { Star, MessageSquare, User, Calendar, ThumbsUp, Filter } from 'lucide-react';

const ReviewsSection = ({ reviews }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredReviews = reviews
    .filter(review => {
      if (filter === 'all') return true;
      if (filter === 'positive') return (review.rating || 0) >= 4;
      if (filter === 'negative') return (review.rating || 0) <= 2;
      if (filter === 'neutral') return (review.rating || 0) === 3;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

  const averageRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / Math.max(reviews.length, 1);
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(r => Math.round(r.rating || 0) === rating).length
  );

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Overall Rating</h3>
              <p className="text-gray-600">Based on {reviews.length} reviews</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-4">
              {renderStars(averageRating)}
            </div>
            <p className="text-gray-600">Average rating</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${reviews.length > 0 ? (ratingCounts[index] / reviews.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {ratingCounts[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                <p className="text-gray-600">{filteredReviews.length} of {reviews.length} reviews</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                <Filter className="w-4 h-4 text-gray-500 ml-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border-none bg-transparent text-sm focus:outline-none"
                >
                  <option value="all">All Reviews</option>
                  <option value="positive">Positive (4-5★)</option>
                  <option value="neutral">Neutral (3★)</option>
                  <option value="negative">Negative (1-2★)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-none bg-transparent text-sm focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="p-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'No reviews to display yet.' : `No ${filter} reviews found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
                      {(review.user_name || 'U').charAt(0).toUpperCase()}
                    </div>

                    {/* Review content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.user_name || 'Anonymous User'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating || 0)}
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRatingColor(review.rating || 0)}`}>
                              {review.rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {review.created_at 
                                ? new Date(review.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'Unknown date'
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-3">
                        {review.comment || review.text || 'No comment provided.'}
                      </p>

                      {/* Review actions */}
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">Helpful</span>
                        </button>
                        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
