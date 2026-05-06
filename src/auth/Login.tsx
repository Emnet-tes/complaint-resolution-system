import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Loader2, Languages, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { setCredentials } from '../store/slices/authSlice';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login, logout } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

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
    const stored = sessionStorage.getItem('loginError');
    if (stored) setError(stored);
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      setError('');
      sessionStorage.removeItem('loginError');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData);

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (token && user.role) {
        dispatch(setCredentials({ token, role: user.role }));
      }

      if (user.role === 'SysAdmin') {
        navigate('/dashboard');
      } else if (user.role === 'OrgAdmin') {
        navigate('/org-dashboard');
      } else if (user.role === 'OrgHead') {
        navigate('/org-head/dashboard');
      } else if (user.role === 'DeptHead') {
        navigate('/dept-dashboard');
      } else {
        await logout();
        toast.error(t('auth.not_allowed', 'You are not allowed to access this system.'));
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || t('dept_mgmt.toasts.fetch_error');
      setError(msg);
      try { sessionStorage.setItem('loginError', msg); } catch (_e) {}
    } finally {
      setLoading(false);
    }
  };

  

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

    <div className="w-full max-w-md mx-auto flex flex-col ">

        {/* Title */}
        <h1 className="text-3xl font-black text-[#005a43] mb-10 italic">
          {t('auth.login', 'Login')}
        </h1>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t('settings.profile.email', 'Email')}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-[#005a43]" size={20} />
              <input
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex: abc@example.com"
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t('settings.security.current_password', 'Password')}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-[#005a43]" size={20} />
              <input
                required
                name="password"
                type={showPwd ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="........."
                className="w-full py-4 pl-12 pr-12 border-2 border-[#005a43] rounded-2xl focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowPwd((s) => !s); }}
                className="absolute right-4 text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005a43] text-white font-black py-4 rounded-2xl hover:bg-[#004835] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {t('sys_dashboard.loading')}
              </>
            ) : (
              t('auth.login', 'Login')
            )}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-black text-[#005a43] underline underline-offset-4 uppercase tracking-widest hover:text-[#004835] transition-all"
          >
            {t('auth.forgot_password_title', 'Forgot Password?')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;