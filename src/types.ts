export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type ActionStatus = 
  | 'recommended' 
  | 'ready' 
  | 'waiting_confirmation' 
  | 'executing' 
  | 'completed' 
  | 'failed' 
  | 'rejected' 
  | 'pending' 
  | 'executed';

export type LocationStatus = 
  | 'unavailable' 
  | 'requesting_permission' 
  | 'permission_denied' 
  | 'available' 
  | 'live_tracking' 
  | 'stale';

export interface LocationData {
  status: LocationStatus;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  formattedAddress?: string;
  timestamp: number;
  freshness: 'LIVE' | 'FRESH' | 'STALE' | 'UNAVAILABLE';
}

export interface EmergencyContact {
  number: string;
  service: string;
  name?: string;
  jurisdiction?: string;
  country: string;
  region?: string;
  source: string;
  sourceTimestamp?: string;
  confidence: number;
  verificationStatus: 'verified' | 'unverified';
  note?: string;
}

export interface ReachableService {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire' | 'ambulance' | 'trauma' | 'pharmacy' | 'other';
  address: string;
  distanceKm: number;
  durationMin: number;
  trafficState: 'light' | 'moderate' | 'heavy';
  phone?: string;
  isFastest: boolean;
  source: string;
  lastUpdated: string;
}

export interface TrafficRoute {
  id: string;
  name: string;
  durationMin: number;
  distanceKm: number;
  trafficLevel: 'light' | 'moderate' | 'heavy';
  trafficCondition?: string;
  delayMin: number;
  congestionDelayMin?: number;
  isRecommended: boolean;
  summary: string;
  explanation: string;
  reason?: string;
  polylineSummary?: string;
}

export interface TrafficComparison {
  origin: string;
  destination: string;
  routes: TrafficRoute[];
  recommendedRouteId: string;
  recommendationReason?: string;
  freshness: 'LIVE' | 'FRESH' | 'STALE' | 'UNAVAILABLE';
  lastUpdated: string;
}

export interface CodeExecutionData {
  code: string;
  output: string;
  calculations: Record<string, any>;
  executionTimeMs: number;
}

export interface UrlContextData {
  url: string;
  title?: string;
  summary: string;
  retrievedAt: string;
  verified: boolean;
}

export interface InformationSource {
  name: string;
  type: string;
  url?: string;
  lastUpdated: string;
  verified: boolean;
}

export type SourceItem = InformationSource;

export interface SystemIntegrationStatus {
  gemini: { status: 'active' | 'fallback' | 'offline'; label: string; model: string };
  search: { status: 'active' | 'available' | 'unavailable'; label: string };
  maps: { status: 'connected' | 'available' | 'requires_key'; label: string };
  routes: { status: 'active' | 'available' | 'requires_key'; label: string };
  codeExec: { status: 'active' | 'available'; label: string };
  urlContext: { status: 'active' | 'available'; label: string };
  firebase: { status: 'active' | 'ready'; label: string };
  cloudRun: { status: 'deployed' | 'active'; label: string };
  location: { status: LocationStatus; label: string; accuracy?: number | null };
  voice: { status: 'available' | 'unsupported' | 'listening'; label: string };
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  action_type?: string; // "User action" | "Guided procedure" | "External lookup"
  destination?: string; // Truthful destination, e.g. "Emergency services: 112", "Google Maps Navigation", "Facility Safety Officer"
  tool?: string; // "Google Maps" | "Google Search" | "Phone dialer (112)" | "User checklist"
  target_system: string; // Truthful label retained for compatibility
  impact: UrgencyLevel;
  parameters: Record<string, string | number | boolean | string[] | number[] | Record<string, any>>;
  requires_confirmation: boolean;
  status: ActionStatus;
  step?: number;
  executed_at?: string;
  execution_receipt?: {
    tx_id: string;
    action_type?: string;
    destination?: string;
    target_endpoint?: string;
    status_code: number;
    latency_ms: number;
    timestamp: string;
    verified_hash?: string;
    notes?: string;
  };
  execution_logs?: string[];
}

export interface NexaResult {
  id: string;
  timestamp: string;
  intent: string;
  situation: string;
  urgency: UrgencyLevel;
  confidence: number; // 0.0 - 1.0 (Model confidence)
  confidence_note?: string; // "Confidence reflects the model's assessment of its interpretation, not factual certainty."
  input_observations: string[]; // Facts directly observable or explicitly stated in the supplied input
  observations?: string[]; // Alias for input_observations
  verified_facts: string[]; // Facts confirmed using an actual external/reliable source or tool
  external_verification_status?: 'verified' | 'unavailable' | 'none';
  external_verification_note?: string; // e.g. "External verification unavailable — result based on supplied input"
  inferences: string[]; // AI reasoning or interpretation
  uncertainties: string[]; // Information that cannot be established
  entities?: { name: string; category?: string; detail?: string }[]; // Extracted key physical entities, telemetry items, or actors
  verification_required?: boolean; // Whether external tools were genuinely required
  required_tools?: string[]; // Tools required for execution or validation
  reasoning_summary?: string; // Crisp high-level operational synthesis
  medical_safety_notice?: string; // Disclaimer for medical contexts
  recommended_actions: ActionItem[];
  requires_human_confirmation: boolean;
  
  // Real-time Action Bridge Extensions
  location_data?: LocationData;
  emergency_contacts?: EmergencyContact[];
  emergency_services?: ReachableService[];
  fastest_service?: ReachableService;
  traffic_comparison?: TrafficComparison;
  code_execution?: CodeExecutionData;
  url_context?: UrlContextData;
  sources?: InformationSource[];
  tools_used?: string[];
  
  meta?: {
    input_type: 'text' | 'image' | 'document' | 'audio' | 'multimodal';
    input_preview: string;
    processing_time_ms: number;
    tokens_analyzed?: number;
    verification_score?: number;
    model_version?: string;
    location_context?: string;
  };
}

export type ScreenView = 
  | 'landing' 
  | 'input' 
  | 'processing' 
  | 'situation' 
  | 'action' 
  | 'scenarios'
  | 'history'
  | 'settings' 
  | 'security' 
  | 'location' 
  | 'emergency' 
  | 'traffic';

export type BridgeStage = 
  | 'INPUT' 
  | 'UNDERSTAND' 
  | 'STRUCTURE' 
  | 'VERIFY' 
  | 'REASON' 
  | 'ACTION';

export interface StageInfo {
  stage: BridgeStage;
  title: string;
  description: string;
  status: 'idle' | 'active' | 'completed' | 'error';
  progress: number;
  details: string[];
}

export interface AttachedMedia {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64 without prefix or data url
  size: number;
  previewUrl?: string;
  type: 'image' | 'document' | 'audio';
}

export interface SampleScenario {
  id: string;
  title: string;
  category: string;
  summary: string;
  urgency: UrgencyLevel;
  iconName: string;
  input: {
    text: string;
    mediaNote?: string;
    mediaMimeType?: string;
    mediaName?: string;
  };
}
