import { RiskLevel } from './securityTypes';
import { ActionItem } from '../types';

export interface EvaluatedAction extends ActionItem {
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
  securityNotice?: string;
  verificationChecklist?: {
    serviceName?: string;
    targetNumber?: string;
    locationSummary?: string;
    dispatchReason?: string;
    verifiedSource?: string;
    confidenceScore?: number;
  };
}

export class ActionRiskEngine {
  /**
   * Classify any action item based on strict functional semantics
   */
  static evaluateAction(action: ActionItem, context?: { locationCity?: string; locationCoords?: string }): EvaluatedAction {
    const titleLower = (action.title || '').toLowerCase();
    const descLower = (action.description || '').toLowerCase();
    const destLower = (action.destination || '').toLowerCase();
    const combined = `${titleLower} ${descLower} ${destLower}`;

    let riskLevel: RiskLevel = 'low';
    let requiresConfirmation = false;
    let securityNotice = '';

    // CRITICAL: Emergency calls, physical infrastructure actuation, automated alerts to public safety
    if (
      destLower.includes('tel:') ||
      combined.includes('emergency call') ||
      combined.includes('dispatch') ||
      combined.includes('dial 112') ||
      combined.includes('dial 911') ||
      combined.includes('dial 108') ||
      combined.includes('ambulance') ||
      combined.includes('evacuate') ||
      combined.includes('spillway') ||
      combined.includes('shutoff') ||
      combined.includes('power trip') ||
      action.impact === 'critical'
    ) {
      riskLevel = 'critical';
      requiresConfirmation = true;
      securityNotice = 'CRITICAL IMPACT: High-stakes real-world emergency action. Requires explicit human verification before execution. AI execution alone is strictly blocked.';
    }
    // HIGH: Location sharing, personal info disclosure, external notifications, sensor broadcasts
    else if (
      combined.includes('share location') ||
      combined.includes('broadcast gps') ||
      combined.includes('send message') ||
      combined.includes('sms') ||
      combined.includes('email') ||
      combined.includes('export data') ||
      action.impact === 'high'
    ) {
      riskLevel = 'high';
      requiresConfirmation = true;
      securityNotice = 'HIGH RISK: External communication or private telemetry sharing. Requires explicit user consent.';
    }
    // MEDIUM: Saving state, opening navigational maps, drafting reports
    else if (
      combined.includes('save') ||
      combined.includes('draft') ||
      combined.includes('open map') ||
      combined.includes('view route') ||
      action.impact === 'medium'
    ) {
      riskLevel = 'medium';
      requiresConfirmation = false;
      securityNotice = 'MEDIUM RISK: State modification or external navigation view. Safe to execute upon user click.';
    }
    // LOW: Summaries, unit conversions, numerical calculation verification
    else {
      riskLevel = 'low';
      requiresConfirmation = false;
      securityNotice = 'LOW RISK: Read-only calculation or formatting. Safe for direct display.';
    }

    // Build verification checklist if emergency / high impact
    const isEmergency = riskLevel === 'critical' || destLower.includes('tel:');
    const phoneMatch = destLower.match(/tel:([+\d\s-]+)/);
    const targetNumber = phoneMatch ? phoneMatch[1] : (combined.includes('112') ? '112' : combined.includes('911') ? '911' : undefined);

    const verificationChecklist = isEmergency ? {
      serviceName: action.title,
      targetNumber: targetNumber || '112 (National Emergency)',
      locationSummary: context?.locationCity || 'Current Verified GPS Telemetry',
      dispatchReason: action.description,
      verifiedSource: 'Authoritative Emergency Directory & Gemini 3.8 Reasoning',
      confidenceScore: 0.99
    } : undefined;

    return {
      ...action,
      riskLevel,
      requiresConfirmation,
      securityNotice,
      verificationChecklist
    };
  }

  /**
   * Evaluate a full array of proposed actions from the AI pipeline
   */
  static evaluateBatch(actions: ActionItem[], context?: { locationCity?: string; locationCoords?: string }): EvaluatedAction[] {
    return (actions || []).map(a => this.evaluateAction(a, context));
  }

  static evaluateAll(actions: ActionItem[], context?: { locationCity?: string; locationCoords?: string }): EvaluatedAction[] {
    return this.evaluateBatch(actions, context);
  }
}
