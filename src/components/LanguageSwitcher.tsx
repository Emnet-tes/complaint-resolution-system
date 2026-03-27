import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-all cursor-pointer"
    >
      <Languages size={16} className="text-[#006B5D]" />
      <span className="text-[10px] font-black uppercase tracking-widest">
        {i18n.language === 'en' ? 'English' : 'አማርኛ'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;