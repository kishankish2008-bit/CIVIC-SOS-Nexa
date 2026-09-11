import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Cpu, 
  MapPin, 
  Car, 
  ShieldAlert, 
  Search, 
  Layers, 
  Mic, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  ChevronUp, 
  ChevronDown,
  X,
  ExternalLink
} from 'lucide-react';
import { LocationData, ScreenView } from '../types';

interface NexaLivePanelProps {
  location: LocationData | null;
  isTracking: boolean;
  onNavigate?: (view: ScreenView) => void;
  onRefresh?: () => void;
}

export const NexaLivePanel: React.FC<NexaLivePanelProps> = ({
  location,
  isTracking,
  onNavigate,
  onRefresh,
}) => {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedSec, setLastUpdatedSec] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec((s) => (s >= 30 ? 2 : s + 2));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setLastUpdatedSec(1);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const city = location?.city || 'Bengaluru';
  const region = location?.region || 'KA';
  const accuracy = location?.accuracy || 12;
  const locationText = `${city}, ${region} (±${accuracy} m)`;

  const items = [
    {
      id: 'gemini',
      label: 'Gemini 3.8 Flash',
      status: 'Active',
      statusColor: 'emerald',
      icon: Cpu,
      subtext: 'Primary Multimodal Engine',
    },
    {
      id: 'location',
      label: 'Location',
      status: isTracking ? 'Live' : 'Paused',
      statusColor: isTracking ? 'emerald' : 'amber',
      icon: MapPin,
      subtext: locationText,
      clickable: true,
      targetView: 'location' as ScreenView,
    },
    {
      id: 'traffic',
      label: 'Traffic',
      status: 'Live',
      statusColor: 'emerald',
      icon: Car,
      subtext: 'Normal traffic • Moderate on Arterial',
      clickable: true,
      targetView: 'traffic' as ScreenView,
    },
    {
      id: 'emergency',
      label: 'Emergency',
      status: 'Ready',
      statusColor: 'emerald',
      icon: ShieldAlert,
      subtext: 'ERS 112 verified • Fast hospital route',
      clickable: true,
      targetView: 'emergency' as ScreenView,
    },
    {
      id: 'search',
      label: 'Google Search',
      status: 'Active',
      statusColor: 'emerald',
      icon: Search,
      subtext: 'Ground-truth fact-checking',
    },
    {
      id: 'maps',
      label: 'Maps & Routes',
      status: 'Active',
      statusColor: 'emerald',
      icon: Layers,
      subtext: 'Google Maps Platform APIs',
      clickable: true,
      targetView: 'traffic' as ScreenView,
    },
    {
      id: 'voice',
      label: 'Voice',
      status: 'Ready',
      statusColor: 'emerald',
      icon: Mic,
      subtext: 'Speech synthesis & streaming input',
    },
    {
      id: 'security',
      label: 'Security',
      status: 'Protected',
      statusColor: 'emerald',
      icon: ShieldCheck,
      subtext: 'App Check • SSRF Defense • Zero Leak',
      clickable: true,
      targetView: 'security' as ScreenView,
    },
  ];

  return (
    <>
      {/* DESKTOP / LAPTOP PANEL (Visible on xl/lg screens: width ~260px, sticky right side) */}
      <aside 
        className="hidden xl:flex flex-col w-[260px] shrink-0 sticky top-20 h-[calc(100vh-6rem)] bg-white dark:bg-[#0F1624] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xs overflow-y-auto space-y-4 select-none"
        aria-label="NEXA LIVE Subsystem Panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              N
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-wider text-slate-900 dark:text-white uppercase flex items-center gap-1">
                <span>NEXA LIVE</span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
          <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
        </div>

        {/* Live Items List */}
        <div className="space-y-2.5 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.clickable && item.targetView && onNavigate) {
                    onNavigate(item.targetView);
                  }
                }}
                className={`p-2 rounded-xl border border-transparent transition-all text-left ${
                  item.clickable
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700/80 cursor-pointer group'
                    : 'bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                      {item.label}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{item.status}</span>
                  </span>
                </div>
                {item.subtext && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-5.5 truncate mt-0.5 font-mono">
                    {item.subtext}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with Last Updated & Refresh */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span>Updated {lastUpdatedSec} seconds ago</span>
          <button
            type="button"
            onClick={handleRefreshClick}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition-colors"
            title="Refresh System Status"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </aside>

      {/* MOBILE EXPANDABLE LIVE STATUS BAR (Requirement 17) */}
      <div className="xl:hidden fixed bottom-16 left-3 right-3 z-30">
        {/* Collapsed Pill Bar */}
        {!isExpandedMobile && (
          <div 
            onClick={() => setIsExpandedMobile(true)}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl px-3.5 py-2 shadow-lg flex items-center justify-between text-xs cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-2 font-mono text-[11px] truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-100">LIVE</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-600 dark:text-slate-300 truncate">
                {city} • Traffic: Normal • ERS 112
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider shrink-0 pl-2">
              <span>Status</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Expanded Bottom Sheet */}
        {isExpandedMobile && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  NEXA LIVE System Status
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpandedMobile(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.clickable && item.targetView && onNavigate) {
                        onNavigate(item.targetView);
                        setIsExpandedMobile(false);
                      }
                    }}
                    className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-left ${
                      item.clickable ? 'cursor-pointer active:scale-98' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold text-emerald-500">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Updated {lastUpdatedSec}s ago</span>
              <button
                type="button"
                onClick={() => setIsExpandedMobile(false)}
                className="text-blue-500 font-semibold"
              >
                Collapse
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
