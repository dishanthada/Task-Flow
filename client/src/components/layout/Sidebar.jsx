import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layout, Calendar, BarChart2,
  Sparkles, Users, Settings, LogOut, Sun, Moon,
  CheckSquare, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Nav structure ─────────────────────────────────────────────── */
const NAV_CATEGORIES = [
  {
    key: 'workspace',
    label: 'WORKSPACE',
    items: [
      { to: '/dashboard',                label: 'Dashboard',  Icon: LayoutDashboard },
      { to: '/dashboard?tab=boards',     label: 'Boards',     Icon: Layout          },
      { to: '/dashboard?tab=calendar',   label: 'Calendar',   Icon: Calendar        },
      { to: '/dashboard?tab=analytics',  label: 'Analytics',  Icon: BarChart2       },
    ],
  },
  {
    key: 'ai',
    label: 'AI',
    items: [
      { to: '/dashboard?tab=analytics', label: 'AI Assistant', Icon: Sparkles, badge: 'New' },
    ],
  },
  {
    key: 'management',
    label: 'MANAGEMENT',
    items: [
      { to: '/dashboard?tab=team',      label: 'Members',  Icon: Users    },
      { to: '/dashboard?tab=settings',  label: 'Settings', Icon: Settings },
    ],
  },
];

/* ─── Nav Item ──────────────────────────────────────────────────── */
const NavItem = ({ to, label, Icon, badge, active, collapsed, onClose }) => {
  const [hovered, setHovered] = useState(false);

  const bg = active
    ? '#FFFFFF'
    : hovered
      ? 'rgba(255,255,255,0.07)'
      : 'transparent';

  const fg = active
    ? '#000000'
    : hovered
      ? '#FFFFFF'
      : 'rgba(255,255,255,0.5)';

  return (
    <NavLink
      to={to}
      onClick={onClose}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10,
        background: bg,
        color: fg,
        fontWeight: active ? 600 : 450,
        fontSize: 13,
        textDecoration: 'none',
        transition: 'background 0.15s ease, color 0.15s ease',
        letterSpacing: '-0.01em',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Icon
        size={15}
        strokeWidth={active ? 2.5 : 1.75}
        style={{ flexShrink: 0, transition: 'stroke-width 0.15s ease' }}
      />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!collapsed && badge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 9, fontWeight: 700,
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: '0.06em',
              flexShrink: 0,
            }}
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};

/* ─── Main Sidebar ──────────────────────────────────────────────── */
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('taskflow_sidebar_collapsed') === 'true'
  );
  const [logoutHover, setLogoutHover] = useState(false);
  const [themeHover, setThemeHover] = useState(false);
  const [collapseHover, setCollapseHover] = useState(false);

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('taskflow_sidebar_collapsed', String(next));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const isItemActive = (to) => {
    const current = location.pathname + location.search;
    if (to === '/dashboard') return current === '/dashboard' || current === '/dashboard/';
    return current === to;
  };

  const sidebarW = isCollapsed ? 72 : 240;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 30,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        animate={{ width: sidebarW, minWidth: sidebarW }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: '#090909',
          height: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 40,
          position: 'relative',
        }}
        className={[
          'fixed top-0 left-0 h-full',
          'lg:relative lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        ].join(' ')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 12 }}>

          {/* ── Logo ──────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: isCollapsed ? '14px 0' : '14px 8px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CheckSquare size={15} color="#000000" strokeWidth={2.5} />
            </div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ flex: 1, overflow: 'hidden' }}
                >
                  <div style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-0.025em',
                    whiteSpace: 'nowrap',
                  }}>
                    TaskFlow
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 10,
                    marginTop: 3,
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                  }}>
                    Task Manager
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Navigation ────────────────────────────────────── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {NAV_CATEGORIES.map(({ key, label, items }) => (
              <div key={key}>
                {/* Category label */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        color: 'rgba(255,255,255,0.22)',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        padding: '0 12px',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nav items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {items.map(({ to, label: itemLabel, Icon, badge }) => (
                    <NavItem
                      key={to}
                      to={to}
                      label={itemLabel}
                      Icon={Icon}
                      badge={badge}
                      active={isItemActive(to)}
                      collapsed={isCollapsed}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom Controls ────────────────────────────────── */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            flexShrink: 0,
          }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isCollapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
              onMouseEnter={() => setThemeHover(true)}
              onMouseLeave={() => setThemeHover(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '9px 0' : '9px 12px',
                borderRadius: 10,
                background: themeHover ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none',
                color: themeHover ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                fontSize: 13,
              }}
            >
              {isDark
                ? <Sun size={14} strokeWidth={1.75} />
                : <Moon size={14} strokeWidth={1.75} />
              }
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User profile card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: isCollapsed ? '8px 0' : '8px 10px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#FFFFFF', color: '#000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                letterSpacing: '-0.02em',
                flexShrink: 0,
              }}>
                {initials}
              </div>

              {/* Name + Email */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
                  >
                    <div style={{
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1,
                      letterSpacing: '-0.01em',
                    }}>
                      {user?.name}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.32)',
                      fontSize: 10,
                      marginTop: 3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user?.email}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Logout icon */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleLogout}
                    title="Sign out"
                    onMouseEnter={() => setLogoutHover(true)}
                    onMouseLeave={() => setLogoutHover(false)}
                    style={{
                      padding: 5, borderRadius: 6,
                      border: 'none',
                      background: logoutHover ? 'rgba(220,38,38,0.15)' : 'transparent',
                      color: logoutHover ? '#DC2626' : 'rgba(255,255,255,0.28)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <LogOut size={13} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Collapse button — desktop only */}
            <button
              onClick={handleToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onMouseEnter={() => setCollapseHover(true)}
              onMouseLeave={() => setCollapseHover(false)}
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 10,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '8px 0' : '8px 12px',
                borderRadius: 10,
                background: collapseHover ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                color: collapseHover ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                fontSize: 12,
              }}
              className="lg:flex"
            >
              {isCollapsed
                ? <PanelLeft size={14} strokeWidth={1.75} />
                : <PanelLeftClose size={14} strokeWidth={1.75} />
              }
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Collapse Sidebar
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
