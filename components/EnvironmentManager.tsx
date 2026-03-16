'use client';

import React, { useState } from 'react';
import { useApiStore, KeyValue } from '@/lib/store';
import { KeyValueEditor } from './KeyValueEditor';
import { Cpu, Plus, Trash2, ChevronRight, Globe, Check } from 'lucide-react';
import { clsx } from 'clsx';

export const EnvironmentManager = () => {
  const { 
    workspaces,
    activeWorkspaceId, 
    activeEnvironmentId, 
    addEnvironment, 
    updateEnvironment, 
    deleteEnvironment, 
    setActiveEnvironmentId 
  } = useApiStore();

  const [newEnvName, setNewEnvName] = useState('');
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const environments = activeWorkspace.environments;
  const activeEnv = environments.find(e => e.id === activeEnvironmentId);

  const handleAddEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEnvName.trim()) {
      addEnvironment(newEnvName.trim());
      setNewEnvName('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Environments</h1>
            <p className="text-muted-foreground mt-1">Manage global variables and workspace configurations.</p>
          </div>
          <form onSubmit={handleAddEnv} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Environment Name"
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              className="bg-card border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-all w-48"
            />
            <button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Sidebar Area (List of Environments) */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">Your Environments</h3>
            <button 
              onClick={() => setActiveEnvironmentId(null)}
              className={clsx(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left",
                activeEnvironmentId === null 
                  ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-sm" 
                  : "bg-card/50 border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Globe className="h-4 w-4" />
              <span className="flex-1 text-sm truncate">No Environment</span>
              {activeEnvironmentId === null && <Check className="h-3 w-3" />}
            </button>
            
            {environments.map(env => (
              <div key={env.id} className="relative group">
                <button 
                  onClick={() => setActiveEnvironmentId(env.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left pr-10",
                    activeEnvironmentId === env.id 
                      ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-sm" 
                      : "bg-card/50 border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Cpu className="h-4 w-4" />
                  <span className="flex-1 text-sm truncate">{env.name}</span>
                  {activeEnvironmentId === env.id && <Check className="h-3 w-3" />}
                </button>
                <button 
                  onClick={() => deleteEnvironment(env.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Editor Area */}
          <div className="md:col-span-3">
            {activeEnv ? (
              <div className="bg-card/30 border border-border rounded-2xl p-6 space-y-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{activeEnv.name}</h2>
                    <p className="text-xs text-muted-foreground">Define variables that can be used via <code className="bg-accent px-1 rounded text-primary font-mono font-bold">{"{{variable_name}}"}</code> syntax.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <KeyValueEditor 
                    title="Variables"
                    items={activeEnv.variables}
                    onChange={(variables) => updateEnvironment(activeEnv.id, variables)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl bg-card/10 text-center space-y-4">
                <div className="p-4 rounded-full bg-accent/50 text-muted-foreground opacity-20">
                  <Globe className="h-12 w-12" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-lg font-bold">No Environment Selected</h3>
                  <p className="text-sm text-muted-foreground mt-1">Select an environment from the list or create a new one to start managing variables.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
