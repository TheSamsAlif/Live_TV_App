import { useState, useMemo } from 'react';
import { useApp } from './context/AppContext';
import VideoPlayer from './components/VideoPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorScreen from './components/ErrorScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { FiTv, FiStar, FiZap } from 'react-icons/fi';

// Deterministic color per category (jatrabari-style colored accents)
const PALETTE = [
  '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
  '#db2777', '#0891b2', '#65a30d', '#e11d48', '#4f46e5',
  '#ea580c', '#0d9488', '#9333ea', '#c026d3', '#16a34a',
];
function colorFor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function abbrev(name) {
  const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'TV';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[1][0] + (words[2] ? words[2][0] : '')).toUpperCase();
}

function App() {
  const {
    channels, filteredChannels, groups, selectedGroup, setGroup,
    currentChannel, isLoading, error, loadPlaylist,
    searchQuery, showFavorites, toggleFavorites, favorites,
  } = useApp();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorScreen message={error} onRetry={loadPlaylist} />;

  // Group filtered channels into sections by category
  const sections = useMemo(() => {
    const map = new Map();
    for (const ch of filteredChannels) {
      if (!map.has(ch.group)) map.set(ch.group, []);
      map.get(ch.group).push(ch);
    }
    // Preserve the ordered groups list
    const ordered = [];
    for (const g of groups) {
      if (g === 'All') continue;
      if (map.has(g)) ordered.push([g, map.get(g)]);
    }
    return ordered;
  }, [filteredChannels, groups]);

  const totalShown = filteredChannels.length;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Player (sticky when a channel is selected) */}
      {currentChannel && currentChannel.type !== 'link' && (
        <div className="sticky top-14 z-30 bg-slate-100/80 dark:bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
            <VideoPlayer />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
          <button
            onClick={toggleFavorites}
            className={`chip flex items-center gap-1.5 ${showFavorites ? 'active' : ''}`}
          >
            <FiStar className="w-3.5 h-3.5" fill={showFavorites ? 'currentColor' : 'none'} />
            Favorites
          </button>
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`chip ${!showFavorites && selectedGroup === g ? 'active' : ''}`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          {searchQuery ? `Search: "${searchQuery}" — ` : ''}
          <span className="font-semibold text-slate-600 dark:text-slate-300">{totalShown}</span> channels
          {showFavorites ? ' in favorites' : ''}
        </p>

        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FiTv className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              {showFavorites ? 'No favorite channels yet. Tap the star on any channel.' : 'No channels found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {sections.map(([group, items], sIdx) => (
              <CategorySection key={group} group={group} items={items} index={sIdx} />
            ))}
          </div>
        )}
      </div>

      <Footer channelCount={channels.length} />
    </div>
  );
}

function CategorySection({ group, items, index }) {
  const { setCurrentChannel, currentChannel, favorites, toggleFavorite } = useApp();
  const accent = colorFor(group);
  const isQuick = group.includes('Quick Access');

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span className="section-num" style={{ background: accent }}>
          {isQuick ? <FiZap className="w-4 h-4" /> : String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{group}</h2>
        <span className="nodes-badge">{items.length} {items.length === 1 ? 'node' : 'nodes'}</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {items.map((ch) => (
          <NodeTile
            key={ch.id}
            channel={ch}
            accent={accent}
            isActive={currentChannel?.id === ch.id}
            isFav={favorites.includes(ch.id)}
            onSelect={setCurrentChannel}
            onFav={toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

function NodeTile({ channel, accent, isActive, isFav, onSelect, onFav }) {
  const [imgError, setImgError] = useState(false);
  const isLink = channel.type === 'link';

  function handleClick() {
    if (isLink) {
      window.open(channel.url, '_blank', 'noopener,noreferrer');
    } else {
      onSelect(channel);
      // Scroll to top so the player is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const showImg = channel.logo && !imgError;

  return (
    <div onClick={handleClick} className={`node-tile ${isActive ? 'active' : ''}`}>
      <button
        onClick={(e) => { e.stopPropagation(); onFav(channel.id); }}
        className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all z-10 ${
          isFav ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
        }`}
      >
        <FiStar className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
      </button>

      {isLink && (
        <span className="absolute top-1.5 left-1.5 text-[7px] font-bold px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 z-10">
          LINK
        </span>
      )}

      {showImg ? (
        <img
          src={channel.logo}
          alt={channel.name}
          className="node-code"
          style={{ background: '#0f172a' }}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="node-code" style={{ background: accent }}>
          {abbrev(channel.name)}
        </div>
      )}
      <span className="node-name">{channel.name}</span>
    </div>
  );
}

export default App;
