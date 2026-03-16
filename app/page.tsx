'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Settings, 
  Search, 
  Plus, 
  ChevronRight,
  Globe,
  Database,
  Cpu,
  Layers,
  X,
  FileCode,
  FolderPlus,
  Trash2,
  Users,
  LogIn,
  Clock,
  Send,
  Mail
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useApiStore, resolveVariables, Workspace } from '@/lib/store';
import { insforge } from '@/lib/insforge';
import { RequestPanel } from '@/components/RequestPanel';
import { ResponsePanel } from '@/components/ResponsePanel';
import { KeyValueEditor } from '@/components/KeyValueEditor';
import { BodyEditor } from '@/components/BodyEditor';
import { AuthEditor } from '@/components/AuthEditor';
import { AuthModal } from '@/components/AuthModal';
import { EnvironmentManager } from '@/components/EnvironmentManager';
import { WorkspaceDashboard } from '@/components/WorkspaceDashboard';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import { TeamManager } from '@/components/TeamManager';
import { RenameDialog } from '@/components/RenameDialog';
import { SettingsModal } from '@/components/SettingsModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TabType = 'Params' | 'Auth' | 'Headers' | 'Body';
type SidebarView = 'History' | 'Collections' | 'Environments' | 'Team';

export default function ApiClientPage() {
  const { 
    user,
    isAuthenticated,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    createWorkspace,
    logout,
    tabs, 
    activeTabId, 
    setActiveTabId, 
    closeTab, 
    addTab, 
    updateActiveTabRequest,
    addCollection,
    deleteCollection,
    renameTab,
    sidebarSearchTerm,
    setSidebarSearchTerm,
    activeEnvironmentId,
    setActiveEnvironmentId,
    initializeSession,
    tempEmailForVerification,
    setTempEmail
  } = useApiStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);
  
  const [activeTabPanel, setActiveTabPanel] = useState<TabType>('Params');
  const [sidebarView, setSidebarView] = useState<SidebarView>('History');

  // OTP / Verification Logic (Must be at the top level)
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string, type: 'tab' | 'collection', name: string } | null>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeEnv = activeWorkspace.environments.find(e => e.id === activeEnvironmentId);

  const history = activeWorkspace.history;
  const collections = activeWorkspace.collections;
  const environments = activeWorkspace.environments;

  const handleRename = (newName: string) => {
    if (!renameTarget) return;
    if (renameTarget.type === 'tab') {
      renameTab(renameTarget.id, newName);
    } else {
      useApiStore.getState().renameCollection(renameTarget.id, newName);
    }
  };

  const filteredHistory = history.filter(h => 
    h.url.toLowerCase().includes(sidebarSearchTerm.toLowerCase()) || 
    h.method.toLowerCase().includes(sidebarSearchTerm.toLowerCase())
  );

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(sidebarSearchTerm.toLowerCase()) ||
    c.requests.some(r => r.name.toLowerCase().includes(sidebarSearchTerm.toLowerCase()))
  );

  // No changes needed here, just cleaner flow

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToVerify = user?.email || tempEmailForVerification;
    if (!emailToVerify || verificationCode.length < 6) return;
    
    setVerifying(true);
    setVerifyError(null);
    try {
      const { error } = await insforge.auth.verifyEmail({ 
        email: emailToVerify, 
        otp: verificationCode 
      });
      if (error) throw error;
      
      await initializeSession();
      setTempEmail(null);
      setVerificationCode('');
    } catch (err: any) {
      setVerifyError(err.message || 'Ghalt code hai bhaiyah janu. Check karein!');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    const emailToResend = user?.email || tempEmailForVerification;
    if (!emailToResend) return;

    setResending(true);
    setResendMessage(null);
    try {
      const { error } = await insforge.auth.resendVerificationEmail({ email: emailToResend });
      if (error) throw error;
      setResendMessage({ type: 'success', text: 'Naya code bhej diya gaya hai! ✅' });
    } catch (err: any) {
      setResendMessage({ type: 'error', text: err.message || 'Ghalti ho gayi bhaiyah janu. Dubara try karein.' });
    } finally {
      setResending(false);
    }
  };

  const isUnverified = (isAuthenticated && user && !user.emailVerified) || !!tempEmailForVerification;

  // 1. Authentication Guard (Landing Page)
  if (!isAuthenticated && !tempEmailForVerification) {
    return (
      <div className="h-screen w-full bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-2xl shadow-primary/20">
              <Send className="h-10 w-10 text-primary-foreground rotate-[-20deg]" />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tighter text-white">Postman <span className="text-primary truncate">Clone</span></h1>
              <p className="text-muted-foreground text-sm font-medium mt-2">Professional API Development Platform</p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              <LogIn className="h-5 w-5" />
              Get Started
            </button>
            <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Join 10,000+ developers worldwide
            </p>
          </div>
        </div>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
        />
      </div>
    );
  }

  // 2. Email Verification Guard (OTP Screen)
  if (isUnverified) {
    const displayEmail = user?.email || tempEmailForVerification || '';
    return (
      <div className="h-screen w-full bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center max-w-md w-full p-8 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-500/10">
              <Mail className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Verify Your Email</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bhaiyah janu, <span className="text-white font-bold">{displayEmail}</span> par verification code bheja gaya hai.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyCode} className="w-full space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Enter 6-Digit Code</label>
              <input 
                type="text" 
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] text-primary outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/5"
              />
              {verifyError && (
                <p className="text-xs text-red-500 font-medium animate-in shake duration-300">{verifyError}</p>
              )}
            </div>

            <button 
              type="submit"
              disabled={verifying || verificationCode.length < 6}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
            >
              {verifying ? <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Verify Account</span>}
            </button>
          </form>
          
          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            {resendMessage && (
              <p className={cn(
                "text-[10px] font-bold text-center col-span-2 animate-in fade-in slide-in-from-top-1",
                resendMessage.type === 'success' ? "text-emerald-500" : "text-red-500"
              )}>
                {resendMessage.text}
              </p>
            )}
            <button 
              onClick={handleResendCode}
              disabled={resending}
              className="bg-secondary/30 border border-border text-foreground hover:bg-secondary/50 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              {resending ? <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Resend Code'}
            </button>
            <button 
              onClick={() => logout()}
              className="bg-secondary/30 border border-border text-foreground hover:bg-secondary/50 py-3 rounded-xl font-bold text-xs transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Activity Bar (Slim Sidebar) */}
      <aside className="flex w-14 flex-col items-center border-r border-border bg-card/80 py-4 gap-6 z-20">
        <div className="rounded-xl bg-primary/10 p-2 border border-primary/20">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <nav className="flex flex-col gap-4">
          <button 
            onClick={() => setSidebarView('History')}
            className={cn(
              "p-2 rounded-lg transition-all",
              sidebarView === 'History' ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <History className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setSidebarView('Collections')}
            className={cn(
              "p-2 rounded-lg transition-all",
              sidebarView === 'Collections' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Layers className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setSidebarView('Environments')}
            className={cn(
              "p-2 rounded-lg transition-all",
              sidebarView === 'Environments' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Cpu className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setSidebarView('Team')}
            className={cn(
              "p-2 rounded-lg transition-all",
              sidebarView === 'Team' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Users className="h-5 w-5" />
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-4 items-center mb-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="h-[1px] w-8 bg-border" />
          {isAuthenticated ? (
            <button 
              onClick={() => logout()}
              className="group relative"
              title="Logout"
            >
              <img 
                src={user?.avatar} 
                className="h-8 w-8 rounded-full border-2 border-primary/20 group-hover:border-primary transition-all shadow-md" 
                alt="Profile"
              />
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-0 group-hover:opacity-40 transition-opacity flex items-center justify-center">
                <X className="h-4 w-4 text-white" />
              </div>
            </button>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
              title="Login"
            >
              <LogIn className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Explorer Pane */}
      <aside className="w-72 border-r border-border bg-card/10 flex flex-col backdrop-blur-md z-10 transition-all">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Explorer</h2>
            <div className="flex gap-1">
              <button 
                onClick={() => addTab()}
                className="p-1 hover:bg-accent border border-transparent hover:border-border rounded-md text-muted-foreground transition-all"
                title="New Request"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <WorkspaceSwitcher />

          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${sidebarView.toLowerCase()}...`}
              value={sidebarSearchTerm}
              onChange={(e) => setSidebarSearchTerm(e.target.value)}
              className="w-full bg-secondary/30 border border-border rounded-lg pl-8 pr-3 py-1.5 text-[11px] outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {sidebarView === 'History' && (
            <div className="flex flex-col gap-1">
              {filteredHistory.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground italic">
                  {history.length === 0 ? "No history yet" : "No matches found"}
                </div>
              )}
              {filteredHistory.map((h, i) => (
                <div 
                  key={i} 
                  onClick={() => addTab(h)}
                  onDoubleClick={() => setRenameTarget({ id: h.id, type: 'tab', name: h.name })}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/20 text-[12px] cursor-pointer text-muted-foreground hover:text-foreground truncate transition-all group"
                  title="Double click to rename"
                >
                  <span className={cn(
                    "font-bold min-w-[32px] text-[10px]",
                    h.method === 'GET' ? "text-emerald-500" : 
                    h.method === 'POST' ? "text-amber-500" : 
                    h.method === 'DELETE' ? "text-red-500" : "text-blue-500"
                  )}>{h.method}</span>
                  <span className="truncate flex-1">{h.name || h.url || 'Untitled Request'}</span>
                </div>
              ))}
            </div>
          )}

          {sidebarView === 'Collections' && (
            <div className="flex flex-col gap-1">
              {filteredCollections.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground italic">
                  {collections.length === 0 ? "Create a collection to organize requests" : "No matches found"}
                </div>
              )}
              {filteredCollections.map(c => (
                <div key={c.id} className="group mb-1">
                  <div 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 cursor-pointer"
                    onDoubleClick={() => setRenameTarget({ id: c.id, type: 'collection', name: c.name })}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:rotate-90 transition-transform shrink-0" />
                      <Layers className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-[13px] font-medium truncate">{c.name}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCollection(c.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sidebarView === 'Environments' && (
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveEnvironmentId(null)}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg text-[12px] cursor-pointer transition-all border border-transparent",
                  activeEnvironmentId === null ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground hover:bg-accent/20"
                )}
              >
                <Globe className="h-4 w-4" />
                <span>No Environment</span>
              </button>
              {environments.map(e => (
                <button 
                  key={e.id}
                  onClick={() => setActiveEnvironmentId(e.id)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg text-[12px] cursor-pointer transition-all border border-transparent",
                    activeEnvironmentId === e.id ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground hover:bg-accent/20"
                  )}
                >
                  <Cpu className="h-4 w-4" />
                  <span className="truncate">{e.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Workspace Area */}
      <section className="flex-1 flex flex-col min-w-0 bg-background/30 z-0">
        {/* Tab Bar Logic */}
        {tabs.length > 0 && (
          <div className="h-10 border-b border-border bg-card/10 flex items-center overflow-x-auto scrollbar-none px-2 gap-1 border-t border-t-white/5">
            {tabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 h-full rounded-t-lg text-[12px] font-medium cursor-pointer transition-all border-x border-t border-transparent",
                  activeTabId === tab.id 
                    ? "bg-background border-border text-primary font-semibold" 
                    : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  tab.request.method === 'GET' ? "bg-emerald-500" : "bg-amber-500"
                )} />
                <span className="max-w-[120px] truncate">{tab.name}</span>
                <X 
                  className="h-3 w-3 hover:text-red-500 transition-colors opacity-60 hover:opacity-100 ml-1" 
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </div>
            ))}
            <button 
              onClick={() => addTab()}
              className="p-1 min-w-[28px] hover:bg-accent/40 rounded-full transition-colors ml-2"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {sidebarView === 'Environments' ? (
          <EnvironmentManager />
        ) : sidebarView === 'Team' ? (
          <TeamManager />
        ) : activeTab ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <RequestPanel />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Workspace Tab Panels */}
              <div className="flex border-b border-border px-4 py-0 h-10 gap-6 items-end bg-card/5">
                {(['Params', 'Auth', 'Headers', 'Body'] as TabType[]).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTabPanel(tab)}
                    className={cn(
                      "text-[13px] font-bold pb-2 px-1 border-b-2 transition-all relative top-[2px] tracking-wider uppercase",
                      activeTabPanel === tab 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Main Content & Response Split */}
              <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pb-10">
                <div className="p-6">
                  {activeTabPanel === 'Params' && (
                    <KeyValueEditor 
                      title="Query Parameters" 
                      items={activeTab.request.params} 
                      onChange={(params) => updateActiveTabRequest({ params })} 
                    />
                  )}
                  {activeTabPanel === 'Auth' && <AuthEditor />}
                  {activeTabPanel === 'Headers' && (
                    <KeyValueEditor 
                      title="Request Headers" 
                      items={activeTab.request.headers} 
                      onChange={(headers) => updateActiveTabRequest({ headers })} 
                    />
                  )}
                  {activeTabPanel === 'Body' && <BodyEditor />}
                </div>

                <div className="h-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-20 mx-6 my-2" />
                <ResponsePanel />
              </div>
            </div>
          </div>
        ) : (
          <WorkspaceDashboard />
        )}
      </section>

      {/* Modals */}
      <RenameDialog 
        isOpen={!!renameTarget}
        initialName={renameTarget?.name || ''}
        title={`Rename ${renameTarget?.type === 'tab' ? 'Request' : 'Collection'}`}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
      />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </main>
  );
}
