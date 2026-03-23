import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarItem {
  id: string;
  label: string;
  roles: ('SYSTEM_ADMIN' | 'ORG_ADMIN' | 'EMPLOYEE')[];
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

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/organizations')) return 'organizations';
    if (path.startsWith('/complaints')) return 'complaints';
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  const allItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', roles: ['SYSTEM_ADMIN'] },
    { id: 'organizations', label: 'Organizations', roles: ['SYSTEM_ADMIN'] },
    { id: 'complaints', label: 'Complaints', roles: ['ORG_ADMIN', 'EMPLOYEE'] },
    { id: 'users', label: 'Employee Mgmt', roles: ['ORG_ADMIN'] },
    { id: 'settings', label: 'Profile', roles: ['SYSTEM_ADMIN', 'ORG_ADMIN', 'EMPLOYEE'] },
  ];

  const filteredItems = allItems.filter(item =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const getIcon = (id: string) => {
    switch (id) {
      case 'dashboard':
        return <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />;
      case 'organizations':
        return <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
      case 'complaints':
        return <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
      case 'users':
        return <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />;
      case 'settings':
        return <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Dark Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Wrapper */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col font-sans transition-all duration-300 z-50
          ${isCollapsed ? 'md:w-20' : 'md:w-64'} 
          ${isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-100 rounded-full items-center justify-center text-slate-400 hover:text-[#006B5D] hover:border-[#006B5D] z-50 shadow-sm transition-all"
        >
          <svg className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header Profile Section */}
        <div className={`p-6 mb-4 flex items-center justify-between`}>
          <div className="flex items-center overflow-hidden">
            <div className="text-emerald-800 shrink-0">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 22h20V10h-4V4h-4v4h-4v6H2v8zM7 16h2v2H7v-2zm0 3h2v2H7v-2zm5-11h2v2h-2V8zm0 3h2v2h-2v-2zm0 3h2v2h-2v-2zm0 3h2v2h-2v-2zm5-7h2v2h-2v-2zm0 3h2v2h-2v-2zm0 3h2v2h-2v-2z"/>
               </svg>
            </div>
            <div className={`ml-3 transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
              <h2 className="text-[15px] font-bold text-slate-800 whitespace-nowrap">System Admin</h2>
              <p className="text-[11px] text-slate-400 whitespace-nowrap">City Hall • Main Office</p>
            </div>
          </div>
          
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
             <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {filteredItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/${item.id}`);
                  if (window.innerWidth < 768) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center py-3.5 transition-all relative group ${
                  isActive ? 'bg-[#EBF5F3] text-[#006B5D]' : 'text-slate-500 hover:bg-gray-50'
                } ${isCollapsed ? 'md:justify-center' : 'px-6'}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006B5D]" />
                )}
                
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center ${isActive ? 'text-[#006B5D]' : 'text-slate-400'} ${!isCollapsed && 'mr-4'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {getIcon(item.id)}
                  </svg>
                </div>
                
                <span className={`text-sm whitespace-nowrap transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium'} ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        {user && (
          <div className="p-4 mt-auto border-t border-gray-100">
            <button
              onClick={logout}
              className={`w-full flex items-center py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isCollapsed ? 'md:justify-center' : 'px-4'}`}
            >
              <LogOut size={20} className={!isCollapsed ? "mr-4" : ""} />
              <span className={`text-sm font-medium ${isCollapsed ? 'md:hidden' : 'block'}`}>Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;