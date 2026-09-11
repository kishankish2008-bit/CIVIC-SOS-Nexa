import React, { useState, useEffect } from 'react';
import { AttachedMedia, SampleScenario, ScreenView, LocationData } from '../../types';
import { SAMPLE_SCENARIOS } from '../../data/sampleScenarios';
import { UniversalInput } from '../UniversalInput';
import { Pipeline } from '../Pipeline';
import { 
  ScanLine, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Layers,
  MapPin,
  Mic,
  Image as ImageIcon
} from 'lucide-react';

interface UniversalInputViewProps {
  onProcess: (text: string, media: AttachedMedia[], location?: LocationData) => void;
  isProcessing: boolean;
  initialText?: string;
  initialMedia?: AttachedMedia[];
  onSelectScenario?: (scen: SampleScenario) => void;
  onNavigate?: (view: ScreenView) => void;
  locationData?: LocationData | null;
  onSetCustomLocation?: (city: string, country: string, lat: number, lng: number) => void;
}

export const UniversalInputView: React.FC<UniversalInputViewProps> = ({
  onProcess,
  isProcessing,
  initialText = '',
  initialMedia = [],
  onSelectScenario,
  onNavigate,
  locationData,
  onSetCustomLocation,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <ScanLine className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Universal Multimodal Intake
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ingest unstructured raw text, voice recordings, situational photos, and technical documents.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gemini 3.8 Flash Engine Ready</span>
          </span>
        </div>
      </div>

      {/* Primary Intake Card */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>SITUATION INGRESS PANEL</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Supported formats: Text, Audio/Speech, JPG/PNG, PDF, CSV, JSON
          </span>
        </div>
        <UniversalInput
          onProcess={onProcess}
          isProcessing={isProcessing}
          initialText={initialText}
          initialMedia={initialMedia}
          locationData={locationData}
          onSetCustomLocation={onSetCustomLocation}
          placeholder="Describe any crisis, field dispatch, clinical query, or operational emergency in messy human language..."
        />
      </div>

      {/* 6-Stage Process Guidance Strip */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          PIPELINE TRANSFORMATION STAGES
        </div>
        <Pipeline />
      </div>

      {/* Quick Scenario Fillers */}
      {onSelectScenario && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161E2E] border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Quick Ingress Presets
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('scenarios')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                View full catalog →
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_SCENARIOS.slice(0, 4).map((scen) => (
              <button
                key={scen.id}
                type="button"
                onClick={() => onSelectScenario(scen)}
                className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {scen.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {scen.summary}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
