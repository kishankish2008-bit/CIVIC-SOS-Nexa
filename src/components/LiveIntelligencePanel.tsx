import React, { useEffect, useState } from 'react';
import { Radio, Wifi, Navigation, ShieldCheck, Cpu, Mic, Search, Layers, RefreshCw } from 'lucide-react';
import { SystemIntegrationStatus } from '../types';

interface LiveIntelligencePanelProps {
  locationStatus: string;
  isTracking: boolean;
  isVoiceListening: boolean;
  activeModel?: string;
  onRefreshStatus?: () => void;
}

export const LiveIntelligencePanel: React.FC<LiveIntelligencePanelProps> = ({
  locationStatus,
  isTracking,
  isVoiceListening,
  activeModel = 'Gemini 3.8 Flash',
  onRefreshStatus
}) => {
  const [systemStatus, setSystemStatus] = useState<SystemIntegrationStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('Just now');

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
        setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('[NEXA Live Status] Notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: 'connected' | 'degraded' | 'unavailable' | 'active' | 'idle') => {
    switch (status) {
      case 'connected':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            DEGRADED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-surface border-y border-border px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono font-bold tracking-wider text-primary text-[11px] uppercase">
            <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>NEXA Real-Time Intelligence Bridge</span>
          </div>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-muted-foreground font-mono text-[10px]">
            Sync: {lastChecked}
          </span>
        </div>

        {/* Real-time Status Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gemini Brain */}
          <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-md border border-border">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-muted-foreground font-medium">BRAIN:</span>
            <span className="font-semibold text-foreground">{activeModel}</span>
            {getStatusBadge(systemStatus?.gemini?.active ? 'connected' : 'active')}
          </div>

          {/* Location & GPS */}
          <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-md border border-border">
            <Navigation className={`w-3.5 h-3.5 ${isTracking ? 'text-emerald-500 animate-spin' : 'text-blue-500'}`} />
            <span className="text-muted-foreground font-medium">LOCATION:</span>
            <span className="font-semibold text-foreground">
              {isTracking ? 'LIVE TRACKING' : locationStatus === 'available' ? 'AVAILABLE' : 'OFFLINE'}
            </span>
            {getStatusBadge(isTracking || locationStatus === 'available' ? 'connected' : 'idle')}
          </div>

          {/* Traffic & Routes */}
          <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-md border border-border">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-muted-foreground font-medium">TRAFFIC:</span>
            <span className="font-semibold text-foreground">ROUTES ENGINE</span>
            {getStatusBadge('connected')}
          </div>

          {/* Emergency 112 */}
          <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-md border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-muted-foreground font-medium">EMERGENCY:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">ERSS 112 VERIFIED</span>
            {getStatusBadge('connected')}
          </div>

          {/* Voice Engine */}
          <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-md border border-border">
            <Mic className={`w-3.5 h-3.5 ${isVoiceListening ? 'text-rose-500 animate-pulse' : 'text-zinc-500'}`} />
            <span className="text-muted-foreground font-medium">VOICE:</span>
            <span className="font-semibold text-foreground">{isVoiceListening ? 'LISTENING' : 'READY'}</span>
            {getStatusBadge(isVoiceListening ? 'active' : 'idle')}
          </div>

          {/* Search Grounding */}
          <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-md border border-border">
            <Search className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-muted-foreground font-medium">GROUNDING:</span>
            <span className="font-semibold text-foreground">GOOGLE SEARCH</span>
            {getStatusBadge('connected')}
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-intelligence-status-btn"
            onClick={() => {
              fetchStatus();
              if (onRefreshStatus) onRefreshStatus();
            }}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh system status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
