import { useState } from 'react';
import { useApp } from './context/AppContext';
import VideoPlayer from './components/VideoPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorScreen from './components/ErrorScreen';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { FiTv, FiSearch, FiX, FiStar, FiChevronDown, FiChevronUp, FiGithub, FiPlay, FiHeart, FiRadio, FiHome } from 'react-icons/fi';

const GROUP_COLORS = [
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-fuchsia-500',
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
  'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
  'bg-violet-500/15 border-violet-500/30 text-violet-300',
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

function App() {
  const {
    channels, filteredChannels, groups, selectedGroup, setGroup,
    currentChannel, isLoading, error, loadPlaylist,
    searchQuery, setSearch, showFavorites, toggleFavorites,
    sidebarOpen, toggleSidebar, favorites,
  } = useApp();

  const [view, setView] = useState('grid');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorScreen message={error} onRetry={loadPlaylist} />;

  const items = showFavorites
    ? filteredChannels.filter((ch) => favorites.includes(ch.id))
    : filteredChannels;

  return (
    <div className="animated-bg min-h-screen text-white relative">
      <div className="aurora-glow" />
      
      <div className="relative z-10">
        <Navbar sidebarOpen={sidebarOpen} />

        {/* Hero Banner */}
        {!currentChannel && (
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
            <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-fuchsia-500/10" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                    <span className="live-badge">
                      <span className="live-badge-dot" />
                      LIVE
                    </span>
                    <span className="text-xs text-white/40 font-mono tracking-wider">{channels.length} CHANNELS</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    <span className="gradient-text">SAMS ALIF</span> LIVE TV
                  </h1>
                  <p className="text-sm text-white/40 mt-1">Bangla • Sports • FIFA • International • Kids & More</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                    <FiTv className="w-5 h-5 text-cyan-400" />
                    <div className="text-left">
                      <p className="text-xs text-white/40">Total Channels</p>
                      <p className="text-lg font-bold gradient-text">{channels.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                    <FiRadio className="w-5 h-5 text-fuchsia-400" />
                    <div className="text-left">
                      <p className="text-xs text-white/40">Categories</p>
                      <p className="text-lg font-bold gradient-text">{groups.length - 1}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-4">
            {/* Sidebar */}
            {sidebarOpen && (
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-20 h-[calc(100vh-6rem)] glass rounded-2xl overflow-hidden">
                  <Sidebar />
                </div>
              </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={toggleSidebar}>
                <div className="absolute left-0 top-0 bottom-0 w-72 glass-strong overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <Sidebar />
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {currentChannel ? (
                <div className="space-y-4">
                  <VideoPlayer onBack={() => {}} />
                  <ChannelGrid channels={items} currentChannel={currentChannel} onSelect={(ch) => {}} groups={groups} selectedGroup={selectedGroup} setGroup={setGroup} />
                </div>
              ) : (
                <ChannelGrid channels={items} currentChannel={null} onSelect={(ch) => {}} groups={groups} selectedGroup={selectedGroup} setGroup={setGroup} />
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function ChannelGrid({ channels, currentChannel, onSelect, groups, selectedGroup, setGroup }) {
  const { setCurrentChannel, favorites, toggleFavorite } = useApp();
  const [showAllGroups, setShowAllGroups] = useState(false);

  const visibleGroups = showAllGroups ? groups : groups.slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Group Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {visibleGroups.map((group, i) => (
          <button
            key={group}
            onClick={() => setGroup(group)}
            className={`group-pill px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              selectedGroup === group
                ? getGroupBg(i)
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {group}
          </button>
        ))}
        {groups.length > 20 && (
          <button
            onClick={() => setShowAllGroups(!showAllGroups)}
            className="px-3 py-1.5 text-xs font-medium rounded-full border bg-white/5 border-white/10 text-white/40 hover:text-white/70 flex items-center gap-1"
          >
            {showAllGroups ? 'Show Less' : `+${groups.length - 20} More`}
            {showAllGroups ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Channel Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">
          Showing <span className="text-white/60 font-semibold">{channels.length}</span> channels
        </p>
      </div>

      {/* Channel Grid */}
      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FiTv className="w-12 h-12 text-white/10 mb-3" />
          <p className="text-white/30 text-sm">No channels found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {channels.map((channel, i) => (
            <ChannelTile
              key={channel.id}
              channel={channel}
              onSelect={setCurrentChannel}
              isActive={currentChannel?.id === channel.id}
              isFav={favorites.includes(channel.id)}
              onFav={toggleFavorite}
              groupIndex={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#1a1a2e"/><text x="50%" y="55%" text-anchor="middle" font-size="24" fill="#06b6d4" font-family="system-ui" font-weight="bold">TV</text></svg>'
);

function ChannelTile({ channel, onSelect, isActive, isFav, onFav, groupIndex }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`channel-card group relative cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 ${
        isActive
          ? 'border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 shadow-[0_0_24px_rgba(6,182,212,0.15)]'
          : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
      }`}
    >
      {/* Gradient top bar */}
      <div className={`h-1 bg-gradient-to-r ${getGroupColor(groupIndex)}`} />
      
      <div className="p-3">
        <div className="relative mb-2">
          <img
            src={imgError || !channel.logo ? FALLBACK_LOGO : channel.logo}
            alt={channel.name}
            className="w-full aspect-square rounded-xl object-cover bg-slate-800/50 ring-1 ring-white/5"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {isActive && (
            <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center">
                <FiPlay className="w-5 h-5 text-cyan-300 ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
          {channel.type === 'link' && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[8px] text-white/60 font-medium">
              EXT
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onFav(channel.id); }}
            className={`absolute top-1 left-1 w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
              isFav ? 'bg-yellow-500/20 text-yellow-400' : 'bg-black/40 text-white/30 opacity-0 group-hover:opacity-100'
            }`}
          >
            <FiStar className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className={`text-xs font-semibold truncate ${isActive ? 'text-cyan-300' : 'text-white/80'}`}>
          {channel.name}
        </p>
        <p className="text-[10px] text-white/30 truncate mt-0.5">{channel.group}</p>
      </div>
    </div>
  );
}

export default App;
