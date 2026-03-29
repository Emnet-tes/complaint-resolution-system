import React, { useState } from 'react';
import { ArrowLeft, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Verification = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    const current = i18n.language.startsWith('en') ? 'en' : 'am';
    const newLang = current === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a typical flow, backend would validate this code and
      // respond with a reset token. Since your backend contract
      // doesn't specify this, we'll just pass the code along as "token"
      // to the reset-password page.
      navigate('/reset-password', { state: { token: code } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error'));
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
          onClick={() => navigate('/forgot-password')}
          className="mb-8 w-fit p-1 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
          aria-label="back"
        >
          <ArrowLeft size={28} className="text-black" />
        </button>

        {/* Header Section */}
        <h1 className="text-3xl font-bold text-[#005a43] mb-4">
          {t('auth.verify_code_title')}
        </h1>
        <p className="text-gray-800 text-lg leading-tight mb-10">
          {t('auth.verify_code_subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Verification Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t('auth.verify_code_label')}
            </label>
            <div className="relative flex items-center">
              <input
                required
                type="text"
                placeholder="EX: 123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full py-4 px-6 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300 text-center tracking-widest font-bold text-xl"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005a43] text-white font-bold py-4 rounded-2xl hover:bg-[#004835] transition-colors text-lg disabled:opacity-70"
          >
            {loading ? t('sys_dashboard.loading') : t('orgs.btns.confirm')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verification;