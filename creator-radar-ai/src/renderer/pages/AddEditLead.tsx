import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate }       from 'react-router-dom';
import { CreatorLead }       from '../../shared/types';
import { DuplicateWarning }  from '../components/DuplicateWarning';

type Tab = 'profile'|'metrics'|'crm'|'outreach';
const TABS: {id:Tab;label:string}[] = [{id:'profile',label:'Profile Info'},{id:'metrics',label:'Metrics'},{id:'crm',label:'CRM & Status'},{id:'outreach',label:'Outreach'}];
const STATUS_OPTS = ['New Lead','Reviewed','High Priority','Ready to Contact','Contacted','Replied','Interested','Joined','Not a Fit','Do Not Contact','Follow Up Later'];
const LIVE_OPTS   = ['Active streamer','Occasional streamer','New to LIVE','Never streamed','Monthly sessions','Unknown'];
const POST_OPTS   = ['Multiple times per day','2-3x per day','Daily','4-5x per week','2-3x per week','Weekly','Bi-weekly','Monthly','Irregular'];
const BLANK: Partial<CreatorLead> = { username:'',display_name:'',profile_url:'',bio:'',niche:'',sub_niche:'',followers:0,engagement_rate:0,estimated_likes:0,estimated_avg_views:0,live_activity:'Unknown',posting_frequency:'Unknown',status:'New Lead',suggested_dm_tone:'Warm',tags:'[]',notes:'',response_status:'Not Contacted' };

interface Props { leadId?: number; onSave: ()=>Promise<void>; onCancel: ()=>void; }

