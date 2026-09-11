import { AuditLogEntry, SecurityEventType } from './securityTypes';
import { maskPhoneNumber } from './inputSanitizer';

const AUDIT_STORAGE_KEY = 'nexa_security_audit_log_v1';
const MAX_LOCAL_LOGS = 100;

class AuditLoggerService {
  private inMemoryLogs: AuditLogEntry[] = [];
  private listeners: Array<(logs: AuditLogEntry[]) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.inMemoryLogs = JSON.parse(stored);
      }
    } catch {
      this.inMemoryLogs = [];
    }

    // Seed default baseline audit entry if brand new
    if (this.inMemoryLogs.length === 0) {
      this.log({
        eventType: 'app_check_verified',
        severity: 'info',
        action: 'App Integrity Initialized',
        details: 'NEXA Security Core active. Multi-layer validation and Action Risk Engine armed.'
      });
    }
  }

  private saveToStorage() {
    try {
      const trimmed = this.inMemoryLogs.slice(0, MAX_LOCAL_LOGS);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {
      console.warn('[NEXA Audit Logger] Storage write error:', err);
    }
  }

  private notify() {
    this.listeners.forEach(fn => fn([...this.inMemoryLogs]));
  }

  /**
   * Log a security event. Automatically sanitizes and scrubs PII & secrets.
   */
  log(params: {
    eventType: SecurityEventType;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    action: string;
    details: string;
    userId?: string;
    ipAddress?: string;
    resourceId?: string;
  }): AuditLogEntry {
    // 1. Scrub details against accidental password/key leak
    let sanitizedDetails = params.details || '';
    sanitizedDetails = sanitizedDetails
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED_AUTH_TOKEN]')
      .replace(/"password"\s*:\s*"[^"]+"/gi, '"password":"[REDACTED]"')
      .replace(/"apiKey"\s*:\s*"[^"]+"/gi, '"apiKey":"[REDACTED]"');

    // 2. Mask phone numbers if found in details
    const phoneRegex = /(\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4})/g;
    sanitizedDetails = sanitizedDetails.replace(phoneRegex, (match) => maskPhoneNumber(match));

    const entry: AuditLogEntry = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      eventType: params.eventType,
      severity: params.severity,
      action: params.action,
      details: sanitizedDetails,
      userId: params.userId || 'anonymous-session',
      ipAddress: params.ipAddress,
      resourceId: params.resourceId
    };

    this.inMemoryLogs.unshift(entry);
    if (this.inMemoryLogs.length > MAX_LOCAL_LOGS) {
      this.inMemoryLogs = this.inMemoryLogs.slice(0, MAX_LOCAL_LOGS);
    }

    this.saveToStorage();
    this.notify();

    // Fire non-blocking telemetry sync to backend if available
    try {
      fetch('/api/security/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {
        // Silently tolerate server offline in local test
      });
    } catch {
      // Ignore sync error
    }

    return entry;
  }

  getLogs(): AuditLogEntry[] {
    return [...this.inMemoryLogs];
  }

  subscribe(listener: (logs: AuditLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.inMemoryLogs]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clearLogs() {
    this.inMemoryLogs = [];
    this.saveToStorage();
    this.notify();
  }
}

export const auditLogger = new AuditLoggerService();
export const AuditLogger = auditLogger;
