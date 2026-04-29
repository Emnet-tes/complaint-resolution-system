import React, { useState } from 'react';
import { Mail, Lock, Loader2, Languages } from 'lucide-react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
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
        logout();
        toast.error(t('auth.not_allowed', 'You are not allowed to access this system.'));
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const current = i18n.language.startsWith('en') ? 'en' : 'am';
    const newLang = current === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
   <div className="w-full min-h-screen flex flex-col justify-between bg-white p-4">
    <div className="w-full max-w-md mx-auto flex flex-col py-10">
        {/* Language + Theme Toggle */}
        <div className="flex justify-end gap-2 mb-6">
          <ThemeToggle />
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all"
          >
            <Languages className="w-4 h-4 text-[#006B5D]" />
            <span className="text-[10px] font-black uppercase">
              {i18n.language.startsWith('en') ? 'EN' : 'አማ'}
            </span>
          </button>
        </div>

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
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="........."
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none bg-transparent"
              />
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