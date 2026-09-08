import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Sparkles, Check, Copy, Shield, UserCheck } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const DEMO_ACCOUNTS = [
  {
    id: 'admin',
    title: 'Executive Admin',
    email: 'admin@portin.sail.gov.in',
    password: 'Admin@PortIN2026',
  },
  {
    id: 'analyst',
    title: 'Chartering Analyst',
    email: 'analyst@sail.gov.in',
    password: 'Analyst@PortIN2026',
  },
  {
    id: 'manager',
    title: 'Procurement Head',
    email: 'manager@sail.gov.in',
    password: 'Manager@PortIN2026',
  },
  {
    id: 'logistics',
    title: 'Logistics Officer',
    email: 'logistics@sail.gov.in',
    password: 'Logistics@PortIN2026',
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response?.credential) {
              setLoading(true);
              setError(null);
              try {
                await loginWithGoogle({ credential: response.credential });
                navigate('/dashboard');
              } catch (err: any) {
                setError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          },
        });
      } catch (e) {
        console.warn('Google Identity initialization error:', e);
      }
    }
  }, [loginWithGoogle, navigate]);

  const handleSelectDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedDemoId(account.id);
    setError(null);
  };

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

  const handleGoogleSignIn = () => {
    setError(null);

    // Modern Google OAuth2 Token Client (popup flow)
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              setLoading(true);
              try {
                await loginWithGoogle({ access_token: tokenResponse.access_token });
                navigate('/dashboard');
              } catch (err: any) {
                setError(err.response?.data?.detail || 'Google authentication failed.');
              } finally {
                setLoading(false);
              }
            } else if (tokenResponse?.error) {
              setError(`Google Sign-In: ${tokenResponse.error_description || tokenResponse.error}`);
            }
          },
          error_callback: (err: any) => {
            setError(`Google Sign-In: ${err?.message || 'Dialog closed'}`);
          }
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('initTokenClient failed, falling back to One Tap prompt:', err);
      }
    }

    // Fallback to Google One Tap prompt
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError('Google sign-in popup was blocked or skipped. Please allow popups or try again.');
        }
      });
    } else {
      setError('Google Sign-In is initializing. Please wait a moment and try again.');
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to access your PortIN maritime intelligence dashboard."
      heroHeadline="Next-Gen Freight Intelligence &"
      heroHighlight="Strategic Chartering Cockpit"
    >


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

      {/* 1-Click Demo Login (Role Name Only) */}
      <div className="mb-5 p-3 rounded-xl border border-[#E4E2DC] bg-[#FBFBFA]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#68717D] uppercase tracking-wider">
            Quick Demo Access
          </span>
          <span className="text-[10px] text-[#8C95A3]">
            Click role name to auto-fill
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => {
            const isSelected = selectedDemoId === account.id;
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => handleSelectDemo(account)}
                className={`py-2.5 px-3 rounded-lg border text-left font-semibold text-xs transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#D6A63B] bg-[#FFFDF8] text-[#0F2747] ring-1 ring-[#D6A63B]/50 shadow-xs'
                    : 'border-[#E4E2DC] bg-white text-[#333E4F] hover:border-[#D6A63B] hover:text-[#0F2747] hover:bg-[#FAF9F5]'
                }`}
              >
                <span className="truncate">{account.title}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#D6A63B] shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

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
