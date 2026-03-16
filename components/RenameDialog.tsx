'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface RenameDialogProps {
  isOpen: boolean;
  initialName: string;
  onRename: (newName: string) => void;
  onClose: () => void;
  title: string;
}

export const RenameDialog = ({ isOpen, initialName, onRename, onClose, title }: RenameDialogProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Name</label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-all"
              placeholder="Enter name..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
