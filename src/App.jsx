import { useState } from 'react';
import { useApp } from './context/AppContext';
import VideoPlayer from './components/VideoPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorScreen from './components/ErrorScreen';
import { FiMonitor, FiSearch, FiX, FiStar, FiChevronDown, FiChevronUp, FiGithub, FiMaximize, FiMinimize } from 'react-icons/fi';

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23374366"/><text x="20" y="24" text-anchor="middle" fill="%2394a3b8" font-size="14" font-family="system-ui">TV</text></svg>'
);

function ChannelCard({ channel, onSelect, isActive, isFav, onFav }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(channel)}
      className="relative flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,245,255,0.15)] hover:bg-white/[0.07] hover:border-cyan-400/40 group"
    >
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/[0.08] bg-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_16px_rgba(0,245,255,0.25)] transition-all">
        <img
          src={imgError || !channel.logo ? FALLBACK_LOGO : channel.logo}
          alt={channel.name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
      <span className="text-xs font-medium text-white/70 text-center leading-tight truncate w-full group-hover:text-cyan-300 transition-colors">
        {channel.name}
      </span>
      {isActive && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_6px_#22c55e] animate-pulse" />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onFav(channel.id); }}
        className={`absolute top-2 left-2 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${isFav ? 'text-yellow-400 opacity-100' : 'text-white/30 hover:text-yellow-400'}`}
      >
        <FiStar className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
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
    <div className="min-h-screen bg-[#030712] text-white font-['Rajdhani',sans-serif]">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,245,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.03)_1px,transparent_1px)] bg-[length:48px_48px] pointer-events-none z-0" />
      <div className="fixed w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-[120px] -top-[200px] -left-[200px] pointer-events-none z-0" />
      <div className="fixed w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[120px] -bottom-[150px] -right-[150px] pointer-events-none z-0" />

      {/* Player Overlay */}
      {showPlayer && currentChannel && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 z-10">
            <button onClick={handleBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <FiX className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 truncate max-w-[200px]">{currentChannel.name}</span>
              <button onClick={toggleFS} className="p-2 text-white/70 hover:text-white">
                {isFS ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <VideoPlayer />
          </div>
        </div>
      )}

      <div className={`relative z-10 ${showPlayer ? 'hidden' : ''}`}>
        {/* Header */}
        <header className="text-center pt-10 pb-8 px-4">
          <div className="text-[10px] font-['Orbitron',monospace] tracking-[0.35em] text-pink-500 uppercase mb-3 animate-pulse">
            // Entertainment Zone //
          </div>
          <h1 className="font-['Orbitron',monospace] text-4xl md:text-6xl font-black tracking-tight">
            <span className="text-white drop-shadow-[0_0_30px_rgba(0,245,255,0.5)]">SamsAlif</span>
            <span className="text-pink-500 mx-2">.</span>
            <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,245,255,0.8)]">LIVE</span>
          </h1>
          <p className="mt-3 text-sm text-white/30 tracking-[0.08em] uppercase font-light">
            Bangladesh#1 Media Server
          </p>
        </header>

        <div className="max-w-7xl mx-auto px-4 pb-24">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/40 focus:bg-white/[0.06] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sections */}
          {!isLoading && !error && (
            <div className="space-y-8">
              {/* All Channels Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-['Orbitron',monospace] text-[10px] font-bold tracking-[0.2em] uppercase text-black bg-cyan-400 px-3 py-1.5">01</span>
                  <h2 className="font-['Orbitron',monospace] text-sm font-semibold text-cyan-400 uppercase tracking-[0.12em] px-4 py-1.5 border border-cyan-400/20 border-l-0 bg-cyan-400/5">
                    {selectedGroup === 'All' ? 'All Channels' : selectedGroup}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/20 to-transparent" />
                  <span className="font-['Orbitron',monospace] text-[10px] text-white/30">[{items.length} channels]</span>
                </div>

                {/* Category Filters */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-2"
                  >
                    <span>Categories</span>
                    {showCategories ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
                  </button>
                  {showCategories && (
                    <div className="flex flex-wrap gap-1.5">
                      {groups.slice(0, 30).map((group) => (
                        <button
                          key={group}
                          onClick={() => setGroup(group)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            selectedGroup === group
                              ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
                              : 'text-white/40 border-white/10 hover:text-white/70 hover:border-white/30'
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Channel Grid */}
                {items.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
                    {items.map((channel) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        onSelect={handleChannelClick}
                        isActive={currentChannel?.id === channel.id}
                        isFav={favorites.includes(channel.id)}
                        onFav={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/30 text-sm">No channels found.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          )}

          {/* Error */}
          {error && (
            <ErrorScreen message={error} onRetry={loadPlaylist} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/[0.04]">
          <div className="flex items-center justify-center gap-4 mb-2">
            <a href="https://github.com/TheSamsAlif/Live_TV_App" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-cyan-400 transition-colors">
              <FiGithub className="w-4 h-4" />
            </a>
          </div>
          <p className="font-['Orbitron',monospace] text-[10px] tracking-[0.3em] text-white/[0.08] uppercase">
            SAMSALIF LIVE TV // ALL RIGHTS RESERVED // v2.0
          </p>
        </footer>
      </div>
    </div>
  );
}