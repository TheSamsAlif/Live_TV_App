import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <FiAlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-dark-400 text-sm">{message || 'Failed to load the playlist. Please try again.'}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary flex items-center gap-2">
          <FiRefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
