import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { apiClient } from '../api/client';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResponse(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid registered work email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setSuccessResponse(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Unable to process password reset at this time. Please contact system administrator.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your registered email and we'll send you a secure reset link."
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

      {/* Success Notification State (Only shown after real server confirmation) */}
      {successResponse ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div
            className="p-4 rounded-xl border text-xs"
            style={{
              backgroundColor: '#F3FAF7',
              borderColor: '#BCF0DA',
              color: '#2F7D4B',
            }}
          >
            <div className="flex items-center gap-2 font-bold mb-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#2F7D4B]" />
              <span>Reset link sent successfully.</span>
            </div>
            <p className="text-[#172033] font-medium leading-relaxed">
              {successResponse.message || 'Please check your email for instructions to reset your password.'}
            </p>

            {/* If local dev token is returned because SMTP is unconfigured or in development */}
            {successResponse.demo_reset_token && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-[#E4E2DC]">
                <span className="text-[10px] uppercase font-bold text-[#68717D] block mb-1">
                  Local One-Time Security Token:
                </span>
                <span className="font-mono text-xs font-bold text-[#0F2747] bg-[#F8F7F3] px-2 py-1 rounded select-all block">
                  {successResponse.demo_reset_token}
                </span>
              </div>
            )}
          </div>

          <Link
            to={`/reset-password?email=${encodeURIComponent(email)}&token=${successResponse.demo_reset_token || ''}`}
            className="w-full py-3 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md block text-center"
            style={{
              backgroundColor: '#D6A63B',
              color: '#0F2747',
            }}
          >
            <span>Proceed to Reset Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#68717D] hover:text-[#0F2747] font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Standard Request Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5"
            >
              Registered Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68717D]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-[#172033] bg-[#F8F7F3] border border-[#E4E2DC] focus:bg-white focus:border-[#D6A63B] transition-colors placeholder:text-[#68717D]"
              />
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
            <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-3 border-t border-[#E4E2DC]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#68717D] hover:text-[#0F2747] font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
