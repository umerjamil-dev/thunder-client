'use client';

import React, { useState } from 'react';
import { useApiStore } from '@/lib/store';
import { Users, UserPlus, Mail, Shield, ShieldCheck, Trash2, Clock, Globe, X } from 'lucide-react';
import { clsx } from 'clsx';

export const TeamManager = () => {
  const { workspaces, activeWorkspaceId, user, addWorkspaceMember, removeWorkspaceMember } = useApiStore();
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const members = activeWorkspace.members;

  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setInviting(true);
    addWorkspaceMember(activeWorkspaceId, email);
    setTimeout(() => {
      setInviting(false);
      setEmail('');
    }, 500);
  };

  if (activeWorkspace.type === 'personal') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 h-full animate-in fade-in duration-500">
        <div className="p-6 rounded-full bg-primary/5 text-primary/20">
          <Globe className="h-16 w-16" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-xl font-black">Personal Workspace</h3>
          <p className="text-sm text-muted-foreground mt-2">
            This is your private space. Create a **Team Workspace** to invite collaborators and work together.
          </p>
        </div>
        <button 
          onClick={() => useApiStore.getState().createWorkspace('New Team', 'team')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          Upgrade to Team
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{activeWorkspace.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Workspace &bull; {activeWorkspace.members.length + 1} members
          </p>
        </div>

        {/* Invite Form */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <UserPlus className="h-32 w-32" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Invite Member</h3>
          <form onSubmit={handleInvite} className="flex gap-3 relative z-10">
            <div className="flex-1 relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-primary transition-all"
              />
            </div>
            <button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/10"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite</span>
            </button>
          </form>
        </div>

        {/* Member List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Workspace Members</h3>
          <div className="grid grid-cols-1 gap-3">
            {/* You (Owner) */}
            <div className="flex items-center justify-between p-4 bg-card/40 border border-border rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                  UJ
                </div>
                <div>
                  <p className="text-sm font-bold">Umer Jamil (You)</p>
                  <p className="text-[10px] text-muted-foreground">umer@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" />
                Admin
              </div>
            </div>

            {/* Invited Members */}
            {activeWorkspace.members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-card/40 border border-border rounded-2xl group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    {member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{member.email}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {member.status === 'pending' && <Clock className="h-3 w-3 text-amber-500" />}
                      {member.status === 'pending' ? 'Invitation Sent' : 'Active'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-secondary text-muted-foreground rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {member.role}
                  </div>
                  <button 
                    onClick={() => removeWorkspaceMember(activeWorkspaceId, member.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
