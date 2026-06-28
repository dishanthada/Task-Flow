import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/dateUtils';
import { CheckSquare, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const GridBackground = ({ isDark }) => {
  const gridColor = isDark ? '%23ffffff' : '%23000000';
  const gridOpacity = isDark ? '0.015' : '0.02';
  
  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm39 39h1v1h-1v-1z' fill='${gridColor}' fill-opacity='${gridOpacity}' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: isDark 
          ? 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.06) 0%, rgba(10,10,10,1) 80%)' 
          : 'radial-gradient(circle at 50% -20%, rgba(255,255,255,0.8) 0%, rgba(246,246,248,1) 80%)',
      }} />
    </>
  );
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const RegisterPage = () => {
  const { loginUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      loginUser(res.data);
      toast.success(`Account created! Welcome, ${res.data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Deliberately doing nothing to prevent ugly errors per requirements
  };

  const inputStyle = (err) => ({
    height: 54,
    width: '100%',
    borderRadius: 14,
    background: 'var(--bg-surface-2)',
    border: `1.5px solid ${err ? 'var(--red)' : 'var(--border-color)'}`,
    padding: '0 20px',
    fontSize: 14.5,
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      background: isDark ? '#0a0a0a' : '#f6f6f8',
      position: 'relative',
    }}>
      <GridBackground isDark={isDark} />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-[92%] sm:max-w-[460px] md:max-w-[500px] lg:max-w-[520px]"
        style={{
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Card */}
        <div 
          className="p-6 sm:px-10 sm:py-8"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            boxShadow: isDark ? '0 10px 40px -10px rgba(0,0,0,0.8)' : '0 10px 40px -10px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          
          {/* Logo Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: 'var(--text-primary)',
                color: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isDark ? '0 4px 16px rgba(255,255,255,0.08)' : '0 4px 16px rgba(0,0,0,0.1)',
              }}>
                <CheckSquare size={22} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>TaskFlow</span>
            </div>

            <h1 style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Create Account
            </h1>
            <p style={{
              fontSize: 14.5,
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontWeight: 500,
            }}>
              Get started with TaskFlow for free
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="name" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                style={inputStyle(errors.name)}
                onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.boxShadow = '0 0 0 4px var(--bg-surface-3)'; }}
                onBlur={e => { e.target.style.borderColor = errors.name ? 'var(--red)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                autoComplete="name"
              />
              {errors.name && <span style={{ fontSize: 12, color: 'var(--red)' }}>{errors.name}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={inputStyle(errors.email)}
                onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.boxShadow = '0 0 0 4px var(--bg-surface-3)'; }}
                onBlur={e => { e.target.style.borderColor = errors.email ? 'var(--red)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                autoComplete="email"
              />
              {errors.email && <span style={{ fontSize: 12, color: 'var(--red)' }}>{errors.email}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                style={inputStyle(errors.password)}
                onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.boxShadow = '0 0 0 4px var(--bg-surface-3)'; }}
                onBlur={e => { e.target.style.borderColor = errors.password ? 'var(--red)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                autoComplete="new-password"
              />
              {errors.password && <span style={{ fontSize: 12, color: 'var(--red)' }}>{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="confirmPassword" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={inputStyle(errors.confirmPassword)}
                onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.boxShadow = '0 0 0 4px var(--bg-surface-3)'; }}
                onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? 'var(--red)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span style={{ fontSize: 12, color: 'var(--red)' }}>{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { if (!loading) e.currentTarget.style.transform = btnHover ? 'translateY(-2px)' : 'none'; }}
              style={{
                height: 54,
                width: '100%',
                marginTop: 4,
                borderRadius: 14,
                background: 'var(--text-primary)',
                color: 'var(--bg-surface)',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1,
                transform: btnHover && !loading ? 'translateY(-2px)' : 'none',
                boxShadow: btnHover && !loading 
                  ? (isDark ? '0 6px 20px rgba(255,255,255,0.1)' : '0 6px 20px rgba(0,0,0,0.15)') 
                  : 'none',
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            margin: '16px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)', opacity: 0.6 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              OR CONTINUE WITH
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)', opacity: 0.6 }} />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            onMouseEnter={() => setGoogleHover(true)}
            onMouseLeave={() => setGoogleHover(false)}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = googleHover ? 'translateY(-2px)' : 'none'; }}
            style={{
              height: 54,
              width: '100%',
              borderRadius: 14,
              background: '#FFFFFF',
              color: '#000000',
              border: '1px solid #E2E8F0',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
              transition: 'all 0.3s ease',
              transform: googleHover ? 'translateY(-2px)' : 'none',
              boxShadow: googleHover ? '0 6px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
              position: 'relative',
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
          
          {/* Footer (Inside Card) */}
          <div style={{
            textAlign: 'center',
            marginTop: 16,
            paddingTop: 8,
          }}>
            <span style={{ fontSize: 14.5, color: 'var(--text-muted)', fontWeight: 500 }}>
              Already have an account?
            </span>
            {' '}
            <Link 
              to="/login" 
              style={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: 14.5,
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
