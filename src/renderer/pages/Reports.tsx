import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = ['#6366f1','#22c55e','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4','#84cc16'];
const TT = { contentStyle:{ background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'8px', color:'var(--text-primary)' } };

export const Reports: React.FC = () => {
  const [tab,  setTab]  = useState<'campaigns'|'niches'|'recruiters'>('campaigns');
  const [cRep, setCRep] = useState<any[]>([]);
  const [nRep, setNRep] = useState<any[]>([]);
  const [rRep, setRRep] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([window.electronAPI.getCampaignReports(),window.electronAPI.getNicheReports(),window.electronAPI.getRecruiterReports()])
      .then(([c,n,r])=>{ setCRep(c||[]); setNRep(n||[]); setRRep(r||[]); }).finally(()=>setLoading(false));
  },[]);

  if (loading) return <div className="page-loading"><div className="loading-spinner"/></div>;

  return (
    <div className="reports-page">
      <div className="page-header"><h1>Reports</h1><p className="page-subtitle">Campaign performance, niche breakdown, and recruiter conversion metrics.</p></div>
      <div className="tab-nav">
        {[['campaigns','Campaign Performance'],['niches','Niche Breakdown'],['recruiters','Recruiter Performance']].map(([id,label])=>(
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id as any)}>{label}</button>
        ))}
      </div>

      {tab==='campaigns' && (
        <div className="report-section">
          <h2>Campaign Conversion Overview</h2>
          {cRep.length===0 ? <div className="empty-state">No campaign data yet. Assign leads to campaigns to see metrics here.</div> : (<>
            <ResponsiveContainer width="100%" height={300}><BarChart data={cRep} margin={{top:5,right:30,left:20,bottom:60}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)"/><XAxis dataKey="campaign_name" angle={-35} textAnchor="end" tick={{fill:'var(--text-secondary)',fontSize:12}} interval={0}/><YAxis tick={{fill:'var(--text-secondary)',fontSize:12}}/><Tooltip {...TT}/><Legend/><Bar dataKey="total_leads" name="Total Leads" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="contacted" name="Contacted" fill="#3b82f6" radius={[4,4,0,0]}/><Bar dataKey="interested" name="Interested" fill="#22c55e" radius={[4,4,0,0]}/><Bar dataKey="joined" name="Joined" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
            <div className="report-table-wrapper"><table className="report-table"><thead><tr><th>Campaign</th><th>Total</th><th>Tier 1</th><th>Contacted</th><th>Replied</th><th>Interested</th><th>Joined</th><th>Conversion%</th><th>Avg Recruit.</th></tr></thead><tbody>{cRep.map((r,i)=><tr key={i}><td className="campaign-name-cell">{r.campaign_name||'Unassigned'}</td><td>{r.total_leads}</td><td><span className="tier-badge tier-1">{r.tier1_leads}</span></td><td>{r.contacted}</td><td>{r.replied}</td><td>{r.interested}</td><td>{r.joined}</td><td><span className={`conversion-rate ${r.conversion_rate>=10?'high':r.conversion_rate>=5?'med':'low'}`}>{r.conversion_rate?.toFixed(1)}%</span></td><td>{r.avg_recruitability?.toFixed(0)}</td></tr>)}</tbody></table></div>
          </>)}
        </div>
      )}

      {tab==='niches' && (
        <div className="report-section">
          <h2>Leads by Niche</h2>
          {nRep.length===0 ? <div className="empty-state">No niche data yet.</div> : (
            <div className="niche-chart-row">
              <div className="niche-pie">
                <ResponsiveContainer width="100%" height={320}><PieChart><Pie data={nRep} dataKey="total" nameKey="niche" cx="50%" cy="50%" outerRadius={120} label={({name,percent}:{name:string;percent:number})=>percent>0.04?`${name} (${(percent*100).toFixed(0)}%)`:''}>
                  {nRep.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie><Tooltip {...TT}/></PieChart></ResponsiveContainer>
              </div>
              <div className="niche-table-wrapper"><table className="report-table"><thead><tr><th>Niche</th><th>Total</th><th>Interested</th><th>Joined</th><th>Join Rate</th></tr></thead><tbody>{nRep.map((r,i)=><tr key={i}><td><span className="niche-dot" style={{backgroundColor:PIE_COLORS[i%PIE_COLORS.length]}}/>{r.niche}</td><td>{r.total}</td><td>{r.interested}</td><td>{r.joined}</td><td>{r.total>0?`${((r.joined/r.total)*100).toFixed(1)}%`:'—'}</td></tr>)}</tbody></table></div>
            </div>
          )}
        </div>
      )}

      {tab==='recruiters' && (
        <div className="report-section">
          <h2>Recruiter Conversion Performance</h2>
          {rRep.length===0 ? <div className="empty-state">No recruiter data yet. Assign leads to recruiters to see metrics here.</div> : (<>
            <ResponsiveContainer width="100%" height={280}><BarChart data={rRep} margin={{top:5,right:30,left:20,bottom:20}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)"/><XAxis dataKey="recruiter_name" tick={{fill:'var(--text-secondary)',fontSize:12}}/><YAxis tick={{fill:'var(--text-secondary)',fontSize:12}}/><Tooltip {...TT}/><Legend/><Bar dataKey="total_assigned" name="Assigned" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="contacted" name="Contacted" fill="#3b82f6" radius={[4,4,0,0]}/><Bar dataKey="interested" name="Interested" fill="#22c55e" radius={[4,4,0,0]}/><Bar dataKey="joined" name="Joined" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
            <div className="report-table-wrapper"><table className="report-table"><thead><tr><th>Recruiter</th><th>Assigned</th><th>Contacted</th><th>Interested</th><th>Joined</th><th>Conversion Rate</th></tr></thead><tbody>{rRep.map((r,i)=>{ const rate=r.total_assigned>0?(r.joined/r.total_assigned)*100:0; return <tr key={i}><td className="recruiter-name-cell">{r.recruiter_name||'Unassigned'}</td><td>{r.total_assigned}</td><td>{r.contacted}</td><td>{r.interested}</td><td>{r.joined}</td><td><span className={`conversion-rate ${rate>=10?'high':rate>=5?'med':'low'}`}>{r.total_assigned>0?`${rate.toFixed(1)}%`:'—'}</span></td></tr>; })}</tbody></table></div>
          </>)}
        </div>
      )}
    </div>
  );
};
