import React, { useEffect } from 'react';
import { CreatorLead, ReviewAction } from '../../shared/types';
import { ScoreBadge } from './ScoreBadge';

interface Props { lead: CreatorLead; onAction: (a: ReviewAction)=>void; onOpenFull: (l: CreatorLead)=>void; isAnimating: boolean; }

const TC: Record<string,string> = {'Tier 1':'#22c55e','Tier 2':'#3b82f6','Tier 3':'#eab308','Tier 4':'#6b7280'};

function fmtF(n: number): string { if(n>=1e6) return `${(n/1e6).toFixed(1)}M`; if(n>=1e3) return `${(n/1e3).toFixed(1)}K`; return String(n); }

export const QuickReviewCard: React.FC<Props> = ({ lead, onAction, onOpenFull, isAnimating }) => {
  const tags: string[] = (() => { try { return JSON.parse(lead.ai_content_tags||'[]'); } catch { return []; } })();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key==='h'||e.key==='H') onAction('high-priority');
      else if (e.key==='s'||e.key==='S') onAction('save');
      else if (e.key==='k'||e.key==='K') onAction('skip');
      else if (e.key==='n'||e.key==='N') onAction('not-a-fit');
      else if (e.key==='o'||e.key==='O') onOpenFull(lead);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lead, onAction, onOpenFull]);

  return (
    <div className={`qr-card ${isAnimating?'qr-card-exit':'qr-card-enter'}`}>
      <div className="qr-card-header">
        <div className="qr-avatar">{(lead.username||'?')[0].toUpperCase()}</div>
        <div className="qr-identity">
          <div className="qr-username-row">
            <h2 className="qr-username">@{lead.username}</h2>
            {lead.profile_url && <a href={lead.profile_url} target="_blank" rel="noreferrer" className="qr-profile-link">↗</a>}
          </div>
          {lead.display_name && <p className="qr-display-name">{lead.display_name}</p>}
          <div className="qr-niche-row">
            <span className="qr-niche-badge">{lead.niche}</span>
            {lead.sub_niche && <span className="qr-sub-niche">{lead.sub_niche}</span>}
            <span className="qr-tier-badge" style={{color:TC[lead.priority_tier]||'#6b7280'}}>● {lead.priority_tier}</span>
          </div>
        </div>
      </div>

      <div className="qr-body">
        <div className="qr-metrics-col">
          <h4 className="qr-section-label">Creator Metrics</h4>
          <div className="qr-metric-row"><span className="qr-metric-label">Followers</span><span className="qr-metric-value">{lead.followers?fmtF(lead.followers):'—'}</span></div>
          <div className="qr-metric-row"><span className="qr-metric-label">Engagement</span><span className="qr-metric-value">{lead.engagement_rate?`${lead.engagement_rate.toFixed(1)}%`:'—'}</span></div>
          <div className="qr-metric-row"><span className="qr-metric-label">LIVE Activity</span><span className="qr-metric-value">{lead.live_activity||'—'}</span></div>
          <div className="qr-metric-row"><span className="qr-metric-label">Posting</span><span className="qr-metric-value">{lead.posting_frequency||'—'}</span></div>
          <div className="qr-scores">
            <div className="qr-score-item"><span className="qr-score-label">Recruit</span><ScoreBadge score={lead.recruit_score} size="md"/></div>
            <div className="qr-score-item"><span className="qr-score-label">Recruitability</span><ScoreBadge score={lead.recruitability_score} size="md"/></div>
            <div className="qr-score-item"><span className="qr-score-label">Growth</span><ScoreBadge score={lead.growth_potential_score} size="md"/></div>
          </div>
          <div className="qr-live-potential">
            <span className="qr-metric-label">LIVE Potential</span>
            <span className={`qr-live-badge qr-live-${(lead.ai_live_potential||'low').toLowerCase()}`}>{lead.ai_live_potential||'Unknown'}</span>
          </div>
        </div>
        <div className="qr-insights-col">
          <h4 className="qr-section-label">AI Recruiter Insight</h4>
          {lead.ai_summary ? <p className="qr-ai-summary">{lead.ai_summary}</p> : <p className="qr-ai-summary qr-ai-empty">Fill in niche, followers, and engagement to generate insights.</p>}
          {lead.ai_outreach_angle && <div className="qr-outreach-angle"><span className="qr-insight-label">Suggested Angle</span><p>{lead.ai_outreach_angle}</p></div>}
          {tags.length>0 && <div className="qr-content-tags">{tags.map(t=><span key={t} className="qr-tag">{t}</span>)}</div>}
          {lead.fit_summary && <div className="qr-fit-summary"><span className="qr-insight-label">Why Good Candidate</span><p>{lead.fit_summary}</p></div>}
        </div>
      </div>

      <div className="qr-actions">
        {([['high-priority','⭐','High Priority','H','#22c55e'],['save','✓','Save Lead','S','#3b82f6'],['skip','→','Skip','K','#6b7280'],['not-a-fit','✕','Not a Fit','N','#ef4444']] as [ReviewAction,string,string,string,string][]).map(([a,icon,lbl,k])=>(
          <button key={a} className={`qr-btn qr-btn-${a}`} onClick={()=>onAction(a)} title={`${lbl} (${k})`}>
            <span className="qr-btn-icon">{icon}</span>
            <span className="qr-btn-label">{lbl}</span>
            <span className="qr-btn-key">{k}</span>
          </button>
        ))}
        <button className="qr-btn qr-btn-open" onClick={()=>onOpenFull(lead)} title="Open Full Profile (O)">
          <span className="qr-btn-icon">↗</span><span className="qr-btn-label">Open Full Profile</span><span className="qr-btn-key">O</span>
        </button>
      </div>
    </div>
  );
};
