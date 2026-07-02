import { useEffect, useState } from 'react';

export default function LoadingSpinner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dark-600 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-dark-400 text-sm">Loading your channels...</p>
        <p className="text-dark-500 text-xs mt-1">Developed by Sams Alif</p>
      </div>
    </div>
  );
}
