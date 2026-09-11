import React, { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../security/authContext';
import { 
  Search, 
  ChevronDown, 
  Menu, 
  User, 
  CheckCircle2, 
  Settings, 
  Sparkles, 
  LogOut,
  LogIn,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { ScreenView } from '../types';

interface TopNavProps {
  currentView?: ScreenView;
  onOpenMobileMenu?: () => void;
  onToggleMobileMenu?: () => void;
  onSearchSubmit?: (query: string) => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  onNavigate: (view: ScreenView) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onOpenMobileMenu,
  onToggleMobileMenu,
  onSearchSubmit,
  onOpenHelp,
  onOpenSettings,
  onNavigate,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMobileMenu = () => {
    if (typeof onOpenMobileMenu === 'function') {
      onOpenMobileMenu();
    } else if (typeof onToggleMobileMenu === 'function') {
      onToggleMobileMenu();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery);
      } else {
        onNavigate('input');
      }
    }
  };

  const displayName = user?.displayName || user?.fullName || (user?.email ? user.email.split('@')[0] : 'Operator');
  const initial = (displayName[0] || 'O').toUpperCase();
  const isVerified = Boolean(user && (user.emailVerified || user.phoneVerified));

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Mobile Sidebar Hamburger + Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={handleMobileMenu}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">NEXA</span>
      </div>

      {/* Center/Left: Search Bar with Ctrl+K */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search or enter a request...  Ctrl + K"
            className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
          />
          <div className="absolute right-2.5 hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/70 dark:bg-slate-800 rounded border border-slate-300/60 dark:border-slate-700">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Notifications, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Notifications Icon with active pulse */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotificationToast((prev) => !prev)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Notifications & System Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-[#0B0F17]" />
          </button>

          {showNotificationToast && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Alerts & Status</span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">All Systems Green</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Active Protection</div>
                    <div className="text-[11px] text-slate-500">Firebase App Check & SSRF gatekeepers active.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Switch */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            id="user-profile-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            aria-expanded={profileDropdownOpen}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initial}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                  {displayName}
                </span>
                {isVerified && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {isAuthenticated 
                  ? (user?.provider === 'google' || user?.provider === 'google.com' ? 'Google Account' : user?.provider === 'phone' ? 'Phone Account' : 'Email Account')
                  : 'Guest'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName || displayName}
                  </div>
                  {isVerified ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      Verified
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                      Unverified
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.email || user?.phone || 'No identity connected'}
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Account & Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof onOpenSettings === 'function') {
                      onOpenSettings();
                    } else {
                      onNavigate('settings');
                    }
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preferences & Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof onOpenHelp === 'function') {
                      onOpenHelp();
                    }
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer font-medium"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
