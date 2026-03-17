'use client';

import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Trash2, 
  Play, 
  ChevronDown, 
  ChevronRight, 
  Save, 
  Shield, 
  Loader2,
  Folder,
  FolderPlus 
} from 'lucide-react';
import { clsx } from 'clsx';
import { useApiStore, HttpMethod, resolveVariables } from '@/lib/store';

export const RequestPanel = () => {
  const { 
    tabs, 
    activeTabId, 
    updateActiveTabRequest, 
    updateActiveTabResponse, 
    addToHistory,
    saveToCollection,
    workspaces,
    activeWorkspaceId,
    activeEnvironmentId
  } = useApiStore();
  const [loading, setLoading] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const activeTab = tabs.find(t => t.id === activeTabId);
  const collections = activeWorkspace.collections;
  const environments = activeWorkspace.environments;

  if (!activeTab) return null;

  const handleSave = (collectionId: string) => {
    saveToCollection(collectionId, activeTab.request);
    setShowSaveDropdown(false);
  };

  const handleSend = async () => {
    const { url: rawUrl, method, params, headers: requestHeaders, body, auth } = activeTab.request;
    const activeEnv = environments.find(e => e.id === activeEnvironmentId);
    const variables = activeEnv?.variables || [];
    
    if (!rawUrl) return;
    
    setLoading(true);
    updateActiveTabResponse({ loading: true, error: null, status: null });
    
    const startTime = Date.now();
    
    try {
      // Resolve variables in URL
      const resolvedUrl = resolveVariables(rawUrl, variables);
      const url = new URL(resolvedUrl);
      
      // Resolve and add params
      params.forEach(p => {
        if (p.enabled && p.key) {
          const key = resolveVariables(p.key, variables);
          const value = resolveVariables(p.value, variables);
          url.searchParams.append(key, value);
        }
      });

      const headers: Record<string, string> = {};
      
      // Resolve and add headers
      requestHeaders.forEach(h => {
        if (h.enabled && h.key) {
          const key = resolveVariables(h.key, variables);
          const value = resolveVariables(h.value, variables);
          headers[key] = value;
        }
      });

      // Handle Authentication
      if (auth && auth.type !== 'none') {
        if (auth.type === 'bearer' && auth.bearerToken) {
          headers['Authorization'] = `Bearer ${resolveVariables(auth.bearerToken, variables)}`;
        } else if (auth.type === 'basic' && auth.basicUsername) {
          const user = resolveVariables(auth.basicUsername, variables);
          const pass = resolveVariables(auth.basicPassword || '', variables);
          headers['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
        } else if (auth.type === 'apikey' && auth.apiKeyName && auth.apiKeyValue) {
          const key = resolveVariables(auth.apiKeyName, variables);
          const value = resolveVariables(auth.apiKeyValue, variables);
          if (auth.apiKeyLocation === 'query') {
            url.searchParams.append(key, value);
          } else {
            headers[key] = value;
          }
        }
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'HEAD') {
        if ((method as string) === 'GET' || (method as string) === 'HEAD') {
          if (!useProxy) {
            throw new Error('Browsers do not allow sending a body with GET/HEAD requests. Please enable "Proxy" in the top right to bypass this restriction.');
          }
          // Workaround for GET with body: Switch to POST and use override header
          options.method = 'POST';
          headers['X-HTTP-Method-Override'] = method;
        }
        options.body = resolveVariables(body, variables);
      }

      let finalUrl = url.toString();
      if (useProxy) {
        finalUrl = `https://8f65zx5p.edge.insforge.app/proxy?url=${encodeURIComponent(finalUrl)}`;
      }

      const res = await fetch(finalUrl, options);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => resHeaders[k] = v);

      updateActiveTabResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        headers: resHeaders,
        time: duration,
        size: res.headers.get('content-length') ? `${(parseInt(res.headers.get('content-length')!) / 1024).toFixed(2)} KB` : 'Unknown',
        loading: false,
      });

      addToHistory({ ...activeTab.request, id: Math.random().toString(36).substr(2, 9) });

    } catch (err: any) {
      updateActiveTabResponse({
        error: err.message || 'An error occurred',
        loading: false,
        status: 0,
        statusText: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-card/20 border-t border-t-white/5">
      <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 border border-border focus-within:border-primary/50 transition-colors">
        <select 
          className="bg-transparent text-sm font-bold text-primary outline-none cursor-pointer"
          value={activeTab.request.method}
          onChange={(e) => updateActiveTabRequest({ method: e.target.value as HttpMethod })}
        >
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
            <option key={m} value={m} className="bg-card text-foreground">{m}</option>
          ))}
        </select>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <input 
          type="text" 
          placeholder="https://api.example.com/endpoint"
          className="bg-transparent flex-1 outline-none text-sm"
          value={activeTab.request.url}
          onChange={(e) => updateActiveTabRequest({ url: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            onClick={() => setShowSaveDropdown(!showSaveDropdown)}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border border-border"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
          
          {showSaveDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Collection</div>
              {collections.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground italic">No collections found</div>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {collections.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => handleSave(c.id)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-sm transition-colors text-left"
                    >
                      <Folder className="h-4 w-4" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Proxy Toggle */}
          <button 
            onClick={() => setUseProxy(!useProxy)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
              useProxy 
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-sm shadow-amber-500/10" 
                : "bg-secondary/50 border-border text-muted-foreground hover:bg-accent"
            )}
            title="Enable CORS Proxy via InsForge Edge"
          >
            <Shield className={clsx("h-3.5 w-3.5", useProxy && "animate-pulse")} />
            <span>Proxy</span>
          </button>

          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Send</span>
          </button>
        </div>
      </div>
    </header>
  );
};
