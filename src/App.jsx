import { useState, useRef, useEffect } from 'react';
import { useApp } from './context/AppContext';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorScreen from './components/ErrorScreen';
import {
  FiSearch, FiX, FiStar, FiChevronRight, FiGithub,
  FiTv, FiRadio, FiGrid, FiLayers, FiShield,
  FiZap, FiRefreshCw, FiSliders, FiHeart, FiMaximize2,
  FiExternalLink, FiPlay
} from 'react-icons/fi';

const CATEGORY_ICONS = {
  All: '📺',
  Bangla: '🇧🇩',
  Sports: '⚽',
  News: '📰',
  Movies: '🎬',
  Entertainment: '🍿',
  Music: '🎵',
  Kids: '👶',
  Documentary: '🌍',
  Religious: '🕌',
  BDIPTV: '⚡',
};

const QUICK_ACCESS_ITEMS = [
  {
    id: 'qa-bdiptv-main',
    name: 'BDIPTV Live Portal',
    url: 'http://tv.bdiptv.net/',
    desc: 'BDIX Live TV, Cricket & Sports Portal',
    icon: '⚡',
    badge: 'Official BDIX',
  },
  {
    id: 'qa-ezlivetv',
    name: 'EzLiveTV BDIX Hub',
    url: 'https://tv.ezshomadhan.com/',
    desc: 'Bangladesh BDIX All Channels Hub',
    icon: '📺',
    badge: 'BDIX TV',
  },
  {
    id: 'qa-fifa',
    name: 'FIFA Sports Live',
    url: 'https://fifalive.click/',
    desc: 'Live Football & FIFA HD Match Hub',
    icon: '⚽',
    badge: 'Live Sports',
  },
  {
    id: 'qa-eplayhd',
    name: 'EplayHD Live Sports',
    url: 'https://eplayhd.com/',
    desc: 'Premier League, Cricket & F1 Live',
    icon: '🏆',
    badge: 'Sports HD',
  },
  {
    id: 'qa-tsports-portal',
    name: 'BDIPTV Sports Hub',
    url: 'http://tv.bdiptv.net/',
    desc: 'T-Sports & Star Sports BDIX Portal',
    icon: '⭐',
    badge: 'BDIX Sports',
  },
];

