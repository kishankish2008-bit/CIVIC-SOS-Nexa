import React from 'react';
import { BridgeStage, ScreenView } from '../../types';
import { 
  User, 
  BrainCircuit, 
  Layers, 
  ShieldCheck, 
  Settings2, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Terminal, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ProcessingViewProps {
  currentStage: BridgeStage;
  logs: string[];
  onComplete?: () => void;
  onNavigate: (view: ScreenView) => void;
  inputSnippet: string;
}

const STAGE_ORDER: { stage: BridgeStage; title: string; desc: string; icon: React.ElementType }[] = [
  { stage: 'INPUT', title: 'Multimodal Ingestion', desc: 'Decoding raw input buffers and media attachments.', icon: User },
  { stage: 'UNDERSTAND', title: 'Intent Understanding', desc: 'Extracting implicit human objective and urgency parameters.', icon: BrainCircuit },
  { stage: 'STRUCTURE', title: 'Entity Normalization', desc: 'Parsing coordinates, physical metrics, entity records, and timeframes.', icon: Layers },
  { stage: 'VERIFY', title: 'Ground Truth Verification', desc: 'Cross-referencing verified facts against assumptions and uncertainties.', icon: ShieldCheck },
  { stage: 'REASON', title: 'Action Planning & Risk Assessment', desc: 'Formulating step-by-step resolution plan and blast radius.', icon: Settings2 },
  { stage: 'ACTION', title: 'Action Dispatch & Payload', desc: 'Synthesizing executable system commands and confirmation requirements.', icon: Zap },
];

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  currentStage,
  logs,
  onComplete,
  onNavigate,
  inputSnippet,
}) => {
  const currentStageIndex = STAGE_ORDER.findIndex((s) => s.stage === currentStage);
  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / STAGE_ORDER.length) * 100));

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reasoning Engine & AI Core
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gemini 3.8 Flash orchestrating the 6-stage action transformation pipeline.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pipeline Progress
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full sm:w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Stages on Left, Reasoning Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 cols: Stage Steps */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Pipeline Steps
          </div>
          <div className="space-y-2">
            {STAGE_ORDER.map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = currentStage === s.stage;
              const isPast = currentStageIndex > idx;

              return (
                <div
                  key={s.stage}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20'
                      : isPast
                      ? 'bg-white dark:bg-[#161E2E] border-slate-200/80 dark:border-slate-800'
                      : 'bg-slate-50/40 dark:bg-slate-900/30 border-transparent opacity-60'
                  }`}
                >
                  <div className="mt-0.5">
                    {isPast ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {s.stage}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 cols: Active Input Preview & Live Reasoning Stream */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Intake Context */}
          {inputSnippet && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161E2E] border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Active Ingress Snippet
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 italic font-sans">
                "{inputSnippet}"
              </p>
            </div>
          )}

          {/* Reasoning Logs Terminal Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm flex flex-col">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  Real-Time Pipeline Trace
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400">STREAMING</span>
              </div>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-72 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-blue-400 font-bold shrink-0">›</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-slate-500 italic">Initializing pipeline workers...</div>
              )}
            </div>
          </div>

          {/* Action to view results if ready */}
          {currentStage === 'ACTION' && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate('situation')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>View Situation Card</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
