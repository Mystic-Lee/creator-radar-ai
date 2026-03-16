import React from 'react';
interface Match { id:number; username:string; display_name:string; niche:string; status:string; }
interface Props { matches: Match[]; onViewLead?: (id:number)=>void; onDismiss: ()=>void; }
export const DuplicateWarning: React.FC<Props> = ({ matches, onViewLead, onDismiss }) => {
  if (!matches.length) return null;
  return (
    <div className="duplicate-warning">
      <div className="duplicate-warning-header">
        <span className="warning-icon">⚠️</span>
        <strong>Possible Duplicate{matches.length>1?'s':''} Detected</strong>
        <button className="btn-ghost btn-sm" onClick={onDismiss}>Dismiss</button>
      </div>
      <p className="duplicate-warning-text">These existing leads may match the creator you're adding:</p>
      <div className="duplicate-matches">
        {matches.map(m => (
          <div key={m.id} className="duplicate-match-row">
            <div className="match-info">
              <span className="match-username">@{m.username}</span>
              {m.display_name && <span className="match-display">{m.display_name}</span>}
              <span className="match-niche">{m.niche}</span>
              <span className="status-badge">{m.status}</span>
            </div>
            {onViewLead && <button className="btn-sm btn-secondary" onClick={()=>onViewLead(m.id)}>View Lead</button>}
          </div>
        ))}
      </div>
      <p className="duplicate-warning-footer">You can still save if this is a genuinely different creator.</p>
    </div>
  );
};