export const AddEditLead: React.FC<Props> = ({ leadId, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState<Tab>('profile');
  const [form,    setForm]    = useState<Partial<CreatorLead>>(BLANK);
  const [loading, setLoading] = useState(!!leadId);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string|null>(null);
  const [niches,  setNiches]  = useState<string[]>([]);
  const [recs,    setRecs]    = useState<any[]>([]);
  const [camps,   setCamps]   = useState<any[]>([]);
  const [dups,    setDups]    = useState<any[]>([]);
  const [dupOk,   setDupOk]   = useState(false);
  const [tagIn,   setTagIn]   = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const tags: string[] = (() => { try { return JSON.parse(form.tags||'[]'); } catch { return []; } })();

  useEffect(() => {
    Promise.all([window.electronAPI.getNiches(),window.electronAPI.getRecruiters(),window.electronAPI.getCampaigns()])
      .then(([n,r,c])=>{setNiches(n||[]);setRecs(r||[]);setCamps(c||[]);});
  },[]);

  useEffect(()=>{
    if (!leadId) { setLoading(false); return; }
    window.electronAPI.getLead(leadId).then(l=>{ if(l){setForm(l);} }).catch(console.error).finally(()=>setLoading(false));
  },[leadId]);

  const checkDups = useCallback(async()=>{
    if (dupOk||(!form.username&&!form.profile_url&&!form.display_name)) return;
    const m = await window.electronAPI.checkDuplicates({username:form.username,profileUrl:form.profile_url,displayName:form.display_name,excludeId:leadId});
    setDups(m||[]);
  },[form.username,form.profile_url,form.display_name,leadId,dupOk]);

  useEffect(()=>{ if(timer.current) clearTimeout(timer.current); timer.current=setTimeout(checkDups,600); return()=>{if(timer.current)clearTimeout(timer.current);}; },[form.username,form.profile_url,checkDups]);

  const setF = <K extends keyof CreatorLead>(k:K,v:CreatorLead[K])=>setForm(f=>({...f,[k]:v}));

  const addTag=()=>{ const t=tagIn.trim(); if(!t||tags.includes(t)) return; setF('tags',JSON.stringify([...tags,t])); setTagIn(''); };
  const removeTag=(t:string)=>setF('tags',JSON.stringify(tags.filter(x=>x!==t)));

  const handleSave = async()=>{
    if (!form.username?.trim()) { setError('Username is required.'); setTab('profile'); return; }
    if (!form.niche?.trim())    { setError('Niche is required.');    setTab('profile'); return; }
    setSaving(true); setError(null);
    try { await window.electronAPI.saveLead(form); await onSave(); }
    catch(e:any) { setError(e?.message||'Failed to save lead.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner"/></div>;

  return (
    <div className="add-edit-lead-page">
      <div className="add-edit-header">
        <button className="btn-ghost" onClick={onCancel}>← Back</button>
        <h1>{leadId?'Edit Creator Lead':'Add New Creator Lead'}</h1>
        <div style={{display:'flex',gap:8}}>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':leadId?'Save Changes':'Add Lead'}</button>
        </div>
      </div>
      {error && <div className="form-error-banner">❌ {error}</div>}
      {dups.length>0 && !dupOk && <DuplicateWarning matches={dups} onViewLead={id=>navigate(`/leads/${id}`)} onDismiss={()=>setDupOk(true)}/>}
      <div className="form-section-tabs">{TABS.map(t=><button key={t.id} className={`form-tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>

      <div className="add-edit-body">
        {tab==='profile' && (
          <div className="form-grid-2">
            <div className="form-group"><label>Username <span className="required">*</span></label><input className="form-input" value={form.username||''} onChange={e=>setF('username',e.target.value)} placeholder="e.g. glowwithamara" autoFocus/></div>
            <div className="form-group"><label>Display Name</label><input className="form-input" value={form.display_name||''} onChange={e=>setF('display_name',e.target.value)} placeholder="Full name or creator name"/></div>
            <div className="form-group form-span-2"><label>Profile URL</label><input className="form-input" type="url" value={form.profile_url||''} onChange={e=>setF('profile_url',e.target.value)} placeholder="https://tiktok.com/@username"/></div>
            <div className="form-group"><label>Niche <span className="required">*</span></label><select className="form-select" value={form.niche||''} onChange={e=>setF('niche',e.target.value)}><option value="">Select a niche…</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
            <div className="form-group"><label>Sub-Niche</label><input className="form-input" value={form.sub_niche||''} onChange={e=>setF('sub_niche',e.target.value)} placeholder="e.g. Skincare, FPS Games"/></div>
            <div className="form-group form-span-2"><label>Bio</label><textarea className="form-textarea" value={form.bio||''} onChange={e=>setF('bio',e.target.value)} placeholder="Paste the creator's bio…" rows={3}/></div>
            <div className="form-group form-span-2">
              <label>Tags</label>
              <div className="tag-input-row"><input className="form-input" value={tagIn} onChange={e=>setTagIn(e.target.value)} placeholder="Add a tag and press Enter" onKeyDown={e=>e.key==='Enter'&&addTag()}/><button className="btn-secondary btn-sm" onClick={addTag}>Add</button></div>
              <div className="tag-list" style={{marginTop:8}}>{tags.map(t=><span key={t} className="lead-tag">{t}<button className="tag-remove" onClick={()=>removeTag(t)}>×</button></span>)}</div>
            </div>
          </div>
        )}
        {tab==='metrics' && (
          <>
            <div className="form-grid-3">
              <div className="form-group"><label>Followers</label><input className="form-input" type="number" min={0} value={form.followers||''} onChange={e=>setF('followers',parseInt(e.target.value)||0)} placeholder="e.g. 48200"/></div>
              <div className="form-group"><label>Engagement Rate (%)</label><input className="form-input" type="number" min={0} max={100} step={0.1} value={form.engagement_rate||''} onChange={e=>setF('engagement_rate',parseFloat(e.target.value)||0)} placeholder="e.g. 6.8"/></div>
              <div className="form-group"><label>Est. Avg Views</label><input className="form-input" type="number" min={0} value={form.estimated_avg_views||''} onChange={e=>setF('estimated_avg_views',parseInt(e.target.value)||0)} placeholder="e.g. 15000"/></div>
              <div className="form-group"><label>Est. Avg Likes</label><input className="form-input" type="number" min={0} value={form.estimated_likes||''} onChange={e=>setF('estimated_likes',parseInt(e.target.value)||0)} placeholder="e.g. 3200"/></div>
              <div className="form-group"><label>LIVE Activity</label><select className="form-select" value={form.live_activity||'Unknown'} onChange={e=>setF('live_activity',e.target.value)}>{LIVE_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
              <div className="form-group"><label>Posting Frequency</label><select className="form-select" value={form.posting_frequency||'Unknown'} onChange={e=>setF('posting_frequency',e.target.value)}><option value="Unknown">Unknown</option>{POST_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
            </div>
            <div className="scoring-note">💡 Scores are calculated automatically when you save. Fill in Followers, Engagement Rate, Niche, and LIVE Activity for best results.</div>
          </>
        )}
        {tab==='crm' && (
          <div className="form-grid-2">
            <div className="form-group"><label>Status</label><select className="form-select" value={form.status||'New Lead'} onChange={e=>setF('status',e.target.value)}>{STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Assigned Recruiter</label><select className="form-select" value={form.assigned_recruiter_id??''} onChange={e=>setF('assigned_recruiter_id',e.target.value?parseInt(e.target.value):null)}><option value="">Unassigned</option>{recs.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="form-group"><label>Campaign</label><select className="form-select" value={form.campaign_id??''} onChange={e=>setF('campaign_id',e.target.value?parseInt(e.target.value):null)}><option value="">No Campaign</option>{camps.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="form-group"><label>Follow-Up Date</label><input className="form-input" type="date" value={form.follow_up_date||''} onChange={e=>setF('follow_up_date',e.target.value)}/></div>
            <div className="form-group form-span-2"><label>Notes</label><textarea className="form-textarea" value={form.notes||''} onChange={e=>setF('notes',e.target.value)} placeholder="Recruiter notes, observations, context…" rows={4}/></div>
          </div>
        )}
        {tab==='outreach' && (
          <div className="form-grid-2">
            <div className="form-group"><label>Date Contacted</label><input className="form-input" type="date" value={form.date_contacted||''} onChange={e=>setF('date_contacted',e.target.value)}/></div>
            <div className="form-group"><label>Response Status</label><select className="form-select" value={form.response_status||'Not Contacted'} onChange={e=>setF('response_status',e.target.value)}>{['Not Contacted','DM Sent','Seen / No Reply','Replied','Interested','Not Interested','Blocked'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Preferred DM Tone</label><select className="form-select" value={form.suggested_dm_tone||'Warm'} onChange={e=>setF('suggested_dm_tone',e.target.value)}>{['Warm','Professional','Friendly','High-energy','Soft Invite','Direct','Encouraging','Premium','Casual'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <div className="form-group"><label>Outcome Notes</label><input className="form-input" value={form.outcome_notes||''} onChange={e=>setF('outcome_notes',e.target.value)} placeholder="e.g. Interested but busy, follow up January"/></div>
            <div className="form-group form-span-2"><label>Saved DM Draft</label><textarea className="form-textarea" value={form.personalized_dm||''} onChange={e=>setF('personalized_dm',e.target.value)} placeholder="Paste or type a DM draft…" rows={5}/><p className="field-hint">Scores and AI insights generate automatically on save.</p></div>
          </div>
        )}
      </div>

      <div className="add-edit-footer">
        {error && <span className="footer-error">{error}</span>}
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':leadId?'Save Changes':'Add Lead & Calculate Scores'}</button>
      </div>
    </div>
  );
};
