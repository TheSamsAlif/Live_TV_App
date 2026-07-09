import { useApp } from '../context/AppContext';
import { FiSearch, FiGithub, FiMaximize, FiMinimize, FiTv, FiSun, FiMoon } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';

export default function Navbar() {
  const { searchQuery, setSearch } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    function handleFS() { setIsFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', handleFS);
    return () => document.removeEventListener('fullscreenchange', handleFS);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  const toggleDark = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('samsalif_theme', next ? 'dark' : 'light'); } catch {}
    setIsDark(next);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-3 sm:px-4 h-14">
        <a href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="logo-mark">
            <span className="logo-ring" />
            <span className="logo-glow" />
            <FiTv className="logo-tv" size={18} />
            <span className="logo-live-dot" />
          </div>
          <div className="hidden sm:block leading-tight">
            <span className="block text-sm font-extrabold tracking-tight logo-text-gradient">SAMS ALIF</span>
            <span className="block text-[10px] font-bold tracking-[0.2em] text-blue-600 dark:text-cyan-400">LIVE&nbsp;TV</span>
          </div>
        </a>

        <div className="flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={toggleDark} className="btn-ghost" aria-label="Theme">
            {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
          <a href="https://github.com/TheSamsAlif/Live_TV_App" target="_blank" rel="noopener noreferrer" className="btn-ghost hidden sm:flex" aria-label="GitHub">
            <FiGithub className="w-5 h-5" />
          </a>
          <button onClick={toggleFullscreen} className="btn-ghost hidden sm:flex" aria-label="Fullscreen">
            {isFullscreen ? <FiMinimize className="w-5 h-5" /> : <FiMaximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
