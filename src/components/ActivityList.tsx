import React from 'react';
import { NexaResult, ScreenView } from '../types';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface ActivityListProps {
  history: NexaResult[];
  onSelectResult: (result: NexaResult) => void;
  onViewHistory: () => void;
  className?: string;
}

interface DefaultActivity {
  id: string;
  title: string;
  timeAgo: string;
  summary: string;
  urgency: string;
}

const DEFAULT_ACTIVITIES: DefaultActivity[] = [
  {
    id: 'def-1',
    title: 'Traffic route analysis',
    timeAgo: '18 min ago',
    summary: 'Route suggestion provided with safety analysis and flood avoidance',
    urgency: 'high',
  },
  {
    id: 'def-2',
    title: 'Medical report summary',
    timeAgo: '2 hours ago',
    summary: 'Key clinical findings and prioritized hospital next steps generated',
    urgency: 'critical',
  },
  {
    id: 'def-3',
    title: 'Infrastructure issue',
    timeAgo: '5 hours ago',
    summary: 'Report template and municipal power department contact provided',
    urgency: 'medium',
  },
];

export const ActivityList: React.FC<ActivityListProps> = ({
  history,
  onSelectResult,
  onViewHistory,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between shadow-sm ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <button
            type="button"
            onClick={onViewHistory}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View history</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-1">
          {history.length > 0 ? (
            history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectResult(item)}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {item.intent}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    Just now • {item.situation}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
              </div>
            ))
          ) : (
            DEFAULT_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                onClick={onViewHistory}
                className="py-3 flex items-start justify-between gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {act.title}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {act.timeAgo} • {act.summary}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
