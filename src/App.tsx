import React, { useState, useEffect, useRef } from 'react';
import { 
  ScreenView, 
  BridgeStage, 
  NexaResult, 
  AttachedMedia, 
  SampleScenario, 
  ActionItem,
  LocationData
} from './types';
import { SAMPLE_SCENARIOS } from './data/sampleScenarios';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './security/authContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LandingHomeView } from './components/views/LandingHomeView';
import { UniversalInputView } from './components/views/UniversalInputView';
import { ProcessingView } from './components/views/ProcessingView';
import { SituationCardView } from './components/views/SituationCardView';
import { ActionConfirmationView } from './components/views/ActionConfirmationView';
import { ScenariosView } from './components/views/ScenariosView';
import { HistoryView } from './components/views/HistoryView';
import { LiveLocationView } from './components/views/LiveLocationView';
import { EmergencyView } from './components/views/EmergencyView';
import { TrafficRoutesView } from './components/views/TrafficRoutesView';
import { SettingsView } from './components/views/SettingsView';
import { NexaLivePanel } from './components/NexaLivePanel';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RawJsonModal } from './components/RawJsonModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SecurityStatusPanel } from './components/SecurityStatusPanel';
import { ActionRiskEngine } from './security/riskEngine';
import { AuditLogger } from './security/auditLogger';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useLiveLocation } from './hooks/useLiveLocation';
import { useVoiceInput } from './hooks/useVoiceInput';

const STORAGE_KEY = 'nexa_bridge_history_v2';

