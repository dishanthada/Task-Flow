import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Sun, Moon, LogOut,
  Sparkles, ChevronLeft, ChevronRight, Folder, Tag,
  Users, Settings, Calendar, BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Local state for collapse, persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('taskflow_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('taskflow_sidebar_collapsed', String(newState));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const mainNavItems = [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/dashboard?tab=boards', label: 'My Boards', Icon: Folder },
    { to: '/dashboard?tab=calendar', label: 'Calendar', Icon: Calendar },
    { to: '/dashboard?tab=analytics', label: 'Analytics', Icon: BarChart2 },
  ];

  const managementNavItems = [
    { to: '/dashboard?tab=team', label: 'Members', Icon: Users },
    { to: '/dashboard?tab=settings', label: 'Settings', Icon: Settings },
  ];

  // Helper to determine if item is active
  const isItemActive = (to) => {
    const currentPath = location.pathname + location.search;
    if (to === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/dashboard/';
    }
    return currentPath === to;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          p-4
        `}
        style={{
          backgroundColor: 'var(--bg-sidebar)',
        }}
      >
        <div className="flex flex-col h-full bg-[#121214] rounded-2xl border border-white/5 relative overflow-hidden">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white flex-shrink-0">
              <CheckSquare size={16} className="text-black" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <h1 className="text-white font-bold text-sm tracking-tight leading-none">TaskFlow</h1>
                <p className="text-[10px] mt-0.5 text-white/40">Smart Task Manager</p>
              </motion.div>
            )}
          </div>

          {/* Navigation Section */}
          <div className="flex-1 px-2.5 py-4 flex flex-col gap-6 overflow-y-auto">
            {/* Main Nav */}
            <div>
              {!isCollapsed && (
                <p className="text-[10px] font-semibold px-3 mb-2 text-white/30 uppercase tracking-wider">
                  Main
                </p>
              )}
              <div className="flex flex-col gap-1">
                {mainNavItems.map(({ to, label, Icon }) => {
                  const active = isItemActive(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                        ${active 
                          ? 'bg-white text-black font-semibold shadow-sm' 
                          : 'text-white/50 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={16} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="truncate"
                        >
                          {label}
                        </motion.span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant Powered Section */}
            <div>
              {!isCollapsed && (
                <p className="text-[10px] font-semibold px-3 mb-2 text-white/30 uppercase tracking-wider">
                  AI Powered
                </p>
              )}
              <NavLink
                to="/dashboard?tab=ai"
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                  ${isItemActive('/dashboard?tab=ai')
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Sparkles size={16} className={isItemActive('/dashboard?tab=ai') ? 'text-black' : 'text-[#A855F7] animate-pulse'} />
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-between min-w-0"
                  >
                    <span>AI Assistant</span>
                    <span className="bg-white/10 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">New</span>
                  </motion.div>
                )}
              </NavLink>
            </div>

            {/* Management Section */}
            <div>
              {!isCollapsed && (
                <p className="text-[10px] font-semibold px-3 mb-2 text-white/30 uppercase tracking-wider">
                  Management
                </p>
              )}
              <div className="flex flex-col gap-1">
                {managementNavItems.map(({ to, label, Icon }) => {
                  const active = isItemActive(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                        ${active 
                          ? 'bg-white text-black font-semibold shadow-sm' 
                          : 'text-white/50 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={16} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="truncate"
                        >
                          {label}
                        </motion.span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="p-3 border-t border-white/5 flex flex-col gap-2 flex-shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all w-full text-left"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {!isCollapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>

            {/* User Profile Info Card */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white text-black text-xs font-bold flex-shrink-0 shadow-sm">
                {initials}
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-white text-xs font-semibold truncate leading-none">{user?.name}</p>
                  <p className="text-[10px] text-white/40 truncate mt-1">{user?.email}</p>
                </motion.div>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors flex-shrink-0"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>

            {/* Collapse Sidebar Button */}
            <button
              onClick={handleToggleCollapse}
              className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white transition-all w-full text-left"
            >
              {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              {!isCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
