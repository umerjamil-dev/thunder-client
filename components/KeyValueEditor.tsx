'use client';

import React from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { KeyValue } from '@/lib/store';
import { clsx } from 'clsx';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  title: string;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({ items, onChange, title }) => {
  const handleAdd = () => {
    onChange([...items, { id: Math.random().toString(36).substr(2, 9), key: '', value: '', enabled: true }]);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<KeyValue>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add New</span>
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card/20">
        <div className="grid grid-cols-[32px_1fr_1fr_32px] border-b border-border text-[10px] font-bold text-muted-foreground uppercase bg-secondary/30">
          <div className="p-2 border-r border-border text-center">#</div>
          <div className="p-2 border-r border-border px-3">Key</div>
          <div className="p-2 border-r border-border px-3">Value</div>
          <div className="p-2 text-center"></div>
        </div>

        {items.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-xs italic">
            No {title.toLowerCase()} added yet.
          </div>
        )}

        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[32px_1fr_1fr_32px] border-b border-border/50 bg-card/10 group">
            <div className="p-2 border-r border-border flex items-center justify-center">
              <button onClick={() => handleUpdate(item.id, { enabled: !item.enabled })}>
                {item.enabled ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
            <div className="p-0 border-r border-border">
              <input 
                className="w-full bg-transparent px-3 py-1.5 text-xs outline-none focus:bg-primary/5 transition-colors"
                placeholder="Key"
                value={item.key}
                onChange={(e) => handleUpdate(item.id, { key: e.target.value })}
              />
            </div>
            <div className="p-0 border-r border-border">
              <input 
                className="w-full bg-transparent px-3 py-1.5 text-xs outline-none focus:bg-primary/5 transition-colors"
                placeholder="Value"
                value={item.value}
                onChange={(e) => handleUpdate(item.id, { value: e.target.value })}
              />
            </div>
            <div className="p-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleRemove(item.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
