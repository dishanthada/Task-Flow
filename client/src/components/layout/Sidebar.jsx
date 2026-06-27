import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Sun, Moon, LogOut,
  X, Sparkles, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'My Boards', Icon: LayoutDashboard },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col w-64
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: '#18181b',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}
          >
            <CheckSquare size={18} color="white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base leading-none tracking-tight">TaskFlow</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Smart Task Manager</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          <p
            className="text-xs font-semibold px-3 mb-2 mt-2 uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Navigation
          </p>

          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive ? 'nav-item-active' : 'nav-item-inactive'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* AI badge */}
          <div
            className="mt-4 mx-1 p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))',
              border: '1px solid rgba(99,102,241,0.18)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} style={{ color: '#818cf8' }} />
              <span className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>AI Powered</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.32)' }}>
              Smart effort estimation with Gemini AI.
            </p>
          </div>
        </nav>

        {/* Bottom: Theme + User */}
        <div
          className="p-3 flex flex-col gap-1 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="sidebar-btn flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User Row */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-tight">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-colors flex-shrink-0 logout-btn"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Scoped styles to avoid Tailwind dynamic class issues */}
      <style>{`
        .nav-item-active {
          background: linear-gradient(135deg, rgba(99,102,241,0.28), rgba(79,70,229,0.18));
          color: white;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .nav-item-inactive {
          color: rgba(255,255,255,0.5);
        }
        .nav-item-inactive:hover {
          background: rgba(255,255,255,0.07);
          color: white;
        }
        .sidebar-btn {
          color: rgba(255,255,255,0.5);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sidebar-btn:hover {
          background: rgba(255,255,255,0.07);
          color: white;
        }
        .logout-btn {
          color: rgba(255,255,255,0.38);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.15);
          color: #f87171;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
