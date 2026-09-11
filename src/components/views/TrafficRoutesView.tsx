import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  Car, 
  Bike, 
  Footprints, 
  ArrowUpDown, 
  Navigation, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { LocationData, ScreenView, TrafficRoute } from '../../types';

interface TrafficRoutesViewProps {
  location: LocationData | null;
  onNavigate: (view: ScreenView) => void;
}

export const TrafficRoutesView: React.FC<TrafficRoutesViewProps> = ({
  location,
  onNavigate,
}) => {
  const [origin, setOrigin] = useState<string>(
    location?.formattedAddress || 'Koramangala, Bengaluru, Karnataka'
  );
  const [destination, setDestination] = useState<string>(
    'Manipal Hospital Emergency, Old Airport Road, Bengaluru'
  );
  const [mode, setMode] = useState<'drive' | 'bike' | 'walk'>('drive');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-fastest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('9 seconds ago');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated('Just now');
    }, 600);
  };

  const routes: TrafficRoute[] = [
    {
      id: 'route-fastest',
      name: 'Via Intermediate Ring Road',
      distanceKm: 5.2,
      durationMin: mode === 'drive' ? 18 : mode === 'bike' ? 15 : 62,
      trafficLevel: 'moderate',
      trafficCondition: 'Moderate Traffic',
      delayMin: 3,
      isRecommended: true,
      summary: 'Fastest Route (Recommended)',
      explanation: 'Saves 4 minutes. Active green corridor and avoids Koramangala junction congestion.',
    },
    {
      id: 'route-alt-1',
      name: 'Via 100 Feet Road',
      distanceKm: 6.1,
      durationMin: mode === 'drive' ? 22 : mode === 'bike' ? 18 : 74,
      trafficLevel: 'heavy',
      trafficCondition: 'Heavy Traffic',
      delayMin: 7,
      isRecommended: false,
      summary: 'Alternative Route 1',
      explanation: '7 min delay due to signal cycle backlogs at 12th Main intersection.',
    },
    {
      id: 'route-alt-2',
      name: 'Via Old Airport Road Link',
      distanceKm: 5.8,
      durationMin: mode === 'drive' ? 20 : mode === 'bike' ? 16 : 70,
      trafficLevel: 'light',
      trafficCondition: 'Light Traffic',
      delayMin: 1,
      isRecommended: false,
      summary: 'Alternative Route 2',
      explanation: 'Free flowing but narrow feeder lanes with higher speed variance.',
    },
  ];

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode === 'bike' ? 'bicycling' : mode === 'walk' ? 'walking' : 'driving'}`;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Traffic & Routes
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time multi-corridor route and congestion intelligence.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Traffic</span>
        </button>
      </div>

      {/* Origin & Destination Card */}
      <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Origin Input */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 ml-1" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin location..."
                className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Destination Input */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 ml-1" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination address or facility..."
                className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Travel Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('drive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mode === 'drive'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('bike')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mode === 'bike'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Two-wheeler</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('walk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mode === 'walk'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Route Comparison Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Available Live Routes ({routes.length})
          </span>
          <span>Live traffic data • Updated {lastUpdated}</span>
        </div>

        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const isLight = route.trafficLevel === 'light';
          const isModerate = route.trafficLevel === 'moderate';

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-400/30'
                  : 'bg-white dark:bg-[#161E2E] border-slate-200/90 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {route.name}
                    </span>
                    {route.isRecommended && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {route.explanation}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="space-y-0.5">
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                      {route.durationMin} mins
                    </div>
                    <div className="text-xs text-slate-400">
                      {route.distanceKm} km
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                      : isModerate
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
                  }`}>
                    {route.trafficCondition}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
