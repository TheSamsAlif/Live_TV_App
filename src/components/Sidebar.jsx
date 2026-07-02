import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ChannelList from './ChannelList';
import SkeletonLoader from './SkeletonLoader';
import { FiSearch, FiStar, FiX, FiList, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function Sidebar() {
  const {
    groups, selectedGroup, setGroup, channels, isLoading, error,
    searchQuery, setSearch, showFavorites, toggleFavorites,
  } = useApp();
  const [showGroups, setShowGroups] = useState(true);

  return (
    <aside className="flex flex-col h-full bg-dark-900/50">
      <div className="p-3 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input pl-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={toggleFavorites}
          className={`sidebar-item w-full ${showFavorites ? 'active' : ''}`}
        >
          <FiStar className="w-4 h-4" />
          <span className="text-sm">Favorites</span>
          <span className="ml-auto text-xs text-dark-500">
            {channels.length}
          </span>
        </button>
      </div>

      <div className="px-3">
        <button
          onClick={() => setShowGroups(!showGroups)}
          className="flex items-center justify-between w-full py-2 text-xs font-semibold text-dark-400 uppercase tracking-wider"
        >
          <span>Categories</span>
          {showGroups ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
        </button>

        {showGroups && (
          <div className="flex flex-wrap gap-1.5 pb-3 max-h-32 overflow-y-auto no-scrollbar">
            {groups.slice(0, 30).map((group) => (
              <button
                key={group}
                onClick={() => setGroup(group)}
                className={`px-2.5 py-1 text-xs rounded-full transition-all duration-200 border ${
                  selectedGroup === group
                    ? 'bg-primary-600/20 text-primary-400 border-primary-500/30'
                    : 'text-dark-400 border-dark-600/50 hover:text-dark-200 hover:border-dark-500'
                }`}
              >
                {group === 'All' ? (
                  <span className="flex items-center gap-1"><FiList className="w-3 h-3" /> All</span>
                ) : (
                  group
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <SkeletonLoader count={10} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-dark-500 text-sm">Failed to load channels.</p>
          </div>
        ) : (
          <ChannelList />
        )}
      </div>

      <div className="p-3 border-t border-white/5">
        <p className="text-[10px] text-dark-600 text-center">
          {channels.length} channels
        </p>
      </div>
    </aside>
  );
}
