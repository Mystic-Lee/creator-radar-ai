import React, { useEffect, useState } from 'react';

const BLANK = { name:'', target_niches:[] as string[], min_followers:0, max_followers:9999999, min_recruit_score:0, min_recruitability:0, target_content_style:'', notes:'', status:'Active' };

export const Campaigns: React.FC = () => {
  const [camps,    setCamps]    = useState<any[]>([]);
  const [niches,   setNiches]   = useState<string[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState<any>(BLANK);
  const [saving,   setSaving]   = useState(false);
  const [expanded, setExpanded] = useState<number|null>(null);
  const [statsMap, setStatsMap] = useState<Record<number,any>>({});
  const [delId,    setDelId]    = useState<number|null>(null);

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    setLoading(true);
    const [c,n] = await Promise.all([window.electronAPI.getCampaigns(),window.electronAPI.getNiches()]);
    setCamps((c||[]) as any[]); setNiches(n||[]); setLoading(false);
  };

  const loadStats = async (id: number, force=false) => {
    if (statsMap[id] && !force) return;
    const s = await window.electronAPI.getCampaignStats(id);
    setStatsMap(p=>({...p,[id]:s}));
  };

  const toggle = (id: number) => {
    if (expanded===id) { setExpanded(null); }
    else { setExpanded(id); loadStats(id); }
  };

  const openEdit = (c: any) => {
    setForm({ id:c.id, name:c.name, target_niches:(() => { try { return JSON.parse(c.target_niches); } catch { return []; } })(), min_followers:c.min_followers, max_followers:c.max_followers===9999999?'':c.max_followers, min_recruit_score:c.min_recruit_score, min_recruitability:c.min_recruitability, target_content_style:c.target_content_style, notes:c.notes, status:c.status });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    await window.electronAPI.saveCampaign({ ...form, target_niches: JSON.stringify(form.target_niches||[]) });
    setShowForm(false); await load(); setSaving(false);
  };

  const handleDelete = async (id: number) => {
    await window.electronAPI.deleteCampaign(id); setDelId(null); load();
  };

  const toggleNiche = (n: string) => setForm((f: any) => ({ ...f, target_niches: f.target_niches.includes(n) ? f.target_niches.filter((x: string)=>x!==n) : [...f.target_niches, n] }));

  const S = ({ label, value, color }: { label:string; value:any; color?:string }) => (
    <div className="campaign-stat-block"><span className="stat-block-value" style={color?{color}:undefined}>{value}</span><span className="stat-block-label">{label}</span></div>
  );

  if (showForm) return (
    <div className="campaigns-page">
      <div className="add-edit-header">
        <button className="btn-ghost" onClick={()=>setShowForm(false)}>← Back</button>
        <h1>{form.id?'Edit Campaign':'New Campaign'}</h1>
        <div style={{display:'flex',gap:8}}>
          <button className="btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':form.id?'Save Changes':'Create Campaign'}</button>
        </div>
      </div>
      <div className="add-edit-body">
        <div className="form-grid-2">
          <div className="form-group form-span-2"><label>Campaign Name *</label><input className="form-input" value={form.name||''} onChange={e=>setForm((f: any)=>({...f,name:e.target.value}))} placeholder="e.g. Beauty Creator Outreach Q1" autoFocus/></div>
          <div className="form-group"><label>Min Followers</label><input className="form-input" type="number" min={0} value={form.min_followers||''} onChange={e=>setForm((f: any)=>({...f,min_followers:parseInt(e.target.value)||0}))}/></div>
          <div className="form-group"><label>Max Followers</label><input className="form-input" type="number" min={0} value={form.max_followers||''} onChange={e=>setForm((f: any)=>({...f,max_followers:parseInt(e.target.value)||9999999}))} placeholder="No limit"/></div>
          <div className="form-group"><label>Min Recruit Score</label><input className="form-input" type="number" min={0} max={100} value={form.min_recruit_score||''} onChange={e=>setForm((f: any)=>({...f,min_recruit_score:parseInt(e.target.value)||0}))}/></div>
          <div className="form-group"><label>Min Recruitability</label><input className="form-input" type="number" min={0} max={100} value={form.min_recruitability||''} onChange={e=>setForm((f: any)=>({...f,min_recruitability:parseInt(e.target.value)||0}))}/></div>
          <div className="form-group"><label>Status</label><select className="form-select" value={form.status||'Active'} onChange={e=>setForm((f: any)=>({...f,status:e.target.value}))}><option value="Active">Active</option><option value="Paused">Paused</option><option value="Completed">Completed</option></select></div>
          <div className="form-group"><label>Target Content Style</label><input className="form-input" value={form.target_content_style||''} onChange={e=>setForm((f: any)=>({...f,target_content_style:e.target.value}))} placeholder="e.g. Tutorial-based, LIVE-ready"/></div>
          <div className="form-group form-span-2"><label>Target Niches</label><div className="niche-checkboxes">{niches.map(n=><label key={n} className="checkbox-row"><input type="checkbox" checked={(form.target_niches||[]).includes(n)} onChange={()=>toggleNiche(n)}/>{n}</label>)}</div></div>
          <div className="form-group form-span-2"><label>Campaign Notes</label><textarea className="form-textarea" value={form.notes||''} onChange={e=>setForm((f: any)=>({...f,notes:e.target.value}))} rows={4} placeholder="Goals, strategy, notes…"/></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="campaigns-page">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><h1>Campaigns</h1><p className="page-subtitle">{camps.length} campaign{camps.length!==1?'s':''}</p></div>
        <button className="btn-primary" onClick={()=>{setForm({...BLANK,target_niches:[]});setShowForm(true);}}>+ New Campaign</button>
      </div>
      {loading ? <div className="page-loading"><div className="loading-spinner"/></div>
        : camps.length===0 ? <div className="empty-state"><p>No campaigns yet.</p><button className="btn-primary" style={{marginTop:12}} onClick={()=>{setForm({...BLANK,target_niches:[]});setShowForm(true);}}>Create First Campaign</button></div>
        : <div className="campaign-list">{camps.map(c=>{
          const niches2: string[] = (() => { try { return JSON.parse(c.target_niches); } catch { return []; } })();
          const stats = statsMap[c.id];
          return (
            <div key={c.id} className="campaign-card">
              <div className="campaign-card-header" onClick={()=>toggle(c.id)}>
                <div className="campaign-card-left">
                  <div className="campaign-name-row"><h3 className="campaign-name">{c.name}</h3><span className={`campaign-status-badge status-${c.status?.toLowerCase()}`}>{c.status}</span></div>
                  <div className="campaign-meta-row">
                    {niches2.length>0 && <span className="campaign-niches">{niches2.slice(0,3).join(', ')}{niches2.length>3?` +${niches2.length-3} more`:''}</span>}
                    <span className="campaign-leads-count">{c.total_leads||0} leads</span>
                    {c.min_recruitability>0 && <span className="campaign-min-score">Min Recruit.: {c.min_recruitability}</span>}
                  </div>
                </div>
                <div className="campaign-card-actions" onClick={e=>e.stopPropagation()}>
                  <button className="btn-sm btn-secondary" onClick={()=>openEdit(c)}>Edit</button>
                  <button className="btn-sm btn-danger" onClick={()=>setDelId(c.id)}>Delete</button>
                  <span className="expand-toggle">{expanded===c.id?'▲':'▼'}</span>
                </div>
              </div>
              {expanded===c.id && (
                <div className="campaign-stats-panel">
                  {!stats ? <div className="stats-loading">Loading stats…</div> : (
                    <>
                      <div className="campaign-stats-grid">
                        <S label="Total Leads"  value={stats.total_leads}/>
                        <S label="Tier 1"        value={stats.tier1_leads} color="#22c55e"/>
                        <S label="Contacted"     value={stats.contacted}/>
                        <S label="Replied"       value={stats.replied}/>
                        <S label="Interested"    value={stats.interested} color="#84cc16"/>
                        <S label="Joined"        value={stats.joined} color="#22c55e"/>
                        <S label="Conversion"    value={`${stats.conversion_rate?.toFixed(1)??0}%`} color={(stats.conversion_rate??0)>=10?'#22c55e':'#3b82f6'}/>
                        <S label="Avg Recruit."  value={stats.avg_recruitability?.toFixed(0)??0}/>
                      </div>
                      {c.notes && <div className="campaign-notes-display"><span className="section-label">Notes:</span> {c.notes}</div>}
                      <div style={{textAlign:'right',marginTop:10}}><button className="btn-ghost btn-sm" onClick={e=>{e.stopPropagation();loadStats(c.id,true);}}>↻ Refresh Stats</button></div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}</div>}
      {delId!==null && <div className="modal-overlay"><div className="modal-box"><h3>Delete Campaign?</h3><p>Leads assigned to this campaign will be unlinked but not deleted.</p><div className="modal-actions"><button className="btn-ghost" onClick={()=>setDelId(null)}>Cancel</button><button className="btn-danger" onClick={()=>handleDelete(delId)}>Delete</button></div></div></div>}
    </div>
  );
};
