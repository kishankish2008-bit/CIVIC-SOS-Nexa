import React from 'react';
import { SampleScenario, ScreenView } from '../types';
import { 
  LayoutGrid, 
  ArrowRight, 
  AlertTriangle, 
  Car, 
  FileText, 
  Camera, 
  ShieldAlert, 
  Ship,
  Sparkles
} from 'lucide-react';

interface ScenarioCardsProps {
  scenarios: SampleScenario[];
  onSelectScenario: (scenario: SampleScenario) => void;
  onViewAll?: () => void;
  maxItems?: number;
  className?: string;
}

export const ScenarioCards: React.FC<ScenarioCardsProps> = ({
  scenarios,
  onSelectScenario,
  onViewAll,
  maxItems = 4,
  className = '',
}) => {
  const displayScenarios = scenarios.slice(0, maxItems);

  const getScenarioIcon = (iconName: string, urgency: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-100 dark:bg-rose-950/60',
          color: 'text-rose-600 dark:text-rose-400',
        };
      case 'Car':
        return {
          icon: Car,
          bg: 'bg-blue-100 dark:bg-blue-950/60',
          color: 'text-blue-600 dark:text-blue-400',
        };
      case 'FileText':
        return {
          icon: FileText,
          bg: 'bg-emerald-100 dark:bg-emerald-950/60',
          color: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'Camera':
        return {
          icon: Camera,
          bg: 'bg-purple-100 dark:bg-purple-950/60',
          color: 'text-purple-600 dark:text-purple-400',
        };
      case 'Ship':
        return {
          icon: Ship,
          bg: 'bg-cyan-100 dark:bg-cyan-950/60',
          color: 'text-cyan-600 dark:text-cyan-400',
        };
      default:
        return {
          icon: ShieldAlert,
          bg: 'bg-amber-100 dark:bg-amber-950/60',
          color: 'text-amber-600 dark:text-amber-400',
        };
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <section className={`space-y-4 ${className}`} aria-label="Scenario Examples">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Try a scenario
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore real-world examples to see how NEXA turns messy inputs into actions.
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="self-start sm:self-auto text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View all scenarios</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4 Cards Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayScenarios.map((scen) => {
          const { icon: Icon, bg, color } = getScenarioIcon(scen.iconName, scen.urgency);

          return (
            <div
              key={scen.id}
              onClick={() => onSelectScenario(scen)}
              className="group cursor-pointer bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Top: Icon Badge & Urgency Pill */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getUrgencyBadge(scen.urgency)}`}>
                    {scen.urgency.charAt(0).toUpperCase() + scen.urgency.slice(1)}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {scen.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {scen.summary}
                </p>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                <span className="text-[11px]">Load scenario</span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
