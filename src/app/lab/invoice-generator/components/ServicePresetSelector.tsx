// src/app/lab/invoice-generator/components/ServicePresetSelector.tsx

'use client';

import React, { useState } from 'react';
import { ServicePreset } from '../lib/types';
import { useInvoices } from '../context/InvoiceContext';
import { Plus, Trash2, X, Edit2, Check } from 'lucide-react';
import { Squircle } from '@squircle-js/react';

interface ServicePresetSelectorProps {
  onClose: () => void;
}

export default function ServicePresetSelector({ onClose }: ServicePresetSelectorProps) {
  const { presets, savePreset, deletePreset } = useInvoices();
  
  const [editingPreset, setEditingPreset] = useState<ServicePreset | null>(null);
  
  // Add state form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    savePreset({
      id: crypto.randomUUID(),
      name: newName,
      description: newDesc,
      unitPrice: newPrice
    });

    // Reset fields
    setNewName('');
    setNewDesc('');
    setNewPrice(0);
  };

  const handleEditClick = (preset: ServicePreset) => {
    setEditingPreset({ ...preset });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPreset || !editingPreset.name.trim()) return;

    savePreset(editingPreset);
    setEditingPreset(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Squircle 
        cornerRadius={24} 
        cornerSmoothing={0.7} 
        className="bg-zinc-950 border border-zinc-800 w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin text-left"
      >
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-medium text-white">Service Presets</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Manage commonly billed packages and items</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Create Form */}
        {!editingPreset ? (
          <form onSubmit={handleCreate} className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-4">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-space">Add Preset Service</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-space text-zinc-400 uppercase tracking-wider">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flyer Design"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-space text-zinc-400 uppercase tracking-wider">Default Unit Price *</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0.00"
                  value={newPrice || ''}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-700"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-space text-zinc-400 uppercase tracking-wider">Default Description</label>
                <textarea
                  placeholder="e.g. Single sided digital flyer design, includes social sizes."
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-700 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                <Plus size={12} /> Add Preset
              </button>
            </div>
          </form>
        ) : (
          /* Edit Form */
          <form onSubmit={handleUpdate} className="p-4 bg-[#3BA2DE]/5 border border-[#3BA2DE]/20 rounded-xl space-y-4">
            <h4 className="text-xs font-semibold text-[#3BA2DE] uppercase tracking-wider font-space flex items-center justify-between">
              <span>Editing: {editingPreset.name}</span>
              <button 
                type="button" 
                onClick={() => setEditingPreset(null)}
                className="text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-space text-zinc-400 uppercase tracking-wider">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingPreset.name}
                  onChange={(e) => setEditingPreset(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-space text-zinc-400 uppercase tracking-wider">Default Unit Price *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingPreset.unitPrice || ''}
                  onChange={(e) => setEditingPreset(prev => prev ? { ...prev, unitPrice: Number(e.target.value) } : null)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-space text-zinc-400 uppercase tracking-wider">Default Description</label>
                <textarea
                  rows={2}
                  value={editingPreset.description || ''}
                  onChange={(e) => setEditingPreset(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#3BA2DE] hover:bg-[#3BA2DE]/90 rounded text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                <Check size={12} /> Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Presets List */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-space">Saved Presets ({presets.length})</h4>
          
          <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
            {presets.length > 0 ? (
              presets.map(p => (
                <div key={p.id} className="p-4 flex justify-between items-start gap-4 hover:bg-zinc-900/10">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200 text-xs">{p.name}</span>
                      <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">
                        ₦{p.unitPrice.toLocaleString()}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-zinc-500 text-[11px] font-light truncate max-w-sm whitespace-pre-line leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Edit Preset"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => deletePreset(p.id)}
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete Preset"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-600 text-xs font-light">
                No custom service presets saved. Add one using the form above.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </Squircle>
    </div>
  );
}
