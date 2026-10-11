import { useRef, useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize,
  FiAlertTriangle, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiMinimize2, FiX, FiShare2, FiCheck, FiSliders, FiWifi
} from 'react-icons/fi';
import { RiPictureInPictureLine, RiPictureInPictureFill } from 'react-icons/ri';

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="%23131326"/><text x="50%" y="55%" text-anchor="middle" font-size="16" font-weight="bold" fill="%23a855f7">8K</text></svg>'
);

export default function VideoPlayer({ isMini = false, onClose, onToggleMini }) {
  const {
    currentChannel,
    volume,
    isMuted,
    setVolume,
    setMuted,
    markChannelOffline,
    playNextChannel,
    playPrevChannel,
  } = useApp();

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // When error happens, auto-flag offline
  const handlePlaybackError = useCallback((streamUrl) => {
    if (currentChannel?.id) {
      console.warn(`Stream failed for channel: ${currentChannel.name}`);
      markChannelOffline(currentChannel.id);
    }
  }, [currentChannel, markChannelOffline]);

  const {
    isLoading,
    error,
    retry,
    loadProgress,
    usingFallback,
    levels,
    currentLevel,
    changeQuality,
  } = useHlsPlayer(
    videoRef,
    currentChannel?.url,
    handlePlaybackError
  );

  function handleTogglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function handleToggleMute() {
    setMuted(!isMuted);
  }

  function handleVolumeChange(e) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setMuted(true);
    else if (isMuted) setMuted(false);
  }

  function handleToggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }

  async function handleTogglePiP() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      /* PiP unsupported */
    }
  }

  function handleShowControls() {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
      setShowQualityMenu(false);
    }, 4000);
  }

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    function onPiPChange() {
      setIsPiP(!!document.pictureInPictureElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    const v = videoRef.current;
    v?.addEventListener('enterpictureinpicture', onPiPChange);
    v?.addEventListener('leavepictureinpicture', onPiPChange);
    v?.addEventListener('play', () => setIsPlaying(true));
    v?.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      v?.removeEventListener('enterpictureinpicture', onPiPChange);
      v?.removeEventListener('leavepictureinpicture', onPiPChange);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useKeyboardShortcuts({
    onTogglePlay: handleTogglePlay,
    onToggleMute: handleToggleMute,
    onToggleFullscreen: handleToggleFullscreen,
    onVolumeUp: () => setVolume(Math.min(1, volume + 0.1)),
    onVolumeDown: () => setVolume(Math.max(0, volume - 0.1)),
    onExitFullscreen: () => {
      if (document.fullscreenElement) document.exitFullscreen();
    },
  });

  const handleCopyUrl = useCallback(() => {
    if (currentChannel?.url) {
      navigator.clipboard.writeText(currentChannel.url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [currentChannel]);

  if (!currentChannel) return null;

  // Active quality label
  const activeLevelObj = levels.find((l) => l.id === currentLevel);
  const activeQualityText = activeLevelObj ? activeLevelObj.label : 'Auto';

  // Mini Floating Player Mode
  if (isMini) {
    return (
      <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.4)] group">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onClick={handleTogglePlay}
          playsInline
          preload="auto"
        />

        {/* Mini Player Overlay Header */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="truncate max-w-[100px]">{currentChannel.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMini}
              className="p-1 rounded-md bg-black/80 hover:bg-white/20 text-white transition-colors"
              title="Expand Player"
            >
              <FiMaximize size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md bg-black/80 hover:bg-red-500/80 text-white transition-colors"
              title="Close Player"
            >
              <FiX size={12} />
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Channel Prev / Next Bar on Hover */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 text-white">
          <button onClick={playPrevChannel} className="p-1 hover:text-cyan-400" title="Previous Channel">
            <FiChevronLeft size={14} />
          </button>
          <button onClick={handleTogglePlay} className="p-1 hover:text-cyan-400">
            {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
          </button>
          <button onClick={playNextChannel} className="p-1 hover:text-cyan-400" title="Next Channel">
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Full Cinema / Theater Modal Mode
  return (
    <div className="flex flex-col w-full h-full rounded-3xl overflow-hidden bg-[#070712] border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.25)] animate-fade-in">
      {/* 8K Top Bar Controls */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900/90 via-violet-950/40 to-slate-900/90 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-slate-800 p-1 flex items-center justify-center ring-1 ring-white/10">
            <img
              src={currentChannel.logo || FALLBACK_LOGO}
              alt={currentChannel.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = FALLBACK_LOGO; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
                {currentChannel.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/30">
                {currentChannel.quality || '8K ULTRA HD'}
              </span>
            </div>
            <p className="text-[10px] text-white/40 flex items-center gap-1.5 mt-0.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CATEGORY: {currentChannel.group}</span>
              {usingFallback && <span className="text-amber-400/80">• DIRECT MODE</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Previous Channel */}
          <button
            onClick={playPrevChannel}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-all border border-white/5"
            title="Previous Channel (Left Arrow)"
          >
            <FiChevronLeft size={14} />
            <span>Prev</span>
          </button>

          {/* Next Channel */}
          <button
            onClick={playNextChannel}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-all border border-white/5"
            title="Next Channel (Right Arrow)"
          >
            <span>Next</span>
            <FiChevronRight size={14} />
          </button>

          {/* Minimize to Floating Dock */}
          {onToggleMini && (
            <button
              onClick={onToggleMini}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-cyan-300 transition-all border border-white/5"
              title="Minimize to Floating Mini-Player (Keep browsing channels!)"
            >
              <FiMinimize2 size={16} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            title="Fullscreen"
          >
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all border border-white/5"
              title="Close Stream (Keep exact scroll position)"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden group select-none"
        onMouseMove={handleShowControls}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain max-h-[75vh]"
          onClick={handleTogglePlay}
          playsInline
          preload="auto"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-cyan-300 font-mono">{loadProgress}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-xs tracking-wider uppercase">Connecting 8K Stream</p>
                <p className="text-white/40 text-[10px] mt-0.5">Optimizing buffer & quality...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-20 p-6">
            <div className="max-w-md text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                <FiAlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Stream Unavailable</h3>
              <p className="text-xs text-red-300/80 mb-2 font-mono">{error}</p>
              <p className="text-xs text-white/40 mb-6 leading-relaxed">
                This channel source may be temporarily offline or restricted by CDN.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={playNextChannel}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <span>Play Next Channel</span>
                  <FiChevronRight size={14} />
                </button>
                <button
                  onClick={retry}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/10 transition-all flex items-center gap-1.5"
                >
                  <FiRefreshCw size={13} />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Play/Pause Center Button on Idle */}
        {!isLoading && !error && !isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer"
            onClick={handleTogglePlay}
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/30 via-violet-600/30 to-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-110 transition-transform">
              <FiPlay className="w-8 h-8 text-white ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Hover Ambient Controls Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-16 pb-4 px-5 transition-opacity duration-300 z-10 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                onClick={handleTogglePlay}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shadow-md"
              >
                {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} className="fill-white" />}
              </button>

              {/* Prev / Next Mobile */}
              <button onClick={playPrevChannel} className="p-2 text-white/60 hover:text-white transition-colors" title="Previous Channel">
                <FiChevronLeft size={20} />
              </button>
              <button onClick={playNextChannel} className="p-2 text-white/60 hover:text-white transition-colors" title="Next Channel">
                <FiChevronRight size={20} />
              </button>

              {/* Volume */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <button onClick={handleToggleMute} className="p-2 text-white/70 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                </button>
                <div className={`flex items-center transition-all duration-200 overflow-hidden ${showVolume ? 'w-24 ml-1' : 'w-0'}`}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 accent-cyan-400 cursor-pointer bg-white/20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Right Controls: Quality Selector & Actions */}
            <div className="flex items-center gap-2">
              {/* Playback Quality Selector (Auto, 1080p, 720p, 480p, 360p) */}
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30 transition-all shadow-sm"
                  title="Playback Quality / Resolution Selector"
                >
                  <FiSliders size={13} />
                  <span>{activeQualityText}</span>
                </button>

                {/* Quality Dropdown Menu */}
                {showQualityMenu && (
                  <div className="absolute bottom-11 right-0 w-48 rounded-2xl bg-[#0e0e1e]/95 backdrop-blur-2xl border border-cyan-400/30 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-slide-up">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 mb-1 flex items-center justify-between">
                      <span>Quality / Resolution</span>
                      <FiWifi size={11} className="text-cyan-400" />
                    </div>

                    {levels.length > 0 ? (
                      levels.map((lvl) => {
                        const isSelected = lvl.id === currentLevel;
                        return (
                          <button
                            key={lvl.id}
                            onClick={() => {
                              changeQuality(lvl.id);
                              setShowQualityMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span>{lvl.label}</span>
                            {isSelected && <FiCheck size={13} className="text-cyan-400" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-xs text-white/50">
                        Auto (Direct Stream)
                      </div>
                    )}

                    <div className="mt-1 pt-1.5 border-t border-white/5 px-2 text-[9px] text-white/30 text-center">
                      Select lower resolution for slow internet
                    </div>
                  </div>
                )}
              </div>

              {/* Share / Copy URL */}
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all border border-white/5 flex items-center gap-1.5"
                title="Copy Stream URL"
              >
                {copied ? <FiCheck size={12} className="text-emerald-400" /> : <FiShare2 size={12} />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
              </button>

              {/* PiP */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={handleTogglePiP}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title="Picture in Picture"
                >
                  {isPiP ? <RiPictureInPictureFill size={18} /> : <RiPictureInPictureLine size={18} />}
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={handleToggleFullscreen}
                className="p-2 text-white/60 hover:text-white transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
