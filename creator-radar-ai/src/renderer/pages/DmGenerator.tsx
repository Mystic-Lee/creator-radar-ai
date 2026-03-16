import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreatorLead }     from '../../shared/types';
import { ScoreBadge }      from '../components/ScoreBadge';

const TONES = ['Warm','Professional','Friendly','High-energy','Soft Invite','Direct','Encouraging','Premium','Casual'];
type DmKey = 'warm'|'standard'|'professional'|'short'|'strong_cta';
const TONE_MAP: Record<string,DmKey> = {Warm:'warm',Professional:'professional','High-energy':'strong_cta','Soft Invite':'warm',Encouraging:'warm',Premium:'professional',Direct:'standard',Casual:'standard',Friendly:'standard'};

export const DmGenerator: React.FC = () => {
  const [sp] = useSearchParams();
  const preId = sp.get('leadId');
  const [leads,    setLeads]    = useState<CreatorLead[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<CreatorLead|null>(null);
  const [tone,     setTone]     = useState('Warm');
  const [variant,  setVariant]  = useState<DmKey>('warm');
  const [dmText,   setDmText]   = useState('');
  const [copied,   setCopied]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [search,   setSearch]   = useState('');

  useEffect(()=>{ window.electronAPI.getLeads({}).then(l=>{ setLeads(l||[]); if(preId){ const f=(l||[]).find((x:CreatorLead)=>String(x.id)===preId); if(f) selectLead(f); } }); },[]);

  const selectLead = (l: CreatorLead) => { setSelected(l); setTone(l.suggested_dm_tone||'Warm'); setVariant('warm'); setDmText(l.dm_warm||l.personalized_dm||''); };

  const switchVariant = (v: DmKey) => {
    if (!selected) return; setVariant(v);
    const m: Record<DmKey,string> = {warm:selected.dm_warm,standard:selected.dm_standard,professional:selected.dm_professional,short:selected.dm_short,strong_cta:selected.dm_strong_cta};
    setDmText(m[v]||'');
  };

  const generate = async () => {
    if (!selected) return; setLoading(true);
    const u = await window.electronAPI.saveLead({...selected,suggested_dm_tone:tone});
    setSelected(u);
    const v = TONE_MAP[tone]??'standard'; setVariant(v);
    const m: Record<DmKey,string> = {warm:u.dm_warm,standard:u.dm_standard,professional:u.dm_professional,short:u.dm_short,strong_cta:u.dm_strong_cta};
    setDmText(m[v]||''); setLoading(false);
  };

  const copy = async () => {
    if (!dmText) return;
    try { await navigator.clipboard.writeText(dmText); } catch { const el=document.createElement('textarea');el.value=dmText;document.body.appendChild(el);el.select();document.execCommand('copy');document.body.removeChild(el); }
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const saveDm = async () => {
    if (!selected) return;
    const u=await window.electronAPI.saveLead({...selected,personalized_dm:dmText,suggested_dm_tone:tone});
    setSelected(u); setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  const filtered = leads.filter(l => !search || [l.username,l.display_name||'',l.niche||''].some(v=>v.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="dm-generator-page">
      <div className="page-header"><h1>DM Generator</h1><p className="page-subtitle">Generate personalised outreach drafts for any creator lead.</p></div>
      <div className="dm-page-warning">⚠️ <strong>Important:</strong> This app does not send messages automatically. All DM drafts must be manually copied and sent by the recruiter.</div>
      <div className="dm-generator-layout">
        <div className="dm-lead-selector">
          <div className="dm-selector-header"><h3>Select Creator</h3><span className="dm-selector-count">{filtered.length} leads</span></div>
          <input className="form-input" type="text" placeholder="Search by username, name, or niche…" value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:10}}/>
          <div className="dm-lead-list">
            {filtered.length===0 ? <div className="empty-state" style={{padding:20}}>{search?'No creators match.':'No leads yet.'}</div>
              : filtered.map(l=>(
                <div key={l.id} className={`dm-lead-item${selected?.id===l.id?' selected':''}`} onClick={()=>selectLead(l)}>
                  <div className="dm-lead-avatar">{(l.username||'?')[0].toUpperCase()}</div>
                  <div className="dm-lead-info"><span className="dm-lead-username">@{l.username}</span><span className="dm-lead-niche">{l.niche}</span></div>
                  <ScoreBadge score={l.recruitability_score} size="sm"/>
                </div>
              ))}
          </div>
        </div>
        <div className="dm-generator-main">
          {!selected ? <div className="dm-no-lead"><p>← Select a creator from the list to generate a DM</p></div> : (
            <>
              <div className="dm-creator-header">
                <div className="dm-creator-avatar">{(selected.username||'?')[0].toUpperCase()}</div>
                <div className="dm-creator-info"><h3>@{selected.username}</h3>{selected.display_name&&<span className="dm-creator-display">{selected.display_name}</span>}<span className="dm-creator-niche">{selected.niche}</span></div>
                <div className="dm-creator-scores"><ScoreBadge score={selected.recruit_score} label="R" size="sm"/><ScoreBadge score={selected.recruitability_score} label="Q" size="sm"/></div>
              </div>
              <div className="dm-tone-section">
                <span className="dm-tone-label">Outreach Tone</span>
                <div className="dm-tone-grid">{TONES.map(t=><button key={t} className={`dm-tone-pill${tone===t?' selected':''}`} onClick={()=>setTone(t)}>{t}</button>)}</div>
              </div>
              {selected.ai_outreach_angle && <div className="dm-outreach-hint">💡 <strong>Suggested angle:</strong> {selected.ai_outreach_angle}</div>}
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',marginBottom:16}} onClick={generate} disabled={loading}>{loading?'Generating…':`🔄 Generate DM — "${tone}" Tone`}</button>
              <div className="dm-variant-tabs">
                {([['warm','Warm'],['standard','Standard'],['professional','Professional'],['short','Short'],['strong_cta','Strong CTA']] as [DmKey,string][]).map(([v,l])=>(
                  <button key={v} className={`dm-variant-tab${variant===v?' active':''}`} onClick={()=>switchVariant(v)}>{l}</button>
                ))}
              </div>
              <textarea className="dm-textarea dm-textarea-lg" value={dmText} onChange={e=>setDmText(e.target.value)} rows={10} placeholder="Select a tone above and click Generate DM…"/>
              <p className="dm-char-count">{dmText.length} characters{dmText.length>500&&<span className="dm-char-warning"> — consider a shorter variant</span>}</p>
              <div className="dm-actions dm-actions-row">
                <button className="btn-primary" onClick={copy}>{copied?'✓ Copied to Clipboard!':'📋 Copy to Clipboard'}</button>
                <button className="btn-secondary" onClick={saveDm}>{saved?'✓ Saved':'💾 Save Version'}</button>
                <button className="btn-ghost btn-sm" onClick={generate}>🔄 Regenerate</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
