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
  FiExternalLink, FiPlay, FiSun, FiMoon, FiCheckCircle,
  FiActivity
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
};

const QUICK_ACCESS_ITEMS = [
  {
    id: 'qa-bdiptv-main',
    name: 'BDIPTV Live Portal',
    url: 'http://tv.bdiptv.net/',
    desc: 'BDIX Live TV, Cricket & Entertainment Server',
    tag: 'BDIX / High Speed',
    icon: '⚡',
    badge: 'Official BDIX',
    glowColor: 'from-cyan-500/20 via-blue-600/10 to-violet-600/20',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400',
    textColor: 'text-cyan-500 dark:text-cyan-300',
  },
  {
    id: 'qa-tsports-portal',
    name: 'BDIPTV Sports Hub',
    url: 'http://tv.bdiptv.net/',
    desc: 'Live Cricket, Football & T-Sports Direct Portal',
    tag: 'Sports & Matches',
    icon: '🏆',
    badge: 'Live Sports',
    glowColor: 'from-amber-500/20 via-orange-600/10 to-rose-600/20',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    textColor: 'text-amber-500 dark:text-amber-300',
  },
  {
    id: 'qa-cinevo-ru',
    name: 'Cinevo Cinema (RU)',
    url: 'https://cinevo.ru/',
    desc: 'HD Movies, Series & Cinema Streaming Hub',
    tag: 'Movies & Series',
    icon: '🎬',
    badge: 'HD Cinema',
    glowColor: 'from-purple-500/20 via-pink-600/10 to-rose-600/20',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    textColor: 'text-purple-500 dark:text-purple-300',
  },
  {
    id: 'qa-cinevo-nl',
    name: 'Cinevo Streaming (NL)',
    url: 'https://cinevo.nl/',
    desc: 'International Movies & Ultra HD Streams',
    tag: 'Movies & Series',
    icon: '🍿',
    badge: 'Premium Cinema',
    glowColor: 'from-fuchsia-500/20 via-violet-600/10 to-indigo-600/20',
    borderColor: 'border-fuchsia-500/30 hover:border-fuchsia-400',
    textColor: 'text-fuchsia-500 dark:text-fuchsia-300',
  },
  {
    id: 'qa-kora-live',
    name: 'Kora Live Sports',
    url: 'https://koray-live.live/',
    desc: 'Live Football Matches & International Sports',
    tag: 'Live Football',
    icon: '⚽',
    badge: 'Live Football',
    glowColor: 'from-emerald-500/20 via-teal-600/10 to-cyan-600/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    textColor: 'text-emerald-500 dark:text-emerald-300',
  },
  {
    id: 'qa-yacine-tv',
    name: 'Yacine TV Live',
    url: 'https://yacinee-tv.net/',
    desc: 'Live Matches, beIN Sports & Events Hub',
    tag: 'Sports & Events',
    icon: '📺',
    badge: 'Sports Hub',
    glowColor: 'from-blue-500/20 via-indigo-600/10 to-violet-600/20',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    textColor: 'text-blue-500 dark:text-blue-300',
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

  // Theme Management (Dark Mode & White/Light Mode)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('samsalif_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('samsalif_theme', theme);
    } catch {}
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

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
    <div className={`min-h-screen transition-colors duration-300 relative selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-200 ${
      theme === 'dark'
        ? 'bg-[#060813] text-slate-100'
        : 'bg-gradient-to-br from-slate-50 via-slate-100/90 to-indigo-50/40 text-slate-800'
    }`}>
      {/* 8K Dynamic Ambient Animated Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {theme === 'dark' ? (
          <>
            <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-violet-600/18 via-purple-700/12 to-transparent rounded-full blur-[160px] animate-pulse-slow" />
            <div className="absolute top-[35%] -right-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/18 via-blue-600/12 to-transparent rounded-full blur-[170px] animate-pulse-slow" style={{ animationDelay: '2.5s' }} />
            <div className="absolute -bottom-32 left-[20%] w-[700px] h-[700px] bg-gradient-to-tr from-fuchsia-600/15 via-pink-600/10 to-transparent rounded-full blur-[180px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-indigo-300/25 via-purple-300/20 to-transparent rounded-full blur-[140px] animate-pulse-slow" />
            <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-300/25 via-blue-300/20 to-transparent rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2.5s' }} />
            <div className="absolute -bottom-32 left-[20%] w-[700px] h-[700px] bg-gradient-to-tr from-rose-300/20 via-pink-200/20 to-transparent rounded-full blur-[160px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#00000006_1px,transparent_1px)] [background-size:32px_32px] opacity-60" />
          </>
        )}
      </div>

      {/* Floating Mini-Player (Allows full uninterrupted scrolling) */}
      {playerMode === 'mini' && currentChannel && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 aspect-video animate-slide-up shadow-[0_14px_45px_rgba(0,0,0,0.5)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden ring-1 ring-white/20">
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
        {/* Navigation Bar / Brand Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
            {/* Logo & Identity */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-fuchsia-500 p-[2px] shadow-lg shadow-violet-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300 transform group-hover:scale-105">
                  <div className="w-full h-full bg-white dark:bg-[#0a0a14] rounded-2xl flex items-center justify-center">
                    <FiTv className="text-violet-600 dark:text-cyan-300 group-hover:scale-110 transition-transform" size={24} />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#060813]" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white/70 bg-clip-text text-transparent">
                    SAMS ALIF <span className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">LIVE</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest bg-gradient-to-r from-cyan-500/15 via-violet-500/15 to-fuchsia-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 shadow-sm">
                    8K ULTRA HD
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/50 tracking-wide font-medium mt-0.5">
                  Premium Glassmorphic Live Streaming Hub • BDIPTV BDIX High Speed
                </p>
              </div>
            </div>

            {/* Header Right Action Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Dark Mode / Light Mode Switcher */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme mode"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 hover:border-violet-400/50 hover:shadow-md"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  {theme === 'dark' ? (
                    <FiMoon className="text-violet-400 animate-spin-once" size={15} />
                  ) : (
                    <FiSun className="text-amber-500 animate-spin-once" size={15} />
                  )}
                </div>
                <span className="capitalize">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>

              {/* Only Online Stream Shield Filter */}
              <button
                onClick={toggleHideOffline}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all backdrop-blur-md ${
                  hideOffline
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60'
                }`}
                title="Toggle showing only verified active channels"
              >
                <FiShield size={13} className={hideOffline ? 'text-emerald-500 dark:text-emerald-400' : ''} />
                <span>{hideOffline ? 'Active Only' : 'All Streams'}</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl p-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode('sections')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'sections'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30 shadow-xs'
                      : 'text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  title="Category Row View"
                >
                  <FiLayers size={14} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30 shadow-xs'
                      : 'text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white'
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
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-600/20 dark:bg-violet-600/30 border border-violet-500/40 text-violet-700 dark:text-violet-200 text-xs font-semibold hover:bg-violet-600/30 transition-all animate-pulse"
                >
                  <FiMaximize2 size={13} />
                  <span>Resume Player</span>
                </button>
              )}

              {/* GitHub Repo */}
              <a
                href="https://github.com/TheSamsAlif/Live_TV_App"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all shadow-sm"
                title="GitHub Repository"
              >
                <FiGithub size={15} />
              </a>
            </div>
          </div>

          {/* Quick Access BDIPTV Hub (Exclusively 2 verified working links) */}
          <div className="mb-8 p-5 sm:p-6 rounded-3xl glass-panel relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-violet-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
                  <span className="text-white text-sm font-black">⚡</span>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide uppercase bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 dark:from-cyan-300 dark:via-violet-300 dark:to-fuchsia-300 bg-clip-text text-transparent">
                    BDIPTV Official High-Speed Hub
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-white/50">
                    Direct BDIX Portals for Bufferless Cricket, Football & Bangla TV
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 font-mono">
                  BDIX GIGABIT SPEED
                </span>
                <a
                  href="http://tv.bdiptv.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-violet-600 dark:text-cyan-400 hover:text-violet-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-white/5"
                >
                  <span>Open Portal</span>
                  <FiExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {QUICK_ACCESS_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleQuickAccessClick(item)}
                  className={`group/card relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-1.5 border bg-white/70 dark:bg-white/[0.03] ${item.borderColor} shadow-sm hover:shadow-lg hover:shadow-cyan-500/10`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center text-2xl shadow-inner border border-slate-200/80 dark:border-white/10 group-hover/card:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-extrabold ${item.textColor} tracking-tight`}>
                          {item.name}
                        </h4>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 border border-slate-200/80 dark:border-white/10">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 dark:bg-cyan-500/10 group-hover/card:bg-violet-500 group-hover/card:text-white text-violet-600 dark:text-cyan-300 text-xs font-bold transition-all border border-violet-500/20 dark:border-cyan-500/20">
                    <span>Visit</span>
                    <FiExternalLink size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spotlight Search & Stats Counter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 blur-xl pointer-events-none" />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-400 z-10" size={18} />
              <input
                type="text"
                placeholder="Search across 96+ 8K channels, sports, cricket, news, bangla..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="relative w-full pl-12 pr-12 py-3.5 bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-white/[0.07] focus:shadow-[0_0_30px_rgba(6,182,212,0.18)] transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white transition-colors z-10"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {/* Live Stats Pill Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                  {filteredChannels.length} Live Channels
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/25 backdrop-blur-md shadow-xs">
                <FiRadio size={13} className="text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300 font-mono">
                  {groups.length - 1} Categories
                </span>
              </div>

              <button
                onClick={toggleFavoritesView}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
                  showFavorites
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
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
                      ? 'bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 text-white border-transparent shadow-[0_4px_20px_rgba(139,92,246,0.35)] scale-105'
                      : 'bg-white/70 dark:bg-white/[0.03] text-slate-600 dark:text-white/60 border-slate-200/80 dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.07] hover:border-violet-300 dark:hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">{CATEGORY_ICONS[grp] || '📺'}</span>
                  <span>{grp}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/50'
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
                        <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white/90">
                          {groupName} Channels
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40">
                          {items.length} Streams
                        </span>
                      </div>

                      <button
                        onClick={() => scrollToCategory(groupName)}
                        className="text-xs text-violet-600 dark:text-cyan-400 hover:text-violet-700 dark:hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
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
                  <h2 className="text-sm font-bold text-slate-600 dark:text-white/70 tracking-wider uppercase flex items-center gap-2">
                    <span>{CATEGORY_ICONS[selectedGroup] || '📺'}</span>
                    <span>{selectedGroup === 'All' ? 'All Channels' : selectedGroup}</span>
                  </h2>
                  <span className="text-xs text-violet-600 dark:text-cyan-400 font-mono bg-violet-500/10 dark:bg-cyan-500/10 px-2.5 py-1 rounded-full border border-violet-500/20 dark:border-cyan-500/20 font-bold">
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
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-white/40">
                    <FiSearch size={48} className="mb-4 text-violet-500/40" />
                    <p className="text-lg font-bold text-slate-700 dark:text-white/70">No matching channels found</p>
                    <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                      {offlineChannels.length > 0 && hideOffline
                        ? 'Some streams are currently filtered because they are offline.'
                        : 'Try adjusting your search query or switching categories.'}
                    </p>
                    {offlineChannels.length > 0 && (
                      <button
                        onClick={resetOfflineChannels}
                        className="mt-4 px-4 py-2 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white text-xs border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center py-24">
            <LoadingSpinner />
          </div>
        )}

        {/* Error Screen */}
        {error && (
          <div className="flex justify-center py-24">
            <ErrorScreen message={error} onRetry={loadPlaylist} />
          </div>
        )}

        {/* 8K Futuristic Glassmorphic Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-200/80 dark:border-white/[0.08] text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[11px] text-slate-400 dark:text-white/30 tracking-[0.3em] uppercase font-mono font-bold">
              SAMS ALIF LIVE • 8K ULTRA HD & BDIPTV
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 dark:text-white/30">
            Engineered with <FiHeart size={11} className="inline text-fuchsia-500 fill-fuchsia-500 mx-1" /> for bufferless live streaming
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-400 dark:text-white/20 flex-wrap">
            <span>© {new Date().getFullYear()} SAMS ALIF</span>
            <span>•</span>
            <a href="http://tv.bdiptv.net/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              BDIPTV Portal
            </a>
            <span>•</span>
            <span>Auto-1080p Quality Switcher</span>
            <span>•</span>
            <span>Scroll-Safe Architecture</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
