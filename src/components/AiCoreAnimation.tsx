import React from 'react';
import { motion } from 'motion/react';
import { BridgeStage } from '../types';
import { 
  Cpu, 
  Eye, 
  Layers, 
  CheckCircle2, 
  BrainCircuit, 
  Zap, 
  Sparkles 
} from 'lucide-react';

interface AiCoreAnimationProps {
  currentStage?: BridgeStage;
  isProcessing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onStageClick?: (stage: BridgeStage) => void;
}

const STAGES: { stage: BridgeStage; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { stage: 'INPUT', label: 'INPUT', icon: Eye, color: '#38bdf8', desc: 'Multimodal Ingestion' },
  { stage: 'UNDERSTAND', label: 'UNDERSTAND', icon: Cpu, color: '#818cf8', desc: 'Intent Extraction' },
  { stage: 'STRUCTURE', label: 'STRUCTURE', icon: Layers, color: '#a78bfa', desc: 'Entity Normalization' },
  { stage: 'VERIFY', label: 'VERIFY', icon: CheckCircle2, color: '#34d399', desc: 'Ground Truth Audit' },
  { stage: 'REASON', label: 'REASON', icon: BrainCircuit, color: '#f59e0b', desc: 'Cognitive Risk Matrix' },
  { stage: 'ACTION', label: 'ACTION', icon: Zap, color: '#f43f5e', desc: 'Deterministic Dispatch' },
];

