import { useRef, useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize,
  FiAlertTriangle, FiRefreshCw, FiArrowLeft, FiX
} from 'react-icons/fi';
import { RiPictureInPictureLine, RiPictureInPictureFill } from 'react-icons/ri';

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#1e293b"/><text x="20" y="24" text-anchor="middle" fill="#3b82f6" font-size="14" font-family="system-ui" font-weight="bold">TV</text></svg>'
);

export default function VideoPlayer() {
  const { currentChannel, volume, isMuted, setVolume, setMuted, setCurrentChannel } = useApp();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const { isLoading, error, retry, loadProgress } = useHlsPlayer(videoRef, currentChannel?.url, currentChannel);

  function handleTogglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play().catch(() => {}); setIsPlaying(true); }
    else { video.pause(); setIsPlaying(false); }
  }

  function handleVolumeChange(e) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setMuted(true);
    else if (isMuted) setMuted(false);
  }

  function handleToggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else containerRef.current.requestFullscreen().catch(() => {});
  }

  async function handleTogglePiP() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch { /* PiP not supported */ }
  }

  function handleShowControls() {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }

  const handleBack = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setCurrentChannel(null);
  }, [setCurrentChannel]);

  useEffect(() => {
    function onFullscreenChange() { setIsFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    const v = videoRef.current;
    const onPiP = () => setIsPiP(!!document.pictureInPictureElement);
    v?.addEventListener('enterpictureinpicture', onPiP);
    v?.addEventListener('leavepictureinpicture', onPiP);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      v?.removeEventListener('enterpictureinpicture', onPiP);
      v?.removeEventListener('leavepictureinpicture', onPiP);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useKeyboardShortcuts({
    onTogglePlay: handleTogglePlay,
    onToggleMute: () => setMuted(!isMuted),
    onToggleFullscreen: handleToggleFullscreen,
    onVolumeUp: () => setVolume(Math.min(1, volume + 0.1)),
    onVolumeDown: () => setVolume(Math.max(0, volume - 0.1)),
    onExitFullscreen: () => { if (document.fullscreenElement) document.exitFullscreen(); else handleBack(); },
  });

  if (!currentChannel) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-3 animate-fade-in">
      <div
        ref={containerRef}
        className="player-container group lg:flex-1 lg:max-w-4xl"
        onMouseMove={handleShowControls}
        onMouseLeave={() => setShowControls(false)}
      >
        <video ref={videoRef} className="w-full h-full object-contain bg-black" onClick={handleTogglePlay} playsInline preload="auto" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
              <p className="text-white/60 text-xs tracking-wider uppercase">
                {loadProgress < 30 ? 'Connecting...' : loadProgress < 70 ? 'Buffering...' : 'Starting...'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-10">
            <div className="flex flex-col items-center gap-4 text-center px-6 max-w-md">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <FiAlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Stream Unavailable</p>
                <p className="text-white/40 text-xs mb-3 font-mono truncate max-w-full">{currentChannel.name}</p>
                <p className="text-red-300/70 text-sm">This source may be offline or geo-restricted.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={retry} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-medium">
                  <FiRefreshCw className="w-4 h-4" /> Retry
                </button>
                <button onClick={handleBack} className="px-4 py-2.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all text-sm">Back</button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 cursor-pointer" onClick={handleTogglePlay}>
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all">
              <FiPlay className="w-7 h-7 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Top bar with working Back button */}
        <div className={`absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all text-sm">
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="live-badge"><span className="live-badge-dot" /> LIVE</span>
            <span className="text-white text-sm font-medium truncate text-shadow">{currentChannel.name}</span>
          </div>
        </div>

        {/* Bottom controls */}
        <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-3 px-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-2">
            <button onClick={handleTogglePlay} className="btn-ghost text-white hover:bg-white/10">
              {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
            </button>
            <div className="relative flex items-center" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
              <button onClick={() => setMuted(!isMuted)} className="btn-ghost text-white hover:bg-white/10">
                {isMuted || volume === 0 ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
              </button>
              <div className={`flex items-center transition-all duration-200 overflow-hidden ${showVolume ? 'w-20 ml-1' : 'w-0'}`}>
                <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-full h-1 accent-blue-500 cursor-pointer" />
              </div>
            </div>
            <div className="flex-1" />
            {document.pictureInPictureEnabled && (
              <button onClick={handleTogglePiP} className="btn-ghost text-white hover:bg-white/10" title="Picture in Picture">
                {isPiP ? <RiPictureInPictureFill className="w-4 h-4" /> : <RiPictureInPictureLine className="w-4 h-4" />}
              </button>
            )}
            <button onClick={handleToggleFullscreen} className="btn-ghost text-white hover:bg-white/10" title="Fullscreen">
              {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Info card beside player on desktop */}
      <div className="card p-4 flex lg:flex-col items-center lg:items-start justify-between gap-3 lg:w-64 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img src={currentChannel.logo || FALLBACK_LOGO} alt={currentChannel.name}
            className="w-11 h-11 rounded-lg object-cover bg-slate-800 flex-shrink-0"
            onError={(e) => { e.target.src = FALLBACK_LOGO; }} />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{currentChannel.name}</h2>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
              {currentChannel.group}
            </span>
          </div>
        </div>
        <button onClick={handleBack} className="btn-primary text-sm flex-shrink-0 lg:w-full justify-center">
          <FiX className="w-4 h-4" /> Close Player
        </button>
      </div>
    </div>
  );
}
