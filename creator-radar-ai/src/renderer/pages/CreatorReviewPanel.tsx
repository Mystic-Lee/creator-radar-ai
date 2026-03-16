import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatorLead } from '../../shared/types';
import { ScoreBadge }  from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';

const TC: Record<string,string> = {'Tier 1':'#22c55e','Tier 2':'#3b82f6','Tier 3':'#eab308','Tier 4':'#6b7280'};
const DM_TONES = ['Warm','Professional','Friendly','High-energy','Soft Invite','Direct','Encouraging','Premium','Casual'];
const STATUS_OPTS = ['New Lead','Reviewed','High Priority','Ready to Contact','Contacted','Replied','Interested','Joined','Not a Fit','Do Not Contact','Follow Up Later'];
type DmKey = 'warm'|'standard'|'professional'|'short'|'strong_cta';

export const CreatorReviewPanel: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const navigate = useNavigate();
  const [lead,     setLead]     = useState<CreatorLead|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tone,     setTone]     = useState('Warm');
  const [variant,  setVariant]  = useState<DmKey>('warm');
  const [dmText,   setDmText]   = useState('');
  const [copied,   setCopied]   = useState(false);
  const [dmSaved,  setDmSaved]  = useState(false);
  const [notes,    setNotes]    = useState('');
  const [noteSaved,setNoteSaved]= useState(false);
  const [status,   setStatus]   = useState('New Lead');
  const [aiTab,    setAiTab]    = useState<'insights'|'scoring'>('insights');

  useEffect(() => { if (id) load(parseInt(id)); },[id]);

  const load = async (lid: number) => {
    setLoading(true);
    const d = await window.electronAPI.getLead(lid);
    if (d) { setLead(d); setStatus(d.status); setNotes(d.notes||''); setTone(d.suggested_dm_tone||'Warm'); setDmText(d.dm_warm||d.personalized_dm||''); }
    setLoading(false);
  };

  const switchVariant = (v: DmKey) => {
    if (!lead) return;
    setVariant(v);
    const m: Record<DmKey,string> = {warm:lead.dm_warm,standard:lead.dm_standard,professional:lead.dm_professional,short:lead.dm_short,strong_cta:lead.dm_strong_cta};
    setDmText(m[v]||'');
  };

  const generateDm = useCallback(async () => {
    if (!lead) return;
    const u = await window.electronAPI.saveLead({...lead,suggested_dm_tone:tone});
    setLead(u);
    const tmap: Record<string,DmKey> = {Warm:'warm',Professional:'professional','High-energy':'strong_cta','Soft Invite':'warm',Encouraging:'warm',Premium:'professional',Direct:'standard',Casual:'standard',Friendly:'standard'};
    const v = tmap[tone]??'standard'; setVariant(v);
    const m: Record<DmKey,string> = {warm:u.dm_warm,standard:u.dm_standard,professional:u.dm_professional,short:u.dm_short,strong_cta:u.dm_strong_cta};
    setDmText(m[v]||'');
  },[lead,tone]);

  const copyDm = async () => {
    try { await navigator.clipboard.writeText(dmText); } catch { const el=document.createElement('textarea');el.value=dmText;document.body.appendChild(el);el.select();document.execCommand('copy');document.body.removeChild(el); }
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const saveDm = async () => { if (!lead) return; const u=await window.electronAPI.saveLead({...lead,personalized_dm:dmText,suggested_dm_tone:tone}); setLead(u); setDmSaved(true); setTimeout(()=>setDmSaved(false),2000); };
  const saveNotes = async () => { if (!lead) return; const u=await window.electronAPI.saveLead({...lead,notes}); setLead(u); setNoteSaved(true); setTimeout(()=>setNoteSaved(false),2000); };
  const updateStatus = async (s: string) => { if (!lead) return; setStatus(s); const u=await window.electronAPI.saveLead({...lead,status:s}); setLead(u); };
  const fmt = (n?: number|null) => !n?'—':n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(n);
  const tags: string[] = (() => { try { return JSON.parse(lead?.ai_content_tags||'[]'); } catch { return []; } })();
  const leadTags: string[] = (() => { try { return JSON.parse(lead?.tags||'[]'); } catch { return []; } })();

  if (loading) return <div className="page-loading"><div className="loading-spinner"/><p>Loading creator profile…</p></div>;
  if (!lead)   return <div className="page-error">Lead not found.<button className="btn-primary" onClick={()=>navigate('/leads')} style={{marginLeft:16}}>Back to Leads</button></div>;

  return (
    <div className="review-panel-page">
      <div className="review-panel-nav">
        <button className="btn-ghost" onClick={()=>navigate('/leads')}>← Back to Leads</button>
        <div className="review-panel-nav-actions">
          <button className="btn-secondary" onClick={()=>navigate(`/dm-generator?leadId=${lead.id}`)}>✉️ Open in DM Generator</button>
          <button className="btn-secondary" onClick={()=>navigate('/leads',{state:{editId:lead.id}})}>✏️ Edit Lead</button>
        </div>
      </div>

      <div className="review-panel-layout">
        <div className="review-left">
          <div className="profile-identity-card">
            <div className="profile-avatar-lg">{(lead.username||'?')[0].toUpperCase()}</div>
            <div className="profile-identity-info">
              <h2>@{lead.username}</h2>
              {lead.display_name && <p className="profile-display-name">{lead.display_name}</p>}
              <div className="profile-niche-row">
                <span className="niche-badge">{lead.niche}</span>
                {lead.sub_niche && <span className="sub-niche-badge">{lead.sub_niche}</span>}
              </div>
              {lead.profile_url && <a href={lead.profile_url} target="_blank" rel="noreferrer" className="profile-link">View Profile ↗</a>}
            </div>
          </div>
          <div className="score-cards-row">
            {[['Recruit Score',lead.recruit_score],['Recruitability',lead.recruitability_score],['Growth Potential',lead.growth_potential_score]].map(([l,s])=>(
              <div key={String(l)} className="score-card"><span className="score-card-label">{l}</span><ScoreBadge score={s as number} size="lg"/></div>
            ))}
          </div>
          <div className="priority-tier-banner" style={{borderColor:TC[lead.priority_tier]||'#6b7280'}}>
            <span className="tier-dot-lg" style={{backgroundColor:TC[lead.priority_tier]||'#6b7280'}}/>
            <span className="tier-label-text" style={{color:TC[lead.priority_tier]||'#6b7280'}}>{lead.priority_tier}</span>
            <span className="tier-growth-cat">{lead.growth_category}</span>
          </div>
          <div className="metrics-grid">
            {[['Followers',fmt(lead.followers)],['Engagement',lead.engagement_rate?`${lead.engagement_rate.toFixed(1)}%`:'—'],['Avg Views',fmt(lead.estimated_avg_views)],['LIVE Activity',lead.live_activity||'—'],['Posting Freq.',lead.posting_frequency||'—'],['LIVE Potential',lead.ai_live_potential||'—']].map(([l,v])=>(
              <div key={String(l)} className="metric-item"><span className="metric-item-label">{l}</span><span className="metric-item-value">{v}</span></div>
            ))}
          </div>
          <div className="crm-section">
            <h4 className="section-label">Status</h4>
            <div className="status-select-row">
              <select className="form-select" value={status} onChange={e=>updateStatus(e.target.value)}>{STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
              <StatusBadge status={status}/>
            </div>
          </div>
          <div className="crm-details-grid">
            {lead.date_added && <div className="crm-detail-item"><span className="crm-detail-label">Date Added</span><span className="crm-detail-value">{lead.date_added}</span></div>}
            {lead.date_contacted && <div className="crm-detail-item"><span className="crm-detail-label">Contacted</span><span className="crm-detail-value">{lead.date_contacted}</span></div>}
            {lead.response_status && <div className="crm-detail-item"><span className="crm-detail-label">Response</span><span className="crm-detail-value">{lead.response_status}</span></div>}
            {lead.follow_up_date && <div className="crm-detail-item"><span className="crm-detail-label">Follow-Up</span><span className="crm-detail-value follow-up-date">{lead.follow_up_date}</span></div>}
            {lead.recruiter_name && <div className="crm-detail-item"><span className="crm-detail-label">Recruiter</span><span className="crm-detail-value">{lead.recruiter_name}</span></div>}
            {lead.campaign_name && <div className="crm-detail-item"><span className="crm-detail-label">Campaign</span><span className="crm-detail-value">{lead.campaign_name}</span></div>}
          </div>
          {leadTags.length>0 && <div className="crm-section"><h4 className="section-label">Tags</h4><div className="tag-list">{leadTags.map(t=><span key={t} className="lead-tag lead-tag-readonly">{t}</span>)}</div></div>}
          <div className="crm-section">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <h4 className="section-label" style={{margin:0}}>Notes</h4>
              <button className="btn-sm btn-secondary" onClick={saveNotes}>{noteSaved?'✓ Saved':'Save Notes'}</button>
            </div>
            <textarea className="form-textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add recruiter notes here…" rows={4}/>
          </div>
          {lead.bio && <div className="crm-section"><h4 className="section-label">Profile Bio</h4><p className="bio-text">{lead.bio}</p></div>}
        </div>

        <div className="review-right">
          <div className="ai-disclaimer">🤖 AI suggestions are advisory. Recruiters should review all leads manually.</div>
          <div className="right-panel-tabs">
            <button className={`right-tab${aiTab==='insights'?' active':''}`} onClick={()=>setAiTab('insights')}>AI Insights</button>
            <button className={`right-tab${aiTab==='scoring'?' active':''}`} onClick={()=>setAiTab('scoring')}>Score Breakdown</button>
          </div>
          {aiTab==='insights' && (
            <div className="ai-insights-panel">
              {lead.ai_summary && <div className="insight-block"><h4>Creator Summary</h4><p>{lead.ai_summary}</p></div>}
              {tags.length>0 && <div className="insight-block"><h4>Content Style Tags</h4><div className="content-tags">{tags.map(t=><span key={t} className="content-tag">{t}</span>)}</div></div>}
              <div className="insight-block"><h4>LIVE Performance Prediction</h4><div className="live-potential-display"><span className="live-potential-score" style={{color:lead.ai_live_potential==='High'?'#22c55e':lead.ai_live_potential==='Medium'?'#3b82f6':'#6b7280'}}>{lead.ai_live_potential||'Unknown'}</span><span className="live-potential-label">LIVE Potential</span></div></div>
              {lead.ai_outreach_angle && <div className="insight-block"><h4>Suggested Outreach Angle</h4><p className="outreach-angle-text">{lead.ai_outreach_angle}</p></div>}
            </div>
          )}
          {aiTab==='scoring' && (
            <div className="score-breakdown-panel">
              {[['Recruit Score',lead.recruit_score,lead.fit_summary,lead.why_good_candidate],['Recruitability Score',lead.recruitability_score,lead.recruitability_reason,''],['Growth Potential Score',lead.growth_potential_score,lead.growth_signals_summary,'']].map(([label,score,p1,p2])=>(
                <div key={String(label)} className="breakdown-block">
                  <div className="breakdown-header"><span>{label}</span><ScoreBadge score={score as number}/></div>
                  <p>{p1}</p>{p2 && <p style={{marginTop:6}}>{p2}</p>}
                </div>
              ))}
            </div>
          )}
          <div className="dm-generator-section">
            <div className="dm-warning-banner">⚠️ This app does not send messages. All outreach must be sent manually by the recruiter.</div>
            <h3 className="dm-section-title">Personalised DM Generator</h3>
            <div className="dm-controls-row">
              <select className="form-select dm-tone-select" value={tone} onChange={e=>setTone(e.target.value)}>{DM_TONES.map(t=><option key={t} value={t}>{t}</option>)}</select>
              <button className="btn-primary btn-sm" onClick={generateDm}>Generate DM</button>
            </div>
            <div className="dm-variant-tabs">
              {([['warm','Warm'],['standard','Standard'],['professional','Professional'],['short','Short'],['strong_cta','Strong CTA']] as [DmKey,string][]).map(([v,l])=>(
                <button key={v} className={`dm-variant-tab${variant===v?' active':''}`} onClick={()=>switchVariant(v)}>{l}</button>
              ))}
            </div>
            <textarea className="dm-textarea" value={dmText} onChange={e=>setDmText(e.target.value)} rows={8} placeholder="Click 'Generate DM' to create a personalised message draft."/>
            <div className="dm-actions">
              <button className="btn-primary" onClick={copyDm}>{copied?'✓ Copied!':'📋 Copy to Clipboard'}</button>
              <button className="btn-secondary" onClick={saveDm}>{dmSaved?'✓ Saved':'💾 Save Version'}</button>
              <button className="btn-ghost btn-sm" onClick={generateDm}>🔄 Regenerate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
