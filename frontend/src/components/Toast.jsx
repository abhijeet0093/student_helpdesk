import { useEffect, useState } from 'react';

/**
 * Toast notification component.
 * Usage:
 *   const [toast, setToast] = useState(null);
 *   setToast({ type: 'success', message: 'Done!' });
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 *
 * type: 'success' | 'error' | 'warning' | 'info'
 * Auto-hides after 4 seconds.
 */

const STYLES = {
  success: { bar: 'bg-green-500',  icon: '✅', bg: 'bg-green-50 border-green-200 text-green-800' },
  error:   { bar: 'bg-red-500',    icon: '❌', bg: 'bg-red-50 border-red-200 text-red-800' },
  warning: { bar: 'bg-yellow-400', icon: '⚠️', bg: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  info:    { bar: 'bg-blue-500',   icon: 'ℹ️', bg: 'bg-blue-50 border-blue-200 text-blue-800' },
};

const Toast = ({ toast, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for fade-out
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const style = STYLES[toast.type] || STYLES.info;

  return (
    <div className={`fixed top-5 right-5 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${style.bg}`}>
        <span className="text-lg flex-shrink-0">{style.icon}</span>
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">✕</button>
      </div>
      <div className={`h-1 rounded-full mt-1 ${style.bar} animate-shrink`} />
    </div>
  );
};

export default Toast;
