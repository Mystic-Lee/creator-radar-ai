import React, { useEffect, useState } from 'react';
import { useNavigate }  from 'react-router-dom';
import { CreatorLead }  from '../../shared/types';
import { ScoreBadge }   from '../components/ScoreBadge';
import { StatusBadge }  from '../components/StatusBadge';

const TC: Record<string,string> = {'Tier 1':'#22c55e','Tier 2':'#3b82f6','Tier 3':'#eab308','Tier 4':'#6b7280'};
const fmt = (n:number) => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(n);

export const PriorityQueue: React.FC = () => {
  const navigate = useNavigate();
  const [leads,   setLeads]   = useState<CreatorLead[]>([]);
  const [recs,    setRecs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(new Date());

  useEffect(()=>{ loadData(); },[]);

  const loadData = async () => {
    setLoading(true);
    const [q,r] = await Promise.all([window.electronAPI.getPriorityQueue(),window.electronAPI.getRecruiters()]);
    setLeads(q||[]); setRecs(r||[]); setRefresh(new Date()); setLoading(false);
  };

  const markContacted = async (l: CreatorLead) => {
    await window.electronAPI.saveLead({...l,status:'Contacted',date_contacted:new Date().toISOString().slice(0,10)});
    loadData();
  };

  const assignRecruiter = async (l: CreatorLead, v: string) => {
    const id = parseInt(v); if (isNaN(id)) return;
    await window.electronAPI.saveLead({...l,assigned_recruiter_id:id}); loadData();
  };

  return (
    <div className="priority-queue-page">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><h1>Priority Queue</h1><p className="page-subtitle">Top {leads.length} creators by Recruitability Score — not yet contacted. Last refreshed: {refresh.toLocaleTimeString()}.</p></div>
        <button className="btn-secondary" onClick={loadData}>🔄 Refresh Queue</button>
      </div>
      {loading ? <div className="page-loading"><div className="loading-spinner"/></div>
        : leads.length===0 ? <div className="empty-state"><p>🎉 All leads have been contacted!</p><button className="btn-primary" style={{marginTop:16}} onClick={()=>navigate('/leads')}>Go to Leads</button></div>
        : <div className="queue-list">{leads.map((lead,i)=>(
          <div key={lead.id} className="queue-card" onClick={()=>navigate(`/leads/${lead.id}`)}>
            <div className="queue-rank">#{i+1}</div>
            <div className="queue-avatar" style={{backgroundColor:TC[lead.priority_tier]||'#6b7280'}}>{(lead.username||'?')[0].toUpperCase()}</div>
            <div className="queue-identity"><span className="queue-username">@{lead.username}</span>{lead.display_name&&<span className="queue-display">{lead.display_name}</span>}<span className="queue-niche">{lead.niche}</span></div>
            <div className="queue-metrics"><span className="queue-followers">{fmt(lead.followers||0)}</span><span className="queue-engagement">{lead.engagement_rate?`${lead.engagement_rate.toFixed(1)}%`:'—'}</span></div>
            <div className="queue-scores">
              <div className="queue-score-item"><span className="queue-score-label">Score</span><ScoreBadge score={lead.recruit_score} size="sm"/></div>
              <div className="queue-score-item"><span className="queue-score-label">Recruit.</span><ScoreBadge score={lead.recruitability_score} size="sm"/></div>
              <div className="queue-score-item"><span className="queue-score-label">Growth</span><ScoreBadge score={lead.growth_potential_score} size="sm"/></div>
            </div>
            <div className="queue-tier" style={{color:TC[lead.priority_tier]||'#6b7280'}}><span className="tier-dot" style={{backgroundColor:TC[lead.priority_tier]||'#6b7280'}}/>{lead.priority_tier}</div>
            <StatusBadge status={lead.status} size="sm"/>
            <div className="queue-actions" onClick={e=>e.stopPropagation()}>
              <button className="btn-sm btn-primary" onClick={()=>navigate(`/leads/${lead.id}`)}>View</button>
              <button className="btn-sm btn-secondary" onClick={()=>navigate(`/dm-generator?leadId=${lead.id}`)}>✉️ DM</button>
              <button className="btn-sm btn-secondary" onClick={()=>markContacted(lead)}>✓ Contacted</button>
              {recs.length>0 && <select className="filter-select" style={{fontSize:11,padding:'4px 8px'}} value={lead.assigned_recruiter_id??''} onChange={e=>assignRecruiter(lead,e.target.value)} onClick={e=>e.stopPropagation()}><option value="">Assign…</option>{recs.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>}
            </div>
          </div>
        ))}</div>}
    </div>
  );
};
