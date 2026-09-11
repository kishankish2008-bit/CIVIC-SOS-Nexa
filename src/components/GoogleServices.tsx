import React from 'react';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Database, 
  Cloud, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

export const GoogleServices: React.FC<{ className?: string }> = ({ className = '' }) => {
  const services = [
    {
      name: 'Gemini 3.8 Flash',
      role: 'Multimodal AI',
      icon: Sparkles,
      iconColor: 'text-blue-500',
    },
    {
      name: 'Google Search',
      role: 'Real-time verification',
      icon: Search,
      iconColor: 'text-rose-500',
    },
    {
      name: 'Google Maps',
      role: 'Location & navigation',
      icon: MapPin,
      iconColor: 'text-emerald-500',
    },
    {
      name: 'Firebase',
      role: 'Secure backend',
      icon: Database,
      iconColor: 'text-amber-500',
    },
    {
      name: 'Cloud Run',
      role: 'Scalable deployment',
      icon: Cloud,
      iconColor: 'text-sky-500',
    },
    {
      name: 'App Check',
      role: 'Security & safety',
      icon: ShieldCheck,
      iconColor: 'text-indigo-500',
    },
  ];

  return (
    <div className={`bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between shadow-sm ${className}`}>
      <div>
        {/* Header with Google G Icon */}
        <div className="flex items-center gap-2.5 pb-2">
          {/* Official Google G 4-color SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.26A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            NEXA is powered by Google
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          NEXA integrates Google's powerful ecosystem to bring real-world intelligence and action.
        </p>

        {/* 2x3 Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.name}
                className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5"
              >
                <div className="p-1 rounded-md bg-white dark:bg-slate-800 shadow-2xs shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${srv.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-none">
                    {srv.name}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                    {srv.role}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Quote Banner */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400 italic">
        <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>“A safer, smarter and more connected world.”</span>
      </div>
    </div>
  );
};