export const AiCoreAnimation: React.FC<AiCoreAnimationProps> = ({
  currentStage = 'INPUT',
  isProcessing = false,
  size = 'md',
  interactive = false,
  onStageClick,
}) => {
  const currentStageIndex = STAGES.findIndex((s) => s.stage === currentStage);

  const containerSizes = {
    sm: 'w-56 h-56',
    md: 'w-80 h-80 sm:w-96 sm:h-96',
    lg: 'w-96 h-96 sm:w-[480px] sm:h-[480px]',
  };

  const coreSizes = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28 sm:w-32 sm:h-32',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
  };

  const radius = size === 'sm' ? 84 : size === 'md' ? 140 : 185;

  return (
    <div className={`relative flex items-center justify-center select-none ${containerSizes[size]}`}>
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
        style={{
          background: isProcessing
            ? 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(168,85,247,0.4) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(14,165,233,0.5) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)',
        }}
      />

      {/* SVG Circuit Grid and Connecting Geometric Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbit track ring */}
        <circle
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke="rgba(51, 65, 85, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Active pipeline arc */}
        {isProcessing && (
          <circle
            cx="200"
            cy="200"
            r={radius}
            fill="none"
            stroke="url(#cyberGrad)"
            strokeWidth="3"
            strokeDasharray="40 180"
            className="animate-spin-slow"
            filter="url(#glow)"
          />
        )}

        {/* Internal concentric geometric rings */}
        <circle
          cx="200"
          cy="200"
          r={radius * 0.65}
          fill="none"
          stroke="rgba(14, 165, 233, 0.2)"
          strokeWidth="1"
          strokeDasharray="2 8"
        />
        <circle
          cx="200"
          cy="200"
          r={radius * 0.38}
          fill="none"
          stroke="rgba(168, 85, 247, 0.25)"
          strokeWidth="1"
        />
      </svg>

      {/* Outer Counter-Rotating Gyro Rings */}
      <div
        className={`absolute inset-4 rounded-full border border-cyan-500/20 pointer-events-none ${
          isProcessing ? 'animate-spin-slow' : ''
        }`}
      />
      <div
        className={`absolute inset-8 rounded-full border border-dashed border-violet-500/20 pointer-events-none ${
          isProcessing ? 'animate-spin-reverse-slow' : ''
        }`}
      />

      {/* Central Pulsing AI Core */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.08, 0.98, 1.04, 1] : [1, 1.03, 1],
          boxShadow: isProcessing
            ? [
                '0 0 20px rgba(6, 182, 212, 0.4)',
                '0 0 50px rgba(168, 85, 247, 0.7)',
                '0 0 25px rgba(16, 185, 129, 0.5)',
                '0 0 20px rgba(6, 182, 212, 0.4)',
              ]
            : '0 0 25px rgba(6, 182, 212, 0.25)',
        }}
        transition={{
          duration: isProcessing ? 2.2 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative z-10 flex flex-col items-center justify-center rounded-full bg-slate-950/90 border-2 border-cyan-400/60 backdrop-blur-xl shadow-2xl overflow-hidden ${coreSizes[size]}`}
      >
        {/* Core animated background rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25)_0%,rgba(15,23,42,0.95)_75%)]" />

        {/* Central glyph */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center p-2">
          <motion.div
            animate={isProcessing ? { rotate: [0, 360] } : {}}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="mb-1"
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </motion.div>
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-cyan-200">
            NEXA
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {isProcessing ? 'REASONING' : 'AI CORE'}
          </span>
        </div>

        {/* Core pulse radar line */}
        {isProcessing && (
          <div className="absolute inset-0 border-t-2 border-cyan-400/80 rounded-full animate-spin-slow pointer-events-none" />
        )}
      </motion.div>

      {/* 6 Peripheral Stage Nodes on Orbit */}
      {STAGES.map((s, index) => {
        // Calculate coordinate on orbit: 6 stages distributed evenly
        // Angle starts at top (270 deg / -90 deg) and proceeds clockwise
        const angle = -90 + index * (360 / STAGES.length);
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        const isCurrent = s.stage === currentStage;
        const isPassed = index <= currentStageIndex;
        const Icon = s.icon;

        return (
          <div
            key={s.stage}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            className="absolute z-20 transition-all duration-300"
          >
            <motion.button
              type="button"
              id={`stage-node-${s.stage.toLowerCase()}`}
              aria-label={`Pipeline Stage: ${s.label} - ${s.desc}`}
              onClick={() => interactive && onStageClick && onStageClick(s.stage)}
              disabled={!interactive}
              whileHover={interactive ? { scale: 1.15 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
              className={`group relative flex items-center justify-center rounded-full transition-all duration-300 ${
                size === 'sm' ? 'w-9 h-9' : 'w-11 h-11 sm:w-13 sm:h-13'
              } ${
                isCurrent
                  ? 'bg-slate-900 border-2 shadow-[0_0_20px_rgba(6,182,212,0.8)] ring-4 ring-cyan-500/20'
                  : isPassed
                  ? 'bg-slate-900/90 border border-slate-700 text-slate-300'
                  : 'bg-slate-950/80 border border-slate-800/80 text-slate-600'
              }`}
              style={{
                borderColor: isCurrent ? s.color : isPassed ? 'rgba(71,85,105,0.7)' : 'rgba(30,41,59,0.7)',
              }}
            >
              {/* Inner glow for active node */}
              {isCurrent && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-40 pointer-events-none"
                  style={{ backgroundColor: s.color }}
                />
              )}

              <Icon
                className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} transition-colors ${
                  isCurrent
                    ? 'text-white drop-shadow-[0_0_6px_currentColor]'
                    : isPassed
                    ? 'text-slate-200'
                    : 'text-slate-600'
                }`}
                style={{ color: isCurrent ? s.color : undefined }}
              />

              {/* Stage label pill */}
              <div
                className={`absolute top-full mt-1.5 flex flex-col items-center pointer-events-none transition-all duration-200 ${
                  isCurrent ? 'opacity-100 scale-100' : 'opacity-70 scale-95 group-hover:opacity-100'
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-semibold tracking-wider uppercase whitespace-nowrap ${
                    isCurrent
                      ? 'bg-slate-800/90 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : isPassed
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </motion.button>
          </div>
        );
      })}

      {/* Bottom Workflow Flow Indicators */}
      <div className="absolute -bottom-10 sm:-bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] sm:text-xs font-mono text-slate-400 backdrop-blur-md">
        <span className="text-cyan-400 font-semibold">FLOW:</span>
        <span>INPUT</span>
        <span className="text-slate-600">→</span>
        <span>UNDERSTAND</span>
        <span className="text-slate-600">→</span>
        <span>VERIFY</span>
        <span className="text-slate-600">→</span>
        <span>REASON</span>
        <span className="text-slate-600">→</span>
        <span className="text-rose-400 font-semibold">ACTION</span>
      </div>
    </div>
  );
};
