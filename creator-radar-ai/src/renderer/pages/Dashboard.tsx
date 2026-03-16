import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp }      from '../context/AppContext';
import { DashboardStats, SearchPreset } from '../../shared/types';

const TC: Record<string,string> = {'Tier 1':'#22c55e','Tier 2':'#3b82f6','Tier 3':'#eab308','Tier 4':'#6b7280'};

export const Dashboard: React.FC = () => {
  const { settings } = useApp();
  const navigate = useNavigate();
  const [data,    setData]    = useState<DashboardStats|null>(null);
  const [presets, setPresets] = useState<SearchPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([window.electronAPI.getDashboardStats(), window.electronAPI.getPresets()])
      .then(([s,p]) => { setData(s); setPresets((p||[]).filter((x:SearchPreset)=>x.pinned)); })
      .catch(console.error).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="loading-spinner"/><p>Loading dashboard…</p></div>;
  if (!data)   return <div className="page-error">Failed to load dashboard.</div>;

  const hr = new Date().getHours();
  const greeting = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const today = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  const cards = [
    { label:'Leads Found Today',  value:data.leadsToday,      icon:'👥', color:'#6366f1', path:'/leads' },
    { label:'High Priority',      value:data.highPriority,    icon:'⭐', color:'#22c55e', path:'/priority' },
    { label:'Contacted Today',    value:data.contactedToday,  icon:'✉️', color:'#06b6d4', path:'/leads' },
    { label:'Replies Received',   value:data.repliesReceived, icon:'💬', color:'#f59e0b', path:'/leads' },
    { label:'Interested',         value:data.interested,      icon:'🙋', color:'#84cc16', path:'/leads' },
    { label:'Creators Joined',    value:data.joined,          icon:'🎉', color:'#8b5cf6', path:'/leads' },
    { label:'Follow-Ups Due',     value:data.followUpsDue,    icon:'🔔', color:'#f97316', path:'/leads' },
  ];

  const quickActions = [
    { icon:'👥', label:'Add New Lead',      path:'/leads' },
    { icon:'⚡', label:'Quick Review Mode', path:'/quick-review' },
    { icon:'⭐', label:'Priority Queue',    path:'/priority' },
    { icon:'✉️', label:'Generate DM',       path:'/dm-generator' },
    { icon:'📊', label:'Export to Excel',   path:'/exports' },
    { icon:'🎯', label:'View Campaigns',    path:'/campaigns' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{greeting}{settings.companyName?`, ${settings.companyName}`:''}</h1>
          <p className="dashboard-date">{today}</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn-secondary" onClick={()=>navigate('/quick-review')}>⚡ Quick Review</button>
          <button className="btn-primary" onClick={()=>navigate('/leads')}>+ Add Lead</button>
        </div>
      </div>

      <div className="metric-cards">
        {cards.map(c=>(
          <button key={c.label} className="metric-card" onClick={()=>navigate(c.path)} style={{'--card-accent':c.color} as React.CSSProperties}>
            <div className="metric-icon">{c.icon}</div>
            <div className="metric-value">{c.value}</div>
            <div className="metric-label">{c.label}</div>
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header"><h3>Recent Leads</h3><button className="btn-link" onClick={()=>navigate('/leads')}>View All →</button></div>
          <div className="lead-list">
            {data.recentLeads.length===0
              ? <div className="empty-list"><p>No leads yet.</p><button className="btn-primary btn-sm" onClick={()=>navigate('/leads')} style={{marginTop:8}}>Add First Lead</button></div>
              : data.recentLeads.map(l=>(
                <div key={l.id} className="lead-list-item" onClick={()=>navigate(`/leads/${l.id}`)}>
                  <div className="lead-avatar">{(l.username||'?')[0].toUpperCase()}</div>
                  <div className="lead-info"><span className="lead-username">@{l.username}</span><span className="lead-niche">{l.niche}</span></div>
                  <div className="lead-meta">
                    <span className="tier-pill" style={{backgroundColor:TC[l.priority_tier||'']||'#6b7280',color:'white',padding:'2px 7px',borderRadius:9999,fontSize:10,fontWeight:700}}>{l.priority_tier}</span>
                    <span style={{color:'var(--text-muted)',fontSize:10}}>{l.status}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header"><h3>Top Priority Creators</h3><button className="btn-link" onClick={()=>navigate('/priority')}>View Queue →</button></div>
          <div className="priority-list">
            {data.topPriority.length===0
              ? <div className="empty-list"><p>No priority leads yet.</p></div>
              : data.topPriority.map((l,i)=>(
                <div key={l.id} className="priority-list-item" onClick={()=>navigate(`/leads/${l.id}`)}>
                  <span className="priority-rank">#{i+1}</span>
                  <div className="lead-avatar">{(l.username||'?')[0].toUpperCase()}</div>
                  <div className="lead-info"><span className="lead-username">@{l.username}</span><span className="lead-niche">{l.niche}</span></div>
                  <div className="score-stack">
                    <div className="score-row-sm"><span className="score-label-sm">R</span><span className="score-val-sm">{l.recruit_score}</span></div>
                    <div className="score-row-sm"><span className="score-label-sm">Q</span><span className="score-val-sm">{l.recruitability_score}</span></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--bottom">
        <div className="dashboard-card">
          <div className="card-header"><h3>Lead Breakdown by Niche</h3></div>
          <div className="niche-breakdown-list">
            {data.nicheBreakdown.length===0 ? <div className="empty-list">No niche data yet.</div>
              : data.nicheBreakdown.map((item,i)=>{
                const max=data.nicheBreakdown[0]?.count||1;
                const colors=['#6366f1','#22c55e','#f59e0b','#3b82f6','#8b5cf6','#ef4444'];
                return (
                  <div key={item.niche} className="niche-bar-row">
                    <span className="niche-bar-label">{item.niche}</span>
                    <div className="niche-bar-track"><div className="niche-bar-fill" style={{width:`${Math.round(item.count/max*100)}%`,backgroundColor:colors[i%colors.length]}}/></div>
                    <span className="niche-bar-count">{item.count}</span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="dashboard-card quick-actions-card">
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="quick-actions">
            {quickActions.map(a=>(
              <button key={a.path} className="quick-action-btn" onClick={()=>navigate(a.path)}>
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
          {presets.length>0 && (
            <div className="dashboard-preset-section">
              <h4 className="dashboard-preset-heading">Saved Presets</h4>
              <div className="dashboard-presets-row">
                {presets.map(p=>(
                  <button key={p.id} className="dashboard-preset-btn" onClick={()=>navigate('/discovery',{state:{applyPreset:p}})}>📌 {p.name}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
