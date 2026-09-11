import React, { useState } from 'react';
import { NexaResult, ScreenView, UrgencyLevel } from '../../types';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Sliders,
  Plus
} from 'lucide-react';

interface HistoryViewProps {
  history: NexaResult[];
  onSelectResult: (result: NexaResult) => void;
  onClearHistory: () => void;
  onNavigate: (view: ScreenView) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recommended_actions.some((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.destination || a.target_system || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesUrgency =
      urgencyFilter === 'all' || item.urgency.toLowerCase() === urgencyFilter.toLowerCase();

    return matchesSearch && matchesUrgency;
  });

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexa_audit_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
    <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Operational History & Audit Trail
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of converted unstructured events, ground truth facts, and verified actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                type="button"
                id="export-history-json-btn"
                onClick={exportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Export Audit JSON</span>
              </button>

              <button
                type="button"
                id="clear-history-btn"
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onNavigate('input')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Intake</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search situations by intent, keywords, or target systems..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#161E2E] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Urgency Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 self-stretch sm:self-auto overflow-x-auto">
          {['all', 'critical', 'high', 'medium', 'low'].map((urg) => (
            <button
              key={urg}
              type="button"
              onClick={() => setUrgencyFilter(urg)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                urgencyFilter === urg
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* History Items */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No audit records match your query
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {history.length === 0
              ? 'Process a situation or select a scenario to start generating audit records.'
              : 'Try clearing your search query or urgency filter.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('input')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors mt-2"
          >
            <span>Launch Universal Input</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="group cursor-pointer bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getUrgencyBadge(item.urgency)}`}>
                    {item.urgency.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.intent}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.situation}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>{item.verified_facts.length} Verified Facts</span>
                  <span>•</span>
                  <span>{item.recommended_actions.length} Recommended Actions</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Inspect
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
