
import React from 'react';
import { Clock, X } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onSelectSearch: (search: string) => void;
  onRemoveSearch: (search: string) => void;
  onClearAll: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelectSearch,
  onRemoveSearch,
  onClearAll
}) => {
  if (searches.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-2 shadow-lg backdrop-blur-sm z-10">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Searches
          </h4>
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Clear All
          </button>
        </div>
        
        <div className="space-y-1">
          {searches.slice(0, 5).map((search, index) => (
            <div
              key={index}
              className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <button
                onClick={() => onSelectSearch(search)}
                className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {search}
              </button>
              <button
                onClick={() => onRemoveSearch(search)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;
