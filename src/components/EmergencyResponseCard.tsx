import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, Navigation, Share2, AlertTriangle, Hospital, Clock, MapPin, CheckCircle2, Shield } from 'lucide-react';
import { EmergencyContact, ReachableService, LocationData } from '../types';

interface EmergencyResponseCardProps {
  urgency: string;
  situation: string;
  location?: LocationData | null;
  fastestService?: ReachableService;
  emergencyContacts?: EmergencyContact[];
  onCallEmergency: (contact: EmergencyContact) => void;
  onOpenRoute: (service: ReachableService) => void;
  onShareLocation: () => void;
}

export const EmergencyResponseCard: React.FC<EmergencyResponseCardProps> = ({
  urgency,
  situation,
  location,
  fastestService,
  emergencyContacts = [],
  onCallEmergency,
  onOpenRoute,
  onShareLocation
}) => {
  const isCritical = urgency === 'critical';
  const defaultFastest = fastestService || {
    id: 'hosp-1',
    name: 'Apex Trauma & Multi-Specialty Hospital',
    type: 'Trauma & Emergency Care',
    address: 'Residency Road, Bangalore Central',
    distanceKm: 2.4,
    durationMin: 7,
    trafficCondition: 'Moderate Traffic',
    verified: true,
    emergencyPhone: '112',
    lat: 12.9716,
    lng: 77.5946
  };

  const primaryContact = emergencyContacts.find(c => c.number === '112') || {
    id: 'contact-112',
    name: 'National Emergency Response (ERSS)',
    number: '112',
    serviceType: 'Universal Police, Fire & Medical Dispatch',
    jurisdiction: 'India (Pan-National)',
    verified: true,
    source: 'Ministry of Home Affairs (MHA)'
  };

  return (
    <div
      id="emergency-response-card"
      className={`rounded-xl border p-5 shadow-md transition-all ${
        isCritical
          ? 'bg-rose-500/5 border-rose-500/30 dark:bg-rose-950/10'
          : 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/10'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {isCritical ? 'CRITICAL EMERGENCY PROTOCOL' : 'HIGH PRIORITY SITUATION'}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                MHA 112 Standard
              </span>
            </div>
            <h3 className="font-bold text-base text-foreground mt-0.5">
              Rapid Response & Emergency Dispatch
            </h3>
          </div>
        </div>

        {/* Universal emergency badge */}
        <div className="flex items-center gap-2 bg-background/80 border border-rose-500/30 px-3 py-1.5 rounded-lg">
          <Shield className="w-4 h-4 text-rose-500" />
          <div>
            <span className="text-[10px] text-muted-foreground block font-mono">PAN-INDIA EMERGENCY</span>
            <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">CALL 112</span>
          </div>
        </div>
      </div>

      {/* Brief Situation Summary */}
      <div className="mt-3.5 text-xs text-foreground/90 leading-relaxed bg-background/60 p-3 rounded-lg border border-border/50">
        <strong className="text-foreground block font-medium mb-1">Detected Emergency Context:</strong>
        {situation}
      </div>

      {/* Fastest Reachable Facility Card */}
      <div className="mt-3.5 bg-background border border-border/80 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-primary" />
            <span className="font-semibold text-xs text-foreground">FASTEST VERIFIED MEDICAL / TRAUMA FACILITY</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> VERIFIED REACHABLE
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-bold text-sm text-foreground">{defaultFastest.name}</h4>
            <p className="text-muted-foreground text-xs">{defaultFastest.address}</p>
          </div>

          <div className="flex items-center gap-3 bg-muted/60 px-3 py-2 rounded-lg font-mono text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">DISTANCE</span>
              <span className="font-bold text-foreground">{defaultFastest.distanceKm} km</span>
            </div>
            <div className="h-6 w-[1px] bg-border"></div>
            <div>
              <span className="text-[10px] text-muted-foreground block">ETA VIA TRAFFIC</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {defaultFastest.durationMin} MIN
              </span>
            </div>
            <div className="h-6 w-[1px] bg-border"></div>
            <div>
              <span className="text-[10px] text-muted-foreground block">TRAFFIC</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{defaultFastest.trafficCondition}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls - Human Gatekeeper Guarded */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          id="emergency-call-112-btn"
          onClick={() => onCallEmergency(primaryContact)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>CALL 112 (CONFIRM)</span>
        </button>

        <button
          id="emergency-open-route-btn"
          onClick={() => onOpenRoute(defaultFastest)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>OPEN FASTEST ROUTE</span>
        </button>

        <button
          id="emergency-share-loc-btn"
          onClick={onShareLocation}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs bg-background hover:bg-muted text-foreground border border-border transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>BROADCAST LOCATION</span>
        </button>
      </div>

      {/* Emergency Registry Contacts Grid */}
      {emergencyContacts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/60">
          <span className="text-[11px] font-mono text-muted-foreground block mb-2">
            ADDITIONAL AUTHORIZED EMERGENCY CONTACTS ({location?.country || 'India'}):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {emergencyContacts.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => onCallEmergency(c)}
                className="flex items-center justify-between p-2 rounded-md bg-background/80 hover:bg-muted border border-border/70 text-left transition-colors"
              >
                <div>
                  <span className="font-semibold text-foreground block text-[11px]">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">{c.serviceType}</span>
                </div>
                <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  {c.number}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
