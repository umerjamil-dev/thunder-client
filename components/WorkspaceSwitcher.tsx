'use client';

import React, { useState } from 'react';
import { useApiStore, Workspace } from '@/lib/store';
import { ChevronDown, Plus, Globe, Users, Check, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';

export const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, createWorkspace } = useApiStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreateTeam = () => {
    const name = prompt('Team Workspace Name:');
    if (name) {
      createWorkspace(name, 'team');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/30 hover:bg-accent/50 border border-border transition-all active:scale-[0.98]"
      >
        <div className="p-1 rounded-md bg-primary/10 text-primary">
          {activeWorkspace.type === 'personal' ? <Globe className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
        </div>
        <span className="text-xs font-bold truncate max-w-[120px]">{activeWorkspace.name}</span>
        <ChevronDown className={clsx("h-3.5 w-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Workspaces</div>
            
            <div className="space-y-1 mt-1">
              {workspaces.map(w => (
                <button 
                  key={w.id}
                  onClick={() => {
                    setActiveWorkspaceId(w.id);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 p-2 rounded-xl text-sm transition-all text-left",
                    w.id === activeWorkspaceId ? "bg-primary/10 text-primary font-bold" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={clsx("p-1.5 rounded-lg", w.id === activeWorkspaceId ? "bg-primary/20" : "bg-card border border-border")}>
                    {w.type === 'personal' ? <Globe className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  </div>
                  <span className="flex-1 truncate">{w.name}</span>
                  {w.id === activeWorkspaceId && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>

            <div className="h-[1px] bg-border my-2" />
            
            <button 
              onClick={handleCreateTeam}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Plus className="h-4 w-4" />
              </div>
              <span>Create Team Workspace</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
