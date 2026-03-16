import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreatorLead, SearchFilters, SearchPreset } from '../../shared/types';
import { ScoreBadge }   from '../components/ScoreBadge';
import { StatusBadge }  from '../components/StatusBadge';
import { SavedPresets } from '../components/SavedPresets';

const TC: Record<string,string> = {'Tier 1':'#22c55e','Tier 2':'#3b82f6','Tier 3':'#eab308','Tier 4':'#6b7280'};
const STATUS_OPTS = ['New Lead','Reviewed','High Priority','Ready to Contact','Contacted','Replied','Interested','Joined','Not a Fit','Do Not Contact','Follow Up Later'];
const BLANK: SearchFilters = {};
const fmt = (n:number) => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(n);

export const CreatorDiscovery: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [results, setResults]   = useState<CreatorLead[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched,setSearched]  = useState(false);
  const [niches,  setNiches]    = useState<string[]>([]);
  const [camps,   setCamps]     = useState<any[]>([]);
  const [presets, setPresets]   = useState<SearchPreset[]>([]);
  const [filters, setFilters]   = useState<SearchFilters>(BLANK);

  useEffect(()=>{
    Promise.all([window.electronAPI.getNiches(),window.electronAPI.getCampaigns(),window.electronAPI.getPresets()])
      .then(([n,c,p])=>{setNiches(n||[]);setCamps(c||[]);setPresets(p||[]);});
  },[]);

  useEffect(()=>{
    const s = location.state as {applyPreset?:SearchPreset}|null;
    if (s?.applyPreset) { setFilters(s.applyPreset.filters||BLANK); runSearch(s.applyPreset.filters||BLANK); window.history.replaceState({},''); }
    else runSearch(BLANK);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const runSearch = useCallback(async (f: SearchFilters) => {
    setLoading(true); setSearched(true);
    try {
      const p: Record<string,unknown> = {};
      if (f.niche) p.niche=f.niche;
      if (f.minFollowers) p.minFollowers=f.minFollowers;
      if (f.maxFollowers) p.maxFollowers=f.maxFollowers;
      if (f.minRecruitScore) p.minRecruitScore=f.minRecruitScore;
      if (f.minRecruitabilityScore) p.minRecruitabilityScore=f.minRecruitabilityScore;
      if (f.minGrowthScore) p.minGrowthScore=f.minGrowthScore;
      if (f.liveActivity) p.liveActivity=f.liveActivity;
      if (f.campaignId) p.campaignId=f.campaignId;
      if (f.priorityTier) p.priorityTier=f.priorityTier;
      if (f.status) p.status=f.status;
      const d = await window.electronAPI.searchCreators(p);
      setResults(d||[]);
    } catch(e){console.error(e);}
    finally { setLoading(false); }
  },[]);

  const setF = <K extends keyof SearchFilters>(k:K,v:SearchFilters[K])=>setFilters(f=>({...f,[k]:v}));
  const hasFilters = Object.values(filters).some(v=>v!==undefined&&v!==''&&v!==0);
  const clearFilters = ()=>{ setFilters(BLANK); runSearch(BLANK); };

  return (
    <div className="discovery-page">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><h1>Creator Discovery</h1><p className="page-subtitle">Search and filter your lead database with precision.</p></div>
        <button className="btn-secondary" onClick={()=>navigate('/quick-review')}>⚡ Quick Review Mode</button>
      </div>

      <SavedPresets presets={presets} currentFilters={filters} onApply={f=>{setFilters(f);runSearch(f);}} onPresetsChange={setPresets} compact/>

      <div className="discovery-filters">
        <div className="filter-row">
          <div className="filter-group"><label>Niche</label><select className="filter-select" value={filters.niche||''} onChange={e=>setF('niche',e.target.value||undefined)}><option value="">All Niches</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
          <div className="filter-group"><label>Priority Tier</label><select className="filter-select" value={filters.priorityTier||''} onChange={e=>setF('priorityTier',e.target.value||undefined)}><option value="">All Tiers</option>{['Tier 1','Tier 2','Tier 3','Tier 4'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          <div className="filter-group"><label>Campaign</label><select className="filter-select" value={filters.campaignId||''} onChange={e=>setF('campaignId',e.target.value?parseInt(e.target.value):undefined)}><option value="">All Campaigns</option>{camps.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="filter-group"><label>Status</label><select className="filter-select" value={filters.status||''} onChange={e=>setF('status',e.target.value||undefined)}><option value="">All Statuses</option>{STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="filter-row">
          <div className="filter-group"><label>Min Recruit Score</label><div className="range-with-value"><input type="range" min={0} max={100} value={filters.minRecruitScore??0} onChange={e=>setF('minRecruitScore',parseInt(e.target.value)||undefined)}/><span>{filters.minRecruitScore??0}+</span></div></div>
          <div className="filter-group"><label>Min Recruitability</label><div className="range-with-value"><input type="range" min={0} max={100} value={filters.minRecruitabilityScore??0} onChange={e=>setF('minRecruitabilityScore',parseInt(e.target.value)||undefined)}/><span>{filters.minRecruitabilityScore??0}+</span></div></div>
          <div className="filter-group"><label>Min Growth Score</label><div className="range-with-value"><input type="range" min={0} max={100} value={filters.minGrowthScore??0} onChange={e=>setF('minGrowthScore',parseInt(e.target.value)||undefined)}/><span>{filters.minGrowthScore??0}+</span></div></div>
        </div>
        <div className="filter-actions-row">
          <button className="btn-primary" onClick={()=>runSearch(filters)}>🔍 Search</button>
          {hasFilters && <button className="btn-ghost" onClick={clearFilters}>Clear Filters</button>}
          {searched && !loading && <span className="results-summary">{results.length} result{results.length!==1?'s':''}</span>}
        </div>
      </div>

      <div style={{marginBottom:20}}><SavedPresets presets={presets} currentFilters={filters} onApply={f=>{setFilters(f);runSearch(f);}} onPresetsChange={setPresets}/></div>

      {loading ? <div className="page-loading"><div className="loading-spinner"/><p>Searching…</p></div> : searched && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Creator</th><th>Niche</th><th style={{textAlign:'right'}}>Followers</th><th style={{textAlign:'right'}}>Eng%</th><th>Recruit</th><th>Recruitability</th><th>Growth</th><th>Tier</th><th>Status</th><th>LIVE</th><th style={{textAlign:'center'}}>Actions</th></tr></thead>
            <tbody>
              {results.length===0 ? <tr><td colSpan={11} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No creators match your filters.</td></tr>
                : results.map(lead=>(
                  <tr key={lead.id} onClick={()=>navigate(`/leads/${lead.id}`)}>
                    <td><div className="creator-cell"><div className="creator-cell-avatar">{(lead.username||'?')[0].toUpperCase()}</div><div className="creator-cell-info"><span className="creator-cell-username">@{lead.username}</span>{lead.display_name&&<span className="creator-cell-display">{lead.display_name}</span>}</div></div></td>
                    <td>{lead.niche}</td>
                    <td className="num-cell">{fmt(lead.followers||0)}</td>
                    <td className="num-cell">{lead.engagement_rate?`${lead.engagement_rate.toFixed(1)}%`:'—'}</td>
                    <td><ScoreBadge score={lead.recruit_score} size="sm"/></td>
                    <td><ScoreBadge score={lead.recruitability_score} size="sm"/></td>
                    <td><ScoreBadge score={lead.growth_potential_score} size="sm"/></td>
                    <td><span style={{color:TC[lead.priority_tier]||'#6b7280',fontWeight:700,fontSize:12}}>{lead.priority_tier}</span></td>
                    <td><StatusBadge status={lead.status} size="sm"/></td>
                    <td><span style={{fontSize:11,fontWeight:600,color:lead.ai_live_potential==='High'?'#22c55e':lead.ai_live_potential==='Medium'?'#3b82f6':'#6b7280'}}>{lead.ai_live_potential||'—'}</span></td>
                    <td onClick={e=>e.stopPropagation()}><div className="row-actions" style={{justifyContent:'center'}}><button className="row-action-btn" onClick={()=>navigate(`/leads/${lead.id}`)}>👁</button><button className="row-action-btn" onClick={()=>navigate(`/dm-generator?leadId=${lead.id}`)}>✉️</button></div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
