import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, X, Terminal, Lock, PhoneCall, ArrowRight } from 'lucide-react';
import { ActionItem } from '../types';

interface HumanConfirmationModalProps {
  action: ActionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actionId: string, updatedParams?: Record<string, any>) => void;
}

export const HumanConfirmationModal: React.FC<HumanConfirmationModalProps> = ({
  action,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !action) return null;

  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [paramsJson, setParamsJson] = useState(
    JSON.stringify(action.parameters || { timestamp: new Date().toISOString(), priority: action.impact }, null, 2)
  );
  const [isEditingParams, setIsEditingParams] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isCritical = action.impact === 'critical';
  const isEmergencyCall = action.destination?.includes('112') || action.tool?.includes('112') || action.title?.toLowerCase().includes('112');

  const handleConfirm = () => {
    let parsedParams = action.parameters;
    if (isEditingParams) {
      try {
        parsedParams = JSON.parse(paramsJson);
      } catch (err: any) {
        setJsonError('Invalid JSON parameters format');
        return;
      }
    }

    onConfirm(action.id, parsedParams);
    onClose();

    // If it's a telephone dialer action, trigger browser dialer safely
    if (isEmergencyCall) {
      window.location.href = 'tel:112';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        id="human-confirmation-modal"
        className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-foreground animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isCritical
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
        }`}>
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5" />
            <div>
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase block">
                NEXA HUMAN GATEKEEPER PROTOCOL
              </span>
              <h3 className="font-bold text-sm text-foreground">
                Consequential Action Confirmation Required
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Action Overview Card */}
          <div className="bg-muted/40 p-3.5 rounded-lg border border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">{action.title}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isCritical
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                {action.impact} IMPACT
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {action.description}
            </p>

            <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-muted-foreground text-[10px] block">DESTINATION</span>
                <span className="font-medium text-foreground">{action.destination || action.target_system}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">REQUIRED TOOL</span>
                <span className="font-medium text-foreground">{action.tool}</span>
              </div>
            </div>
          </div>

          {/* Emergency Special Warning */}
          {isEmergencyCall && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-900 dark:text-rose-200 flex items-start gap-2">
              <PhoneCall className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Emergency Dialing Warning (112):</strong>
                <span>
                  Confirming this action will initiate a direct cellular/telephony call to the National Emergency Response Centre (112).
                </span>
              </div>
            </div>
          )}

          {/* Action Parameters Inspector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                EXECUTION PARAMETERS:
              </span>
              <button
                type="button"
                onClick={() => setIsEditingParams(!isEditingParams)}
                className="text-[10px] text-primary hover:underline font-mono"
              >
                {isEditingParams ? 'Save View' : 'Edit Parameters'}
              </button>
            </div>

            {isEditingParams ? (
              <div>
                <textarea
                  value={paramsJson}
                  onChange={(e) => {
                    setParamsJson(e.target.value);
                    setJsonError(null);
                  }}
                  rows={4}
                  className="w-full font-mono text-[11px] p-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
                {jsonError && <p className="text-rose-500 text-[10px] mt-1">{jsonError}</p>}
              </div>
            ) : (
              <pre className="p-2 bg-background border border-border/80 rounded font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-24">
                {paramsJson}
              </pre>
            )}
          </div>

          {/* Explicit Human Gatekeeper Checkbox */}
          <div className="p-3 bg-background border border-border rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                id="human-gatekeeper-confirm-checkbox"
                type="checkbox"
                checked={hasAcknowledged}
                onChange={(e) => setHasAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-foreground/90 select-none">
                I have reviewed the destination, parameters, and risk level. I explicitly authorize NEXA to execute this consequential action.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
          >
            Cancel / Abort
          </button>
          <button
            id="execute-confirmed-action-btn"
            type="button"
            disabled={!hasAcknowledged}
            onClick={handleConfirm}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all ${
              hasAcknowledged
                ? isCritical
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-sm'
                  : 'bg-primary hover:bg-primary/90 shadow-sm'
                : 'bg-muted-foreground/30 cursor-not-allowed text-muted-foreground'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>CONFIRM & EXECUTE ACTION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
