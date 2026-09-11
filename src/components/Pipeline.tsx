import React from 'react';
import { BridgeStage } from '../types';
import { 
  User, 
  BrainCircuit, 
  Layers, 
  ShieldCheck, 
  Settings2, 
  Zap, 
  ArrowRight 
} from 'lucide-react';

interface PipelineProps {
  currentStage?: BridgeStage;
  isProcessing?: boolean;
  interactive?: boolean;
  onStageClick?: (stage: BridgeStage) => void;
  className?: string;
}

interface PipelineStep {
  stage: BridgeStage;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  bgLight: string;
  bgDark: string;
  iconColorLight: string;
  iconColorDark: string;
}

const STEPS: PipelineStep[] = [
  {
    stage: 'INPUT',
    title: 'INPUT',
    subtitle: 'Any format',
    icon: User,
    bgLight: 'bg-blue-100',
    bgDark: 'dark:bg-blue-950/60',
    iconColorLight: 'text-blue-600',
    iconColorDark: 'dark:text-blue-400',
  },
  {
    stage: 'UNDERSTAND',
    title: 'UNDERSTAND',
    subtitle: 'Detect intent',
    icon: BrainCircuit,
    bgLight: 'bg-sky-100',
    bgDark: 'dark:bg-sky-950/60',
    iconColorLight: 'text-sky-600',
    iconColorDark: 'dark:text-sky-400',
  },
  {
    stage: 'STRUCTURE',
    title: 'STRUCTURE',
    subtitle: 'Extract info',
    icon: Layers,
    bgLight: 'bg-indigo-100',
    bgDark: 'dark:bg-indigo-950/60',
    iconColorLight: 'text-indigo-600',
    iconColorDark: 'dark:text-indigo-400',
  },
  {
    stage: 'VERIFY',
    title: 'VERIFY',
    subtitle: 'Cross-check',
    icon: ShieldCheck,
    bgLight: 'bg-emerald-100',
    bgDark: 'dark:bg-emerald-950/60',
    iconColorLight: 'text-emerald-600',
    iconColorDark: 'dark:text-emerald-400',
  },
  {
    stage: 'REASON',
    title: 'REASON',
    subtitle: 'Prioritize',
    icon: Settings2,
    bgLight: 'bg-purple-100',
    bgDark: 'dark:bg-purple-950/60',
    iconColorLight: 'text-purple-600',
    iconColorDark: 'dark:text-purple-400',
  },
  {
    stage: 'ACTION',
    title: 'ACTION',
    subtitle: 'Next steps',
    icon: Zap,
    bgLight: 'bg-amber-100',
    bgDark: 'dark:bg-amber-950/60',
    iconColorLight: 'text-amber-600',
    iconColorDark: 'dark:text-amber-400',
  },
];

export const Pipeline: React.FC<PipelineProps> = ({
  currentStage,
  isProcessing = false,
  interactive = false,
  onStageClick,
  className = '',
}) => {
  const currentIndex = currentStage ? STEPS.findIndex((s) => s.stage === currentStage) : -1;

  return (
    <div className={`w-full ${className}`}>
      {/* Pipeline Strip */}
      <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = currentStage === step.stage;
            const isCompleted = currentIndex > idx;
            const isClickable = interactive && !!onStageClick;

            return (
              <div key={step.stage} className="relative flex items-center">
                {/* Step Item Box */}
                <div
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onClick={() => isClickable && onStageClick(step.stage)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : isCompleted
                      ? 'border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  } ${isClickable ? 'cursor-pointer' : ''}`}
                >
                  {/* Circular pastel icon badge */}
                  <div
                    className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center transition-transform ${
                      step.bgLight
                    } ${step.bgDark} ${isCurrent && isProcessing ? 'scale-110' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 ${step.iconColorLight} ${step.iconColorDark} ${
                        isCurrent && isProcessing ? 'animate-pulse' : ''
                      }`}
                    />
                  </div>

                  {/* Step labels */}
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-none truncate">
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-medium truncate">
                      {step.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right Arrow connecting steps (hidden on last or mobile wraps) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
