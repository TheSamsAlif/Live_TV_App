import { useState } from 'react';
import { useApp } from './context/AppContext';
import VideoPlayer from './components/VideoPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorScreen from './components/ErrorScreen';
import { FiMonitor, FiSearch, FiX, FiStar, FiChevronDown, FiChevronUp, FiGithub, FiMaximize, FiMinimize, FiExternalLink, FiPlay, FiTv, FiRadio, FiHome, FiHeart } from 'react-icons/fi';

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="%231a1a2e"/><text x="50%" y="55%" text-anchor="middle" font-size="16" fill="%237c3aed">TV</text></svg>'
);

const GROUP_COLORS = [
  'from-violet-500 to-fuchsia-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-yellow-500',
  'from-indigo-500 to-purple-500',
  'from-lime-500 to-green-500',
  'from-sky-500 to-indigo-500',
  'from-rose-500 to-pink-500',
];

const GROUP_BG_COLORS = [
  'bg-violet-500/15 border-violet-500/30 text-violet-300',
  'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
  'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  'bg-orange-500/15 border-orange-500/30 text-orange-300',
  'bg-pink-500/15 border-pink-500/30 text-pink-300',
  'bg-amber-500/15 border-amber-500/30 text-amber-300',
  'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
  'bg-lime-500/15 border-lime-500/30 text-lime-300',
  'bg-sky-500/15 border-sky-500/30 text-sky-300',
  'bg-rose-500/15 border-rose-500/30 text-rose-300',
];

function getGroupColor(index) {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

function getGroupBg(index) {
  return GROUP_BG_COLORS[index % GROUP_BG_COLORS.length];
}

function ChannelCard({ channel, onSelect, isActive, isFav, onFav, groupIndex }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 border ${
        isActive
          ? 'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.25)]'
          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-violet-400/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)]'
      }`}
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center ring-1 ring-white/10 group-hover:ring-violet-400/30 transition-all">
        <img
          src={imgError || !channel.logo ? FALLBACK_LOGO : channel.logo}
          alt={channel.name}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {isActive && (
          <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
        )}
      </div>
      <span className="text-xs text-center text-white/80 font-medium line-clamp-2 leading-tight group-hover:text-white transition-colors">
        {channel.name}
      </span>
      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${groupIndex !== undefined ? getGroupBg(groupIndex) : 'bg-white/5 border-white/10 text-white/40'}`}>
        {channel.group}
      </span>
      {channel.type === 'link' ? (
        <span className="absolute top-2 right-2 text-violet-400/60">
          <FiExternalLink size={10} />
        </span>
      ) : null}
      <button
        onClick={(e) => { e.stopPropagation(); onFav(channel.id); }}
        className={`absolute top-2 left-2 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
          isFav ? 'text-yellow-400 opacity-100' : 'text-white/20 hover:text-yellow-400'
        }`}
      >
        <FiStar size={12} fill={isFav ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

export default function App() {
  const {
    channels, groups, filteredChannels, currentChannel, searchQuery, setSearch,
    selectedGroup, setGroup, isLoading, error, favorites, toggleFavorite,
    setCurrentChannel, loadPlaylist
  } = useApp();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [isFS, setIsFS] = useState(false);

  function handleChannelClick(channel) {
    if (channel.type === 'link') {
      window.open(channel.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setCurrentChannel(channel);
    setShowPlayer(true);
  }

  function handleBack() {
    setShowPlayer(false);
  }

  function toggleFS() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFS(false);
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFS(true);
    }
  }

  const items = filteredChannels;

  return (
    <div className="min-h-screen bg-[#0a0a14] relative overflow-hidden">
      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/5 to-orange-600/5 rounded-full blur-[200px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[30%] left-[5%] w-[250px] h-[250px] bg-pink-500/8 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:60px_60px]" />

      {/* Player Overlay */}
      {showPlayer && currentChannel && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30">
            <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm transition-all">
              ← Back to Channels
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-white/90 font-medium text-sm truncate max-w-[200px]">{currentChannel.name}</span>
              </div>
              <button onClick={toggleFS} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                {isFS ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.15)]">
              <VideoPlayer onBack={handleBack} />
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-glow">
                  <FiTv className="text-white" size={24} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0a14] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  SAMS ALIF{' '}
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">LIVE</span>
                </h1>
                <p className="text-[11px] text-white/40 tracking-wider">Bangladesh's Premium Media Hub</p>
              </div>
            </div>
            <a href="https://github.com/TheSamsAlif/Live_TV_App" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 hover:border-violet-400/30">
              <FiGithub size={18} />
            </a>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">{channels.length} Channels</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <FiRadio size={12} className="text-violet-400" />
              <span className="text-xs text-violet-400 font-semibold">{groups.length - 1} Categories</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <FiStar size={12} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-semibold">{favorites.length} Favorites</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-pink-500/20 blur-xl" />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 z-10" size={18} />
            <input
              type="text"
              placeholder="🔍 Search any channel, sport, or category..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full pl-12 pr-12 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white placeholder-white/30 outline-none focus:border-violet-400/50 focus:bg-white/[0.06] focus:shadow-[0_0_30px_rgba(139,92,246,0.12)] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors z-10">
                <FiX size={18} />
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        {!isLoading && !error && (
          <main>
            {/* Category Filters */}
            <div className="mb-6">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-3"
              >
                <FiHome size={14} />
                <span className="font-semibold tracking-wide uppercase text-[11px]">Categories</span>
                {showCategories ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {showCategories && (
                <div className="flex flex-wrap gap-2">
                  {groups.map((group, idx) => (
                    <button
                      key={group}
                      onClick={() => setGroup(group)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                        selectedGroup === group
                          ? `bg-gradient-to-r ${getGroupColor(idx)} text-white border-transparent shadow-lg shadow-violet-500/20`
                          : 'bg-white/[0.04] text-white/50 border-white/10 hover:text-white/80 hover:border-white/25 hover:bg-white/[0.08]'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Channel Grid Section */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white/70 tracking-wide uppercase">
                {selectedGroup === 'All' ? '📺 All Channels' : selectedGroup}
              </h2>
              <span className="text-xs text-white/30 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                {items.length} channel{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                {items.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    onSelect={handleChannelClick}
                    isActive={currentChannel?.id === channel.id}
                    isFav={favorites.includes(channel.id)}
                    onFav={toggleFavorite}
                    groupIndex={groups.indexOf(channel.group) - 1}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-white/30">
                <FiSearch size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-semibold text-white/50">No channels found</p>
                <p className="text-sm text-white/30 mt-1">Try a different search or category</p>
              </div>
            )}
          </main>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center py-20">
            <ErrorScreen message={error} onRetry={loadPlaylist} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 pb-6 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-1 h-1 rounded-full bg-violet-500" />
            <span className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-mono">SAMS ALIF LIVE TV</span>
            <div className="w-1 h-1 rounded-full bg-fuchsia-500" />
          </div>
          <p className="text-xs text-white/20">
            Built with <FiHeart size={10} className="inline text-fuchsia-400" /> in Bangladesh • v3.0
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-[10px] text-white/10">© {new Date().getFullYear()} SAMS ALIF</span>
            <span className="text-white/5">|</span>
            <span className="text-[10px] text-white/10">All streams from public sources</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
