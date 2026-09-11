import React from 'react';

interface NexaLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NexaLogo: React.FC<NexaLogoProps> = ({
  className = '',
  showSubtitle = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Stylized Modern N Mark */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} shrink-0`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Smooth modern dynamic geometric N in vibrant Google Blue & soft indigo */}
          <path
            d="M8 32V10C8 8.89543 8.89543 8 10 8H12.5C13.8 8 15 8.7 15.6 9.8L25.4 28.2C26 29.3 27.2 30 28.5 30H30C31.1046 30 32 29.1046 32 28V8"
            stroke="url(#nexa-gradient)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="9" r="3.5" fill="#2563EB" />
          <circle cx="31" cy="31" r="3.5" fill="#3B82F6" />
          <defs>
            <linearGradient id="nexa-gradient" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="0.6" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <div className={`font-extrabold tracking-tight font-sans text-slate-900 dark:text-white leading-none ${titleSizes[size]}`}>
          NEXA
        </div>
        {showSubtitle && (
          <span className="text-[10px] tracking-wide text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            From Intent to Impact
          </span>
        )}
      </div>
    </div>
  );
};
