import React, { useState } from 'react';
import { ArrowLeft, Mail, Loader2, Languages, Link as LinkIcon, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/api'; // Import your API
import ThemeToggle from '../components/ThemeToggle';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const toggleLanguage = () => {
    const current = i18n.language.startsWith('en') ? 'en' : 'am';
    const newLang = current === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleRequest = async (method: 'otp' | 'link') => {
    if (!email) {
      setError(t('settings.profile.email_required', 'Email is required'));
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (method === 'otp') {
        const response = await authApi.forgotPasswordOtp(email);
        if (response.status === 200) {
          setSuccessMessage(t('auth.otp_sent', 'OTP has been sent to your email.'));
          setTimeout(() => navigate('/verify-code', { state: { email } }), 800);
        }
      } else {
        const response = await authApi.forgotPassword(email);
        if (response.status === 200) {
          setSuccessMessage(t('auth.link_sent', 'Reset link has been sent to your email.'));
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('dept_mgmt.toasts.fetch_error');
      setError(errorMessage);
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

        {/* Back Button */}
        <button 
          onClick={() => navigate('/login')}
          className="mb-8 w-fit p-1 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <ArrowLeft size={28} className="text-black" />
        </button>

        {/* Header Section */}
        <h1 className="text-3xl font-black text-[#005a43] mb-4 tracking-tight">
          {t('auth.forgot_password_title')}
        </h1>
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
          {t('auth.forgot_password_subtitle')}
        </p>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 font-bold">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-200 font-bold">
            {successMessage}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {t('settings.profile.email')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Mail size={20} />
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: abc@example.com"
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300 font-medium"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleRequest('otp')}
              disabled={loading || !!successMessage}
              className="flex-1 bg-white border-2 border-[#005a43] text-[#005a43] font-black py-4 rounded-2xl hover:bg-gray-50 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <KeyRound size={18} />}
              {t('auth.send_otp', 'OTP')}
            </button>
            <button
              type="button"
              onClick={() => handleRequest('link')}
              disabled={loading || !!successMessage}
              className="flex-1 bg-[#005a43] text-white font-black py-4 rounded-2xl hover:bg-[#004835] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LinkIcon size={18} />}
              {t('auth.send_link', 'Link')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;