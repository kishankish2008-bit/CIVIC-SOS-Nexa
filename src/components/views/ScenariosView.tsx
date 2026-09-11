import React, { useState } from 'react';
import { SampleScenario, ScreenView } from '../../types';
import { SAMPLE_SCENARIOS } from '../../data/sampleScenarios';
import { 
  LayoutGrid, 
  Search, 
  ArrowRight, 
  AlertTriangle, 
  Car, 
  FileText, 
  Camera, 
  ShieldAlert, 
  Ship, 
  Filter 
} from 'lucide-react';

interface ScenariosViewProps {
  onSelectScenario: (scenario: SampleScenario) => void;
  onNavigate: (view: ScreenView) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  onSelectScenario,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(SAMPLE_SCENARIOS.map((s) => s.category)))];

  const filteredScenarios = SAMPLE_SCENARIOS.filter((scen) => {
    const matchesSearch =
      scen.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scen.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scen.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || scen.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Scenario Catalog
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pre-configured real-world crisis, logistics, and medical situations ready to run through NEXA.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter scenarios..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scen) => (
          <div
            key={scen.id}
            onClick={() => onSelectScenario(scen)}
            className="group cursor-pointer bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {scen.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getUrgencyBadge(scen.urgency)}`}>
                  {scen.urgency.charAt(0).toUpperCase() + scen.urgency.slice(1)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {scen.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {scen.summary}
              </p>

              {scen.input.mediaName && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[200px]">{scen.input.mediaName}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Execute Scenario Ingress</span>
              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
