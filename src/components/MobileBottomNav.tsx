import React from 'react';
import { Home, LayoutGrid, Mic, Clock, Settings, Sparkles } from 'lucide-react';
import { ScreenView } from '../types';

interface MobileBottomNavProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  onOpenQuickVoice?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenQuickVoice,
}) => {
  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-around select-none"
      aria-label="Mobile Navigation"
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => onNavigate('landing')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
          currentView === 'landing'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-[10px]">Home</span>
      </button>

      {/* 2. Scenarios */}
      <button
        type="button"
        onClick={() => onNavigate('scenarios')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
          currentView === 'scenarios'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-[10px]">Scenarios</span>
      </button>

      {/* 3. Center Quick Action / Mic Floating Circle Button */}
      <button
        type="button"
        onClick={() => {
          if (onOpenQuickVoice) {
            onOpenQuickVoice();
          } else {
            onNavigate('input');
          }
        }}
        className="w-12 h-12 -mt-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-white dark:ring-[#0B0F17] active:scale-95 transition-all"
        title="Universal Intake"
      >
        <Mic className="w-5 h-5" />
      </button>

      {/* 4. History */}
      <button
        type="button"
        onClick={() => onNavigate('history')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
          currentView === 'history'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span className="text-[10px]">History</span>
      </button>

      {/* 5. Settings */}
      <button
        type="button"
        onClick={() => onNavigate('settings')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
          currentView === 'settings'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Settings className="w-4 h-4" />
        <span className="text-[10px]">Settings</span>
      </button>
    </nav>
  );
};
