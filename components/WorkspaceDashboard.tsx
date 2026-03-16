'use client';

import React from 'react';
import { Plus, Globe, History, Folder, Cpu, Sparkles } from 'lucide-react';
import { useApiStore } from '@/lib/store';

export const WorkspaceDashboard = () => {
  const { addTab } = useApiStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background/50 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-pulse">
            <Globe className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Welcome to your <span className="text-primary">API Workspace</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            A premium environment for building, testing, and documenting your APIs.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => addTab()}
            className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Create New Request</h3>
              <p className="text-sm text-muted-foreground mt-1">Start a fresh API request with customizable parameters.</p>
            </div>
          </button>

          <button className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Recent History</h3>
              <p className="text-sm text-muted-foreground mt-1">Pick up where you left off with your last executions.</p>
            </div>
          </button>

          <button className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <Folder className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Browse Collections</h3>
              <p className="text-sm text-muted-foreground mt-1">Access your saved endpoints and project folders.</p>
            </div>
          </button>

          <button className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Environments</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage global variables and staging/production configs.</p>
            </div>
          </button>
        </div>

        {/* Footer Polish */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-50">
          <Sparkles className="h-3 w-3" />
          <span>Postman Clone Premium v1.0.0</span>
          <span>•</span>
          <span>Build with Next.js & Zustand</span>
        </div>
      </div>
    </div>
  );
};
