import { useState } from 'react';
import { FiStar, FiExternalLink, FiPlay, FiWifi } from 'react-icons/fi';

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="%23131326"/><text x="50%" y="55%" text-anchor="middle" font-size="16" font-weight="bold" fill="%23a855f7">8K</text></svg>'
);

const CATEGORY_COLORS = {
  Bangla: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
  Sports: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
  News: 'from-rose-500/20 to-red-500/10 text-rose-300 border-rose-500/30',
  Movies: 'from-purple-500/20 to-pink-500/10 text-purple-300 border-purple-500/30',
  Entertainment: 'from-fuchsia-500/20 to-violet-500/10 text-fuchsia-300 border-fuchsia-500/30',
  Music: 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30',
  Kids: 'from-yellow-500/20 to-lime-500/10 text-yellow-300 border-yellow-500/30',
  Documentary: 'from-sky-500/20 to-indigo-500/10 text-sky-300 border-sky-500/30',
  Religious: 'from-teal-500/20 to-emerald-500/10 text-teal-300 border-teal-500/30',
};

export default function ChannelCard({
  channel,
  onSelect,
  isActive = false,
  isFav = false,
  onFav,
}) {
  const [imgError, setImgError] = useState(false);
  const badgeClass = CATEGORY_COLORS[channel.group] || 'from-violet-500/20 to-fuchsia-500/10 text-violet-300 border-violet-500/30';

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative flex flex-col items-center p-3.5 rounded-2xl cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-2 select-none border backdrop-blur-xl ${
        isActive
          ? 'bg-gradient-to-b from-violet-600/30 via-fuchsia-600/20 to-black/80 border-cyan-400/70 shadow-[0_0_35px_rgba(6,182,212,0.35),0_0_15px_rgba(168,85,247,0.35)] scale-[1.02]'
          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] hover:border-violet-500/50 hover:shadow-[0_12px_35px_rgba(139,92,246,0.22)]'
      }`}
    >
      {/* 8K Metallic Hologram Badge */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-pink-500/20 border border-cyan-400/30 backdrop-blur-md shadow-sm">
        <span className="text-[8px] font-black tracking-wider bg-gradient-to-r from-cyan-300 via-white to-pink-300 bg-clip-text text-transparent">
          8K
        </span>
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFav?.(channel.id);
        }}
        aria-label="Add to favorites"
        className={`absolute top-2.5 left-2.5 z-10 p-1 rounded-full transition-all duration-200 ${
          isFav
            ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
            : 'text-white/20 hover:text-amber-400 opacity-0 group-hover:opacity-100'
        }`}
      >
        <FiStar size={13} fill={isFav ? 'currentColor' : 'none'} />
      </button>

      {/* Channel Logo with Neon Ring */}
      <div className="relative mt-2 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 to-black p-2 flex items-center justify-center ring-1 ring-white/10 group-hover:ring-violet-400/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300">
        <img
          src={imgError || !channel.logo ? FALLBACK_LOGO : channel.logo}
          alt={channel.name}
          className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Live Active Audio Waves Overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-0.5">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Hover Quick Play Icon */}
        {!isActive && (
          <div className="absolute inset-0 bg-violet-600/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-cyan-400/90 text-black flex items-center justify-center shadow-lg shadow-cyan-400/50">
              <FiPlay size={13} className="ml-0.5 fill-black" />
            </div>
          </div>
        )}
      </div>

      {/* Channel Title */}
      <h3 className="mt-2.5 text-xs font-semibold text-center text-white/90 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight px-1 h-8 flex items-center justify-center">
        {channel.name}
      </h3>

      {/* Category Pill & Live Ping */}
      <div className="mt-1 flex items-center gap-1.5">
        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border bg-gradient-to-r ${badgeClass}`}>
          {channel.group || 'Live'}
        </span>
        <span className="flex items-center gap-1 text-[8px] text-emerald-400/80 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          LIVE
        </span>
      </div>

      {channel.type === 'link' && (
        <span className="absolute bottom-2 right-2 text-white/20 group-hover:text-cyan-400 transition-colors">
          <FiExternalLink size={10} />
        </span>
      )}
    </div>
  );
}
