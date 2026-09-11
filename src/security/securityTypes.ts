export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type SecurityEventType =
  | 'auth_login'
  | 'auth_logout'
  | 'auth_signup'
  | 'auth_verification'
  | 'auth_guest_emergency'
  | 'app_check_verified'
  | 'app_check_failed'
  | 'ssrf_blocked'
  | 'prompt_injection_blocked'
  | 'rate_limit_exceeded'
  | 'emergency_call_gate_shown'
  | 'emergency_call_confirmed'
  | 'emergency_call_cancelled'
  | 'location_share_requested'
  | 'location_share_started'
  | 'location_share_stopped'
  | 'code_execution_sandboxed'
  | 'phone_number_masked'
  | 'permission_changed'
  | 'untrusted_input_sanitized'
  | 'secret_exfiltration_prevented'
  | 'function_execution'
  | 'storage_violation'
  | 'action_completed'
  | 'dangerous_action_blocked'
  | 'file_security_rejected';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  action: string;
  details: string;
  userId?: string;
  ipAddress?: string;
  resourceId?: string;
}

export interface SecurityStatusReport {
  timestamp: string;
  overallStatus: 'secure' | 'warning' | 'alert';
  authentication: {
    status: 'enforced' | 'emergency_guest' | 'unauthenticated';
    label: string;
    currentUser: string;
    role: string;
    method: string;
  };
  appCheck: {
    status: 'active' | 'enforced' | 'simulated';
    label: string;
    provider: string;
    tokensIssued: number;
    failedAttempts: number;
  };
  firestoreRules: {
    status: 'enforced';
    label: string;
    isolationModel: string;
  };
  storageRules: {
    status: 'enforced';
    label: string;
    maxFileSizeBytes: number;
    mimeRestrictions: string;
  };
  apiSecrets: {
    status: 'server_only';
    label: string;
    exposedClientSecrets: 0;
  };
  functionGate: {
    status: 'active';
    label: string;
    policy: string;
  };
  locationPrivacy: {
    status: 'user_controlled';
    label: string;
    activeSharesCount: number;
    consentRequired: true;
  };
  actionConfirmation: {
    status: 'enforced';
    label: string;
    highRiskBlockedWithoutConfirmation: true;
    criticalRiskBlockedWithoutConfirmation: true;
  };
  ssrfDefense: {
    status: 'active';
    label: string;
    blockedAttempts: number;
  };
  aiPromptSafety: {
    status: 'active';
    label: string;
    untrustedDataDelimiters: true;
  };
}

export interface UserSecurityProfile {
  uid: string;
  email?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  displayName: string;
  fullName?: string;
  photoURL?: string;
  bio?: string;
  isVerified?: boolean;
  provider?: 'google' | 'phone' | 'email' | 'guest' | string;
  providers?: string[];
  role: 'user' | 'emergency_responder' | 'admin';
  isAnonymous: boolean;
  createdAt: string;
  appCheckVerified: boolean;
}

export interface LocationShareSession {
  id: string;
  recipient: string;
  durationMinutes: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  status: 'active' | 'stopped' | 'expired';
  startedAt: string;
  expiresAt: string;
}
