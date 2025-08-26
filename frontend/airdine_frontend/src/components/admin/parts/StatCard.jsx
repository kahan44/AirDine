import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  accent = 'from-orange-500 to-red-500',
  trend,
  trendValue,
  loading = false 
}) => {
  const showTrend = trend && trendValue !== undefined;
  const isPositiveTrend = trend === 'up';
  
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 p-6 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${accent} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
              {loading ? (
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                value
              )}
            </div>
            <div className="text-gray-600 font-medium">{label}</div>
          </div>
        </div>
        
        {showTrend && !loading && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            isPositiveTrend 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>
      
      {/* Subtle bottom border with accent color */}
      <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${accent} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
    </div>
  );
};

export default StatCard;
