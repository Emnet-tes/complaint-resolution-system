import React, { useState } from 'react';
import { ArrowLeft, Lock, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { authApi } from '../api/api';
import ThemeToggle from '../components/ThemeToggle';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  const emailFromState = (location.state as { email?: string; otp?: string } | null)?.email || '';
  const otpFromState = (location.state as { email?: string; otp?: string } | null)?.otp || '';

  const [email, setEmail] = useState(emailFromState || emailFromUrl || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleLanguage = () => {
    const current = i18n.language.startsWith('en') ? 'en' : 'am';
    const newLang = current === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('settings.security.password_mismatch') || 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const finalEmail = email || emailFromState || emailFromUrl;
      if (!finalEmail) {
        setError(t('auth.missing_email', 'Missing email. Please restart the reset flow.'));
        return;
      }
      
      if (tokenFromUrl) {
        await authApi.resetPassword({
          token: tokenFromUrl,
          email: finalEmail,
          password,
        });
      } else {
        if (!otpFromState) {
          setError(t('auth.missing_otp', 'Missing OTP. Please restart the reset flow.'));
          return;
        }
        await authApi.resetPasswordOtp({
          email: finalEmail,
          otp: otpFromState,
          password,
        });
      }
      
      setSuccess(t('auth.reset_success', 'Password reset successful. Please login.'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || t('dept_mgmt.toasts.fetch_error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[400px] flex flex-col">
        {/* Language + Theme Toggle */}
        <div className="flex justify-end gap-2 mb-6">
          <ThemeToggle />
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all"
            type="button"
          >
            <Languages className="w-4 h-4 text-[#006B5D]" />
            <span className="text-[10px] font-black uppercase">
              {i18n.language.startsWith('en') ? 'EN' : 'አማ'}
            </span>
          </button>
        </div>

        <button 
          onClick={() => navigate(tokenFromUrl ? '/login' : '/verify-code')}
          className="mb-8 w-fit p-1 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <ArrowLeft size={28} className="text-black" />
        </button>

        <h1 className="text-3xl font-bold text-[#005a43] mb-4">
          {t('auth.reset_password_title')}
        </h1>
        <p className="text-gray-800 text-lg leading-tight mb-10">
          {t('auth.reset_password_subtitle')}
        </p>

        {/* Feedback */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 font-bold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-200 font-bold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t('settings.profile.email')}
            </label>
            <div className="relative flex items-center">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: abc@example.com"
                className="w-full py-4 px-6 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t('settings.security.new_password')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Lock size={20} />
              </span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........."
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t('settings.security.confirm_password')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Lock size={20} />
              </span>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="........."
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005a43] text-white font-bold py-4 rounded-2xl hover:bg-[#004835] transition-colors text-lg mt-4 disabled:opacity-70"
          >
            {loading ? t('sys_dashboard.loading') : t('orgs.btns.confirm')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;