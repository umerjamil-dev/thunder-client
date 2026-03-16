'use client';

import React from 'react';
import { useApiStore } from '@/lib/store';
import { clsx } from 'clsx';

export const ResponsePanel = () => {
  const { tabs, activeTabId } = useApiStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  const response = activeTab?.response;

  if (!activeTab || !response) return null;

  if (response.loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse py-12">
        Sending request...
      </div>
    );
  }

  if (!response.status && !response.error) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic py-12">
        Send a request to see the response data...
      </div>
    );
  }

  const isError = response.status === 0 || (response.status && response.status >= 400);

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Response</h3>
        <div className="flex gap-4 text-xs font-semibold">
          <span className={clsx(
            isError ? "text-red-500" : "text-emerald-500",
            "bg-accent/50 px-2 py-1 rounded"
          )}>
            {response.status} {response.statusText}
          </span>
          <span className="bg-accent/50 px-2 py-1 rounded text-blue-400">{response.time}ms</span>
          <span className="bg-accent/50 px-2 py-1 rounded text-purple-400">{response.size}</span>
        </div>
      </div>
      
      {response.error ? (
        <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {response.error}
        </div>
      ) : (
        <div className="flex-1 bg-card border border-border rounded-xl p-4 overflow-auto shadow-inner group relative min-h-[200px]">
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-accent hover:bg-accent-foreground/10 text-xs px-2 py-1 rounded border border-border"
          >
            Copy
          </button>
          <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
