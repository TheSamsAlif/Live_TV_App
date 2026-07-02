import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorScreen from './components/ErrorScreen';
import Footer from './components/Footer';
import { FiMonitor, FiArrowRight } from 'react-icons/fi';

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/20 mb-6">
        <FiMonitor className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">SamsAlif Live TV</h1>
      <p className="text-dark-400 max-w-md mb-8 leading-relaxed">
        Select a channel from the sidebar to start watching live TV.
        Browse categories, search for your favorite channels, and save them for quick access.
      </p>
      <div className="flex items-center gap-2 text-dark-500 text-sm">
        <span>Select a channel</span>
        <FiArrowRight className="w-4 h-4 animate-pulse" />
      </div>
      <div className="mt-12 p-4 glass rounded-xl max-w-sm">
        <h3 className="text-white text-sm font-medium mb-1">About</h3>
        <p className="text-dark-400 text-xs leading-relaxed">
          Developed and maintained by Sams Alif. This application provides live TV streaming
          from various sources around the world. All streams are sourced from publicly available playlists.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { isLoading, error, currentChannel, loadPlaylist, sidebarOpen, toggleSidebar } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        <aside
          className={`fixed lg:relative z-30 h-[calc(100vh-3.5rem)] top-14 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'left-0' : '-left-80'
          } w-72 lg:w-72 lg:left-0 flex-shrink-0`}
        >
          <Sidebar />
        </aside>

        <main className="flex-1 min-w-0 px-4 py-4 lg:py-6 lg:px-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorScreen message={error} onRetry={loadPlaylist} />
            ) : currentChannel ? (
              <VideoPlayer />
            ) : (
              <WelcomeScreen />
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
