import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, X, Menu, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 1. Import useTranslation

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // 2. Initialize translation hook

  // Function to toggle between English and Amharic
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left Side: Menu Toggle & Title */}
      <div className="flex items-center space-x-3">
        {!isSearchOpen && (
          <>
            <button 
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-[#1E293B] text-lg md:text-xl font-black tracking-tight whitespace-nowrap">
              {/* 3. Localized Title */}
              <span className="hidden sm:inline uppercase text-sm tracking-widest">
                {t('nav.dashboard_title', 'Welcome to the Dashboard')}
              </span>
              <span className="sm:hidden text-base">Dashboard</span>
            </h1>
          </>
        )}
      </div>

      {/* Right Side Actions */}
      <div className={`flex items-center ${isSearchOpen ? 'w-full' : 'space-x-2 md:space-x-4'}`}>
        
        {isSearchOpen ? (
          <div className="flex items-center w-full animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('nav.search_placeholder', 'Search...')}
                className="w-full py-2 pl-4 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#006B5D]/20 focus:border-[#006B5D]"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2.5 text-slate-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>   
        )}
        
        {!isSearchOpen && (
          <div className="relative group hidden md:block">
            <input
              type="text"
              placeholder={t('nav.global_search', 'Global search...')}
              className="w-40 lg:w-64 py-2 pl-4 pr-10 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#006B5D]/20 focus:border-[#006B5D] transition-all"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Action Icons */}
        {!isSearchOpen && (
          <div className="flex items-center space-x-1.5 md:space-x-3">
            
            {/* 4. Language Switcher Button */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer transition-all active:scale-95"
              title="Switch Language"
            >
              <Languages className="w-4 h-4 text-[#006B5D]" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {i18n.language === 'en' ? 'EN' : 'አማ'}
              </span>
            </button>

            <button className="relative p-2.5 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
            <button 
              className="hidden sm:block p-2.5 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer" 
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;