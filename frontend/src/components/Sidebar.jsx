import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Reusable Sidebar with:
 * - Desktop: collapsible (icon-only vs full)
 * - Mobile: slide-in drawer with backdrop overlay (click outside to close)
 *
 * Props:
 *   isOpen        {boolean}  - sidebar open state
 *   onToggle      {fn}       - toggle open/close
 *   menuItems     {Array}    - [{ name, path, icon }]
 *   logoLabel     {string}   - text shown next to logo
 *   logoIcon      {JSX}      - icon element for logo
 *   gradientClass {string}   - Tailwind gradient classes for sidebar bg
 *   onLogout      {fn}       - logout handler
 */
const Sidebar = ({
  isOpen,
  onToggle,
  menuItems = [],
  logoLabel = 'CampusOne',
  logoIcon,
  gradientClass = 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900',
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sidebarContent = (
    <aside
      className={`
        ${gradientClass} text-white flex flex-col shadow-2xl relative overflow-hidden h-full
        transition-all duration-300
        /* desktop: collapsible width */
        md:relative md:translate-x-0
        ${isOpen ? 'md:w-64' : 'md:w-20'}
        /* mobile: fixed full-height drawer */
        fixed top-0 left-0 z-40 w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:flex
      `}
    >
      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50 pointer-events-none" />

      {/* Logo */}
      <div className="p-6 border-b border-white/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm flex-shrink-0">
            {logoIcon || (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>
          {isOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent truncate">
              {logoLabel}
            </span>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 relative z-10 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path || item.key || index}
              onClick={() => {
                navigate(item.path);
                // Close drawer on mobile after navigation
                if (window.innerWidth < 768) onToggle();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-white/20 text-white shadow-md scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              {isOpen && <span className="font-medium truncate">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/20 relative z-10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-600/80 hover:text-white transition-all duration-200 group"
        >
          <svg className="w-6 h-6 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Desktop collapse toggle */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-indigo-600 rounded-full items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200 z-20"
        aria-label="Toggle sidebar"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );

  return (
    <>
      {/* Mobile backdrop overlay — click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      {sidebarContent}
    </>
  );
};

export default Sidebar;
