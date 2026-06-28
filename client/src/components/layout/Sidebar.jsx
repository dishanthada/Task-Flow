import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layout, Calendar, BarChart2,
  Sparkles, Users, Settings, LogOut, Sun, Moon, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   NAV STRUCTURE
   ═══════════════════════════════════════════════════════════ */
const NAV_CATEGORIES = [
  {
    key: 'workspace',
    label: 'WORKSPACE',
    items: [
      { to: '/dashboard',               label: 'Dashboard',   Icon: LayoutDashboard },
      { to: '/dashboard?tab=boards',    label: 'Boards',      Icon: Layout          },
      { to: '/dashboard?tab=calendar',  label: 'Calendar',    Icon: Calendar        },
      { to: '/dashboard?tab=analytics', label: 'Analytics',   Icon: BarChart2       },
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
      { to: '/dashboard?tab=team',     label: 'Members',  Icon: Users    },
      { to: '/dashboard?tab=settings', label: 'Settings', Icon: Settings },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   NAV ITEM
   ═══════════════════════════════════════════════════════════ */
const NavItem = ({ to, label, Icon, badge, active, onClose }) => {
  const [hovered, setHovered] = useState(false);

  const bg  = active ? '#FFFFFF' : hovered ? 'rgba(255,255,255,0.06)' : 'transparent';
  const fg  = active ? '#000000' : hovered ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
  const ico = active ? 2.5 : 1.75;
  const shadow = active ? '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset' : 'none';

  return (
    <NavLink
      to={to}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12, // More rounded active state
        background: bg,
        color: fg,
        fontWeight: active ? 600 : 500,
        fontSize: 13.5,
        textDecoration: 'none',
        transition: 'all 0.2s ease', // Smooth hover animation
        letterSpacing: '-0.01em',
        flexShrink: 0,
        position: 'relative',
        boxShadow: shadow,
      }}
    >
      <Icon
        size={16}
        strokeWidth={ico}
        style={{ flexShrink: 0, transition: 'stroke-width 0.2s ease' }}
      />

      <span style={{
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {label}
      </span>

      {badge && (
        <span style={{
          fontSize: 9, fontWeight: 700,
          padding: '2px 7px', borderRadius: 6,
          background: 'rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN DRAWER
   ═══════════════════════════════════════════════════════════ */
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout }      = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate              = useNavigate();
  const location              = useLocation();
  const drawerRef             = useRef(null);

  const [themeHover,  setThemeHover]  = useState(false);
  const [profileHover, setProfileHover] = useState(false);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  /* Active item detection */
  const isItemActive = (to) => {
    const current = location.pathname + location.search;
    if (to === '/dashboard') return current === '/dashboard' || current === '/dashboard/';
    return current === to;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop overlay ─────────────────────────────── */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 60, // Start below navbar
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 80,
              background: 'rgba(0,0,0,0.35)', // 35% black overlay
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* ── Drawer panel ─────────────────────────────────── */}
          <motion.aside
            key="drawer-panel"
            ref={drawerRef}
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }} // ~0.35s spring
            style={{
              position: 'fixed',
              top: 60, // Start below navbar
              left: 0,
              width: 280,
              height: 'calc(100vh - 60px)',
              background: '#090909', // Premium black
              zIndex: 90,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '16px 0 40px rgba(0,0,0,0.3)',
              borderRadius: '0 16px 16px 0', // Rounded right corners
            }}
          >
            {/* ── Navigation ───────────────────────────────── */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '24px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}>
              {NAV_CATEGORIES.map(({ key, label, items }) => (
                <div key={key}>
                  {/* Category label */}
                  <div style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '0 4px 10px',
                    marginBottom: 10,
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid rgba(255,255,255,0.06)', // Subtle dividers
                  }}>
                    {label}
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map(({ to, label: itemLabel, Icon, badge }) => (
                      <NavItem
                        key={to + itemLabel}
                        to={to}
                        label={itemLabel}
                        Icon={Icon}
                        badge={badge}
                        active={isItemActive(to)}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Bottom Section ───────────────────────────── */}
            <div style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12, // Better spacing
              flexShrink: 0,
              background: '#090909',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* User profile card */}
              <button
                onClick={handleLogout}
                onMouseEnter={() => setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14, // Rounded card
                  background: profileHover ? 'rgba(220,38,38,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${profileHover ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                }}
                title="Sign out"
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38,
                  borderRadius: 10,
                  background: profileHover ? '#DC2626' : '#FFFFFF',
                  color: profileHover ? '#FFFFFF' : '#000000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                  letterSpacing: '-0.02em',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}>
                  {initials}
                </div>

                {/* Name + Email */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: profileHover ? '#DC2626' : '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: '-0.015em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 0.2s ease',
                  }}>
                    {user?.name}
                  </div>
                  <div style={{
                    color: profileHover ? 'rgba(220,38,38,0.7)' : 'rgba(255,255,255,0.4)',
                    fontSize: 11,
                    marginTop: 3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 400,
                    transition: 'color 0.2s ease',
                  }}>
                    {user?.email}
                  </div>
                </div>

                {/* Right Arrow / Action Icon */}
                <div style={{
                  color: profileHover ? '#DC2626' : 'rgba(255,255,255,0.3)',
                  transition: 'color 0.2s ease',
                  display: 'flex', alignItems: 'center',
                }}>
                  {profileHover ? <LogOut size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>

              {/* Dark mode toggle (below profile) */}
              <button
                onClick={toggleTheme}
                onMouseEnter={() => setThemeHover(true)}
                onMouseLeave={() => setThemeHover(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: themeHover ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  color: themeHover ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                {isDark
                  ? <Sun size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                  : <Moon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                }
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
