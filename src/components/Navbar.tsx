import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Menu, Languages, Clock, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps { onMenuClick: () => void; }

const Navbar = ({ onMenuClick }: NavbarProps) => {
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('nav.good_morning');
    if (hour >= 12 && hour < 18) return t('nav.good_afternoon');
    return t('nav.good_evening');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      
      <div className="flex items-center space-x-3">
            <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-slate-600 cursor-pointer">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-[#1E293B] text-lg md:text-xl font-black tracking-tight whitespace-nowrap">
              <span className="hidden sm:inline uppercase text-sm tracking-widest font-black text-slate-500">
                {getGreeting()} {user?.fullname?.split(' ')[0]}
              </span>
              <span className="sm:hidden text-base font-black text-slate-500">{getGreeting()}</span>
            </h1>
      </div>

      <div className={`flex items-center space-x-2 md:space-x-4 `}>
        {/* Search logic remains here... */}
        
          <div className="flex items-center space-x-1.5 md:space-x-3">
            
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer transition-all">
              <Languages className="w-4 h-4 text-[#006B5D]" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {i18n.language === 'en' ? 'EN' : 'አማ'}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer transition-all"
              aria-label={theme === 'dark' ? t('nav.switch_light', 'Switch to light mode') : t('nav.switch_dark', 'Switch to dark mode')}
              title={theme === 'dark' ? t('nav.switch_light', 'Switch to light mode') : t('nav.switch_dark', 'Switch to dark mode')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* NOTIFICATION BELL & DROPDOWN */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 border rounded-full shadow-sm transition-all cursor-pointer ${isNotifOpen ? 'bg-slate-100 border-slate-300' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-500">
                      {t('notifications.title')}
                    </h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] font-bold text-[#006B5D] hover:underline cursor-pointer">
                        {t('notifications.mark_all')}
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center">
                        <Bell className="text-slate-200 mb-2" size={40} />
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          {t('notifications.empty')}
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n._id} 
                          onClick={() => !n.read && markAsRead(n._id)}
                          className={`p-4 border-b border-gray-50 flex gap-3 transition-colors cursor-pointer ${!n.read ? 'bg-[#006B5D]/5 hover:bg-[#006B5D]/10' : 'hover:bg-gray-50'}`}
                        >
                          <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.read ? 'bg-[#006B5D]' : 'bg-transparent'}`} />
                          <div className="space-y-1">
                            <p className={`text-xs font-bold leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{n.message}</p>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                              <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#006B5D] cursor-pointer">
                      {t('notifications.view_all')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="hidden sm:block p-2.5 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;