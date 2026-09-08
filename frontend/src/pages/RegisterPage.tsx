import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Briefcase, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('Steel Authority of India Limited (SAIL)');
  const [role, setRole] = useState('Chartering Manager');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
                setError(err.response?.data?.detail || 'Google sign-up failed. Please try again.');
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

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['#E4E2DC', '#C64A3B', '#D98A27', '#2F7D4B', '#2F7D4B'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!organization.trim()) {
      setError('Please specify your company or organization.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        organization,
        role: role.toLowerCase().replace(/\s+/g, '_'),
        password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'An account with this email already exists or registration failed. Please sign in instead.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
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
                setError(err.response?.data?.detail || 'Google sign-up failed.');
              } finally {
                setLoading(false);
              }
            } else if (tokenResponse?.error) {
              setError(`Google Sign-Up: ${tokenResponse.error_description || tokenResponse.error}`);
            }
          },
          error_callback: (err: any) => {
            setError(`Google Sign-Up: ${err?.message || 'Dialog closed'}`);
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
          setError('Google sign-up popup was blocked or skipped. Please allow popups or try again.');
        }
      });
    } else {
      setError('Google Sign-Up is initializing. Please wait a moment and try again.');
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join PortIN and make smarter maritime decisions."
      heroHeadline="Autonomous Maritime Procurement &"
      heroHighlight="Global Fleet Optimization"
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

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Capt. Rajesh Sharma"
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
            />
          </div>
        </div>

        {/* Work Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
          >
            Work Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@sail.gov.in"
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
            />
          </div>
        </div>

        {/* Company & Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="signup-org"
              className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
            >
              Company / Organization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#68717D]">
                <Building className="w-3.5 h-3.5" />
              </div>
              <input
                id="signup-org"
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Company Name"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-role"
              className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
            >
              Role / Designation
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#68717D]">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <select
                id="signup-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors"
              >
                <option value="Chartering Manager">Chartering Manager</option>
                <option value="Procurement Manager">Procurement Manager</option>
                <option value="Freight Analyst">Freight Analyst</option>
                <option value="Operations Manager">Operations Manager</option>
                <option value="Management / Executive">Management / Executive</option>
                <option value="Administrator">Administrator</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-11 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68717D] hover:text-[#172033]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#E4E2DC] rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className="flex-1 h-full transition-all"
                    style={{
                      backgroundColor: strength >= step ? strengthColors[strength] : 'transparent',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[10px] font-bold"
                style={{ color: strengthColors[strength] }}
              >
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full pl-10 pr-11 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68717D] hover:text-[#172033]"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Agree Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#D6A63B] accent-[#D6A63B] mt-0.5"
            />
            <span className="text-[11px] text-[#68717D] leading-tight">
              I agree to the <span className="text-[#172033] font-semibold">Terms of Service</span> and{' '}
              <span className="text-[#172033] font-semibold">Privacy Policy</span>.
            </span>
          </label>
        </div>

        {/* Primary CTA: Muted Gold */}
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
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary: Sign up with Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
          <span>Sign up with Google</span>
        </button>

        {/* Bottom Link: Sign In */}
        <div className="text-center pt-2 border-t border-[#E4E2DC] text-xs text-[#68717D]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold hover:underline transition-colors"
            style={{ color: '#D6A63B' }}
          >
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
