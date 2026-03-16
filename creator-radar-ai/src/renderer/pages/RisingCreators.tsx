import React, { useEffect, useState } from 'react';
import { CreatorLead } from '../../shared/types';

const GC: Record<string,string> = {'Rising Creator':'#22c55e','Emerging Creator':'#3b82f6','Developing Creator':'#eab308','Low Growth Signals':'#6b7280'};
const TC: Record<string,string> = {'Tier 1':'#22c55e','Tier 2':'#3b82f6','Tier 3':'#eab308','Tier 4':'#6b7280'};
const fmt = (n:number) => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(n);

export const RisingCreators: React.FC = () => {
  const [creators, setCreators] = useState<CreatorLead[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [niches,   setNiches]   = useState<string[]>([]);
  const [selected, setSelected] = useState<CreatorLead|null>(null);
  const [filters,  setFilters]  = useState({ minGrowthScore:70, minRecruitabilityScore:60, maxFollowers:100000, niche:'' });

  useEffect(()=>{ window.electronAPI.getNiches().then(n=>setNiches(n||[])); },[]);
  useEffect(()=>{ load(); },[filters]);

  const load = async () => {
    setLoading(true);
    const r = await window.electronAPI.getRisingCreators(filters);
    setCreators(r||[]); setLoading(false);
  };

  const setF = (k: keyof typeof filters, v: any) => setFilters(f=>({...f,[k]:v}));

  return (
    <div className="rising-creators-page">
      <div className="page-header"><h1>Rising Creator Opportunities</h1><p className="page-subtitle">Discover creators with strong growth potential before they become large.</p></div>
      <div className="leads-filter-bar" style={{marginBottom:16}}>
        <div className="filter-group"><label>Min Growth Score</label><div className="range-with-value"><input type="range" min={0} max={100} value={filters.minGrowthScore} onChange={e=>setF('minGrowthScore',parseInt(e.target.value))}/><span>{filters.minGrowthScore}+</span></div></div>
        <div className="filter-group"><label>Min Recruitability</label><div className="range-with-value"><input type="range" min={0} max={100} value={filters.minRecruitabilityScore} onChange={e=>setF('minRecruitabilityScore',parseInt(e.target.value))}/><span>{filters.minRecruitabilityScore}+</span></div></div>
        <div className="filter-group"><label>Max Followers</label><select className="filter-select" value={filters.maxFollowers} onChange={e=>setF('maxFollowers',parseInt(e.target.value))}><option value={10000}>Under 10K</option><option value={50000}>Under 50K</option><option value={100000}>Under 100K</option><option value={500000}>Under 500K</option><option value={9999999}>Any</option></select></div>
        <div className="filter-group"><label>Niche</label><select className="filter-select" value={filters.niche} onChange={e=>setF('niche',e.target.value)}><option value="">All Niches</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
      </div>
      <p className="results-summary" style={{marginBottom:16}}>{loading?'Loading…':`${creators.length} rising creator${creators.length!==1?'s':''} found`}</p>
      {loading ? <div className="page-loading"><div className="loading-spinner"/></div>
        : creators.length===0 ? <div className="empty-state"><p>No rising creators match your filters. Try lowering the minimum Growth Score.</p></div>
        : <div className="creator-grid">
          {creators.map(c=>(
            <div key={c.id} className="rising-creator-card" onClick={()=>setSelected(c)}>
              <div className="tier-ribbon" style={{backgroundColor:TC[c.priority_tier]||'#6b7280'}}>{c.priority_tier}</div>
              <div className="creator-card-header">
                <div className="creator-avatar-placeholder">{(c.username||'?')[0].toUpperCase()}</div>
                <div className="creator-identity"><span className="creator-username">@{c.username}</span><span className="creator-display-name">{c.display_name}</span></div>
              </div>
              <div className="creator-niche-tag">{c.niche}</div>
              <div className="score-row">
                <div className="score-pill growth"><span className="score-label">Growth</span><span className="score-value">{c.growth_potential_score}</span></div>
                <div className="score-pill recruitability"><span className="score-label">Recruit.</span><span className="score-value">{c.recruitability_score}</span></div>
                <div className="score-pill recruit"><span className="score-label">Score</span><span className="score-value">{c.recruit_score}</span></div>
              </div>
              <div className="creator-metrics-row"><span>{c.followers?fmt(c.followers):'—'} followers</span><span>{c.engagement_rate?`${c.engagement_rate.toFixed(1)}% eng.`:'—'}</span></div>
              {c.growth_category && <div className="growth-category-badge" style={{color:GC[c.growth_category]||'#6b7280',borderColor:GC[c.growth_category]||'#6b7280'}}>{c.growth_category}</div>}
              {c.growth_signals_summary && <p className="growth-signals-preview">{c.growth_signals_summary.slice(0,100)}{c.growth_signals_summary.length>100?'…':''}</p>}
              <div className="card-actions"><button className="btn-sm btn-primary" onClick={e=>{e.stopPropagation();setSelected(c);}}>View Profile</button></div>
            </div>
          ))}
        </div>}
      {selected && (
        <div className="creator-drawer-overlay" onClick={()=>setSelected(null)}>
          <div className="creator-drawer" onClick={e=>e.stopPropagation()}>
            <button className="drawer-close" onClick={()=>setSelected(null)} aria-label="Close">×</button>
            <h2>@{selected.username}</h2>
            {selected.display_name && <p className="drawer-display-name">{selected.display_name}</p>}
            <div className="drawer-scores">
              {[['Recruit Score',selected.recruit_score],['Recruitability',selected.recruitability_score],['Growth Potential',selected.growth_potential_score]].map(([l,v])=>(
                <div key={String(l)} className="score-block"><span>{l}</span><strong>{v}</strong></div>
              ))}
            </div>
            {selected.growth_signals_summary && <div className="drawer-section"><h4>Growth Signals</h4><p>{selected.growth_signals_summary}</p></div>}
            {selected.recruitability_reason   && <div className="drawer-section"><h4>Why Recruitable</h4><p>{selected.recruitability_reason}</p></div>}
            {selected.fit_summary             && <div className="drawer-section"><h4>Fit Summary</h4><p>{selected.fit_summary}</p></div>}
            {selected.ai_outreach_angle       && <div className="drawer-section"><h4>Suggested Outreach Angle</h4><p>{selected.ai_outreach_angle}</p></div>}
            {selected.profile_url && <div className="drawer-actions"><a href={selected.profile_url} target="_blank" rel="noreferrer" className="btn-secondary btn-sm" style={{textDecoration:'none',display:'inline-flex',alignItems:'center'}}>View Profile ↗</a></div>}
          </div>
        </div>
      )}
    </div>
  );
};
