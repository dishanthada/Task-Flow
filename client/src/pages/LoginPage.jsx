import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/dateUtils';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { CheckSquare } from 'lucide-react';

const LoginPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
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
      const res = await login({ email: form.email, password: form.password });
      loginUser(res.data);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-[#F5F5F5] dark:bg-[#0A0A0A] transition-colors"
    >
      <div className="w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl p-8 shadow-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4 shadow-sm">
              <CheckSquare size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-black dark:text-white">Welcome Back</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Sign in to your TaskFlow account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="login-email"
              name="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
              className="rounded-lg text-xs"
            />
            <Input
              id="login-password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
              className="rounded-lg text-xs"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 btn-primary rounded-lg text-xs font-semibold py-2.5"
            >
              Sign In
            </Button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-neutral-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-black dark:text-white hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
