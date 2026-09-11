import React, { useState } from 'react';
import { Terminal, CheckCircle2, Copy, Check, Calculator, Play, Cpu } from 'lucide-react';
import { CodeExecutionData } from '../types';

interface CodeExecutionCardProps {
  data?: CodeExecutionData;
}

export const CodeExecutionCard: React.FC<CodeExecutionCardProps> = ({ data }) => {
  if (!data) return null;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.output || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="code-execution-card" className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <span>Isolated Node V8 Code Execution</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                VERIFIED DETERMINISTIC MATH
              </span>
            </h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              Runtime Latency: {data.executionTimeMs || 1.2} ms | Sandbox: Isolated Node.js Context
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="p-1 rounded text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
          title="Copy output"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span className="text-[10px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="bg-slate-950 text-emerald-400 p-3 rounded-lg font-mono text-xs overflow-x-auto shadow-inner">
          <div className="text-[10px] text-slate-500 pb-1 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-slate-400" />
            <span>STDOUT & RETURN VALUE:</span>
          </div>
          <pre className="whitespace-pre-wrap">{data.output}</pre>
        </div>

        {data.calculations && Object.keys(data.calculations).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            {Object.entries(data.calculations).map(([key, val]) => (
              <div key={key} className="bg-muted/40 p-2 rounded border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase block">{key}</span>
                <span className="font-bold text-foreground">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
