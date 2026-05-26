import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Loader2, Languages, KeyRound, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { forgotPasswordThunk, selectAuthError, selectAuthSubmitting } from '../store/slices/authSlice';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthSubmitting);
  const authError = useAppSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  const languageOptions = [
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'am', label: 'አማ', fullName: 'አማርኛ' },
    { code: 'om', label: 'OM', fullName: 'Afaan Oromoo' },
  ] as const;

  const getLanguageLabel = (language: string) =>
    languageOptions.find((o) => language.startsWith(o.code))?.label ?? 'EN';

  const setLanguage = (language: 'en' | 'am' | 'om') => {
    i18n.changeLanguage(language);
    setIsLanguageOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRequest = async (method: 'otp' | 'link') => {
    if (!email) {
      setError(t('settings.profile.email_required', 'Email is required'));
      return;
    }
    setError('');
    setSuccessMessage('');

    try {
      await dispatch(forgotPasswordThunk({ email, mode: method })).unwrap();
      if (method === 'otp') {
        toast.success(t('auth.otp_sent', 'OTP has been sent to your email.'));
        navigate('/verify-code', { state: { email } });
      } else {
        toast.success(t('auth.link_sent', 'Reset link has been sent to your email.'));
      }
    } catch (err: any) {
      const errorMessage = err?.message || authError || t('dept_mgmt.toasts.fetch_error');
      setError(errorMessage);
    }
  };

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative">
      {/* Top-right toggles positioned slightly outside the form width */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <ThemeToggle />
        <div className="relative" ref={languageRef}>
          <button
            type="button"
            onClick={() => setIsLanguageOpen((s) => !s)}
            className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-full shadow-sm hover:bg-gray-50 transition-all ${isLanguageOpen ? 'border-[#006B5D]/30' : 'border-gray-100'}`}
          >
            <Languages className="w-4 h-4 text-[#006B5D]" />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {getLanguageLabel(i18n.language)}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLanguageOpen && (
            <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
              {languageOptions.map((option) => {
                const active = i18n.language.startsWith(option.code);
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setLanguage(option.code)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 border-l-2 ${
                      active ? 'border-l-[#006B5D] bg-[#006B5D]/5' : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-[#006B5D]' : 'text-slate-600'}`}>
                        {option.label}
                      </span>
                      <span className={`text-[10px] font-medium ${active ? 'text-[#006B5D]/70' : 'text-slate-400'}`}>
                        {option.fullName}
                      </span>
                    </div>
                    {active && <span className="h-2 w-2 rounded-full bg-[#006B5D] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[400px] flex flex-col">

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

          {/* Submit Button */}
          <div>
            <button
              type="button"
              onClick={() => handleRequest('otp')}
              disabled={loading || !!successMessage}
              className="w-full bg-[#005a43] text-white font-black py-4 rounded-2xl hover:bg-[#004835] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <KeyRound size={18} />}
              {t('auth.send_otp', 'OTP')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;