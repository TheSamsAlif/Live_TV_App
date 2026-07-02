import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    function handleKey(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handlers.onTogglePlay?.();
          break;
        case 'm':
          handlers.onToggleMute?.();
          break;
        case 'f':
          handlers.onToggleFullscreen?.();
          break;
        case 'arrowup':
          e.preventDefault();
          handlers.onVolumeUp?.();
          break;
        case 'arrowdown':
          e.preventDefault();
          handlers.onVolumeDown?.();
          break;
        case 'escape':
          handlers.onExitFullscreen?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handlers]);
}
