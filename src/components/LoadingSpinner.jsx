import { useEffect, useState } from 'react';
import { FiTv } from 'react-icons/fi';

export default function LoadingSpinner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);
  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg animate-float mb-5">
        <FiTv className="text-white" size={28} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-4">Loading channels...</p>
      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">SAMS ALIF LIVE TV</p>
    </div>
  );
}
