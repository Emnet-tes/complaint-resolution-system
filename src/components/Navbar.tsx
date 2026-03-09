import { useState } from 'react';
import { Bell, Search, Settings, X, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            <h1 className="text-[#1E293B] text-lg md:text-xl font-bold whitespace-nowrap">
              <span className="hidden sm:inline">System Admin Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </h1>
          </>
        )}
      </div>

      {/* Right Side Actions */}
      <div className={`flex items-center ${isSearchOpen ? 'w-full' : 'space-x-2 md:space-x-4'}`}>
        
        {/* Mobile Search Field (Expands to fill bar) */}
        {isSearchOpen ? (
          <div className="flex items-center w-full animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
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
          /* Mobile Search Trigger Button (Visible only on mobile/small screens) */
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2.5 text-slate-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>   
        )}
        
        {/* Desktop Search Bar (Hidden on mobile) */}
        {!isSearchOpen && (
          <div className="relative group hidden md:block">
            <input
              type="text"
              placeholder="Global search..."
              className="w-48 lg:w-64 py-2 pl-4 pr-10 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#006B5D]/20 focus:border-[#006B5D] transition-all"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Action Icons */}
        {!isSearchOpen && (
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="relative p-2.5 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button className="hidden sm:block p-2.5 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 cursor-pointer">
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;