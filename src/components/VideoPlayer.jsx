import { useRef, useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize,
  FiCommand, FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi';
import { RiPictureInPictureLine, RiPictureInPictureFill } from 'react-icons/ri';

export default function VideoPlayer() {
  const { currentChannel, volume, isMuted, setVolume, setMuted } = useApp();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const { isLoading, error, retry } = useHlsPlayer(videoRef, currentChannel?.url);

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
    } catch { /* PiP not supported */ }
  }

  function handleShowControls() {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    function onPiPChange() {
      setIsPiP(!!document.pictureInPictureElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    videoRef.current?.addEventListener('enterpictureinpicture', onPiPChange);
    videoRef.current?.addEventListener('leavepictureinpicture', onPiPChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
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
    onExitFullscreen: () => { if (document.fullscreenElement) document.exitFullscreen(); },
  });

  const handleCopyUrl = useCallback(() => {
    if (currentChannel?.url) {
      navigator.clipboard.writeText(currentChannel.url).then(() => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 glass px-4 py-2 rounded-lg text-sm text-white z-50 animate-slide-up';
        toast.textContent = 'Stream URL copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      });
    }
  }, [currentChannel]);

  const handleShare = useCallback(() => {
    if (navigator.share && currentChannel) {
      navigator.share({ title: currentChannel.name, text: `Watch ${currentChannel.name} live!`, url: window.location.href }).catch(() => {});
    } else {
      handleCopyUrl();
    }
  }, [currentChannel, handleCopyUrl]);

  if (!currentChannel) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div
        ref={containerRef}
        className="player-container group"
        onMouseMove={handleShowControls}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          onClick={handleTogglePlay}
          playsInline
          preload="auto"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-dark-400 text-sm">Loading stream...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <FiAlertTriangle className="w-10 h-10 text-red-400" />
              <div>
                <p className="text-white font-medium mb-1">Playback Error</p>
                <p className="text-dark-400 text-sm">{error}</p>
              </div>
              <button onClick={retry} className="btn-primary flex items-center gap-2">
                <FiRefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
            <span className="live-badge">
              <span className="live-badge-dot" />
              LIVE
            </span>
            <span className="text-white text-sm font-medium truncate text-shadow">
              {currentChannel.name}
            </span>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-4 px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <button onClick={handleTogglePlay} className="btn-ghost text-white hover:bg-white/10">
              {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
            </button>

            <div className="relative flex items-center"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button onClick={handleToggleMute} className="btn-ghost text-white hover:bg-white/10">
                {isMuted || volume === 0 ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
              </button>
              <div className={`flex items-center transition-all duration-200 overflow-hidden ${showVolume ? 'w-24 ml-1' : 'w-0 ml-0'}`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 accent-primary-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex-1" />

            <button onClick={handleCopyUrl} className="btn-ghost text-white hover:bg-white/10" title="Copy Stream URL">
              <FiCommand className="w-4 h-4" />
            </button>

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

      <div className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentChannel.logo || FALLBACK_LOGO}
            alt={currentChannel.name}
            className="w-10 h-10 rounded-lg object-cover bg-dark-700 flex-shrink-0"
            onError={(e) => { e.target.src = FALLBACK_LOGO; }}
          />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{currentChannel.name}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-600/20 text-primary-400 border border-primary-500/20">
              {currentChannel.group}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyUrl} className="btn-ghost text-sm flex items-center gap-1.5">
            <FiCommand className="w-4 h-4" /> Copy URL
          </button>
          <button onClick={handleShare} className="btn-primary text-sm flex items-center gap-1.5">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_LOGO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23374366"/><text x="20" y="24" text-anchor="middle" fill="%2394a3b8" font-size="14" font-family="system-ui">TV</text></svg>'
);
