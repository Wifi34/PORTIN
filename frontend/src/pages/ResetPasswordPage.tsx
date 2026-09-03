import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { apiClient } from '../api/client';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qToken = searchParams.get('token');
    if (qEmail) setEmail(qEmail);
    if (qToken) setToken(qToken);
  }, [searchParams]);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['#E4E2DC', '#C64A3B', '#D98A27', '#2F7D4B', '#2F7D4B'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('One-time verification token is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to reset password. The token may be expired or invalid. Please request a new link.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter your verification token and select a secure new password."
      heroHeadline="Institutional Security &"
      heroHighlight="Account Protection"
      heroSubheadline="Encrypted Access. Role-Based Governance."
    >
      {/* Error Alert */}
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

      {/* Success State */}
      {success ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div
            className="p-4 rounded-xl border text-xs text-center"
            style={{
              backgroundColor: '#F3FAF7',
              borderColor: '#BCF0DA',
              color: '#2F7D4B',
            }}
          >
            <CheckCircle2 className="w-8 h-8 text-[#2F7D4B] mx-auto mb-2" />
            <div className="font-bold text-sm text-[#0F2747] mb-1">
              Password Updated Successfully
            </div>
            <p className="text-[#172033] font-medium">
              Your credentials have been securely updated. Redirecting to sign in...
            </p>
          </div>

          <Link
            to="/login"
            className="w-full py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md block text-center"
            style={{
              backgroundColor: '#D6A63B',
              color: '#0F2747',
            }}
          >
            <span>Continue to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div>
            <label
              htmlFor="reset-email"
              className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
            >
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B]"
            />
          </div>

          {/* Token */}
          <div>
            <label
              htmlFor="reset-token"
              className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
            >
              One-Time Token
            </label>
            <input
              id="reset-token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter security token"
              className="w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#0F2747] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B]"
            />
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="reset-new-password"
              className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-11 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] placeholder:text-[#68717D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68717D] hover:text-[#172033]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
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
              htmlFor="reset-confirm-password"
              className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-11 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] placeholder:text-[#68717D]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68717D] hover:text-[#172033]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

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
            <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-[#68717D] hover:text-[#0F2747] font-medium"
            >
              Cancel and Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
