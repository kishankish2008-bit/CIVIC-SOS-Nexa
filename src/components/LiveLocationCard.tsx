import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, RefreshCw, Radio, CheckCircle2, AlertCircle } from 'lucide-react';
import { LocationData } from '../types';

interface LiveLocationCardProps {
  location: LocationData | null;
  status: string;
  isTracking: boolean;
  errorMessage: string | null;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onRefresh: () => void;
  onSetCustomLocation: (city: string, country: string, lat?: number, lng?: number) => void;
}

export const LiveLocationCard: React.FC<LiveLocationCardProps> = ({
  location,
  status,
  isTracking,
  errorMessage,
  onStartTracking,
  onStopTracking,
  onRefresh,
  onSetCustomLocation
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCity, setCustomCity] = useState('');

  const PRESET_CITIES = [
    { name: 'Bengaluru (MG Road / Koramangala)', city: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946 },
    { name: 'Mumbai (Bandra Kurla Complex)', city: 'Mumbai', country: 'India', lat: 19.0657, lng: 72.8687 },
    { name: 'New Delhi (AIIMS / Connaught Place)', city: 'New Delhi', country: 'India', lat: 28.5672, lng: 77.2100 },
    { name: 'Hyderabad (Hitec City)', city: 'Hyderabad', country: 'India', lat: 17.4435, lng: 78.3772 },
  ];

  const mapsUrl = location?.latitude && location?.longitude
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : `https://www.google.com/maps?q=Bengaluru,India`;

  return (
    <div id="live-location-card" className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isTracking ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'}`}>
            <Navigation className={`w-4 h-4 ${isTracking ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <span>Live Location Intelligence</span>
              {isTracking && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  TRACKING ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {location?.city ? `${location.city}, ${location.country}` : 'Device GPS Ready'}
            </p>
          </div>
        </div>

        {/* Tracking action buttons */}
        <div className="flex items-center gap-1.5">
          {isTracking ? (
            <button
              id="stop-tracking-btn"
              onClick={onStopTracking}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              Stop Tracking
            </button>
          ) : (
            <button
              id="start-tracking-btn"
              onClick={onStartTracking}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Start Live Tracking</span>
            </button>
          )}

          <button
            id="refresh-gps-btn"
            onClick={onRefresh}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            title="Refresh GPS Fix"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            <button
              onClick={() => setShowCustomModal(true)}
              className="ml-2 underline font-semibold text-amber-900 dark:text-amber-100"
            >
              Select preset region
            </button>
          </div>
        </div>
      )}

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/50">
        <div>
          <span className="text-[10px] text-muted-foreground block font-mono">COORDINATES</span>
          <span className="font-mono font-medium text-foreground">
            {location?.latitude ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°` : 'Pending Fix'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-mono">ACCURACY</span>
          <span className="font-mono font-medium text-foreground">
            {location?.accuracy ? `±${Math.round(location.accuracy)} m` : '±12 m (GPS)'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-mono">FRESHNESS</span>
          <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {location?.freshness || 'LIVE'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-mono">UPDATED</span>
          <span className="font-mono font-medium text-foreground">
            {location?.timestamp ? new Date(location.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
          </span>
        </div>
      </div>

      {/* Footer link to maps and preset switcher */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-xs">
        <button
          onClick={() => setShowCustomModal(!showCustomModal)}
          className="text-muted-foreground hover:text-foreground text-[11px] underline"
        >
          {showCustomModal ? 'Hide Presets' : 'Simulate / Change Region'}
        </button>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium text-[11px] flex items-center gap-1"
        >
          <span>Open Coordinates in Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Preset Region Selector */}
      {showCustomModal && (
        <div className="mt-3 p-3 bg-background border border-border rounded-lg text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="font-medium text-muted-foreground mb-2">Select a region to simulate location context:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PRESET_CITIES.map((c) => (
              <button
                key={c.city}
                onClick={() => {
                  onSetCustomLocation(c.city, c.country, c.lat, c.lng);
                  setShowCustomModal(false);
                }}
                className="text-left px-2.5 py-1.5 rounded bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors text-xs flex items-center justify-between"
              >
                <span>{c.name}</span>
                <MapPin className="w-3 h-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
