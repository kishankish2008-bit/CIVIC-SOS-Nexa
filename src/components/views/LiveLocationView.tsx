import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Navigation, 
  Radio, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Compass, 
  Gauge, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { LocationData, ScreenView } from '../../types';
import { InteractiveLiveMap } from '../InteractiveLiveMap';

interface LiveLocationViewProps {
  location: LocationData | null;
  status: string;
  isTracking: boolean;
  accuracyQuality: 'excellent' | 'good' | 'moderate' | 'low' | 'unavailable';
  speedKmH: number;
  lastUpdatedText: string;
  errorMessage: string | null;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onRefresh: () => void;
  onSetCustomLocation: (city: string, country: string, lat?: number, lng?: number) => void;
  onNavigate: (view: ScreenView) => void;
}

export const LiveLocationView: React.FC<LiveLocationViewProps> = ({
  location,
  status,
  isTracking,
  accuracyQuality,
  speedKmH,
  lastUpdatedText,
  errorMessage,
  onStartTracking,
  onStopTracking,
  onRefresh,
  onSetCustomLocation,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);

  const lat = location?.latitude ?? 12.9352;
  const lng = location?.longitude ?? 77.6245;
  const accuracy = location?.accuracy ?? 12;
  const city = location?.city ?? 'Bengaluru';
  const region = location?.region ?? 'Karnataka';
  const country = location?.country ?? 'India';
  const address = location?.formattedAddress ?? `${city}, ${region}, ${country}`;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PRESET_CORRIDORS = [
    { name: 'Bengaluru (Koramangala / MG Rd)', city: 'Bengaluru', country: 'India', lat: 12.9352, lng: 77.6245 },
    { name: 'Mumbai (BKC / Bandra)', city: 'Mumbai', country: 'India', lat: 19.0657, lng: 72.8687 },
    { name: 'New Delhi (Connaught Place)', city: 'New Delhi', country: 'India', lat: 28.6304, lng: 77.2177 },
    { name: 'Hyderabad (Hitec City)', city: 'Hyderabad', country: 'India', lat: 17.4435, lng: 78.3772 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Status Header */}
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
                Live Location
              </h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isTracking
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isTracking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isTracking ? 'Live' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your current location is being tracked (with your permission).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh GPS</span>
          </button>

          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Real-time Map Canvas */}
      <InteractiveLiveMap
        latitude={lat}
        longitude={lng}
        accuracy={accuracy}
        city={city}
        isLive={isTracking}
      />

      {/* Two Column Grid: Location Details & Live Tracking Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Location Details */}
        <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {city}, {region}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {country}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={copyCoordinates}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1 font-mono">
            <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
              Formatted Postal Address:
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold font-sans">
              {address}
            </div>
            <div className="text-blue-600 dark:text-blue-400 pt-1 text-[11px]">
              GPS Coordinates: {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
            </div>
          </div>

          {/* Preset Location Test Corridors */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Test Region Corridors (MHA 112 Active):
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_CORRIDORS.map((p) => (
                <button
                  key={p.city}
                  type="button"
                  onClick={() => onSetCustomLocation(p.city, p.country, p.lat, p.lng)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left text-xs transition-all ${
                    city === p.city
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate">{p.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Tracking & 4-Metric Grid */}
        <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Tracking
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                • {lastUpdatedText}
              </span>
            </div>

            {isTracking ? (
              <button
                type="button"
                onClick={onStopTracking}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
              >
                Stop Tracking
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartTracking}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                Start Tracking
              </button>
            )}
          </div>

          {/* 4-Metric Grid: Source, Accuracy, Speed, Last Updated */}
          <div className="grid grid-cols-2 gap-3">
            {/* Metric 1: Source */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Radio className="w-3.5 h-3.5 text-blue-500" />
                <span>Source</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Device GPS
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                High Accuracy Mode
              </div>
            </div>

            {/* Metric 2: Accuracy */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Accuracy</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                ±{accuracy} meters
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                {accuracyQuality} Quality
              </div>
            </div>

            {/* Metric 3: Speed */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>Speed</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {speedKmH} km/h
              </div>
              <div className="text-[10px] text-slate-400">
                Stationary / Walking
              </div>
            </div>

            {/* Metric 4: Last Updated */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Last Updated</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {lastUpdatedText}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Real-Time Telemetry
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Encrypted on-device • Never shared without explicit human confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
