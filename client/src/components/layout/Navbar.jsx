import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, ChevronDown, Bell, Search, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  // Get active board title from localStorage (saved in BoardPage.jsx)
  const [boardTitle, setBoardTitle] = useState('');
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTitle = localStorage.getItem('taskflow_current_board_title');
      if (savedTitle) setBoardTitle(savedTitle);
    };
    
    // Check initially
    handleStorageChange();

    // Check periodically or on path change
    const interval = setInterval(handleStorageChange, 1000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  // Determine breadcrumbs
  const getBreadcrumbs = () => {
    const paths = [{ label: 'Dashboard', to: '/dashboard' }];
    if (location.pathname.startsWith('/boards/')) {
      paths.push({ 
        label: boardTitle || 'Board View', 
        to: location.pathname 
      });
    }
    return paths;
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-14 bg-white border-b border-[#E8E8E8] dark:bg-[#121212] dark:border-[#222224] transition-colors"
    >
      {/* Left: Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon lg:hidden p-1.5 rounded-lg text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-neutral-400">
          {getBreadcrumbs().map((path, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-neutral-300">/</span>}
              <span
                onClick={() => navigate(path.to)}
                className={`cursor-pointer hover:text-black dark:hover:text-white transition-colors ${
                  idx === getBreadcrumbs().length - 1 ? 'text-black dark:text-white font-semibold' : ''
                }`}
              >
                {path.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Search input matching Apple/Linear design */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-[#F5F5F5] dark:bg-neutral-900 border border-[#E8E8E8] dark:border-neutral-800 rounded-lg text-xs outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <X size={12} />
            </button>
          ) : (
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[10px] text-neutral-400 font-mono">
              ⌘K
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon */}
        <button className="relative p-1.5 rounded-lg text-[#666666] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-[#666666] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150"
            aria-label="User menu"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold shadow-xs">
              {initials}
            </div>
            <ChevronDown size={12} className={`text-[#666666] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Card */}
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden animate-scale-in bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 shadow-xl z-50"
            >
              {/* User details */}
              <div className="px-4 py-3 border-b border-[#E8E8E8] dark:border-neutral-800">
                <p className="text-xs font-semibold text-black dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">{user?.email}</p>
              </div>

              {/* Actions */}
              <div className="p-1 flex flex-col gap-0.5">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-600 hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-all text-left"
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <div className="my-1 border-t border-[#E8E8E8] dark:border-neutral-800" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
