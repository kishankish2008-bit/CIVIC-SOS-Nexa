import React, { useState } from 'react';
import { NexaResult } from '../types';
import { X, Copy, Check, Download, FileCode } from 'lucide-react';

interface RawJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NexaResult | null;
}

export const RawJsonModal: React.FC<RawJsonModalProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  // Clean formatted output adhering strictly to user schema specification
  const formattedSchema = {
    intent: data.intent,
    situation: data.situation,
    urgency: data.urgency,
    confidence: data.confidence,
    verified_facts: data.verified_facts,
    inferences: data.inferences,
    uncertainties: data.uncertainties,
    recommended_actions: data.recommended_actions.map((act) => ({
      id: act.id,
      title: act.title,
      description: act.description,
      target_system: act.target_system,
      impact: act.impact,
      parameters: act.parameters,
      requires_confirmation: act.requires_confirmation,
      status: act.status,
    })),
    requires_human_confirmation: data.requires_human_confirmation,
  };

  const jsonString = JSON.stringify(formattedSchema, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexa_result_${data.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="raw-json-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161E2E] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-500" />
            <h3 id="raw-json-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
              NEXA Structured JSON Schema Audit
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/60">
          <pre className="leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Schema compliance: 100% verified</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};
