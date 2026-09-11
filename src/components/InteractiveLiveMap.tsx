import React, { useState } from 'react';
import { Plus, Minus, Navigation2, ExternalLink, Compass, Shield } from 'lucide-react';

interface InteractiveLiveMapProps {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  isLive?: boolean;
}

export const InteractiveLiveMap: React.FC<InteractiveLiveMapProps> = ({
  latitude,
  longitude,
  accuracy,
  city = 'Bengaluru',
  isLive = true,
}) => {
  const [zoom, setZoom] = useState<number>(15);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 12));
  const handleRecenter = () => setPanOffset({ x: 0, y: 0 });

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  // Calculate pixel radius for accuracy circle (scaled by zoom)
  const accuracyRadiusPx = Math.max(16, Math.min(120, (accuracy / 12) * (zoom - 10) * 8));

  return (
    <div 
      className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner select-none cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }}
      onMouseMove={(e) => {
        if (!isDragging) return;
        setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* SVG Map Canvas with realistic cartographic grid */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Street grid pattern */}
          <pattern id="street-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#334155" strokeWidth="1.5" strokeOpacity="0.4" />
            <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.3" />
          </pattern>
          {/* Major expressway arterial pattern */}
          <pattern id="expressway-grid" width="180" height="180" patternUnits="userSpaceOnUse">
            <path d="M 0 90 L 180 90 M 90 0 L 90 180" fill="none" stroke="#475569" strokeWidth="3" strokeOpacity="0.5" />
          </pattern>
          {/* Radial pulse gradient */}
          <radialGradient id="beacon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Map Background with cartographic tones */}
        <rect width="100%" height="100%" fill="#0f172a" />
        <rect width="100%" height="100%" fill="url(#street-grid)" transform={`translate(${panOffset.x % 60}, ${panOffset.y % 60})`} />
        <rect width="100%" height="100%" fill="url(#expressway-grid)" transform={`translate(${panOffset.x % 180}, ${panOffset.y % 180})`} />

        {/* Simulated vector roads with road names */}
        <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
          {/* Arterial Road 1 */}
          <path d="M -500 190 Q 200 170 900 230" fill="none" stroke="#38bdf8" strokeWidth="4" strokeOpacity="0.4" />
          <text x="80" y="165" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" letterSpacing="1" opacity="0.8">
            100 FEET CORRIDOR (PRIMARY ARTERIAL)
          </text>

          {/* Secondary Avenue */}
          <path d="M 280 -400 L 250 800" fill="none" stroke="#64748b" strokeWidth="3" strokeOpacity="0.5" />
          <text x="260" y="80" fill="#64748b" fontSize="9" fontFamily="sans-serif" transform="rotate(88, 260, 80)">
            HOSUR LINK ROAD
          </text>

          {/* Green Park / Campus Area */}
          <rect x="50" y="50" width="140" height="90" rx="8" fill="#14532d" fillOpacity="0.25" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.3" />
          <text x="65" y="95" fill="#4ade80" fontSize="10" fontFamily="sans-serif" opacity="0.7" fontWeight="600">
            Tech Park / Hospital Zone
          </text>
        </g>

        {/* Center Point: User GPS Coordinates with Dynamic Accuracy Circle */}
        <g transform={`translate(${window.innerWidth ? Math.min(350, window.innerWidth / 3) + panOffset.x : 280 + panOffset.x}, ${190 + panOffset.y})`}>
          {/* Accuracy Circle */}
          <circle
            cx="0"
            cy="0"
            r={accuracyRadiusPx}
            fill="url(#beacon-glow)"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="animate-pulse"
          />

          {/* Outer Pulsing Radar Ring */}
          {isLive && (
            <circle
              cx="0"
              cy="0"
              r={accuracyRadiusPx * 0.7}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate attributeName="r" from="12" to={String(accuracyRadiusPx)} dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" />
            </circle>
          )}

          {/* User Location Beacon */}
          <circle cx="0" cy="0" r="9" fill="#2563eb" stroke="#ffffff" strokeWidth="3" shadow="0 2px 8px rgba(0,0,0,0.5)" />
          <circle cx="0" cy="0" r="3.5" fill="#ffffff" />

          {/* User Marker Callout */}
          <g transform="translate(14, -24)">
            <rect x="0" y="0" width="130" height="32" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#3b82f6" strokeWidth="1" />
            <text x="8" y="14" fill="#ffffff" fontSize="10" fontWeight="bold">You are here</text>
            <text x="8" y="26" fill="#93c5fd" fontSize="9" fontFamily="monospace">±{accuracy}m GPS Fix</text>
          </g>
        </g>
      </svg>

      {/* Accuracy Tag Floating Top Left */}
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-semibold text-white font-mono">
          Accuracy: ±{accuracy} m
        </span>
        <span className="text-[10px] text-slate-400">({city})</span>
      </div>

      {/* Map Control Buttons: Zoom + / -, Recenter, External Google Maps */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center transition-colors shadow-md active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center transition-colors shadow-md active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-blue-400 border border-slate-700/80 flex items-center justify-center transition-colors shadow-md active:scale-95"
          title="Center on GPS"
        >
          <Navigation2 className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Bottom Floating Bar with Coordinates and Google Maps Open */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-xs text-white">
        <div className="flex items-center gap-2 font-mono text-[11px] truncate">
          <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">{latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E</span>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-all shrink-0"
        >
          <span>Open Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
