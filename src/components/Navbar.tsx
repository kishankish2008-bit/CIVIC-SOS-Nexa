import React, { useState } from 'react';
import { ScreenView, SampleScenario } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { 
  Terminal, 
  Cpu, 
  Radio, 
  Sparkles, 
  Menu, 
  X, 
  ChevronDown, 
  History, 
  FileText, 
  ShieldAlert, 
  HelpCircle,
  Play
} from 'lucide-react';

interface NavbarProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  hasActiveResult: boolean;
  historyCount: number;
  onSelectScenario: (scenario: SampleScenario) => void;
  onOpenHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasActiveResult,
  historyCount,
  onSelectScenario,
  onOpenHelp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);

  const navItems: { id: ScreenView; label: string; icon: React.ElementType; badge?: string; disabled?: boolean }[] = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'input', label: 'Universal Input', icon: Terminal },
    { id: 'processing', label: 'AI Core', icon: Cpu },
    { id: 'situation', label: 'Situation Card', icon: FileText, disabled: !hasActiveResult },
    { id: 'action', label: 'Action Cockpit', icon: ShieldAlert, disabled: !hasActiveResult },
    { id: 'history', label: 'Audit History', icon: History, badge: historyCount > 0 ? String(historyCount) : undefined },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="brand-logo-btn"
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-left group focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none rounded-lg p-1"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <span className="font-mono text-cyan-400 font-extrabold text-sm tracking-tighter">NX</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-wider text-slate-100 font-mono group-hover:text-cyan-300 transition-colors">
                    NEXA
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                    Action Bridge
                  </span>
                </div>
                <span className="hidden md:block text-[10px] font-mono text-slate-400 tracking-tight">
                  UNSTRUCTURED → STRUCTURED → ACTION
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  disabled={item.disabled}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : item.disabled
                      ? 'text-slate-600 opacity-40 cursor-not-allowed'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-700 text-cyan-200">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Scenario Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="quick-scenarios-btn"
                aria-expanded={scenarioDropdownOpen}
                onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Preset Scenarios</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {scenarioDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Load Real-World Scenarios
                  </div>
                  <div className="py-1 space-y-1">
                    {SAMPLE_SCENARIOS.map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => {
                          onSelectScenario(sc);
                          setScenarioDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-sans text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors flex items-start gap-2.5 group"
                      >
                        <div className="mt-0.5 p-1 rounded bg-slate-950 text-cyan-400 group-hover:scale-110 transition-transform">
                          <Play className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-200 truncate">{sc.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">{sc.category}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Model Telemetry Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="text-slate-400">MODEL:</span>
              <span className="font-semibold text-cyan-300">GEMINI 3.8 FLASH</span>
            </div>

            {/* Keyboard Shortcuts Button */}
            <button
              type="button"
              id="shortcuts-help-btn"
              onClick={() => {
                if (typeof onOpenHelp === 'function') {
                  onOpenHelp();
                }
              }}
              aria-label="Keyboard Shortcuts and Info"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-mono transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : item.disabled
                      ? 'text-slate-600 opacity-40'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 mb-2 px-1">Quick Scenarios</div>
            <div className="space-y-1">
              {SAMPLE_SCENARIOS.slice(0, 3).map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    onSelectScenario(sc);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-sans text-slate-300 hover:bg-slate-900 hover:text-cyan-300 truncate"
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
