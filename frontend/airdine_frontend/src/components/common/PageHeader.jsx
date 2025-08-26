// src/components/common/PageHeader.jsx
import React from "react";
import { RotateCcw } from "lucide-react";

// icon: pass a Lucide icon component, e.g., Utensils
const PageHeader = ({ title, subtitle, icon: Icon, actions, showRefresh = true }) => {
  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
      <div className="px-6 sm:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-md">
              {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
              {subtitle ? (
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showRefresh && (
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/80 hover:bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                title="Refresh page"
              >
                <RotateCcw className="h-4 w-4 text-gray-600 group-hover:text-orange-500 transition-colors group-hover:rotate-180 duration-300" />
              </button>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
