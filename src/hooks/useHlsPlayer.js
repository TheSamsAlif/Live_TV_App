import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

const MAX_RETRIES = 3;

export function useHlsPlayer(videoRef, url) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hlsRef = useRef(null);
  const retryRef = useRef(0);

  const destroy = useCallback(() => {
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
    destroy();

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => setIsLoading(false), { once: true });
      video.addEventListener('error', () => {
        setError('Failed to load stream');
        setIsLoading(false);
      }, { once: true });
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backbufferLength: 30 });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryRef.current < MAX_RETRIES) {
          retryRef.current++;
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setError('Stream playback error');
          setIsLoading(false);
        }
      });
    } else {
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

  return { isLoading, error, retry };
}
