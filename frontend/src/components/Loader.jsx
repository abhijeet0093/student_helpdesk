import { useEffect, useState } from 'react';

/**
 * Loader with a Render cold-start notice.
 * After 4 s of waiting, shows a friendly "server is waking up" message.
 */
const Loader = ({ message = 'Loading...' }) => {
  const [showColdStartNotice, setShowColdStartNotice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowColdStartNotice(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-[200px] gap-4 px-4 text-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">{message}</p>

      {showColdStartNotice && (
        <div className="mt-2 max-w-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
          <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
            <span>☕</span>
            Server is waking up — this may take up to 30 seconds on first load.
          </p>
        </div>
      )}
    </div>
  );
};

export default Loader;
