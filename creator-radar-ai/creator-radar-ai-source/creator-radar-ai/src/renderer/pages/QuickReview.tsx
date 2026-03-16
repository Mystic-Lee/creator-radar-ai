import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate }               from 'react-router-dom';
import { CreatorLead, ReviewAction, QueueSource, SearchFilters } from '../../shared/types';
import { QuickReviewCard }           from '../components/QuickReviewCard';

const SOURCES: {id:QueueSource;label:string;desc:string}[] = [
  {id:'unreviewed', label:'Unreviewed Leads',     desc:'Leads with status "New Lead"'},
  {id:'today',      label:'Added Today',          desc:'Leads discovered today'},
  {id:'high-growth',label:'High Growth Potential',desc:'Growth score 70+'},
  {id:'niche',      label:'By Niche',             desc:'Filter to a specific niche'},
  {id:'campaign',   label:'By Campaign',          desc:'Leads in a specific campaign'},
  {id:'custom',     label:'Custom Filters',       desc:'Apply your own filter set'},
];

const EMPTY = { reviewed:0, highPriority:0, saved:0, skipped:0, notAFit:0 };

export const QuickReview: React.FC = () => {
  const navigate = useNavigate();
  const [isSetup,   setIsSetup]   = useState(true);
  const [source,    setSource]    = useState<QueueSource>('unreviewed');
  const [filters,   setFilters]   = useState<SearchFilters>({});
  const [niches,    setNiches]    = useState<string[]>([]);
  const [camps,     setCamps]     = useState<any[]>([]);
  const [presets,   setPresets]   = useState<any[]>([]);
  const [queue,     setQueue]     = useState<CreatorLead[]>([]);
  const [idx,       setIdx]       = useState(0);
  const [stats,     setStats]     = useState(EMPTY);
  const [animating, setAnimating] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const processed = useRef<Set<number>>(new Set());

  useEffect(()=>{
    Promise.all([window.electronAPI.getNiches(),window.electronAPI.getCampaigns(),window.electronAPI.getPresets()])
      .then(([n,c,p])=>{setNiches(n||[]);setCamps(c||[]);setPresets(p||[]);});
  },[]);

  const current = queue[idx]??null;
  const total   = queue.length;

  const start = async () => {
    if (loading) return; setLoading(true);
    const data = await window.electronAPI.getReviewQueue(source, filters as Record<string,unknown>);
    if (!data?.length) { alert('No creators found for the selected queue source. Try different filters.'); setLoading(false); return; }
    processed.current=new Set(); setQueue(data); setIdx(0); setStats(EMPTY); setDone(false); setIsSetup(false); setLoading(false);
  };

  const advance = useCallback(()=>{
    setAnimating(true);
    setTimeout(()=>{
      setAnimating(false);
      setIdx(p=>{ const n=p+1; if(n>=queue.length){setDone(true);return p;} return n; });
    },200);
  },[queue.length]);

  const handleAction = useCallback(async (action: ReviewAction)=>{
    if (!current||animating) return;
    if (processed.current.has(current.id!)) return;
    processed.current.add(current.id!);
    setStats(p=>{ const n={...p,reviewed:p.reviewed+1}; if(action==='high-priority') n.highPriority++; else if(action==='save') n.saved++; else if(action==='skip') n.skipped++; else if(action==='not-a-fit') n.notAFit++; return n; });
    window.electronAPI.processReviewAction(current.id!, action).catch(console.error);
    advance();
  },[current,animating,advance]);

  const changeSource = (s: QueueSource) => {
    setSource(s);
    if (['unreviewed','today','high-growth'].includes(s)) setFilters({});
    else if (s!=='niche'&&s!=='custom') setFilters(f=>{ const n={...f}; delete n.niche; return n; });
    if (s!=='campaign') setFilters(f=>{ const n={...f}; delete n.campaignId; return n; });
  };

  const applyPreset = (p: any) => { setFilters(p.filters||{}); if(p.filters?.status==='New Lead') setSource('unreviewed'); else if(p.filters?.niche) setSource('niche'); else setSource('custom'); };

  if (isSetup) return (
    <div className="quick-review-page">
      <div className="page-header"><h1>Quick Review Mode</h1><p className="page-subtitle">Rapidly review and categorise creator leads using keyboard shortcuts. Review 50–100 creators in minutes.</p></div>
      <div className="qr-setup-layout">
        <div className="qr-setup-left">
          {presets.filter((p:any)=>p.pinned).length>0 && (
            <div className="qr-preset-quickstart"><h3>Saved Presets</h3><div className="qr-preset-pills">{presets.filter((p:any)=>p.pinned).map((p:any)=><button key={p.id} className="qr-preset-pill" onClick={()=>applyPreset(p)}>📌 {p.name}</button>)}</div></div>
          )}
          <div className="qr-source-section">
            <h3>Queue Source</h3>
            <div className="qr-source-list">{SOURCES.map(s=>(
              <label key={s.id} className={`qr-source-option${source===s.id?' selected':''}`}>
                <input type="radio" name="qs" value={s.id} checked={source===s.id} onChange={()=>changeSource(s.id)}/>
                <div><span className="qr-source-label">{s.label}</span><span className="qr-source-desc">{s.desc}</span></div>
              </label>
            ))}</div>
          </div>
          {(source==='niche'||source==='custom') && (
            <div className="qr-filter-section">
              <h3>{source==='niche'?'Select Niche':'Custom Filters'}</h3>
              <div className="form-group"><label>Niche</label><select className="form-select" value={filters.niche||''} onChange={e=>setFilters(f=>({...f,niche:e.target.value||undefined}))}><option value="">All Niches</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
              {source==='custom' && (<>
                <div className="form-group"><label>Min Recruitability: {filters.minRecruitabilityScore??0}+</label><input type="range" min={0} max={100} value={filters.minRecruitabilityScore??0} onChange={e=>setFilters(f=>({...f,minRecruitabilityScore:parseInt(e.target.value)||undefined}))}/></div>
                <div className="form-group"><label>Min Growth Score: {filters.minGrowthScore??0}+</label><input type="range" min={0} max={100} value={filters.minGrowthScore??0} onChange={e=>setFilters(f=>({...f,minGrowthScore:parseInt(e.target.value)||undefined}))}/></div>
                <div className="form-group"><label>Status</label><select className="form-select" value={filters.status||''} onChange={e=>setFilters(f=>({...f,status:e.target.value||undefined}))}><option value="">Any Status</option>{['New Lead','Reviewed','High Priority','Ready to Contact','Contacted','Replied','Interested'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              </>)}
            </div>
          )}
          {source==='campaign' && (
            <div className="qr-filter-section"><h3>Select Campaign</h3><select className="form-select" value={filters.campaignId||''} onChange={e=>setFilters(f=>({...f,campaignId:e.target.value?parseInt(e.target.value):undefined}))}><option value="">Select a campaign…</option>{camps.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          )}
        </div>
        <div className="qr-setup-right">
          <div className="qr-instructions">
            <h3>Keyboard Shortcuts</h3>
            <div className="qr-shortcut-list">
              {[['H','High Priority','#22c55e'],['S','Save Lead','#3b82f6'],['K','Skip','#6b7280'],['N','Not a Fit','#ef4444'],['O','Open Full Profile','#8b5cf6']].map(([k,l,c])=>(
                <div key={k} className="qr-shortcut-row"><kbd className="qr-key">{k}</kbd><span style={{color:c}}>{l}</span></div>
              ))}
            </div>
            <div className="qr-tip-box"><strong>Performance tip:</strong> Use keyboard shortcuts to review 50–100 creators in under 10 minutes.</div>
          </div>
          <button className="btn-primary qr-start-btn" onClick={start} disabled={loading}>{loading?'Loading Queue…':'▶ Start Quick Review'}</button>
        </div>
      </div>
    </div>
  );

  if (done) return (
    <div className="quick-review-page">
      <div className="qr-complete-screen">
        <div className="qr-complete-icon">🎉</div>
        <h2>Review Session Complete!</h2>
        <p>You reviewed all {total} creators in this queue.</p>
        <div className="qr-final-stats">
          <div className="qr-final-stat"><span className="qr-final-stat-value">{total}</span><span className="qr-final-stat-label">Total Reviewed</span></div>
          <div className="qr-final-stat qr-stat-green"><span className="qr-final-stat-value">{stats.highPriority}</span><span className="qr-final-stat-label">High Priority</span></div>
          <div className="qr-final-stat qr-stat-blue"><span className="qr-final-stat-value">{stats.saved}</span><span className="qr-final-stat-label">Saved Leads</span></div>
          <div className="qr-final-stat"><span className="qr-final-stat-value">{stats.skipped}</span><span className="qr-final-stat-label">Skipped</span></div>
          <div className="qr-final-stat qr-stat-red"><span className="qr-final-stat-value">{stats.notAFit}</span><span className="qr-final-stat-label">Not a Fit</span></div>
        </div>
        <div className="qr-complete-actions">
          <button className="btn-primary" onClick={()=>{setIsSetup(true);setDone(false);}}>Start Another Session</button>
          <button className="btn-secondary" onClick={()=>navigate('/leads')}>View All Leads</button>
          <button className="btn-secondary" onClick={()=>navigate('/priority')}>View Priority Queue</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="quick-review-page quick-review-active">
      <div className="qr-progress-bar-section">
        <div className="qr-progress-header">
          <div className="qr-progress-text"><span className="qr-progress-current">{idx+1}</span><span className="qr-progress-sep"> / </span><span className="qr-progress-total">{total}</span><span className="qr-progress-label"> creators</span></div>
          <div className="qr-session-stats">
            <span className="qr-stat qr-stat-green">⭐ {stats.highPriority} High Priority</span>
            <span className="qr-stat qr-stat-blue">✓ {stats.saved} Saved</span>
            <span className="qr-stat">→ {stats.skipped} Skipped</span>
            <span className="qr-stat qr-stat-red">✕ {stats.notAFit} Not a Fit</span>
          </div>
          <button className="btn-ghost btn-sm qr-exit-btn" onClick={()=>setIsSetup(true)}>Exit Session</button>
        </div>
        <div className="qr-progress-track"><div className="qr-progress-fill" style={{width:`${(idx/Math.max(total,1))*100}%`}}/></div>
      </div>
      {current ? <QuickReviewCard lead={current} onAction={handleAction} onOpenFull={l=>navigate(`/leads/${l.id}`)} isAnimating={animating}/> : <div className="page-loading"><div className="loading-spinner"/></div>}
      <div className="qr-shortcut-reminder"><kbd>H</kbd> High Priority &nbsp;·&nbsp; <kbd>S</kbd> Save &nbsp;·&nbsp; <kbd>K</kbd> Skip &nbsp;·&nbsp; <kbd>N</kbd> Not a Fit &nbsp;·&nbsp; <kbd>O</kbd> Open Full Profile</div>
    </div>
  );
};