export default function App() {
  const {
    channels,
    groups,
    filteredChannels,
    currentChannel,
    setCurrentChannel,
    searchQuery,
    setSearch,
    selectedGroup,
    setGroup,
    isLoading,
    error,
    favorites,
    toggleFavorite,
    showFavorites,
    toggleFavoritesView,
    playerMode,
    setPlayerMode,
    closePlayer,
    hideOffline,
    toggleHideOffline,
    offlineChannels,
    resetOfflineChannels,
    viewMode,
    setViewMode,
    loadPlaylist,
  } = useApp();

  const savedScrollPos = useRef(0);
  const [activeCategoryTab, setActiveCategoryTab] = useState('All');

  // Handle clicking a channel - preserves exact scroll position
  function handleSelectChannel(channel) {
    if (channel.type === 'link') {
      window.open(channel.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Save current scroll offset
    savedScrollPos.current = window.scrollY;
    setCurrentChannel(channel);
    setPlayerMode('modal');
  }

  // Handle quick access card clicks
  function handleQuickAccessClick(item) {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }

  // Handle closing player modal without losing scroll position
  function handleCloseModal() {
    closePlayer();
    // Restore scroll position cleanly
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollPos.current, behavior: 'instant' });
    });
  }

  // Handle minimizing to floating mini-player
  function handleToggleMini() {
    if (playerMode === 'mini') {
      setPlayerMode('modal');
    } else {
      setPlayerMode('mini');
      // Restore scroll to where user was browsing
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollPos.current, behavior: 'instant' });
      });
    }
  }

  // Scroll to category section
  function scrollToCategory(categoryName) {
    setGroup(categoryName);
    setActiveCategoryTab(categoryName);
    if (viewMode === 'sections' && categoryName !== 'All') {
      const el = document.getElementById(`cat-section-${categoryName}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Categorized channels grouped
  const categorizedGroups = groups
    .filter((g) => g !== 'All')
    .map((g) => ({
      groupName: g,
      items: filteredChannels.filter((ch) => ch.group === g),
    }))
    .filter((cg) => cg.items.length > 0);

  return (
    <div className="min-h-screen bg-[#06070e] text-white relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 8K Ambient Animated Gradient Aura */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-violet-600/15 via-purple-700/10 to-transparent rounded-full blur-[160px] animate-pulse-slow" />
        <div className="absolute top-[35%] -right-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-[170px] animate-pulse-slow" style={{ animationDelay: '2.5s' }} />
        <div className="absolute -bottom-32 left-[20%] w-[700px] h-[700px] bg-gradient-to-tr from-fuchsia-600/12 via-pink-600/10 to-transparent rounded-full blur-[180px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* Floating Mini-Player (Allows full uninterrupted scrolling) */}
      {playerMode === 'mini' && currentChannel && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 aspect-video animate-slide-up shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <VideoPlayer
            isMini={true}
            onClose={handleCloseModal}
            onToggleMini={handleToggleMini}
          />
        </div>
      )}

      {/* Theater / Cinema Modal Player */}
      {playerMode === 'modal' && currentChannel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-5xl aspect-video max-h-[90vh]">
            <VideoPlayer
              isMini={false}
              onClose={handleCloseModal}
              onToggleMini={handleToggleMini}
            />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Futuristic 8K Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-fuchsia-500 p-[2px] shadow-lg shadow-violet-500/25 group-hover:shadow-cyan-400/40 transition-all">
                  <div className="w-full h-full bg-[#0a0a14] rounded-2xl flex items-center justify-center">
                    <FiTv className="text-cyan-300 group-hover:scale-110 transition-transform" size={24} />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-[#06070e]" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-white/70 bg-clip-text text-transparent">
                    SAMS ALIF <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">LIVE</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    8K ULTRA HD
                  </span>
                </div>
                <p className="text-xs text-white/50 tracking-wide font-medium mt-0.5">
                  Premium High-Definition Live Streaming Hub • Verified Streams & BDIX Live
                </p>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Only Online Shield Indicator */}
              <button
                onClick={toggleHideOffline}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all backdrop-blur-md ${
                  hideOffline
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
                title="Toggle showing only working channels"
              >
                <FiShield size={13} className={hideOffline ? 'text-emerald-400' : ''} />
                <span>{hideOffline ? 'Active Streams Only' : 'Showing All'}</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('sections')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'sections'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-white/40 hover:text-white'
                  }`}
                  title="Category Row View"
                >
                  <FiLayers size={14} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-white/40 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <FiGrid size={14} />
                </button>
              </div>

              {/* Mini Player Resume Button if Playing */}
              {currentChannel && playerMode === 'hidden' && (
                <button
                  onClick={() => setPlayerMode('modal')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs font-semibold hover:bg-violet-600/50 transition-all animate-pulse"
                >
                  <FiMaximize2 size={13} />
                  <span>Resume Playing</span>
                </button>
              )}

              {/* Github */}
              <a
                href="https://github.com/TheSamsAlif/Live_TV_App"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/10 transition-all"
                title="GitHub Repo"
              >
                <FiGithub size={16} />
              </a>
            </div>
          </div>

          {/* Quick Access BDIPTV Bar */}
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-cyan-950/20 via-violet-950/20 to-fuchsia-950/20 border border-cyan-500/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base text-cyan-400 animate-pulse">⚡</span>
                <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  BDIPTV Quick Access Hub
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  BDIX Speed
                </span>
              </div>
              <a
                href="http://tv.bdiptv.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Full BDIPTV Portal</span>
                <FiExternalLink size={11} />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {QUICK_ACCESS_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleQuickAccessClick(item)}
                  className="group relative flex flex-col p-3 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.06] hover:border-cyan-400/40 cursor-pointer transition-all duration-200 transform-gpu hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 group-hover:bg-cyan-400/20 text-white/60 group-hover:text-cyan-300 border border-white/5 transition-colors">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white/90 group-hover:text-cyan-300 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-white/40 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar & Stat Counters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 blur-xl pointer-events-none" />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/70 z-10" size={18} />
              <input
                type="text"
                placeholder="Search across 240+ 8K & BDIX channels, sports, cricket, news..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="relative w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_30px_rgba(6,182,212,0.18)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {/* Live Stats Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  {filteredChannels.length} Live Channels
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 backdrop-blur-md">
                <FiRadio size={13} className="text-violet-400" />
                <span className="text-xs font-bold text-violet-300 font-mono">
                  {groups.length - 1} Categories
                </span>
              </div>

              <button
                onClick={toggleFavoritesView}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
                  showFavorites
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <FiStar size={13} fill={showFavorites ? 'currentColor' : 'none'} />
                <span className="text-xs font-bold font-mono">{favorites.length} Favs</span>
              </button>
            </div>
          </div>

          {/* Category Tabs Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {groups.map((grp) => {
              const isSelected = selectedGroup === grp;
              const count = grp === 'All'
                ? channels.length
                : channels.filter((c) => c.group === grp).length;

              return (
                <button
                  key={grp}
                  onClick={() => scrollToCategory(grp)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 border select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 text-white border-transparent shadow-[0_0_25px_rgba(139,92,246,0.35)] scale-105'
                      : 'bg-white/[0.03] text-white/60 border-white/[0.08] hover:text-white hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">{CATEGORY_ICONS[grp] || '📺'}</span>
                  <span>{grp}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Content Body */}
        {!isLoading && !error && (
          <main>
            {/* View Mode 1: Organized Category Sections (Netflix / Prime style) */}
            {viewMode === 'sections' && selectedGroup === 'All' && !searchQuery ? (
              <div className="space-y-12">
                {categorizedGroups.map(({ groupName, items }) => (
                  <section
                    key={groupName}
                    id={`cat-section-${groupName}`}
                    className="relative scroll-mt-24"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{CATEGORY_ICONS[groupName] || '📺'}</span>
                        <h2 className="text-lg font-black tracking-tight text-white/90">
                          {groupName} Channels
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-white/40">
                          {items.length} Streams
                        </span>
                      </div>

                      <button
                        onClick={() => scrollToCategory(groupName)}
                        className="text-xs text-cyan-400/80 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View Only {groupName}</span>
                        <FiChevronRight size={14} />
                      </button>
                    </div>

                    {/* Responsive Grid for Category */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {items.map((channel) => (
                        <ChannelCard
                          key={channel.id}
                          channel={channel}
                          onSelect={handleSelectChannel}
                          isActive={currentChannel?.id === channel.id}
                          isFav={favorites.includes(channel.id)}
                          onFav={toggleFavorite}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* View Mode 2: Unified Filtered Grid */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white/70 tracking-wider uppercase flex items-center gap-2">
                    <span>{CATEGORY_ICONS[selectedGroup] || '📺'}</span>
                    <span>{selectedGroup === 'All' ? 'All Channels' : selectedGroup}</span>
                  </h2>
                  <span className="text-xs text-cyan-400/80 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''} available
                  </span>
                </div>

                {filteredChannels.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {filteredChannels.map((channel) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        onSelect={handleSelectChannel}
                        isActive={currentChannel?.id === channel.id}
                        isFav={favorites.includes(channel.id)}
                        onFav={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-white/40">
                    <FiSearch size={48} className="mb-4 text-violet-500/40" />
                    <p className="text-lg font-bold text-white/70">No matching channels found</p>
                    <p className="text-xs text-white/40 mt-1">
                      {offlineChannels.length > 0 && hideOffline
                        ? 'Some streams are currently filtered because they are offline.'
                        : 'Try adjusting your search query or switching categories.'}
                    </p>
                    {offlineChannels.length > 0 && (
                      <button
                        onClick={resetOfflineChannels}
                        className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/10 transition-all flex items-center gap-1.5"
                      >
                        <FiRefreshCw size={12} />
                        <span>Reset Stream Blacklist</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-24">
            <LoadingSpinner />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center py-24">
            <ErrorScreen message={error} onRetry={loadPlaylist} />
          </div>
        )}

        {/* 8K Futuristic Footer */}
        <footer className="mt-20 pt-8 border-t border-white/[0.08] text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] text-white/30 tracking-[0.3em] uppercase font-mono font-bold">
              SAMS ALIF LIVE • 8K ULTRA HD & BDIPTV
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
          </div>
          <p className="text-xs text-white/30">
            Engineered with <FiHeart size={11} className="inline text-fuchsia-500 fill-fuchsia-500 mx-1" /> for bufferless streaming in Bangladesh
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-white/20">
            <span>© {new Date().getFullYear()} SAMS ALIF</span>
            <span>•</span>
            <a href="http://tv.bdiptv.net/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
              BDIPTV Portal
            </a>
            <span>•</span>
            <span>Quality Switcher (Auto-1080p)</span>
            <span>•</span>
            <span>Scroll-Safe Architecture</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
