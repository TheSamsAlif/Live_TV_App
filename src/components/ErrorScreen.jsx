import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-500/20 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <FiAlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
        <p className="text-white/40 text-sm">{message || 'Failed to load channels. Please try again.'}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/25">
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
