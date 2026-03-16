import React, { useEffect, useState } from 'react';

const TYPES = [
  {id:'all',         label:'All Leads',         desc:'Export every lead in the database',                icon:'👥'},
  {id:'high-priority',label:'High Priority Only', desc:'Export Tier 1 leads only',                       icon:'⭐'},
  {id:'filtered',    label:'Filtered Leads',     desc:'Apply custom filters before exporting',           icon:'🔍'},
  {id:'selected',    label:'Selected Leads',     desc:'Export leads selected in the Leads table',        icon:'✓'},
  {id:'by-campaign', label:'By Campaign',        desc:'Export leads grouped by campaign',                icon:'🎯'},
  {id:'by-recruiter',label:'By Recruiter',       desc:'Export leads grouped by assigned recruiter',      icon:'👤'},
];

const ALL_COLS = ['Date Found','Recruiter Name','Username','Display Name','Profile URL','Niche','Sub-Niche','Followers','Est. Likes','Est. Avg Views','Engagement Rate','LIVE Activity','Posting Frequency','Recruit Score','Recruitability Score','Growth Potential Score','Priority Tier','Priority Reason','Fit Summary','Why Good Candidate','DM Tone','Personalized DM Draft','Status','Campaign','Assigned Recruiter','Date Contacted','Response Status','Follow-Up Date','Notes','Growth Category','Growth Signals Summary'];
const DEFAULT_COLS = ['Date Found','Username','Display Name','Niche','Followers','Engagement Rate','Recruit Score','Recruitability Score','Growth Potential Score','Priority Tier','Status','LIVE Activity','Date Contacted','Response Status','Notes'];

export const ExportPage: React.FC = () => {
  const [type,    setType]    = useState('all');
  const [cols,    setCols]    = useState<string[]>(DEFAULT_COLS);
  const [exporting,setExp]    = useState(false);
  const [lastPath,setLastPath]= useState<string|null>(null);
  const [error,   setError]   = useState<string|null>(null);

  useEffect(()=>{ window.electronAPI.getExportColumns().then(c=>{if(c?.length) setCols(c);}).catch(()=>{}); },[]);

  const toggle = (c: string) => setCols(p => p.includes(c) ? p.filter(x=>x!==c) : [...p, c]);

  const handleExport = async () => {
    setError(null); setExp(true);
    try {
      const p = await window.electronAPI.selectExportPath();
      if (!p) { setExp(false); return; }
      const r = await window.electronAPI.exportToExcel({ exportType:type, columns:cols, outputPath:p });
      if (r.success) setLastPath(r.path);
      else setError('Export failed. Please try again.');
    } catch(e:any) { setError(e?.message||'Export failed.'); }
    finally { setExp(false); }
  };

  return (
    <div className="export-page">
      <div className="page-header"><h1>Export Leads</h1><p className="page-subtitle">Export your creator leads to a formatted Excel spreadsheet (.xlsx).</p></div>
      {lastPath && <div className="export-success-banner">✅ Export saved successfully!<p className="export-path">{lastPath}</p></div>}
      {error    && <div className="form-error-banner" style={{marginBottom:16}}>❌ {error}</div>}
      <div className="export-layout">
        <div className="export-left">
          <div className="export-section">
            <h3>Export Type</h3>
            <div className="export-type-list">
              {TYPES.map(t=>(
                <label key={t.id} className={`export-type-option${type===t.id?' selected':''}`}>
                  <input type="radio" name="exportType" value={t.id} checked={type===t.id} onChange={()=>setType(t.id)}/>
                  <div><span className="export-type-label">{t.icon} {t.label}</span><span className="export-type-desc">{t.desc}</span></div>
                </label>
              ))}
            </div>
          </div>
          <div className="export-features-note">
            <h4>Excel File Features</h4>
            <ul>
              <li>✅ Styled header row (purple)</li><li>✅ Frozen first row</li>
              <li>✅ Auto-filter on all columns</li><li>✅ Colour-coded Priority Tier cells</li>
              <li>✅ Colour-coded Status cells</li><li>✅ Summary tab with niche breakdown</li>
            </ul>
          </div>
        </div>
        <div className="export-right">
          <div className="export-section">
            <h3>Columns to Include <span style={{fontWeight:400,fontSize:12,color:'var(--text-muted)',marginLeft:8}}>({cols.length} of {ALL_COLS.length} selected)</span></h3>
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              <button className="btn-ghost btn-sm" onClick={()=>setCols([...ALL_COLS])}>All</button>
              <button className="btn-ghost btn-sm" onClick={()=>setCols([])}>None</button>
              <button className="btn-ghost btn-sm" onClick={()=>setCols([...DEFAULT_COLS])}>Default</button>
            </div>
            <div className="column-checklist">
              {ALL_COLS.map(c=>(
                <label key={c} className="checkbox-row">
                  <input type="checkbox" checked={cols.includes(c)} onChange={()=>toggle(c)}/>
                  <span style={{fontSize:12.5}}>{c}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn-primary export-btn" onClick={handleExport} disabled={exporting||cols.length===0}>{exporting?'⏳ Generating…':'📊 Generate Excel File (.xlsx)'}</button>
          {cols.length===0 && <p style={{color:'#ef4444',fontSize:12,marginTop:8}}>Select at least one column.</p>}
        </div>
      </div>
    </div>
  );
};
