import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <FiAlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Connection Error</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{message || 'Failed to load channels. Please try again.'}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <FiRefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
}
