import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Trash2, 
  Download,
  Cpu
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  historyCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearHistory,
  historyCount,
}) => {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Preferences & Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure theme, AI models, and local audit storage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              Appearance
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-medium transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-950/50 text-blue-400 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                Primary Intelligence Engine
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Online & Verified
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Gemini 3.8 Flash</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Failover to Flash-Latest & Flash-Lite enabled
                  </div>
                </div>
              </div>
              <Cpu className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Audit History Management */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              Audit Data ({historyCount} events recorded)
            </label>
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Audit logs are stored locally in accordance with security guidelines.
              </div>
              {historyCount > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-medium flex items-center gap-1.5 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
