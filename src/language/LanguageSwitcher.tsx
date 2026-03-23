
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <button 
      onClick={() => setLanguage(language === 'EN' ? 'AM' : 'EN')}
      className="fixed top-4 right-4 bg-gray-100 px-3 py-1 rounded-full text-sm font-bold border border-gray-300 hover:bg-gray-200 transition-colors"
    >
      {language === 'EN' ? 'አማርኛ' : 'English'}
    </button>
  );
};

export default LanguageSwitcher;