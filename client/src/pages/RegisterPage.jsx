import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/dateUtils';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { CheckSquare } from 'lucide-react';

const RegisterPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-[#F5F5F5] dark:bg-[#0A0A0A] transition-colors"
    >
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl p-8 shadow-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4 shadow-sm">
              <CheckSquare size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-black dark:text-white">Create Account</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Get started with TaskFlow for free
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="reg-name"
              name="name"
              label="Full name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              autoComplete="name"
              className="rounded-lg text-xs"
            />
            <Input
              id="reg-email"
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
              id="reg-password"
              name="password"
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
              className="rounded-lg text-xs"
            />
            <Input
              id="reg-confirm-password"
              name="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              className="rounded-lg text-xs"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 btn-primary rounded-lg text-xs font-semibold py-2.5"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-black dark:text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
