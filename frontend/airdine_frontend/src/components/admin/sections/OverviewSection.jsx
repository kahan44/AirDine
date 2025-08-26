import React from 'react';
import StatCard from '../parts/StatCard';
import { 
  ClipboardList, 
  CalendarCheck2, 
  CheckCircle2, 
  MessageSquare,
  Clock,
  Users,
  Star,
  TrendingUp,
  Activity,
  Calendar,
  BookOpen,
  AlertCircle
} from 'lucide-react';

const OverviewSection = ({ overview, reviews = [] }) => {
  const stats = overview?.stats || {};
  const recentActivity = overview?.recent_activity || [];
  const insights = overview?.insights || {};
  const trends = overview?.trends || {};
  
  // Review-based calculations
  const calculateReviewInsights = () => {
    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        recentRating: 0,
        ratingTrend: null,
        topRatingCategory: null,
        reviewGrowth: 0
      };
    }

    // Calculate average rating
    const averageRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    
    // Get recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReviews = reviews.filter(r => {
      const reviewDate = new Date(r.created_at);
      return reviewDate >= thirtyDaysAgo;
    });
    
    const recentAverageRating = recentReviews.length > 0 
      ? recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length 
      : averageRating;
    
    // Calculate rating distribution and find most common rating
    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => Math.round(r.rating || 0) === rating).length
    }));
    
    const topRatingCategory = ratingCounts.reduce((prev, current) => 
      (current.count > prev.count) ? current : prev
    );

    // Calculate growth compared to previous period
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30);
    
    const previousReviews = reviews.filter(r => {
      const reviewDate = new Date(r.created_at);
      return reviewDate >= previousPeriodStart && reviewDate <= previousPeriodEnd;
    });
    
    const reviewGrowth = previousReviews.length > 0 
      ? ((recentReviews.length - previousReviews.length) / previousReviews.length) * 100 
      : recentReviews.length > 0 ? 100 : 0;

    // Determine rating trend
    const ratingTrend = recentAverageRating > averageRating ? 'up' : 
                       recentAverageRating < averageRating ? 'down' : 'stable';

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      recentRating: Math.round(recentAverageRating * 10) / 10,
      ratingTrend,
      topRatingCategory,
      reviewGrowth: Math.round(reviewGrowth),
      recentReviewsCount: recentReviews.length,
      positiveReviews: reviews.filter(r => (r.rating || 0) >= 4).length,
      responseRate: reviews.length > 0 ? Math.round((reviews.filter(r => r.response).length / reviews.length) * 100) : 0
    };
  };

  const reviewInsights = calculateReviewInsights();
  
  // Helper function to determine trend direction and value
  const getTrendData = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change >= 0 ? 'up' : 'down',
      value: Math.abs(Math.round(change))
    };
  };

  // Helper function to extract percentage from string
  const extractPercentage = (text) => {
    if (!text) return null;
    const match = text.match(/(\d+(?:\.\d+)?)%/);
    return match ? parseFloat(match[1]) : null;
  };

  // Get trend data for stats
  const bookingTrend = getTrendData(stats.total_bookings, stats.previous_total_bookings);
  const confirmedTrend = getTrendData(stats.confirmed, stats.previous_confirmed);
  const completedTrend = getTrendData(stats.completed, stats.previous_completed);
  const reviewsTrend = getTrendData(stats.reviews_count, stats.previous_reviews_count);

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
      case 'booking_confirmed':
        return { icon: Calendar, color: 'from-green-500 to-emerald-500' };
      case 'review':
      case 'review_received':
        return { icon: Star, color: 'from-purple-500 to-pink-500' };
      case 'booking_completed':
        return { icon: CheckCircle2, color: 'from-blue-500 to-indigo-500' };
      case 'booking_cancelled':
        return { icon: AlertCircle, color: 'from-red-500 to-pink-500' };
      default:
        return { icon: Activity, color: 'from-gray-500 to-gray-600' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={ClipboardList} 
          label="Total Bookings" 
          value={stats.total_bookings ?? 0}
          trend={bookingTrend?.direction}
          trendValue={bookingTrend?.value}
          accent="from-orange-500 to-red-500"
        />
        <StatCard 
          icon={CalendarCheck2} 
          label="Confirmed" 
          value={stats.confirmed ?? 0} 
          trend={confirmedTrend?.direction}
          trendValue={confirmedTrend?.value}
          accent="from-green-500 to-emerald-500"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Completed" 
          value={stats.completed ?? 0}
          trend={completedTrend?.direction}
          trendValue={completedTrend?.value}
          accent="from-blue-500 to-indigo-500"
        />
        <StatCard 
          icon={MessageSquare} 
          label="Reviews" 
          value={stats.reviews_count ?? 0}
          trend={reviewsTrend?.direction}
          trendValue={reviewsTrend?.value}
          accent="from-purple-500 to-pink-500"
        />
      </div>

      {/* Enhanced activity and insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Feed */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => {
                const activityConfig = getActivityIcon(activity.type);
                const ActivityIcon = activityConfig.icon;
                
                return (
                  <div key={activity.id || index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${activityConfig.color} flex items-center justify-center text-white`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description || activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {activity.created_at 
                          ? new Date(activity.created_at).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            }) + ' ago'
                          : activity.time || 'Unknown time'
                        }
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs">Activity will appear here when customers interact with your restaurant</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
              <p className="text-sm text-gray-600">Performance overview</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Booking Completion Rate */}
            {(insights.booking_rate || insights.completion_rate_value !== undefined) && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-900">
                      {insights.completion_rate_value ?? extractPercentage(insights.booking_rate) ?? 0}%
                    </p>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  {insights.completion_rate_description || 
                   (insights.booking_rate ? insights.booking_rate.replace(/\d+(?:\.\d+)?%/, '').trim() : 'Based on completed bookings')}
                </p>
              </div>
            )}
            
            {/* Average Rating */}
            {insights.average_rating !== undefined && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Avg. Rating</p>
                    <p className="text-2xl font-bold text-blue-900">{insights.average_rating}</p>
                  </div>
                  <div className="text-blue-600">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
                {insights.rating_change !== undefined && (
                  <p className="text-xs text-blue-700 mt-2">
                    {insights.rating_change >= 0 ? '↗' : '↘'} {Math.abs(insights.rating_change)} vs last month
                  </p>
                )}
              </div>
            )}
            
            {/* Review Insights */}
            {reviewInsights.totalReviews > 0 && (
              <>
                {/* Customer Satisfaction */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Review Activity</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-amber-900">{reviewInsights.averageRating}</p>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-amber-700 ml-1">({reviewInsights.totalReviews})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-amber-600">
                      <Star className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Show message when no insights are available */}
            {(!insights.booking_rate && 
              !insights.completion_rate_value && 
              !insights.average_rating && 
              !insights.peak_hours && 
              reviewInsights.totalReviews === 0) && (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No insights available</p>
                <p className="text-gray-400 text-xs">Insights will appear as you get more bookings and reviews</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
