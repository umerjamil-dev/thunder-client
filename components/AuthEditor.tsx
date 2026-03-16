'use client';

import React from 'react';
import { useApiStore, AuthConfig } from '@/lib/store';
import { KeyValueEditor } from './KeyValueEditor';
import { Shield, Key, User, Lock, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

export const AuthEditor = () => {
  const { tabs, activeTabId, updateActiveTabRequest } = useApiStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [showPassword, setShowPassword] = React.useState(false);

  if (!activeTab) return null;

  const auth = activeTab.request.auth || { type: 'none' };

  const updateAuth = (updates: Partial<AuthConfig>) => {
    updateActiveTabRequest({ auth: { ...auth, ...updates } });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
        <Shield className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Authentication</h3>
          <p className="text-xs text-muted-foreground">Select an authentication type for this request.</p>
        </div>
        <select 
          value={auth.type}
          onChange={(e) => updateAuth({ type: e.target.value as any })}
          className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 transition-colors"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="apikey">API Key</option>
        </select>
      </div>

      <div className="px-1">
        {auth.type === 'none' && (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-card/10 text-center">
            <p className="text-sm text-muted-foreground italic">This request does not use authentication.</p>
          </div>
        )}

        {auth.type === 'bearer' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Token</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Key className="h-4 w-4" />
                </div>
                <input 
                  type="text"
                  placeholder="Bearer Token"
                  value={auth.bearerToken || ''}
                  onChange={(e) => updateAuth({ bearerToken: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-10 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Token will be sent in the <code className="bg-accent px-1 rounded">Authorization</code> header as <code className="bg-accent px-1 rounded">Bearer &lt;token&gt;</code>.
              </p>
            </div>
          </div>
        )}

        {auth.type === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input 
                  type="text"
                  placeholder="Username"
                  value={auth.basicUsername || ''}
                  onChange={(e) => updateAuth({ basicUsername: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-10 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={auth.basicPassword || ''}
                  onChange={(e) => updateAuth({ basicPassword: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-10 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {auth.type === 'apikey' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key</label>
              <input 
                type="text"
                placeholder="x-api-key"
                value={auth.apiKeyName || ''}
                onChange={(e) => updateAuth({ apiKeyName: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Value</label>
              <input 
                type="text"
                placeholder="Value"
                value={auth.apiKeyValue || ''}
                onChange={(e) => updateAuth({ apiKeyValue: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Add to</label>
              <select 
                value={auth.apiKeyLocation || 'header'}
                onChange={(e) => updateAuth({ apiKeyLocation: e.target.value as any })}
                className="bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all"
              >
                <option value="header">Header</option>
                <option value="query">Query Params</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
