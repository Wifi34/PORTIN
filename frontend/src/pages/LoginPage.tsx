import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle ?demo=true or role fill
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setEmail('analyst@sail.gov.in');
      setPassword('Analyst@PortIN2026');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Invalid email or password. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: 'analyst' | 'manager' | 'admin') => {
    if (role === 'analyst') {
      setEmail('analyst@sail.gov.in');
      setPassword('Analyst@PortIN2026');
    } else if (role === 'manager') {
      setEmail('manager@sail.gov.in');
      setPassword('Manager@PortIN2026');
    } else if (role === 'admin') {
      setEmail('admin@portin.sail.gov.in');
      setPassword('Admin@PortIN2026');
    }
    setError(null);
  };

  const handleGoogleSignIn = () => {
    // Standard OAuth initiation point
    setError('Google Single Sign-On requires organization domain authorization. Please use work credentials or enterprise SSO.');
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to access your PortIN maritime intelligence dashboard."
      heroHeadline="Smarter Freight Forecasting for"
      heroHighlight="Maritime Decisions"
    >
      {/* Quick Fill Demo Ribbon for SIH Evaluators */}
      <div className="mb-5 p-2.5 rounded-xl bg-[#F8F7F3] border border-[#E4E2DC] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-[#0F2747] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D6A63B]" />
          <span>Demo Quick-Fill:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleDemoFill('analyst')}
            className="px-2 py-1 rounded bg-white hover:bg-[#F3E3B7] border border-[#E4E2DC] text-[#0F2747] font-bold text-[10px] transition-colors"
          >
            Analyst
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('manager')}
            className="px-2 py-1 rounded bg-white hover:bg-[#F3E3B7] border border-[#E4E2DC] text-[#0F2747] font-bold text-[10px] transition-colors"
          >
            Manager
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="px-2 py-1 rounded bg-white hover:bg-[#F3E3B7] border border-[#E4E2DC] text-[#0F2747] font-bold text-[10px] transition-colors"
          >
            Admin
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div
          className="mb-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-200"
          style={{
            backgroundColor: '#FDF2F2',
            borderColor: '#F8B4B4',
            color: '#C64A3B',
          }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-11 py-2.5 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68717D] hover:text-[#172033] focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#D6A63B] accent-[#D6A63B] focus:ring-0"
            />
            <span className="text-xs text-[#68717D] font-medium">Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-xs font-bold hover:underline transition-colors"
            style={{ color: '#D6A63B' }}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Primary CTA Button: Muted Gold */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
          style={{
            backgroundColor: '#D6A63B',
            color: '#0F2747',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C7962F')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D6A63B')}
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E4E2DC]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-white px-3 text-[#68717D]">OR</span>
          </div>
        </div>

        {/* Secondary: Sign in with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#172033] bg-white hover:bg-[#F8F7F3] border border-[#E4E2DC] transition-colors flex items-center justify-center gap-2.5 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Bottom Link: Sign Up */}
        <div className="text-center pt-3 border-t border-[#E4E2DC] text-xs text-[#68717D]">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-bold hover:underline transition-colors"
            style={{ color: '#D6A63B' }}
          >
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
