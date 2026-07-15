import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, ChevronDown, Bell, Search, X, Plus, CheckSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bellHover, setBellHover] = useState(false);
  const [themeHover, setThemeHover] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const isDashboard = location.pathname === '/dashboard';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ⌘K focus search */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  /* Dispatch custom event → DashboardPage listens */
  const handleNewBoard = () => {
    window.dispatchEvent(new CustomEvent('taskflow:new-board'));
  };

  /* Shared icon button style */
  const iconBtnStyle = (hovered) => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hovered ? 'var(--bg-surface-3)' : 'transparent',
    border: 'none',
    color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
    flexShrink: 0,
  });

  return (
    <header
      style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 16,
        background: 'var(--bg-navbar)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* ── Left: Logo + Hamburger ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle navigation"
          title="Navigation"
          style={{
            width: 34, height: 34,
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-surface-3)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 8,
            background: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CheckSquare size={15} style={{ color: 'var(--bg-navbar)' }} strokeWidth={2.5} />
          </div>
          <div className="navbar-logo-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              color: 'var(--text-primary)',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              TaskFlow
            </div>
            <div style={{
              color: 'var(--text-muted)',
              fontSize: 9,
              marginTop: 2,
              letterSpacing: '0.015em',
              fontWeight: 500,
            }}>
              Smart Task Manager
            </div>
          </div>
        </div>
      </div>

      {/* ── Center: Search (hidden on mobile, visible on md+) ──────────────── */}
      <div
        className="navbar-search"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            pointerEvents: 'auto',
          }}
        >
          <span style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            pointerEvents: 'none',
          }}>
            <Search size={14} strokeWidth={2} />
          </span>

          <input
            ref={searchRef}
            type="text"
            placeholder="Search tasks, boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 40,
              paddingRight: searchQuery ? 40 : 48,
              paddingTop: 9,
              paddingBottom: 9,
              background: 'var(--bg-surface-2)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 11,
              fontSize: 13,
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)';
              e.target.style.background = 'var(--bg-surface)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = 'var(--bg-surface-2)';
            }}
          />

          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={13} />
            </button>
          ) : (
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, color: 'var(--text-faint)',
              fontFamily: 'monospace', letterSpacing: '0.02em',
              background: 'var(--bg-surface-3)',
              padding: '2px 6px', borderRadius: 5,
              border: '1px solid var(--border-color)',
              pointerEvents: 'none',
            }}>
              ⌘K
            </span>
          )}
        </div>
      </div>

      {/* ── Right: Actions ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Bell */}
        <button
          title="Notifications"
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
          style={{ ...iconBtnStyle(bellHover), position: 'relative' }}
        >
          <Bell size={16} strokeWidth={1.75} />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 6, height: 6,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            border: '1.5px solid var(--bg-navbar)',
          }} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Light mode' : 'Dark mode'}
          onMouseEnter={() => setThemeHover(true)}
          onMouseLeave={() => setThemeHover(false)}
          style={iconBtnStyle(themeHover)}
        >
          {isDark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
        </button>

        {/* Divider */}
        <div className="navbar-divider" style={{
          width: 1, height: 22,
          background: 'var(--border-color)',
          marginLeft: 2, marginRight: 2,
        }} />

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            aria-label="User menu"
            aria-expanded={profileOpen}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 8px 4px 4px',
              borderRadius: 10,
              background: 'transparent',
              border: '1.5px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-surface-3)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--color-primary)',
              color: 'var(--bg-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, letterSpacing: '-0.02em',
            }}>
              {initials}
            </div>
            <ChevronDown
              size={12}
              strokeWidth={2.5}
              style={{
                color: 'var(--text-muted)',
                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: 220,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                zIndex: 500,
              }}
            >
              {/* User info */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user?.name}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)', marginTop: 3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user?.email}
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => { toggleTheme(); setProfileOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8,
                    border: 'none', background: 'transparent',
                    fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8,
                    border: 'none', background: 'transparent',
                    fontSize: 13, color: 'var(--red)', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{
          width: 1, height: 22,
          background: 'var(--border-color)',
          marginLeft: 2, marginRight: 2,
        }} />

        {/* New Board button — only on dashboard */}
        {isDashboard && (
          <button
            onClick={handleNewBoard}
            id="navbar-new-board"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px',
              background: 'var(--black)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#222222';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--black)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="navbar-new-board-text">New Board</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
