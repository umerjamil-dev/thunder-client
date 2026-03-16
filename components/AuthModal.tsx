'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Github, Chrome, ArrowRight, UserPlus, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApiStore } from '@/lib/store';
import { insforge } from '@/lib/insforge';
import { clsx } from 'clsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = mode === 'login' 
        ? await insforge.auth.signInWithPassword({ email, password })
        : await insforge.auth.signUp({ email, password });

      if (error) throw error;
      
      // If signup, store email for the OTP guard in case session isn't ready
      if (mode === 'signup') {
        useApiStore.getState().setTempEmail(email);
      }

      await useApiStore.getState().initializeSession();
      onClose();
    } catch (err: any) {
      const msg = err.message || '';
      const lowMsg = msg.toLowerCase();
      if (
        lowMsg.includes('email not confirmed') || 
        lowMsg.includes('verify your email') || 
        lowMsg.includes('email verification required') ||
        lowMsg.includes('unconfirmed email')
      ) {
        useApiStore.getState().setTempEmail(email);
        onClose();
      } else {
        setError(msg || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await insforge.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors z-20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 pt-12 text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-sm text-muted-foreground">Premium API development starts here.</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-xs text-red-500 animate-in shake duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex p-1 bg-secondary/50 rounded-2xl border border-border">
            <button 
              onClick={() => setMode('login')}
              className={clsx(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                mode === 'login' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={clsx(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                mode === 'signup' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-2 py-3 bg-card border border-border rounded-2xl hover:bg-accent transition-all text-sm font-semibold active:scale-[0.98]"
            >
              <Chrome className="h-4 w-4" />
              <span>Google</span>
            </button>
            <button 
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center gap-2 py-3 bg-card border border-border rounded-2xl hover:bg-accent transition-all text-sm font-semibold active:scale-[0.98]"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Or Email</span>
            <div className="h-[1px] flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                {mode === 'login' && <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] shadow-xl shadow-primary/20 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground px-4">
            By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
