import React, { useState } from 'react';
import { NexaResult, ScreenView, UrgencyLevel, ActionItem, EmergencyContact, ReachableService } from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  BrainCircuit, 
  FileCode2, 
  ArrowRight, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Sliders,
  Radio,
  Lock,
  PhoneCall
} from 'lucide-react';
import { LiveIntelligencePanel } from '../LiveIntelligencePanel';
import { EmergencyResponseCard } from '../EmergencyResponseCard';
import { TrafficCommandCenter } from '../TrafficCommandCenter';
import { LiveLocationCard } from '../LiveLocationCard';
import { CodeExecutionCard } from '../CodeExecutionCard';
import { UrlContextCard } from '../UrlContextCard';
import { SourcesTruthCard } from '../SourcesTruthCard';
import { HumanConfirmationModal } from '../HumanConfirmationModal';
import { LocationShareModal } from '../LocationShareModal';

interface SituationCardViewProps {
  result: NexaResult;
  onNavigate: (view: ScreenView) => void;
  onOpenRawJson: () => void;
  onReRun: () => void;
  onUpdateActionResult?: (actionId: string, status: string) => void;
}

export const SituationCardView: React.FC<SituationCardViewProps> = ({
  result,
  onNavigate,
  onOpenRawJson,
  onReRun,
  onUpdateActionResult
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedActionForGatekeeper, setSelectedActionForGatekeeper] = useState<ActionItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [localActions, setLocalActions] = useState<ActionItem[]>(result.recommended_actions);

  // Safely grab observations vs verified facts
  const inputObservations = result.input_observations && result.input_observations.length > 0 
    ? result.input_observations 
    : result.verified_facts || [];

  const verifiedFacts = result.verified_facts && result.verified_facts.length > 0
    ? result.verified_facts
    : [];

  const isEmergency = result.urgency === 'critical' || result.urgency === 'high' || !!result.fastest_service;

  const copyBrief = () => {
    const text = `NEXA SITUATION BRIEF (Verified & Fact-Checked)
Intent: ${result.intent}
Situation: ${result.situation}
Urgency: ${result.urgency.toUpperCase()} (AI Model Confidence: ${(result.confidence * 100).toFixed(0)}%)
Confidence Note: ${result.confidence_note || "Reflects the model's assessment of its interpretation, not factual certainty."}
Human Confirmation Gate: ${result.requires_human_confirmation ? 'REQUIRED' : 'NOT REQUIRED'}
${result.medical_safety_notice ? `Medical Notice: ${result.medical_safety_notice}\n` : ''}
1. INPUT OBSERVATIONS (Directly observed from input):
${inputObservations.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}

2. VERIFIED FACTS (External source/tool confirmed):
${verifiedFacts.length > 0 
  ? verifiedFacts.map((f, i) => `  ${i + 1}. ${f}`).join('\n')
  : `  External verification: ${result.external_verification_note || 'External verification unavailable — result based on supplied input.'}`}

3. INFERENCES (AI reasoning / hypotheses):
${result.inferences.map((inf, i) => `  ${i + 1}. ${inf}`).join('\n')}

4. UNCERTAINTIES (Cannot be established):
${result.uncertainties.map((u, i) => `  ${i + 1}. ${u}`).join('\n')}

5. RECOMMENDED ACTIONS:
${localActions.map((a, i) => `  ${i + 1}. [${a.impact.toUpperCase()}] ${a.title} -> Destination: ${a.destination || a.target_system} (${a.status})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    }
  };

  const handleExecuteConfirmedAction = (actionId: string) => {
    setLocalActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: 'completed' as const } : a))
    );
    if (onUpdateActionResult) {
      onUpdateActionResult(actionId, 'completed');
    }
  };

  const handleCallEmergencyContact = (contact: EmergencyContact) => {
    setSelectedActionForGatekeeper({
      id: `call-emerg-${Date.now()}`,
      title: `Call Emergency Services (${contact.number})`,
      description: `Contact ${contact.name} for urgent intervention under ${contact.jurisdiction}.`,
      action_type: 'User action',
      destination: `Emergency Relay: ${contact.number}`,
      tool: `Phone dialer (${contact.number})`,
      target_system: `Emergency Relay (${contact.number})`,
      impact: 'critical',
      requires_confirmation: true,
      status: 'waiting_confirmation',
      parameters: { service: contact.name, number: contact.number, protocol: 'ERSS_112' }
    });
  };

  const handleOpenRoute = (service: ReachableService) => {
    const origin = result.location_data ? `${result.location_data.latitude},${result.location_data.longitude}` : 'Current+Location';
    const dest = encodeURIComponent(`${service.name}, ${service.address}`);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-150">
      {/* Real-time Subsystem Status Strip */}
      <LiveIntelligencePanel
        locationStatus={result.location_data ? 'available' : 'idle'}
        isTracking={false}
        isVoiceListening={false}
        activeModel={result.meta?.model_version || 'Gemini 3.8 Flash'}
      />

      {/* Top Banner with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            SITUATION BRIEFING
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {result.intent}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="copy-brief-btn"
            onClick={copyBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Brief'}</span>
          </button>

          <button
            type="button"
            id="view-json-btn"
            onClick={onOpenRawJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Raw JSON</span>
          </button>

          <button
            type="button"
            id="re-run-btn"
            onClick={onReRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Re-run assessment"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Medical Safety Notice (if present) */}
      {result.medical_safety_notice && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-[11px] block">
              Medical Safety & Triage Notice
            </span>
            <p className="leading-relaxed">{result.medical_safety_notice}</p>
          </div>
        </div>
      )}

      {/* Emergency Protocol Response Card (if critical or emergency detected) */}
      {isEmergency && (
        <EmergencyResponseCard
          urgency={result.urgency}
          situation={result.situation}
          location={result.location_data}
          fastestService={result.fastest_service}
          emergencyContacts={result.emergency_contacts}
          onCallEmergency={handleCallEmergencyContact}
          onOpenRoute={handleOpenRoute}
          onShareLocation={() => setIsShareModalOpen(true)}
        />
      )}

      {/* Traffic Intelligence & Route Optimization (if traffic comparison exists) */}
      {result.traffic_comparison && (
        <TrafficCommandCenter
          trafficComparison={result.traffic_comparison}
          destinationName={result.fastest_service?.name || 'Emergency Facility'}
          originName={result.location_data?.city || 'Device Location'}
        />
      )}

      {/* Live Device Location Telemetry */}
      {result.location_data && (
        <LiveLocationCard
          location={result.location_data}
          status={result.location_data.status}
          isTracking={false}
          errorMessage={null}
          onStartTracking={() => {}}
          onStopTracking={() => {}}
          onRefresh={() => {}}
          onSetCustomLocation={() => {}}
        />
      )}

      {/* Code Execution Deterministic Math Card */}
      {result.code_execution && (
        <CodeExecutionCard data={result.code_execution} />
      )}

      {/* URL Context Ingestion Card */}
      {result.url_context && (
        <UrlContextCard data={result.url_context} />
      )}

      {/* Main Analysis Card */}
      <div className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        {/* Situation Header with Urgency & Confidence */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${getUrgencyBadge(result.urgency)}`}>
              {result.urgency} Urgency
            </span>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </span>
            {result.requires_human_confirmation && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Human Gatekeeper Required</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Model: {result.meta?.model_version || 'gemini-3.8-flash'}
          </div>
        </div>

        {/* Situation Statement */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Situational Assessment
          </span>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
            {result.situation}
          </p>
        </div>

        {/* 4-Column Intelligence Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* 1. Input Observations */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Input Observations</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">({inputObservations.length})</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              Observable facts in supplied input
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-snug">
              {inputObservations.map((obs, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{obs}</span>
                </li>
              ))}
              {inputObservations.length === 0 && (
                <li className="text-slate-400 italic">No input details recorded.</li>
              )}
            </ul>
          </div>

          {/* 2. Verified Facts (External Tool / Reliable Source) */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Facts</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                {verifiedFacts.length > 0 ? `(${verifiedFacts.length})` : '0'}
              </span>
            </div>
            <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 italic">
              Confirmed via external tool
            </p>
            <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200/90 leading-snug">
              {verifiedFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{fact}</span>
                </li>
              ))}
              {verifiedFacts.length === 0 && (
                <li className="text-emerald-800/80 dark:text-emerald-300/80 text-[11px] leading-relaxed bg-emerald-100/50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                  {result.external_verification_note || 'External verification unavailable — result based on supplied input.'}
                </li>
              )}
            </ul>
          </div>

          {/* 3. Inferences */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-blue-800 dark:text-blue-300 font-bold text-xs uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Inferences</span>
              </span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">({result.inferences.length})</span>
            </div>
            <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 italic">
              AI reasoning & deductions
            </p>
            <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-200/90 leading-snug">
              {result.inferences.map((inf, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">›</span>
                  <span>{inf}</span>
                </li>
              ))}
              {result.inferences.length === 0 && (
                <li className="text-blue-600/70 italic">No model inferences recorded.</li>
              )}
            </ul>
          </div>

          {/* 4. Uncertainties */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Uncertainties</span>
              </span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">({result.uncertainties.length})</span>
            </div>
            <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 italic">
              Cannot be established
            </p>
            <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200/90 leading-snug">
              {result.uncertainties.map((u, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">?</span>
                  <span>{u}</span>
                </li>
              ))}
              {result.uncertainties.length === 0 && (
                <li className="text-amber-600/70 italic">No unconfirmed variables.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recommended Actions List */}
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recommended Actions ({localActions.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Click any action to verify with the Human Gatekeeper before execution
            </span>
          </div>

          <div className="space-y-2.5">
            {localActions.map((act) => {
              const isCompleted = act.status === 'completed' || act.status === 'executed';
              const statusDisplay = isCompleted
                ? 'Completed'
                : act.status === 'waiting_confirmation'
                ? 'Waiting for Confirmation'
                : act.status === 'ready'
                ? 'Ready'
                : 'Recommended';

              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {act.title}
                      </span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${getUrgencyBadge(act.impact)}`}>
                        {act.impact.toUpperCase()} IMPACT
                      </span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-medium border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        STATUS: {statusDisplay.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {act.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <span>DESTINATION:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{act.destination || act.target_system}</span>
                      </div>
                      {act.tool && (
                        <div className="flex items-center gap-1">
                          <span>TOOL:</span>
                          <span className="text-slate-600 dark:text-slate-300 font-semibold">{act.tool}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>EXECUTED</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedActionForGatekeeper(act)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          act.impact === 'critical'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Verify & Execute</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Truthful Sources & Tools Audit Card */}
        <SourcesTruthCard
          sources={result.sources}
          toolsUsed={result.tools_used}
        />

        {/* Bottom Bar Primary Action CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Generated: {new Date(result.timestamp).toLocaleTimeString()}</span>
            {result.meta?.location_context && (
              <span className="text-[11px] text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-2">
                {result.meta.location_context}
              </span>
            )}
          </div>

          <button
            type="button"
            id="proceed-to-action-cockpit-btn"
            onClick={() => onNavigate('action')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Full Action Cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Human Confirmation Gatekeeper Modal */}
      <HumanConfirmationModal
        action={selectedActionForGatekeeper}
        isOpen={selectedActionForGatekeeper !== null}
        onClose={() => setSelectedActionForGatekeeper(null)}
        onConfirm={handleExecuteConfirmedAction}
      />

      {/* Location Broadcast Share Modal */}
      <LocationShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        location={result.location_data || null}
        situation={result.situation}
      />
    </div>
  );
};
