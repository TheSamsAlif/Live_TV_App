import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

function getSafeUrl(url, useProxy = true) {
  if (!url) return url;
  if (useProxy && /^https?:\/\//i.test(url)) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function useHlsPlayer(videoRef, url, onErrorCallback) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto

  const hlsRef = useRef(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const progressTimerRef = useRef(null);

  const destroy = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
    setLevels([]);
    setCurrentLevel(-1);
  }, [videoRef]);

  const changeQuality = useCallback((levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
  }, []);

  const load = useCallback((streamUrl, tryDirect = false) => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setError(null);
    setIsLoading(true);
    setLoadProgress(15);
    destroy();

    const targetUrl = tryDirect ? streamUrl : getSafeUrl(streamUrl, true);
    setUsingFallback(tryDirect);

    progressTimerRef.current = setInterval(() => {
      setLoadProgress((p) => Math.min(p + 10, 90));
    }, 800);

    // Native HLS (Safari/iOS)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = targetUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoadProgress(100);
        setIsLoading(false);
        clearInterval(progressTimerRef.current);
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        clearInterval(progressTimerRef.current);
        if (!tryDirect) {
          load(streamUrl, true);
        } else {
          setError('Failed to load stream');
          setIsLoading(false);
          onErrorCallback?.(streamUrl);
        }
      }, { once: true });
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backbufferLength: 30,
        maxBufferLength: 25,
        maxMaxBufferLength: 50,
        manifestLoadingTimeOut: 15000,
        levelLoadingTimeOut: 15000,
        fragLoadingTimeOut: 25000,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
        fragLoadingMaxRetry: 3,
        startLevel: -1, // Start with Auto
        capLevelToPlayerSize: true,
      });

      hlsRef.current = hls;
      hls.loadSource(targetUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        setLoadProgress(100);
        setIsLoading(false);
        clearInterval(progressTimerRef.current);
        retryRef.current = 0;

        // Parse available quality levels
        if (data && data.levels && data.levels.length > 0) {
          const parsed = [
            { id: -1, label: 'Auto (Adaptive)', height: 'Auto', bitrate: 0 },
            ...data.levels.map((lvl, idx) => ({
              id: idx,
              height: lvl.height,
              label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
              bitrate: lvl.bitrate,
            }))
          ];
          setLevels(parsed);
        } else {
          setLevels([{ id: -1, label: 'Auto', height: 'Auto', bitrate: 0 }]);
        }

        video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_evt, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (retryRef.current < MAX_RETRIES) {
            retryRef.current++;
            setLoadProgress(Math.min(95, 40 + retryRef.current * 15));
            retryTimerRef.current = setTimeout(() => {
              hls.startLoad();
            }, RETRY_DELAY);
          } else if (!tryDirect) {
            retryRef.current = 0;
            load(streamUrl, true);
          } else {
            clearInterval(progressTimerRef.current);
            setError('Stream unavailable or offline');
            setIsLoading(false);
            onErrorCallback?.(streamUrl);
          }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          clearInterval(progressTimerRef.current);
          if (!tryDirect) {
            load(streamUrl, true);
          } else {
            setError('Playback error occurred');
            setIsLoading(false);
            onErrorCallback?.(streamUrl);
          }
        }
      });
    } else {
      clearInterval(progressTimerRef.current);
      setError('HLS playback is not supported on this browser');
      setIsLoading(false);
    }
  }, [videoRef, destroy, onErrorCallback]);

  const retry = useCallback(() => {
    if (url) {
      retryRef.current = 0;
      load(url, false);
    }
  }, [url, load]);

  useEffect(() => {
    if (url) {
      retryRef.current = 0;
      load(url, false);
    }
    return destroy;
  }, [url, load, destroy]);

  return {
    isLoading,
    error,
    retry,
    loadProgress,
    usingFallback,
    levels,
    currentLevel,
    changeQuality,
  };
}
