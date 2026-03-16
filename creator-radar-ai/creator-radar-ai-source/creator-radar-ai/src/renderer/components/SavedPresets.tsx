import React, { useState } from 'react';
import { SearchPreset, SearchFilters } from '../../shared/types';

interface Props {
  presets: SearchPreset[];
  currentFilters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onPresetsChange: (presets: SearchPreset[]) => void;
  compact?: boolean;
}

export const SavedPresets: React.FC<Props> = ({ presets, currentFilters, onApply, onPresetsChange, compact=false }) => {
  const [editingPreset, setEditingPreset] = useState<Partial<SearchPreset>|null>(null);
  const [newName, setNewName]             = useState('');
  const [saving, setSaving]               = useState(false);
  const [showAll, setShowAll]             = useState(false);

  const pinned   = presets.filter(p => p.pinned);
  const unpinned = presets.filter(p => !p.pinned);

  const savePreset = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const saved = await window.electronAPI.savePreset({ name:newName.trim(), filters:currentFilters, pinned:false });
      onPresetsChange([...presets, saved]);
      setNewName('');
    } finally { setSaving(false); }
  };

  const togglePin = async (p: SearchPreset) => {
    const u = await window.electronAPI.togglePresetPin(p.id!);
    onPresetsChange(presets.map(x => x.id===p.id?u:x));
  };

  const deletePreset = async (p: SearchPreset) => {
    if (!confirm(`Delete preset "${p.name}"?`)) return;
    await window.electronAPI.deletePreset(p.id!);
    onPresetsChange(presets.filter(x => x.id!==p.id));
  };

  const saveEdit = async () => {
    if (!editingPreset?.name?.trim()) return;
    setSaving(true);
    try {
      const u = await window.electronAPI.savePreset(editingPreset as SearchPreset);
      onPresetsChange(presets.map(p => p.id===u.id?u:p));
      setEditingPreset(null);
    } finally { setSaving(false); }
  };

  if (compact) {
    if (!pinned.length) return null;
    return (
      <div className="preset-pills-row">
        <span className="preset-pills-label">Quick Load:</span>
        {pinned.map(p => <button key={p.id} className="preset-pill" onClick={()=>onApply(p.filters)} title={`Apply: ${p.name}`}>📌 {p.name}</button>)}
      </div>
    );
  }

  const Row = ({ p }: { p: SearchPreset }) => (
    <div className="preset-row">
      <button className="preset-row-name" onClick={()=>onApply(p.filters)}>{p.name}</button>
      <div className="preset-row-actions">
        <button className="preset-action-btn" onClick={()=>onApply(p.filters)}>Apply</button>
        <button className={`preset-action-btn${p.pinned?' preset-pinned':''}`} onClick={()=>togglePin(p)} title={p.pinned?'Unpin':'Pin'}>{p.pinned?'📌':'📍'}</button>
        <button className="preset-action-btn" onClick={()=>setEditingPreset({...p})} title="Edit">✏️</button>
        <button className="preset-action-btn preset-delete-btn" onClick={()=>deletePreset(p)} title="Delete">🗑️</button>
      </div>
    </div>
  );

  return (
    <div className="saved-presets-panel">
      <div className="presets-header"><h3>Saved Search Presets</h3><button className="btn-ghost btn-sm" onClick={()=>setShowAll(v=>!v)}>{showAll?'Show Less':`Show All (${presets.length})`}</button></div>
      <div className="preset-save-row">
        <input className="form-input" type="text" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name this search preset…" onKeyDown={e=>e.key==='Enter'&&savePreset()} style={{flex:1}}/>
        <button className="btn-secondary btn-sm" onClick={savePreset} disabled={saving||!newName.trim()}>{saving?'Saving…':'+ Save Current Filters'}</button>
      </div>
      {editingPreset && (
        <div className="preset-edit-form">
          <input className="form-input" value={editingPreset.name||''} onChange={e=>setEditingPreset(p=>({...p!,name:e.target.value}))} placeholder="Preset name" />
          <div className="preset-edit-actions">
            <button className="btn-primary btn-sm" onClick={saveEdit} disabled={saving}>{saving?'Saving…':'Save'}</button>
            <button className="btn-ghost btn-sm" onClick={()=>setEditingPreset(null)}>Cancel</button>
          </div>
        </div>
      )}
      {pinned.length>0 && <div className="preset-group"><span className="preset-group-label">📌 Pinned</span>{pinned.map(p=><Row key={p.id} p={p}/>)}</div>}
      {(showAll||pinned.length===0)&&unpinned.length>0 && <div className="preset-group">{pinned.length>0&&<span className="preset-group-label">Other Presets</span>}{unpinned.map(p=><Row key={p.id} p={p}/>)}</div>}
      {presets.length===0 && <p className="preset-empty">No presets yet. Set up filters and save them for quick access.</p>}
    </div>
  );
};
