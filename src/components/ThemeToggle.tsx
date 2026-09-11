import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <Sun
        className={`w-3.5 h-3.5 transition-colors ${
          !isDark ? 'text-amber-500 font-bold' : 'text-slate-400'
        }`}
      />
      <div className="relative w-8 h-4 bg-slate-200 dark:bg-blue-600 rounded-full transition-colors">
        <div
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isDark ? 'transform translate-x-4' : 'transform translate-x-0'
          }`}
        />
      </div>
      <Moon
        className={`w-3.5 h-3.5 transition-colors ${
          isDark ? 'text-blue-400 font-bold' : 'text-slate-400'
        }`}
      />
    </button>
  );
};
