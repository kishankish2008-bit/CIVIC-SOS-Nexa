import React, { useState } from 'react';
import { Share2, Copy, Check, X, MapPin, ExternalLink } from 'lucide-react';
import { LocationData } from '../types';

interface LocationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData | null;
  situation?: string;
}

export const LocationShareModal: React.FC<LocationShareModalProps> = ({
  isOpen,
  onClose,
  location,
  situation
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const lat = location?.latitude || 12.9716;
  const lng = location?.longitude || 77.5946;
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const dispatchText = `[EMERGENCY DISPATCH - LIVE LOCATION BROADCAST]
Location: ${location?.city || 'Bengaluru'}, ${location?.country || 'India'}
GPS Coordinates: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E (±${Math.round(location?.accuracy || 15)}m)
Google Maps Link: ${mapsUrl}
Status: ${location?.freshness || 'LIVE'} Telemetry
Timestamp: ${new Date(location?.timestamp || Date.now()).toISOString()}
Context: ${situation || 'Emergency dispatch response requested.'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(dispatchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEXA Live Location Dispatch',
          text: dispatchText,
          url: mapsUrl
        });
      } catch (e) {
        console.warn('Share cancelled or not allowed');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-foreground">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Broadcast Live Location</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Format prepared for first responders, emergency command centers, and roadside rescue units:
          </p>

          <pre className="p-3 bg-muted/60 border border-border/80 rounded font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap max-h-48">
            {dispatchText}
          </pre>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-background hover:bg-muted border border-border font-medium text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Dispatch Payload'}</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
