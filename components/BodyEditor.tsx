'use client';

import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import { useApiStore } from '@/lib/store';

export const BodyEditor = () => {
  const { tabs, activeTabId, updateActiveTabRequest } = useApiStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (!activeTab) return null;

  const { method, body } = activeTab.request;

  if (['GET', 'HEAD'].includes(method)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-card/20 rounded-xl border border-dashed border-border m-4">
        <p className="text-sm font-medium">Standard {method} requests do not usually have a body.</p>
        <button 
          onClick={() => updateActiveTabRequest({ method: 'POST' })}
          className="mt-4 text-xs text-primary hover:underline transition-all"
        >
          Switch to POST to add a body
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">JSON Body</h3>
        <button 
          onClick={() => {
            try {
              const formatted = JSON.stringify(JSON.parse(body), null, 2);
              updateActiveTabRequest({ body: formatted });
            } catch (e) {}
          }}
          className="text-[10px] text-primary hover:underline opacity-80 hover:opacity-100 transition-opacity"
        >
          Beautify JSON
        </button>
      </div>
      <div className="border border-border rounded-xl bg-[#0f0f11] min-h-[300px] overflow-hidden editor-container shadow-inner">
        <Editor
          value={body}
          onValueChange={code => updateActiveTabRequest({ body: code })}
          highlight={code => highlight(code, languages.json, 'json')}
          padding={20}
          className="font-mono min-h-[300px] focus:outline-none leading-relaxed"
          placeholder='{ "key": "value" }'
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 13,
          }}
        />
      </div>
    </div>
  );
};
