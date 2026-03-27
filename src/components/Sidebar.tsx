import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, X, LayoutDashboard, Building2, ShieldCheck, ClipboardList, Settings as SettingsIcon } from 'lucide-react';
import { useAuth, type Role } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // 1. Import hook

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  roles: Role[];
  icon: any;
}

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

const Sidebar = ({ isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation(); // 2. Initialize translation

  // 3. Labels are now localized using t()
  const allItems: SidebarItem[] = [
    { id: 'dashboard', label: t('sidebar.sys_overview'), path: '/dashboard', roles: ['SysAdmin'], icon: LayoutDashboard },
    { id: 'organizations', label: t('sidebar.organizations'), path: '/organizations', roles: ['SysAdmin'], icon: Building2 },
    { id: 'org-dashboard', label: t('sidebar.dashboard'), path: '/org-dashboard', roles: ['OrgAdmin'], icon: LayoutDashboard },
    { id: 'departments', label: t('sidebar.departments'), path: '/departments', roles: ['OrgAdmin'], icon: ShieldCheck },
    { id: 'complaints', label: t('sidebar.complaints'), path: '/complaints', roles: ['OrgAdmin', 'DeptAdmin'], icon: ClipboardList },
    { id: 'settings', label: t('sidebar.profile'), path: '/settings', roles: ['SysAdmin', 'OrgAdmin', 'DeptAdmin'], icon: SettingsIcon },
  ];

  const filteredItems = allItems.filter(item =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const activeItem = allItems.find(item => location.pathname.startsWith(item.path))?.id || 'dashboard';

  return (
    <>
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col font-sans transition-all duration-300 z-50
          ${isCollapsed ? 'md:w-20' : 'md:w-64'} 
          ${isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-100 rounded-full items-center justify-center text-slate-400 hover:text-[#006B5D] hover:border-[#006B5D] z-50 shadow-sm transition-all cursor-pointer"
        >
          <svg className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`p-6 mb-4 flex items-center justify-between`}>
          <div className="flex items-center overflow-hidden">
            <div className="text-[#006B5D] shrink-0">
               <Building2 size={isCollapsed ? 28 : 32} />
            </div>
            <div className={`ml-3 transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
              <h2 className="text-[14px] font-black text-slate-800 whitespace-nowrap uppercase tracking-tight">
                {/* 4. Localized Portal Titles */}
                {user?.role === 'SysAdmin' ? t('sidebar.sys_portal') : 
                 user?.role === 'OrgAdmin' ? t('sidebar.org_portal') : 
                 t('sidebar.dept_portal')}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600 cursor-pointer">
             <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {filteredItems.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 768) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center py-3 transition-all rounded-xl group mb-1 cursor-pointer ${
                  isActive ? 'bg-[#006B5D]/5 text-[#006B5D]' : 'text-slate-500 hover:bg-gray-50'
                } ${isCollapsed ? 'md:justify-center' : 'px-4'}`}
              >
                <div className={`shrink-0 flex items-center justify-center ${isActive ? 'text-[#006B5D]' : 'text-slate-400'} ${!isCollapsed && 'mr-3'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <span className={`text-[13px] whitespace-nowrap transition-all duration-300 ${isActive ? 'font-bold' : 'font-semibold'} ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 mt-auto border-t border-gray-100">
            <button
              onClick={logout}
              className={`w-full flex items-center py-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer ${isCollapsed ? 'md:justify-center' : 'px-4'}`}
            >
              <LogOut size={20} className={!isCollapsed ? "mr-3" : ""} />
              <span className={`text-[13px] font-bold uppercase tracking-wider ${isCollapsed ? 'md:hidden' : 'block'}`}>
                {/* 5. Localized Logout */}
                {t('sidebar.logout')}
              </span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;