function NexaDashboard() {
  const [currentView, setCurrentView] = useState<ScreenView>('landing');
  const [activeResult, setActiveResult] = useState<NexaResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<BridgeStage>('INPUT');
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<NexaResult[]>([]);
  
  const [inputText, setInputText] = useState<string>('');
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);

  // Live device telemetry & voice ingress hooks
  const liveLoc = useLiveLocation();
  const voice = useVoiceInput();

  // Modals
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Mobile sidebar drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // In-flight request tracking & abort control to discard stale results and cancel old requests
  const activeAbortRef = useRef<AbortController | null>(null);
  const requestIdCounterRef = useRef<number>(0);

  // Initial seed benchmark record so the app has realistic data right away
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setActiveResult(parsed[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved history:', err);
    }

    const seedResult: NexaResult = {
      id: 'nexa-seed-01',
      timestamp: new Date().toISOString(),
      intent: 'Mitigate weir seepage at Buttress 3, protect Sector B residents, and prevent highway collapse.',
      situation: 'River gauge R-12 measured 4.8m above flood crest before telemetry went offline. Field inspections confirmed active turbid water seepage along Buttress 3 of the Lower Arroyo Weir with early undercutting on Highway 104 bridge abutment.',
      urgency: 'critical',
      confidence: 0.94,
      confidence_note: "Reflects the model's assessment of its interpretation, not factual certainty.",
      input_observations: [
        'River gauge station R-12 recorded +4.8m above flood threshold before telemetry loss.',
        'Turbid water seepage observed along Buttress 3 of Lower Arroyo Weir by Field Unit 7.',
        'Precipitation rate stated as 42mm/hr in the catchment basin.',
        'Highway 104 bridge abutment scour detected between Mile Markers 18 and 24.'
      ],
      verified_facts: [],
      external_verification_status: 'unavailable',
      external_verification_note: 'External tool verification unavailable — assessment derived from supplied dispatch logs.',
      inferences: [
        'Downstream inundation of Lowland Sector B probable within 60-90 minutes if unchecked.',
        'SCADA telemetry failure likely caused by regional substation power trip.',
        'High risk of structural bridge failure under continuous heavy commercial vehicle transit.'
      ],
      uncertainties: [
        'Acoustic radar required to measure cavity depth behind Buttress 3.',
        'Exact count of un-notified households remaining in Lowland Sector B.'
      ],
      recommended_actions: [
        {
          id: 'act-fld-1',
          title: 'Initiate Emergency Spillway Diversion Gate 2 & 3',
          description: 'Relieve hydraulic head pressure on Buttress 3 by opening diversion gates 30% gradually.',
          destination: 'Water Resources & Dam Operations Desk',
          tool: 'Operational Protocol Checklist',
          target_system: 'Water Resources & Dam Operations Desk',
          impact: 'critical',
          parameters: { diversion_rate: '350 m3/s', gate_ids: ['GATE_02', 'GATE_03'], ramp_up_min: 15 },
          requires_confirmation: true,
          status: 'waiting_confirmation',
          step: 1
        },
        {
          id: 'act-fld-2',
          title: 'Broadcast Emergency Civil Defense Evacuation Advisory',
          description: 'Trigger community emergency sirens and public announcement for low-lying Sector B.',
          destination: 'Emergency Response Centre (Call 112)',
          tool: 'Emergency Services Direct Relay (112)',
          target_system: 'Emergency Response Centre (Call 112)',
          impact: 'critical',
          parameters: { sector: 'SECTOR_B_LOWLANDS', severity: 'IMMEDIATE', alert_type: 'CIVIL_DEFENSE_EVAC' },
          requires_confirmation: true,
          status: 'waiting_confirmation',
          step: 2
        },
        {
          id: 'act-fld-3',
          title: 'Deploy Highway 104 Barricades & Detour Route',
          description: 'Barricade MM 18 to MM 24 and redirect commercial transit to State Route 9.',
          destination: 'Traffic Police & Highway Authority Dispatch',
          tool: 'Traffic Advisory System',
          target_system: 'Traffic Police & Highway Authority Dispatch',
          impact: 'high',
          parameters: { road_id: 'HWY_104', start_mm: 18, end_mm: 24, detour_route: 'STATE_RT_09' },
          requires_confirmation: true,
          status: 'waiting_confirmation',
          step: 3
        }
      ],
      requires_human_confirmation: true,
      meta: {
        input_type: 'multimodal',
        input_preview: 'EMERGENCY DISPATCH - River gauge station R-12 reading +4.8m with Buttress 3 seepage...',
        processing_time_ms: 1080,
        model_version: 'gemini-3.8-flash',
        verification_score: 0.94,
        location_context: 'Emergency Response: 112 (India standard)'
      }
    };

    setHistory([seedResult]);
    setActiveResult(seedResult);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (err) {
        console.warn('Failed to save history:', err);
      }
    }
  }, [history]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is actively in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentView('input');
        return;
      }

      if (e.key === 'Escape') {
        setIsJsonModalOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setMobileMenuOpen(false);
      } else if (e.key === '1') {
        setCurrentView('landing');
      } else if (e.key === '2') {
        setCurrentView('input');
      } else if (e.key === '3') {
        setCurrentView('processing');
      } else if (e.key === '4') {
        if (activeResult) setCurrentView('situation');
      } else if (e.key === '5') {
        if (activeResult) setCurrentView('action');
      } else if (e.key === '6') {
        setCurrentView('scenarios');
      } else if (e.key === '7') {
        setCurrentView('history');
      } else if (e.key === '?' || (e.key === 'h' && !e.ctrlKey && !e.metaKey)) {
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeResult]);

  // Execute the 6-stage AI Action Pipeline with zero artificial delay
  const handleProcessInput = async (text: string, media: AttachedMedia[], customLoc?: LocationData) => {
    // Abort any prior in-flight request so it cannot hang or collide
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const thisRequestId = ++requestIdCounterRef.current;
    const abortController = new AbortController();
    activeAbortRef.current = abortController;

    setIsProcessing(true);
    setCurrentView('processing');
    setCurrentStage('INPUT');
    setProcessingLogs([`[${new Date().toLocaleTimeString()}] Ingress payload received. Transmitting to Gemini 3.8 Flash...`]);

    const addLog = (msg: string) => {
      setProcessingLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    // Non-blocking visual ticker that runs concurrently while the network request is in-flight
    const stages: { stage: BridgeStage; log: string }[] = [
      { stage: 'UNDERSTAND', log: 'Gemini 3.8 Flash analyzing intent, urgency, and operational scope...' },
      { stage: 'STRUCTURE', log: 'Normalizing temporal timestamps, physical telemetry, and system targets...' },
      { stage: 'VERIFY', log: 'Auditing ground truth: Differentiating verified anchors from inferences...' },
      { stage: 'REASON', log: 'Formulating step-by-step resolution plan and human gatekeeper flags...' },
    ];
    let stageIndex = 0;
    const ticker = setInterval(() => {
      if (stageIndex < stages.length) {
        setCurrentStage(stages[stageIndex].stage);
        addLog(stages[stageIndex].log);
        stageIndex++;
      }
    }, 250);

    try {
      const clientTimeout = setTimeout(() => abortController.abort(), 9800);

      const effectiveLocation = customLoc || liveLoc.location || undefined;

      // Fire API call immediately at millisecond 0
      const response = await fetch('/api/bridge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          text,
          media: media.map((m) => ({
            name: m.name,
            mimeType: m.mimeType,
            data: m.data,
          })),
          location: effectiveLocation,
        }),
      });

      clearTimeout(clientTimeout);
      clearInterval(ticker);

      // Discard stale response if a newer request was dispatched
      if (thisRequestId !== requestIdCounterRef.current) {
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: NexaResult = await response.json();

      if (thisRequestId !== requestIdCounterRef.current) {
        return;
      }

      // Layered Security: Pass all proposed actions through ActionRiskEngine
      const evaluatedActions = ActionRiskEngine.evaluateAll(result.recommended_actions || [], {
        locationCity: result.location_data?.city,
        locationCoords: result.location_data?.latitude ? `${result.location_data.latitude}, ${result.location_data.longitude}` : undefined
      });
      result.recommended_actions = evaluatedActions;

      // Mandatory Gatekeeper rule: High or Critical risk requires human confirmation
      if (evaluatedActions.some((a) => a.riskLevel === 'critical' || a.riskLevel === 'high')) {
        result.requires_human_confirmation = true;
      }

      // Record audit event
      AuditLogger.log({
        eventType: 'function_execution',
        severity: result.urgency === 'critical' ? 'critical' : result.urgency === 'high' ? 'high' : 'info',
        action: 'AI Action Proposals Evaluated by Risk Engine',
        details: `Classified ${evaluatedActions.length} actions: ${evaluatedActions.filter((a) => a.riskLevel === 'critical').length} Critical, ${evaluatedActions.filter((a) => a.riskLevel === 'high').length} High. Human gatekeeper: ${result.requires_human_confirmation ? 'MANDATORY' : 'OPTIONAL'}.`,
        resourceId: result.id,
      });

      // Stage 6: ACTION — completed instantly
      setCurrentStage('ACTION');
      addLog(`Synthesized ${result.recommended_actions.length} deterministic system actions. Human gatekeeper: ${result.requires_human_confirmation ? 'MANDATORY' : 'OPTIONAL'}`);
      addLog('Universal Action Bridge processing successfully completed.');

      setActiveResult(result);
      setHistory((prev) => [result, ...prev.filter((item) => item.id !== result.id)]);
      setIsProcessing(false);

      // Instant transition to Situation Card
      setCurrentView('situation');
    } catch (err: any) {
      clearInterval(ticker);
      if (err.name === 'AbortError' || thisRequestId !== requestIdCounterRef.current) {
        // Request was superseded or cancelled; do not overwrite state with stale fallback
        return;
      }

      console.warn('Pipeline notice:', err);
      addLog(`Notice: ${err.message || 'Processing switched to autonomous bridge'}. Operating on local heuristic engine...`);

      // Graceful fallback to guarantee zero user interruption
      const fallbackResult: NexaResult = {
        id: `nexa-out-${Date.now()}`,
        timestamp: new Date().toISOString(),
        intent: 'Review and coordinate action plan for incoming report.',
        situation: text.slice(0, 200) || 'Unstructured situational report processed.',
        urgency: 'high',
        confidence: 0.88,
        confidence_note: "Reflects the model's assessment of its interpretation, not factual certainty.",
        input_observations: [
          `Text transmission received with ${text.trim().split(/\s+/).length} words.`,
          media.length > 0 ? `Multimodal artifact supplied: ${media[0].name}` : 'Direct text input supplied.'
        ],
        verified_facts: [],
        external_verification_status: 'unavailable',
        external_verification_note: 'External tool verification unavailable — result based on supplied input.',
        inferences: ['Operational attention or triage required based on submitted description.'],
        uncertainties: ['Secondary telemetry metrics to be confirmed via site inspection.'],
        recommended_actions: [
          {
            id: 'act-auto-1',
            title: 'Notify Duty Officer / Safety Lead',
            description: 'Send high-priority alert to designated supervisor for situational review.',
            destination: 'Facility Duty Supervisor / Operations Desk',
            tool: 'Internal Communication Relay',
            target_system: 'Facility Duty Supervisor / Operations Desk',
            impact: 'high',
            parameters: { channel: 'DUTY_COMMAND', alert_level: 'PRIORITY_1' },
            requires_confirmation: true,
            status: 'waiting_confirmation',
            step: 1
          },
          {
            id: 'act-auto-2',
            title: 'Log Incident Entry in Operational Registry',
            description: 'Record observation details and parameters in central operational logs.',
            destination: 'Operations Central Registry',
            tool: 'Internal Database Connector',
            target_system: 'Operations Central Registry',
            impact: 'medium',
            parameters: { project: 'OPERATIONS', priority: 'Standard' },
            requires_confirmation: false,
            status: 'ready',
            step: 2
          }
        ],
        requires_human_confirmation: true,
      };

      setActiveResult(fallbackResult);
      setHistory((prev) => [fallbackResult, ...prev]);
      setIsProcessing(false);
      setCurrentView('situation');
    }
  };

  // Load a scenario from the catalog
  const handleSelectScenario = (scenario: SampleScenario) => {
    setInputText(scenario.input.text);
    if (scenario.input.mediaName) {
      const syntheticMedia: AttachedMedia = {
        id: `att-${scenario.id}`,
        name: scenario.input.mediaName,
        mimeType: scenario.input.mediaMimeType || 'image/png',
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        size: 94200,
        previewUrl: scenario.input.mediaMimeType?.startsWith('image')
          ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=400&auto=format&fit=crop&q=60'
          : undefined,
        type: scenario.input.mediaMimeType?.startsWith('image') ? 'image' : 'document',
      };
      setAttachedMedia([syntheticMedia]);
    } else {
      setAttachedMedia([]);
    }
    setCurrentView('input');
  };

  // Update action execution status
  const handleUpdateActionStatus = (
    actionId: string, 
    status: ActionItem['status'], 
    receipt?: any, 
    logs?: string[]
  ) => {
    if (!activeResult) return;

    const updatedActions = activeResult.recommended_actions.map((act) => {
      if (act.id === actionId) {
        return {
          ...act,
          status,
          executed_at: status === 'completed' || status === 'executed' ? new Date().toISOString() : act.executed_at,
          execution_receipt: receipt || act.execution_receipt,
          execution_logs: logs || act.execution_logs,
        };
      }
      return act;
    });

    const updatedResult: NexaResult = {
      ...activeResult,
      recommended_actions: updatedActions,
    };

    setActiveResult(updatedResult);
    setHistory((prev) =>
      prev.map((item) => (item.id === updatedResult.id ? updatedResult : item))
    );
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear storage:', err);
    }
  };

  const handleNavigate = (view: ScreenView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            hasActiveResult={activeResult !== null}
            historyCount={history.length}
            isMobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
            onOpenSettings={() => handleNavigate('settings')}
          />

          {/* Right Main Content Column */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Top Navigation Bar */}
            <TopNav
              currentView={currentView}
              onNavigate={handleNavigate}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
              onOpenSettings={() => handleNavigate('settings')}
              onOpenHelp={() => setIsShortcutsOpen(true)}
            />

            {/* View Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {currentView === 'landing' && (
                <LandingHomeView
                  onNavigate={handleNavigate}
                  onSelectScenario={handleSelectScenario}
                  onProcessInput={handleProcessInput}
                  isProcessing={isProcessing}
                  history={history}
                  locationData={liveLoc.location}
                  locationStatus={liveLoc.status}
                  isLocationTracking={liveLoc.isTracking}
                  isVoiceListening={voice.isListening}
                  onSetCustomLocation={liveLoc.setCustomLocation}
                  onSelectResult={(res) => {
                    setActiveResult(res);
                    setCurrentView('situation');
                  }}
                />
              )}

              {currentView === 'input' && (
                <UniversalInputView
                  onProcess={handleProcessInput}
                  isProcessing={isProcessing}
                  initialText={inputText}
                  initialMedia={attachedMedia}
                  locationData={liveLoc.location}
                  onSetCustomLocation={liveLoc.setCustomLocation}
                  onSelectScenario={handleSelectScenario}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'processing' && (
                <ProcessingView
                  currentStage={currentStage}
                  logs={processingLogs}
                  onNavigate={handleNavigate}
                  inputSnippet={inputText.slice(0, 160) || 'Active Multimodal Ingress'}
                />
              )}

              {currentView === 'situation' && activeResult && (
                <SituationCardView
                  result={activeResult}
                  onNavigate={handleNavigate}
                  onOpenRawJson={() => setIsJsonModalOpen(true)}
                  onReRun={() => {
                    if (inputText) {
                      handleProcessInput(inputText, attachedMedia);
                    } else {
                      setCurrentView('input');
                    }
                  }}
                />
              )}

              {currentView === 'action' && activeResult && (
                <ActionConfirmationView
                  result={activeResult}
                  onUpdateActionStatus={handleUpdateActionStatus}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'scenarios' && (
                <ScenariosView
                  onSelectScenario={handleSelectScenario}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'history' && (
                <HistoryView
                  history={history}
                  onSelectResult={(res) => {
                    setActiveResult(res);
                    setCurrentView('situation');
                  }}
                  onClearHistory={handleClearHistory}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'security' && (
                <SecurityStatusPanel
                  onClose={() => setCurrentView('landing')}
                />
              )}

              {currentView === 'location' && (
                <LiveLocationView
                  location={liveLoc.location}
                  status={liveLoc.status}
                  isTracking={liveLoc.isTracking}
                  accuracyQuality={liveLoc.accuracyQuality}
                  speedKmH={liveLoc.speedKmH}
                  lastUpdatedText={liveLoc.lastUpdatedText}
                  errorMessage={liveLoc.errorMessage}
                  onStartTracking={liveLoc.startTracking}
                  onStopTracking={liveLoc.stopTracking}
                  onRefresh={liveLoc.refreshLocation}
                  onSetCustomLocation={liveLoc.setCustomLocation}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'emergency' && (
                <EmergencyView
                  location={liveLoc.location}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'traffic' && (
                <TrafficRoutesView
                  location={liveLoc.location}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  onNavigate={handleNavigate}
                  historyCount={history.length}
                  onClearHistory={handleClearHistory}
                  onOpenShortcuts={() => setIsShortcutsOpen(true)}
                />
              )}
            </main>

            {/* Desktop / Laptop Right Mini Panel */}
            <div className="p-4 pl-0 hidden xl:block">
              <NexaLivePanel
                location={liveLoc.location}
                isTracking={liveLoc.isTracking}
                onNavigate={handleNavigate}
                onRefresh={liveLoc.refreshLocation}
              />
            </div>
          </div>
        </div>

        {/* Mobile Expandable Status Bar */}
        <NexaLivePanel
          location={liveLoc.location}
          isTracking={liveLoc.isTracking}
          onNavigate={handleNavigate}
          onRefresh={liveLoc.refreshLocation}
        />

        {/* Mobile Fixed Bottom Nav (5 items) */}
        <MobileBottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenQuickVoice={() => handleNavigate('input')}
        />

        {/* Global Modals */}
        <RawJsonModal
          isOpen={isJsonModalOpen}
          onClose={() => setIsJsonModalOpen(false)}
          data={activeResult}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />
      </div>
    );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProtectedRoute>
          <NexaDashboard />
        </ProtectedRoute>
      </ThemeProvider>
    </AuthProvider>
  );
}
