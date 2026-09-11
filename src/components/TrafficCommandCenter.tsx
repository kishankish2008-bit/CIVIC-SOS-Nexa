import React, { useState } from 'react';
import { Layers, Clock, Navigation, AlertTriangle, CheckCircle2, RefreshCw, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { TrafficComparison, TrafficRoute } from '../types';

interface TrafficCommandCenterProps {
  trafficComparison?: TrafficComparison | null;
  destinationName?: string;
  originName?: string;
  onRefreshRoute?: () => void;
}

export const TrafficCommandCenter: React.FC<TrafficCommandCenterProps> = ({
  trafficComparison,
  destinationName = 'Apex Trauma & Multi-Specialty Hospital',
  originName = 'Current Location',
  onRefreshRoute
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Fallback defaults if none passed
  const comparison: TrafficComparison = trafficComparison || {
    origin: originName,
    destination: destinationName,
    recommendedRouteId: 'route-fastest',
    recommendationReason: 'Saves 7 minutes vs Expressway and completely bypasses localized waterlogged underpasses.',
    lastUpdated: new Date().toISOString(),
    routes: [
      {
        id: 'route-fastest',
        name: 'Primary Arterial Boulevard',
        distanceKm: 2.4,
        durationMin: 7,
        trafficCondition: 'Moderate Traffic',
        congestionDelayMin: 1,
        isRecommended: true,
        reason: 'Fastest verified transit with active green-corridor priority for emergency dispatch.',
        polylineSummary: 'Residency Rd -> Hosur Rd Junction'
      },
      {
        id: 'route-inner-ring',
        name: 'Inner Ring Expressway',
        distanceKm: 4.8,
        durationMin: 14,
        trafficCondition: 'Heavy Congestion',
        congestionDelayMin: 7,
        isRecommended: false,
        reason: 'Severe slowdown due to bottleneck at Exit 4 and weather runoff.',
        polylineSummary: 'Domlur Flyover -> Koramangala Link'
      },
      {
        id: 'route-secondary',
        name: 'Secondary Transit Link',
        distanceKm: 3.9,
        durationMin: 18,
        trafficCondition: 'Severe Bottleneck',
        congestionDelayMin: 11,
        isRecommended: false,
        reason: 'Low-water underpass drainage backup causing multi-lane merging delay.',
        polylineSummary: 'Old Airport Road Detour'
      }
    ]
  };

  const selectedRoute = comparison.routes.find(r => r.id === (selectedRouteId || comparison.recommendedRouteId)) || comparison.routes[0];

  const getTrafficColor = (condition: string) => {
    if (condition.toLowerCase().includes('light')) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (condition.toLowerCase().includes('moderate')) return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div id="traffic-command-center" className="bg-card border border-border rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">
                Traffic Intelligence & Route Optimization
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> LIVE ROUTES API
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {comparison.origin} → {comparison.destination}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshRoute && (
            <button
              id="refresh-routes-btn"
              onClick={onRefreshRoute}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Traffic</span>
            </button>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(comparison.origin)}&destination=${encodeURIComponent(comparison.destination)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Rationale for Recommendation */}
      <div className="mt-3.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-800 dark:text-emerald-300 block font-mono text-[11px]">
            RECOMMENDED ROUTE SELECTION RATIONALE:
          </span>
          <p className="text-emerald-900 dark:text-emerald-200 mt-0.5">
            {comparison.recommendationReason}
          </p>
        </div>
      </div>

      {/* Routes Comparison Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {comparison.routes.map((route) => {
          const isSelected = (selectedRouteId || comparison.recommendedRouteId) === route.id;
          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`cursor-pointer rounded-lg p-3.5 border transition-all text-xs relative ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
                  : 'border-border bg-background hover:bg-muted/50'
              }`}
            >
              {route.isRecommended && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-600 text-white shadow-xs">
                  FASTEST / RECOMMENDED
                </span>
              )}

              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-bold text-sm text-foreground">{route.name}</span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-black font-mono text-foreground">{route.durationMin}</span>
                <span className="text-xs font-mono text-muted-foreground">MIN</span>
                <span className="text-xs text-muted-foreground font-mono">({route.distanceKm} km)</span>
              </div>

              <div className="flex items-center justify-between gap-1 text-[11px] mb-2 font-mono">
                <span className={`px-2 py-0.5 rounded border ${getTrafficColor(route.trafficCondition)}`}>
                  {route.trafficCondition}
                </span>
                {route.congestionDelayMin > 0 && (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    +{route.congestionDelayMin}m delay
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground leading-snug">
                {route.reason}
              </p>

              {route.polylineSummary && (
                <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5" />
                  <span className="truncate">{route.polylineSummary}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
