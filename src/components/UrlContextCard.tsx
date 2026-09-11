import React from 'react';
import { ExternalLink, CheckCircle2, Globe, Clock, ShieldCheck } from 'lucide-react';
import { UrlContextData } from '../types';

interface UrlContextCardProps {
  data?: UrlContextData;
}

export const UrlContextCard: React.FC<UrlContextCardProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div id="url-context-card" className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <span>Live Web Document & URL Ingestion</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                HTTP {data.status} CONFIRMED
              </span>
            </h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              Retrieved: {new Date(data.retrievedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-mono text-xs flex items-center gap-1"
        >
          <span>Visit URL</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="mt-3 space-y-2 text-xs">
        <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
          <span className="font-bold text-foreground text-xs block mb-1">{data.title || data.url}</span>
          <p className="text-muted-foreground leading-relaxed text-[11px]">{data.summary}</p>
        </div>
      </div>
    </div>
  );
};
