import { useEffect, useState } from 'react';
import { FiTv } from 'react-icons/fi';

export default function LoadingSpinner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 blur-xl opacity-50 animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-float">
          <FiTv className="text-white" size={32} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <p className="text-sm text-white/50 font-semibold mt-4">Loading channels...</p>
      <p className="text-xs text-white/25 mt-1">SAMS ALIF LIVE</p>
    </div>
  );
}
