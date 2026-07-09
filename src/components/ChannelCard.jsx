import { useApp } from '../context/AppContext';
import { FiStar, FiExternalLink } from 'react-icons/fi';
import { useState } from 'react';

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23374366"/><text x="20" y="24" text-anchor="middle" fill="%2394a3b8" font-size="14" font-family="system-ui">TV</text></svg>'
);

export default function ChannelCard({ channel, onSelect }) {
  const { currentChannel, favorites, toggleFavorite } = useApp();
  const [imgError, setImgError] = useState(false);
  const isActive = currentChannel?.id === channel.id;
  const isFav = favorites.includes(channel.id);

  function handleClick() {
    onSelect?.(channel);
  }

  function handleFav(e) {
    e.stopPropagation();
    toggleFavorite(channel.id);
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
        isActive
          ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.12)]'
          : 'border-transparent hover:bg-white/[0.05] hover:border-white/10'
      }`}
      data-channel-id={channel.id}
    >
      <div className="relative flex-shrink-0">
        <img
          src={imgError || !channel.logo ? FALLBACK_LOGO : channel.logo}
          alt={channel.name}
          className="w-10 h-10 rounded-xl object-cover bg-slate-800 ring-1 ring-white/10"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {isActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-[#0a0a14] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-violet-300' : 'text-white/80'}`}>
          {channel.name}
        </p>
        <p className="text-[10px] text-white/40 truncate mt-0.5">{channel.group}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {channel.type === 'link' && (
          <FiExternalLink className="w-3 h-3 text-violet-400/60" />
        )}
        <button
          onClick={handleFav}
          className={`p-1 rounded transition-colors ${
            isFav ? 'text-yellow-400' : 'text-white/30 hover:text-yellow-400'
          }`}
        >
          <FiStar className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
