import React from 'react';
import { ScreenView } from '../types';
import { NexaLogo } from './NexaLogo';
import { useAuth } from '../security/authContext';
import { 
  Home, 
  ScanLine, 
  Cpu, 
  FileText, 
  Sliders, 
  LayoutGrid, 
  Clock, 
  Settings, 
  ChevronRight,
  User,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  hasActiveResult: boolean;
  historyCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  hasActiveResult,
  historyCount,
  isOpenMobile,
  onCloseMobile,
  isMobileOpen,
  onMobileClose,
  onOpenSettings,
}) => {
  const { user } = useAuth();
  const activeMobileOpen = isOpenMobile ?? isMobileOpen ?? false;
  const activeMobileClose = onCloseMobile || onMobileClose;

  // Clean, focused sidebar matching reference specification
  const navItems = [
    { id: 'landing' as ScreenView, label: 'Home', icon: Home },
    { id: 'input' as ScreenView, label: 'Universal Input', icon: ScanLine },
    { id: 'processing' as ScreenView, label: 'AI Core', icon: Cpu },
    { 
      id: 'situation' as ScreenView, 
      label: 'Situation Card', 
      icon: FileText,
      disabled: !hasActiveResult,
      tooltip: !hasActiveResult ? 'Analyze an input first' : undefined
    },
    { 
      id: 'action' as ScreenView, 
      label: 'Action Cockpit', 
      icon: Sliders,
      disabled: !hasActiveResult,
      tooltip: !hasActiveResult ? 'Generate actions first' : undefined
    },
    { id: 'scenarios' as ScreenView, label: 'Scenarios', icon: LayoutGrid },
    { 
      id: 'history' as ScreenView, 
      label: 'History', 
      icon: Clock,
      badge: historyCount > 0 ? String(historyCount) : undefined
    },
    { 
      id: 'settings' as ScreenView, 
      label: 'Settings', 
      icon: Settings,
      hasChevron: true 
    },
  ];

  const handleNavClick = (id: ScreenView) => {
    if (id === 'settings') {
      if (typeof onOpenSettings === 'function') {
        onOpenSettings();
      } else {
        onNavigate('settings');
      }
    } else {
      onNavigate(id);
    }
    if (typeof activeMobileClose === 'function') {
      activeMobileClose();
    }
  };

  const displayName = user?.displayName || user?.fullName || (user?.email ? user.email.split('@')[0] : 'Operator');
  const displayEmail = user?.email || user?.phone || 'Authenticated Session';
  const initial = (displayName[0] || 'O').toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {activeMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={activeMobileClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-white dark:bg-[#0F1624] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out select-none ${
          activeMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-2">
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className="text-left focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg cursor-pointer"
            >
              <NexaLogo size="md" />
            </button>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  disabled={item.disabled}
                  title={item.tooltip}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : item.disabled
                      ? 'text-slate-400/60 dark:text-slate-600 cursor-not-allowed opacity-50'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                    {item.hasChevron && (
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-600 dark:text-blue-400 translate-x-0.5' : 'text-slate-400'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile Card matching visual reference */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <button
            type="button"
            id="sidebar-profile-card"
            onClick={() => handleNavClick('settings')}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800/80 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {displayEmail}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </button>

          <div className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
            From Intent to Impact
          </div>
        </div>
      </aside>
    </>
  );
};
