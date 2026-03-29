import React, { useState } from 'react';
import { ArrowLeft, Mail, Loader2, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/api'; // Import your API

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleLanguage = () => {
    const current = i18n.language.startsWith('en') ? 'en' : 'am';
    const newLang = current === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.status === 200) {
        setSuccess(true);
        // Optional: Move to verify-code after a short delay 
        // or stay here to show success message
        setTimeout(() => navigate('/verify-code'), 2000);
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
        
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
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
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-200 font-bold">
            {t('dept_mgmt.toasts.add_success') || "Reset link sent successfully!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#005a43] text-white font-black py-4 rounded-2xl hover:bg-[#004835] transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {t('sys_dashboard.loading')}
              </>
            ) : (
              t('dept_mgmt.buttons.submit_admin')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;