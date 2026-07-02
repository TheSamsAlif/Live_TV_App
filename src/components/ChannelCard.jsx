import { useApp } from '../context/AppContext';
import { FiStar } from 'react-icons/fi';
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
      className={`channel-card group ${isActive ? 'active' : ''}`}
      data-channel-id={channel.id}
    >
      <div className="relative flex-shrink-0">
        <img
          src={imgError || !channel.logo ? FALLBACK_LOGO : channel.logo}
          alt={channel.name}
          className="w-10 h-10 rounded-lg object-cover bg-dark-700"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {isActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-live-pulse border-2 border-dark-900" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-400' : 'text-dark-200'}`}>
          {channel.name}
        </p>
        <p className="text-xs text-dark-500 truncate mt-0.5">{channel.group}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {isActive && (
          <span className="live-badge text-[10px]">
            <span className="live-badge-dot" />
            LIVE
          </span>
        )}
        <button
          onClick={handleFav}
          className={`p-1 rounded transition-colors ${
            isFav ? 'text-yellow-400' : 'text-dark-500 hover:text-yellow-400'
          }`}
        >
          <FiStar className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
