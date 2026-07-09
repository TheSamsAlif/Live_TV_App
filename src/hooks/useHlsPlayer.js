import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

function getSafeUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function useHlsPlayer(videoRef, url) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
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
  }, [videoRef]);

  const load = useCallback((streamUrl) => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);
    setLoadProgress(0);
    destroy();

    const safeUrl = getSafeUrl(streamUrl);

    progressTimerRef.current = setInterval(() => {
      setLoadProgress((p) => Math.min(p + 5, 90));
    }, 1000);

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = safeUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoadProgress(100);
        setIsLoading(false);
        clearInterval(progressTimerRef.current);
      }, { once: true });
      video.addEventListener('error', () => {
        clearInterval(progressTimerRef.current);
        setError('Failed to load stream');
        setIsLoading(false);
      }, { once: true });
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backbufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        manifestLoadingTimeOut: 30000,
        levelLoadingTimeOut: 30000,
        fragLoadingTimeOut: 60000,
        manifestLoadingMaxRetry: 5,
        levelLoadingMaxRetry: 5,
        fragLoadingMaxRetry: 5,
        startLevel: 0,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;
      hls.loadSource(safeUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoadProgress(100);
        setIsLoading(false);
        clearInterval(progressTimerRef.current);
        retryRef.current = 0;
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryRef.current < MAX_RETRIES) {
          retryRef.current++;
          setLoadProgress(Math.min(95, 50 + retryRef.current * 10));
          retryTimerRef.current = setTimeout(() => {
            hls.startLoad();
          }, RETRY_DELAY);
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          clearInterval(progressTimerRef.current);
          setError('Stream playback error');
          setIsLoading(false);
        }
      });
    } else {
      clearInterval(progressTimerRef.current);
      setError('HLS playback is not supported in this browser');
      setIsLoading(false);
    }
  }, [videoRef, destroy]);

  const retry = useCallback(() => {
    if (url) {
      retryRef.current = 0;
      load(url);
    }
  }, [url, load]);

  useEffect(() => {
    if (url) {
      retryRef.current = 0;
      load(url);
    }
    return destroy;
  }, [url, load, destroy]);

  return { isLoading, error, retry, loadProgress };
}
