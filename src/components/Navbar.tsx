import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Menu, Languages, Clock, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationContext';

import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

interface NavbarProps { onMenuClick: () => void; }

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('nav.good_morning');
    if (hour >= 12 && hour < 18) return t('nav.good_afternoon');
    return t('nav.good_evening');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // CHANGE 1: Added full native names to each language option
  const languageOptions = [
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'am', label: 'አማ', fullName: 'አማርኛ' },
    { code: 'om', label: 'OM', fullName: 'Afaan Oromoo' },
  ] as const;

  const getLanguageLabel = (language: string) => {
    return languageOptions.find((option) => language.startsWith(option.code))?.label ?? 'EN';
  };

  const setLanguage = (language: 'en' | 'am' | 'om') => {
    i18n.changeLanguage(language);
    setIsLanguageOpen(false);
  };

  // CHANGE 4: Each toggle closes the other dropdown
  const handleToggleLanguage = () => {
    setIsNotifOpen(false);
    setIsLanguageOpen((open) => !open);
  };

  const handleToggleNotif = () => {
    setIsLanguageOpen(false);
    setIsNotifOpen((open) => !open);
  };

  return (
    <nav className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      
      <div className="flex items-center space-x-3">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-slate-600 cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="hidden md:block text-[#1E293B] text-lg md:text-xl font-black tracking-tight whitespace-nowrap">
          <span className="hidden sm:inline uppercase text-sm tracking-widest font-black text-slate-500">
            {getGreeting()} {user?.fullname?.split(' ')[0]}
          </span>
          <span className="sm:hidden text-base font-black text-slate-500">{getGreeting()}</span>
        </h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center space-x-1.5 md:space-x-3">
          
          {/* LANGUAGE DROPDOWN */}
          <div className="relative" ref={languageRef}>
            <button
              type="button"
              onClick={handleToggleLanguage}
              className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-full shadow-sm hover:bg-gray-50 cursor-pointer transition-all ${isLanguageOpen ? 'border-[#006B5D]/30' : 'border-gray-100'}`}
            >
              <Languages className="w-4 h-4 text-[#006B5D]" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {getLanguageLabel(i18n.language)}
              </span>
              {/* CHANGE 3: Chevron rotates when dropdown is open */}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isLanguageOpen && (
              // CHANGE 5: Width bumped to w-48 to fit "Afaan Oromoo" comfortably
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
                {languageOptions.map((option) => {
                  const active = i18n.language.startsWith(option.code);
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => setLanguage(option.code)}
                      // CHANGE 2: Active row uses a left border accent instead of a right dot
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 border-l-2 ${
                        active
                          ? 'border-l-[#006B5D] bg-[#006B5D]/5'
                          : 'border-l-transparent'
                      }`}
                    >
                      {/* CHANGE 1: Full native name shown in dropdown rows */}
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

          <ThemeToggle />
          {/* NOTIFICATION BELL & DROPDOWN */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={handleToggleNotif}
              className={`relative p-2.5 border rounded-full shadow-sm transition-all cursor-pointer ${isNotifOpen ? 'bg-slate-100 border-slate-300' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

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
                        className={`p-4 border-b border-gray-50 flex gap-3 transition-colors ${!n.read ? 'bg-[#006B5D]/5 hover:bg-[#006B5D]/10' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.read ? 'bg-[#006B5D]' : 'bg-transparent'}`} />
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                          <div className="pt-1 flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              <input
                                type="checkbox"
                                checked={n.read}
                                onChange={() => !n.read && markAsRead(n._id)}
                                disabled={n.read}
                                className="h-3.5 w-3.5 accent-[#006B5D] cursor-pointer disabled:cursor-not-allowed"
                              />
                              Read
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const complaintId = n?.data?.complaintId;
                                if (!complaintId) return;
                                if (!n.read) markAsRead(n._id);
                                setIsNotifOpen(false);
                                navigate(`/complaints/${complaintId}`);
                              }}
                              disabled={!n?.data?.complaintId}
                              className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-[#006B5D]/20 text-[#006B5D] hover:bg-[#006B5D]/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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