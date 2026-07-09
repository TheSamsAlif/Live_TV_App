import { useApp } from '../context/AppContext';
import { FiSearch, FiGithub, FiMaximize, FiMinimize, FiMenu, FiX, FiTv } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';

export default function Navbar({ sidebarOpen }) {
  const { searchQuery, setSearch, toggleSidebar } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 20); }
    function handleFS() { setIsFullscreen(!!document.fullscreenElement); }
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('fullscreenchange', handleFS);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('fullscreenchange', handleFS);
    };
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="btn-ghost lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>

          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-fuchsia-500/30 transition-all duration-300 group-hover:scale-105">
              <FiTv className="text-white" size={18} />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm tracking-tight">SAMS ALIF</span>
              <span className="text-white/40 font-light text-sm"> LIVE</span>
            </div>
          </a>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn-ghost md:hidden"
            aria-label="Search"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          <a
            href="https://github.com/TheSamsAlif/Live_TV_App"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            aria-label="GitHub"
          >
            <FiGithub className="w-5 h-5" />
          </a>

          <button onClick={handleToggleFullscreen} className="btn-ghost hidden sm:flex" aria-label="Fullscreen">
            {isFullscreen ? <FiMinimize className="w-5 h-5" /> : <FiMaximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="md:hidden px-4 pb-3 animate-slide-up">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input pl-10"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}