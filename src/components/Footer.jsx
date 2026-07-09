import { FiGithub, FiHeart } from 'react-icons/fi';

export default function Footer({ channelCount }) {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
            <span>© {new Date().getFullYear()}</span>
            <a href="https://github.com/TheSamsAlif/Live_TV_App" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 font-semibold">SAMS ALIF LIVE TV</a>
            <span>· {channelCount} channels</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/TheSamsAlif/Live_TV_App" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs">
              <FiGithub className="w-3.5 h-3.5" /> GitHub
            </a>
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
              Made with <FiHeart className="w-3 h-3 text-red-500" /> in Bangladesh
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-300 dark:text-slate-600">
          All streams from public sources. For educational purposes only.
        </p>
      </div>
    </footer>
  );
}
