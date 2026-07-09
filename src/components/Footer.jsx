import { FiGithub, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-dark-500 text-xs">
            <span>Developed by</span>
              <a
                href="https://github.com/TheSamsAlif/Live_TV_App"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:text-fuchsia-300 transition-colors font-medium"
              >
                SAMS-ALIF.LIVE
              </a>
            <span className="mx-1">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/TheSamsAlif/Live_TV_App"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-dark-500 hover:text-dark-300 transition-colors text-xs"
            >
              <FiGithub className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span className="flex items-center gap-1 text-dark-600 text-xs">
                Made with <FiHeart className="w-3 h-3 text-fuchsia-400" /> by SAMS-ALIF.LIVE
            </span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-[10px] text-dark-600">
              SAMS-ALIF.LIVE &mdash; Developed and maintained by SAMS-ALIF.LIVE.
          </p>
        </div>
      </div>
    </footer>
  );
}
