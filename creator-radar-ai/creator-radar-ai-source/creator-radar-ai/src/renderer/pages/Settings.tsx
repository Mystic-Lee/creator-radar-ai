import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

type Tab = 'branding'|'recruiters'|'niches'|'scoring'|'dm-templates'|'export'|'statuses'|'presets';
const TABS: {id:Tab;label:string}[] = [{id:'branding',label:'Branding'},{id:'recruiters',label:'Recruiters'},{id:'niches',label:'Niches'},{id:'scoring',label:'Scoring Weights'},{id:'dm-templates',label:'DM Templates'},{id:'export',label:'Export Columns'},{id:'statuses',label:'Status Labels'},{id:'presets',label:'Presets'}];
const ALL_COLS = ['Date Found','Recruiter Name','Username','Display Name','Profile URL','Niche','Sub-Niche','Followers','Est. Likes','Est. Avg Views','Engagement Rate','LIVE Activity','Posting Frequency','Recruit Score','Recruitability Score','Growth Potential Score','Priority Tier','Priority Reason','Fit Summary','Why Good Candidate','DM Tone','Personalized DM Draft','Status','Campaign','Assigned Recruiter','Date Contacted','Response Status','Follow-Up Date','Notes','Growth Category','Growth Signals Summary'];
const DEFAULT_WEIGHTS = [{key:'niche_fit',label:'Niche Fit',value:20,desc:'How well the creator fits target niches'},{key:'content_consistency',label:'Content Consistency',value:15,desc:'Posting frequency and regularity'},{key:'engagement_quality',label:'Engagement Quality',value:20,desc:'Quality and depth of audience interaction'},{key:'live_potential',label:'LIVE Potential',value:15,desc:'Likelihood to succeed in LIVE streaming'},{key:'brand_safety',label:'Brand Safety',value:10,desc:'Content safety for brand partnerships'},{key:'growth_signals',label:'Growth Signals',value:10,desc:'Evidence of upward momentum'},{key:'audience_connection',label:'Audience Connection',value:10,desc:'How well the creator connects with followers'}];
const PRESETS_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#22c55e','#06b6d4','#3b82f6'];

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [tab,       setTab]       = useState<Tab>('branding');
  const [name,      setName]      = useState(settings.companyName||'');
  const [color,     setColor]     = useState(settings.themeColor||'#6366f1');
  const [logo,      setLogo]      = useState<string|null>(settings.logoPath||null);
  const [brandSaved,setBrandSaved]= useState(false);
  const [recs,      setRecs]      = useState<any[]>([]);
  const [newRec,    setNewRec]    = useState({name:'',email:''});
  const [niches,    setNiches]    = useState<string[]>([]);
  const [newNiche,  setNewNiche]  = useState('');
  const [weights,   setWeights]   = useState(DEFAULT_WEIGHTS);
  const [tmpls,     setTmpls]     = useState<any[]>([]);
  const [editTmpl,  setEditTmpl]  = useState<any|null>(null);
  const [expCols,   setExpCols]   = useState<string[]>([]);
  const [statuses,  setStatuses]  = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [presets,   setPresets]   = useState<any[]>([]);
  const [editPId,   setEditPId]   = useState<number|null>(null);
  const [editPName, setEditPName] = useState('');

  useEffect(()=>{
    Promise.all([window.electronAPI.getRecruiters(),window.electronAPI.getNiches(),window.electronAPI.getScoringWeights(),window.electronAPI.getDmTemplates(),window.electronAPI.getExportColumns(),window.electronAPI.getStatusLabels(),window.electronAPI.getPresets()])
      .then(([r,n,w,t,c,s,p])=>{ setRecs(r||[]); setNiches(n||[]); if(w&&Array.isArray(w)&&w.length) setWeights(w as any); setTmpls(t||[]); setExpCols(c||[]); setStatuses(s||[]); setPresets(p||[]); });
  },[]);

  const handleColorChange = (c: string) => { setColor(c); document.documentElement.style.setProperty('--brand-color',c); };
  const saveBranding = async () => { await updateSettings({companyName:name,themeColor:color,logoPath:logo??undefined}); setBrandSaved(true); setTimeout(()=>setBrandSaved(false),2000); };
  const addRec = async () => { if(!newRec.name.trim()) return; const s=await window.electronAPI.saveRecruiter({...newRec,active:true}); setRecs(p=>[...p,s]); setNewRec({name:'',email:''}); };
  const toggleRec = async (r: any) => { const u=await window.electronAPI.saveRecruiter({...r,active:!r.active}); setRecs(p=>p.map(x=>x.id===r.id?u:x)); };
  const delRec = async (id: number) => { if(!confirm('Remove this recruiter?')) return; await window.electronAPI.deleteRecruiter(id); setRecs(p=>p.filter(x=>x.id!==id)); };
  const addNiche = async () => { const t=newNiche.trim(); if(!t||niches.includes(t)) return; const u=[...niches,t]; await window.electronAPI.saveNiches(u); setNiches(u); setNewNiche(''); };
  const removeNiche = async (n: string) => { const u=niches.filter(x=>x!==n); await window.electronAPI.saveNiches(u); setNiches(u); };
  const saveWeights = async () => { await window.electronAPI.saveScoringWeights(Object.fromEntries(weights.map(w=>[w.key,w.value]))); alert('Scoring weights saved.'); };
  const saveTmpl = async () => { if(!editTmpl) return; const s=await window.electronAPI.saveDmTemplate(editTmpl); setTmpls(p=>{ const e=p.find(x=>x.id===s.id); return e?p.map(x=>x.id===s.id?s:x):[...p,s]; }); setEditTmpl(null); };
  const delTmpl = async (id: number) => { if(!confirm('Delete this template?')) return; await window.electronAPI.deleteDmTemplate(id); setTmpls(p=>p.filter(x=>x.id!==id)); };
  const toggleCol = async (c: string) => { const u=expCols.includes(c)?expCols.filter(x=>x!==c):[...expCols,c]; await window.electronAPI.saveExportColumns(u); setExpCols(u); };
  const addStatus = async () => { const t=newStatus.trim(); if(!t||statuses.includes(t)) return; const u=[...statuses,t]; await window.electronAPI.saveStatusLabels(u); setStatuses(u); setNewStatus(''); };
  const removeStatus = async (s: string) => { const u=statuses.filter(x=>x!==s); await window.electronAPI.saveStatusLabels(u); setStatuses(u); };
  const togglePin = async (p: any) => { const u=await window.electronAPI.togglePresetPin(p.id); setPresets(px=>px.map(x=>x.id===p.id?u:x)); };
  const savePresetName = async (p: any) => { if(!editPName.trim()) return; const u=await window.electronAPI.savePreset({...p,name:editPName.trim()}); setPresets(px=>px.map(x=>x.id===u.id?u:x)); setEditPId(null); };
  const delPreset = async (id: number) => { const p=presets.find(x=>x.id===id); if(!confirm(`Delete preset "${p?.name}"?`)) return; await window.electronAPI.deletePreset(id); setPresets(px=>px.filter(x=>x.id!==id)); };
  const totalWeight = weights.reduce((s,w)=>s+w.value,0);

  return (
    <div className="settings-page">
      <div className="page-header"><h1>Settings</h1><p className="page-subtitle">Customise branding, scoring, templates, and recruiting preferences.</p></div>
      <div className="settings-layout">
        <div className="settings-nav">{TABS.map(t=><button key={t.id} className={`settings-nav-item${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
        <div className="settings-content">

          {tab==='branding' && <div className="settings-section">
            <h2>Branding &amp; Agency Identity</h2>
            <p className="section-description">These settings control how your agency identity appears throughout the app.</p>
            <div className="form-group"><label>Company / Agency Name</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Leave blank to display CreatorRadar AI only"/></div>
            <div className="form-group"><label>Brand Colour</label>
              <div className="color-picker-row"><input type="color" value={color} onChange={e=>handleColorChange(e.target.value)} className="color-input"/><div className="color-swatch" style={{backgroundColor:color}}/><span className="color-value">{color}</span></div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>{PRESETS_COLORS.map(c=><button key={c} className="color-swatch-sm" style={{backgroundColor:c,outline:color===c?`2px solid ${c}`:'none',outlineOffset:2,cursor:'pointer'}} onClick={()=>handleColorChange(c)}/>)}</div>
            </div>
            <div className="form-group"><label>Logo</label>
              {logo && <div className="logo-preview-box" style={{marginBottom:8}}><img src={logo} alt="Logo" style={{maxHeight:40,maxWidth:180,objectFit:'contain'}}/><button className="btn-ghost btn-sm" onClick={()=>setLogo(null)}>Remove</button></div>}
              <button className="btn-secondary" onClick={async()=>{ const r=await window.electronAPI.selectLogoFile(); if(r) setLogo(r); }}>{logo?'Change Logo':'+ Upload Logo'}</button>
              <p className="field-hint">PNG or JPG, max 2 MB. Recommended: 200×60 px.</p>
            </div>
            <button className="btn-primary" onClick={saveBranding}>{brandSaved?'✓ Saved!':'Save Branding'}</button>
          </div>}

          {tab==='recruiters' && <div className="settings-section">
            <h2>Recruiter Management</h2><p className="section-description">Manage recruiters who can be assigned to leads.</p>
            <div className="add-form"><input className="form-input" value={newRec.name} onChange={e=>setNewRec(r=>({...r,name:e.target.value}))} placeholder="Recruiter name" onKeyDown={e=>e.key==='Enter'&&addRec()}/><input className="form-input" value={newRec.email} onChange={e=>setNewRec(r=>({...r,email:e.target.value}))} placeholder="Email (optional)"/><button className="btn-primary" onClick={addRec}>Add Recruiter</button></div>
            <div className="list-items">{recs.length===0&&<div className="empty-state">No recruiters added yet.</div>}{recs.map(r=><div key={r.id} className={`list-item${!r.active?' inactive':''}`}><div className="list-item-info"><span className="item-name">{r.name}</span>{r.email&&<span className="item-meta">{r.email}</span>}</div><div className="list-item-actions"><button className={`btn-sm ${r.active?'btn-secondary':'btn-ghost'}`} onClick={()=>toggleRec(r)}>{r.active?'Active':'Inactive'}</button><button className="btn-sm btn-danger" onClick={()=>delRec(r.id)}>Remove</button></div></div>)}</div>
          </div>}

          {tab==='niches' && <div className="settings-section">
            <h2>Niche List</h2><p className="section-description">Manage the niches available when adding creators and building campaigns.</p>
            <div className="add-form"><input className="form-input" value={newNiche} onChange={e=>setNewNiche(e.target.value)} placeholder="New niche name" onKeyDown={e=>e.key==='Enter'&&addNiche()}/><button className="btn-primary" onClick={addNiche}>Add Niche</button></div>
            <div className="niche-tags">{niches.map(n=><div key={n} className="niche-tag-item"><span>{n}</span><button className="tag-remove" onClick={()=>removeNiche(n)}>×</button></div>)}</div>
          </div>}

          {tab==='scoring' && <div className="settings-section">
            <h2>Scoring Weights</h2><p className="section-description">Adjust how each factor contributes to the Recruit Score.</p>
            <div className={`weight-total ${Math.abs(totalWeight-100)>5?'warning':'ok'}`}>Total Weight: {totalWeight}</div>
            {weights.map(w=><div key={w.key} className="weight-row"><div className="weight-label"><span className="weight-name">{w.label}</span><span className="weight-description">{w.desc}</span></div><div className="weight-slider"><input type="range" min={0} max={50} value={w.value} onChange={e=>setWeights(p=>p.map(x=>x.key===w.key?{...x,value:parseInt(e.target.value)}:x))}/><span className="weight-value">{w.value}</span></div></div>)}
            <button className="btn-primary" style={{marginTop:16}} onClick={saveWeights}>Save Scoring Weights</button>
          </div>}

          {tab==='dm-templates' && <div className="settings-section">
            <h2>DM Templates</h2><p className="section-description">Manage tone-based DM templates. Use placeholders: <code>&#123;creator_name&#125;</code>, <code>&#123;niche&#125;</code>, <code>&#123;agency_name&#125;</code>.</p>
            <button className="btn-primary" style={{marginBottom:12}} onClick={()=>setEditTmpl({tone:'',template_text:'',is_default:false})}>+ Add Template</button>
            {editTmpl && <div className="template-editor"><div className="form-group"><label>Tone Name</label><input className="form-input" value={editTmpl.tone||''} onChange={e=>setEditTmpl((t: any)=>({...t,tone:e.target.value}))} placeholder="e.g. Warm"/></div><div className="form-group"><label>Template Text</label><textarea className="form-textarea" value={editTmpl.template_text||''} onChange={e=>setEditTmpl((t: any)=>({...t,template_text:e.target.value}))} rows={6} placeholder="Hey {creator_name}! I came across your {niche} content…"/></div><label className="checkbox-row"><input type="checkbox" checked={editTmpl.is_default||false} onChange={e=>setEditTmpl((t: any)=>({...t,is_default:e.target.checked}))}/>Set as default</label><div className="editor-actions"><button className="btn-primary" onClick={saveTmpl}>Save Template</button><button className="btn-ghost" onClick={()=>setEditTmpl(null)}>Cancel</button></div></div>}
            <div className="template-list">{tmpls.map(t=><div key={t.id} className="template-item"><div className="template-header"><span className="template-tone">{t.tone}</span>{t.is_default&&<span className="default-badge">Default</span>}</div><p className="template-preview">{t.template_text.slice(0,120)}{t.template_text.length>120?'…':''}</p><div className="template-actions"><button className="btn-sm btn-secondary" onClick={()=>setEditTmpl({...t})}>Edit</button><button className="btn-sm btn-danger" onClick={()=>delTmpl(t.id)}>Delete</button></div></div>)}</div>
          </div>}

          {tab==='export' && <div className="settings-section">
            <h2>Export Column Defaults</h2><p className="section-description">Choose which columns are included in Excel exports by default.</p>
            <div style={{display:'flex',gap:8,marginBottom:12}}><button className="btn-ghost btn-sm" onClick={()=>{window.electronAPI.saveExportColumns(ALL_COLS);setExpCols(ALL_COLS);}}>Select All</button><button className="btn-ghost btn-sm" onClick={()=>{window.electronAPI.saveExportColumns([]);setExpCols([]);}}>Select None</button></div>
            <div className="column-checklist">{ALL_COLS.map(c=><label key={c} className="checkbox-row"><input type="checkbox" checked={expCols.includes(c)} onChange={()=>toggleCol(c)}/>{c}</label>)}</div>
          </div>}

          {tab==='statuses' && <div className="settings-section">
            <h2>Status Labels</h2><p className="section-description">Customise the lead status options used across the CRM.</p>
            <div className="add-form"><input className="form-input" value={newStatus} onChange={e=>setNewStatus(e.target.value)} placeholder="New status label" onKeyDown={e=>e.key==='Enter'&&addStatus()}/><button className="btn-primary" onClick={addStatus}>Add Status</button></div>
            <div className="status-list">{statuses.map(s=><div key={s} className="list-item"><span className="item-name">{s}</span><button className="btn-sm btn-danger" onClick={()=>removeStatus(s)}>Remove</button></div>)}</div>
          </div>}

          {tab==='presets' && <div className="settings-section">
            <h2>Saved Search Presets</h2><p className="section-description">Manage your saved search presets. Create new presets from Creator Discovery.</p>
            {presets.length===0 ? <div className="empty-state">No presets yet. Go to Creator Discovery to save filter combinations as presets.</div>
              : <div className="list-items">{presets.map(p=><div key={p.id} className="list-item">
                <div className="list-item-info">
                  {editPId===p.id ? <input className="form-input" value={editPName} onChange={e=>setEditPName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') savePresetName(p); if(e.key==='Escape') setEditPId(null);}} autoFocus style={{marginBottom:0}}/> : <><span className="item-name">{p.pinned?'📌 ':''}{p.name}</span><span className="item-meta">{Object.entries(p.filters||{}).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join(' · ')||'No filters'}</span></>}
                </div>
                <div className="list-item-actions">
                  <button className={`btn-sm ${p.pinned?'btn-primary':'btn-secondary'}`} onClick={()=>togglePin(p)}>{p.pinned?'📌 Pinned':'Pin'}</button>
                  {editPId===p.id ? <><button className="btn-sm btn-primary" onClick={()=>savePresetName(p)}>Save</button><button className="btn-sm btn-ghost" onClick={()=>setEditPId(null)}>Cancel</button></> : <button className="btn-sm btn-secondary" onClick={()=>{setEditPId(p.id);setEditPName(p.name);}}>Rename</button>}
                  <button className="btn-sm btn-danger" onClick={()=>delPreset(p.id)}>Delete</button>
                </div>
              </div>)}</div>}
          </div>}

        </div>
      </div>
    </div>
  );
};
