'use client';

import React from 'react';
import { X, Settings, Palette, Zap, Info, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Workspace Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Theme Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              <Palette className="h-3.5 w-3.5" />
              <span>Appearance</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-accent/20 border border-primary/20 flex flex-col gap-1 ring-2 ring-primary">
                <span className="font-bold text-sm text-foreground">Premium Dark</span>
                <span className="text-xs text-muted-foreground">The ultimate dark theme for API development.</span>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-center opacity-40 cursor-not-allowed grayscale">
                <span className="font-bold text-sm italic">Cyberpunk (Coming Soon)</span>
              </div>
            </div>
          </section>

          {/* Proxy Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              <Zap className="h-3.5 w-3.5" />
              <span>Connectivity</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-card/50 border border-border rounded-2xl">
              <div>
                <h3 className="font-bold text-sm">CORS Proxy</h3>
                <p className="text-xs text-muted-foreground mt-1">Route requests through a proxy to bypass CORS restrictions.</p>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-accent/30 rounded-lg text-xs font-bold text-muted-foreground">
                DISABLED
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>About</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold">Postman Clone v1.2.0</p>
                  <p className="text-muted-foreground">A premium API client built with Next.js, Tailwind CSS, and Zustand.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border bg-card/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
