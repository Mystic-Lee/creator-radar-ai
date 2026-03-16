import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CreatorLead } from '../../shared/types';
import { ScoreBadge }  from '../components/ScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AddEditLead } from './AddEditLead';

const TC: Record<string,string> = {'Tier 1':'#22c55e','Tier 2':'#3b82f6','Tier 3':'#eab308','Tier 4':'#6b7280'};
const STATUS_OPTS = ['New Lead','Reviewed','High Priority','Ready to Contact','Contacted','Replied','Interested','Joined','Not a Fit','Do Not Contact','Follow Up Later'];
type SortKey = 'recruit_score'|'recruitability_score'|'growth_potential_score'|'followers'|'engagement_rate'|'created_at'|'username';

const fmt = (n:number) => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(n);

export const Leads: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();
  const [leads,   setLeads]   = useState<CreatorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [niches,  setNiches]  = useState<string[]>([]);
  const [camps,   setCamps]   = useState<any[]>([]);
  const [search,  setSearch]  = useState(sp.get('search')||'');
  const [fNiche,  setFNiche]  = useState('');
  const [fStatus, setFStatus] = useState(sp.get('status')||'');
  const [fTier,   setFTier]   = useState('');
  const [fCamp,   setFCamp]   = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recruit_score');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [selIds,  setSelIds]  = useState<Set<number>>(new Set());
  const [showForm,setShowForm]= useState(false);
  const [editId,  setEditId]  = useState<number|null>(null);
  const [delId,   setDelId]   = useState<number|null>(null);
  const leadsRef = useRef<CreatorLead[]>([]);
  leadsRef.current = leads;

  useEffect(()=>{ loadAll(); },[]);
  useEffect(()=>{
    const s = location.state as {editId?:number}|null;
    if (s?.editId && leadsRef.current.length>0) { setEditId(s.editId); setShowForm(true); window.history.replaceState({},''); }
  },[location.state, leads]);

  const loadAll = async () => {
    setLoading(true);
    const [l,n,c] = await Promise.all([window.electronAPI.getLeads({}),window.electronAPI.getNiches(),window.electronAPI.getCampaigns()]);
    setLeads(l||[]); setNiches(n||[]); setCamps(c||[]);
    setLoading(false);
  };

  const filtered = leads.filter(l=>{
    if (search && !([l.username,l.display_name||'',l.niche||'',l.notes||''].some(v=>v.toLowerCase().includes(search.toLowerCase())))) return false;
    if (fNiche  && l.niche!==fNiche) return false;
    if (fStatus && l.status!==fStatus) return false;
    if (fTier   && l.priority_tier!==fTier) return false;
    if (fCamp   && String(l.campaign_id)!==fCamp) return false;
    return true;
  });

  const sorted = [...filtered].sort((a,b)=>{
    const av=(a as any)[sortKey]??0, bv=(b as any)[sortKey]??0;
    if (typeof av==='string') return sortDir==='asc'?av.localeCompare(bv):bv.localeCompare(av);
    return sortDir==='asc'?av-bv:bv-av;
  });

  const handleSort = (k: SortKey) => { if (sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortKey(k); setSortDir('desc'); } };
  const si = (k: SortKey) => sortKey===k?(sortDir==='asc'?'↑':'↓'):'↕';

  const updateStatus = async (l: CreatorLead, s: string) => {
    const u = await window.electronAPI.saveLead({...l,status:s});
    setLeads(p=>p.map(x=>x.id===l.id?u:x));
  };

  const handleDelete = async (id: number) => {
    await window.electronAPI.deleteLead(id);
    setLeads(p=>p.filter(x=>x.id!==id));
    setDelId(null);
  };

  const hasFilters = search||fNiche||fStatus||fTier||fCamp;
  const clearFilters = ()=>{ setSearch(''); setFNiche(''); setFStatus(''); setFTier(''); setFCamp(''); };

  if (showForm) return <AddEditLead leadId={editId??undefined} onSave={async()=>{setShowForm(false);setEditId(null);await loadAll();}} onCancel={()=>{setShowForm(false);setEditId(null);}}/>;

  return (
    <div className="leads-page">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><h1>Creator Leads</h1><p className="page-subtitle">{sorted.length} lead{sorted.length!==1?'s':''}{hasFilters?` (filtered)`:` of ${leads.length} total`}</p></div>
        <div style={{display:'flex',gap:8}}>
          {selIds.size>0 && <button className="btn-secondary" onClick={()=>navigate('/exports',{state:{selectedIds:[...selIds]}})}>Export {selIds.size} Selected</button>}
          <button className="btn-primary" onClick={()=>{setEditId(null);setShowForm(true);}}>+ Add Lead</button>
        </div>
      </div>

      <div className="leads-filter-bar">
        <div className="filter-search-wrap">
          <span className="filter-search-icon">🔍</span>
          <input className="filter-search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search username, name, niche, notes…"/>
        </div>
        <select className="filter-select" value={fNiche} onChange={e=>setFNiche(e.target.value)}><option value="">All Niches</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select>
        <select className="filter-select" value={fStatus} onChange={e=>setFStatus(e.target.value)}><option value="">All Statuses</option>{STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
        <select className="filter-select" value={fTier} onChange={e=>setFTier(e.target.value)}><option value="">All Tiers</option>{['Tier 1','Tier 2','Tier 3','Tier 4'].map(t=><option key={t} value={t}>{t}</option>)}</select>
        <select className="filter-select" value={fCamp} onChange={e=>setFCamp(e.target.value)}><option value="">All Campaigns</option>{camps.map(c=><option key={c.id} value={String(c.id)}>{c.name}</option>)}</select>
        {hasFilters && <button className="btn-ghost btn-sm" onClick={clearFilters}>Clear</button>}
      </div>

      {loading ? <div className="page-loading"><div className="loading-spinner"/><p>Loading leads…</p></div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{width:36}}><input type="checkbox" checked={selIds.size>0&&selIds.size===sorted.length} onChange={()=>setSelIds(selIds.size===sorted.length?new Set():new Set(sorted.map(l=>l.id!)))} style={{accentColor:'var(--brand-color)'}}/></th>
                <th onClick={()=>handleSort('username')} style={{cursor:'pointer'}}>Creator {si('username')}</th>
                <th>Niche</th>
                <th onClick={()=>handleSort('followers')} style={{cursor:'pointer',textAlign:'right'}}>Followers {si('followers')}</th>
                <th onClick={()=>handleSort('engagement_rate')} style={{cursor:'pointer',textAlign:'right'}}>Eng% {si('engagement_rate')}</th>
                <th onClick={()=>handleSort('recruit_score')} style={{cursor:'pointer'}}>Recruit {si('recruit_score')}</th>
                <th onClick={()=>handleSort('recruitability_score')} style={{cursor:'pointer'}}>Recruit. {si('recruitability_score')}</th>
                <th onClick={()=>handleSort('growth_potential_score')} style={{cursor:'pointer'}}>Growth {si('growth_potential_score')}</th>
                <th>Tier</th><th>Status</th>
                <th style={{textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length===0 ? <tr><td colSpan={11} style={{textAlign:'center',padding:'48px',color:'var(--text-muted)'}}>{hasFilters?'No leads match your filters.':'No leads yet. Click "+ Add Lead" to get started.'}</td></tr>
                : sorted.map(lead=>(
                  <tr key={lead.id} className={selIds.has(lead.id!)?'row-selected':''} onClick={()=>navigate(`/leads/${lead.id}`)}>
                    <td onClick={e=>e.stopPropagation()}><input type="checkbox" checked={selIds.has(lead.id!)} onChange={()=>setSelIds(p=>{const n=new Set(p);n.has(lead.id!)?n.delete(lead.id!):n.add(lead.id!);return n;})} style={{accentColor:'var(--brand-color)'}}/></td>
                    <td><div className="creator-cell"><div className="creator-cell-avatar">{(lead.username||'?')[0].toUpperCase()}</div><div className="creator-cell-info"><span className="creator-cell-username">@{lead.username}</span>{lead.display_name&&<span className="creator-cell-display">{lead.display_name}</span>}</div></div></td>
                    <td><span className="niche-cell">{lead.niche}</span>{lead.sub_niche&&<span className="sub-niche-cell"> · {lead.sub_niche}</span>}</td>
                    <td className="num-cell">{fmt(lead.followers||0)}</td>
                    <td className="num-cell">{lead.engagement_rate?`${lead.engagement_rate.toFixed(1)}%`:'—'}</td>
                    <td><ScoreBadge score={lead.recruit_score} size="sm"/></td>
                    <td><ScoreBadge score={lead.recruitability_score} size="sm"/></td>
                    <td><ScoreBadge score={lead.growth_potential_score} size="sm"/></td>
                    <td><div className="tier-pill-table"><div className="tier-dot" style={{backgroundColor:TC[lead.priority_tier]||'#6b7280'}}/><span style={{color:TC[lead.priority_tier]||'#6b7280',fontSize:11,fontWeight:700}}>{lead.priority_tier}</span></div></td>
                    <td onClick={e=>e.stopPropagation()}><select className="status-select-inline" value={lead.status} onChange={e=>updateStatus(lead,e.target.value)} onClick={e=>e.stopPropagation()}>{STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                    <td onClick={e=>e.stopPropagation()} style={{textAlign:'center'}}>
                      <div className="row-actions" style={{justifyContent:'center'}}>
                        <button className="row-action-btn" title="View" onClick={()=>navigate(`/leads/${lead.id}`)}>👁</button>
                        <button className="row-action-btn" title="Edit" onClick={()=>{setEditId(lead.id!);setShowForm(true);}}>✏️</button>
                        <button className="row-action-btn" title="DM" onClick={()=>navigate(`/dm-generator?leadId=${lead.id}`)}>✉️</button>
                        <button className="row-action-btn row-action-delete" title="Delete" onClick={()=>setDelId(lead.id!)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {delId!==null && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Lead?</h3>
            <p>This will permanently remove this creator lead. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={()=>setDelId(null)}>Cancel</button>
              <button className="btn-danger" onClick={()=>handleDelete(delId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
