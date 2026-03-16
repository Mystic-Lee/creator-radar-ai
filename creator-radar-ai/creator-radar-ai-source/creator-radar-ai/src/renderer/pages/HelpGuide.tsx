import React, { useState } from 'react';

const Section = ({ title, children }: { title:string; children:React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`help-section${open?' open':''}`}>
      <button className="help-section-header" onClick={()=>setOpen(o=>!o)} aria-expanded={open}><span>{title}</span><span className="toggle-icon">{open?'▲':'▼'}</span></button>
      {open && <div className="help-section-body">{children}</div>}
    </div>
  );
};

const K = ({ k }: { k: string }) => <kbd style={{background:'var(--bg-hover)',border:'1px solid var(--border-color)',borderBottom:'2px solid var(--border-color)',borderRadius:3,padding:'1px 6px',fontFamily:'monospace',fontWeight:700,fontSize:12}}>{k}</kbd>;

export const HelpGuide: React.FC = () => (
  <div className="help-guide-page">
    <div className="page-header"><h1>Help &amp; User Guide</h1><p className="page-subtitle">Everything you need to use CreatorRadar AI effectively.</p></div>
    <div className="help-sections">

      <Section title="1. Getting Started">
        <p>Welcome to <strong>CreatorRadar AI</strong> — your recruiting assistant for finding, evaluating, and managing creator leads.</p>
        <h4>First Launch Setup</h4>
        <ol><li>Enter your agency name (optional)</li><li>Upload a logo and choose a brand colour (optional)</li><li>Select Dark or Light mode</li><li>Click "Launch CreatorRadar AI"</li></ol>
        <h4>Navigation</h4>
        <p>Use the left sidebar to navigate. All 20 sample creator leads load automatically on first launch.</p>
      </Section>

      <Section title="2. Adding Creator Leads">
        <p>CreatorRadar AI is a lead management tool. You manually add creator profiles discovered through your own research.</p>
        <ol><li>Go to <strong>Leads</strong> in the sidebar</li><li>Click <strong>"+ Add Lead"</strong></li><li>Fill in the four tabs: Profile Info, Metrics, CRM &amp; Status, Outreach</li><li>Click Save — scores are calculated automatically</li></ol>
        <p>Duplicate detection warns you if a creator with a matching username or URL already exists.</p>
      </Section>

      <Section title="3. Quick Review Mode">
        <p><strong>Quick Review Mode</strong> lets you rapidly evaluate creator leads one at a time — designed for reviewing 50–100 creators in a short session.</p>
        <h4>Starting a Session</h4>
        <ol><li>Click <strong>Quick Review ⚡</strong> in the sidebar</li><li>Choose a Queue Source</li><li>Click <strong>"Start Quick Review"</strong></li></ol>
        <h4>Keyboard Shortcuts</h4>
        <table className="help-table"><thead><tr><th>Key</th><th>Action</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td><K k="H"/></td><td>High Priority</td><td>Sets status to "High Priority", forces Tier 1</td></tr>
            <tr><td><K k="S"/></td><td>Save Lead</td><td>Sets status to "Reviewed", upgrades to Tier 2 if lower</td></tr>
            <tr><td><K k="K"/></td><td>Skip</td><td>No change — moves to next creator</td></tr>
            <tr><td><K k="N"/></td><td>Not a Fit</td><td>Sets status to "Not a Fit"</td></tr>
            <tr><td><K k="O"/></td><td>Open Full Profile</td><td>Opens the full Creator Review Panel</td></tr>
          </tbody>
        </table>
        <div className="warning-box" style={{marginTop:12}}>⚠️ Quick Review never sends messages. It only updates lead status in your local database.</div>
      </Section>

      <Section title="4. Saved Search Presets">
        <p><strong>Saved Search Presets</strong> let you save commonly used filter combinations and reload them instantly.</p>
        <ol><li>Go to Creator Discovery and set your filters</li><li>Type a name in the Saved Presets panel and click <strong>"Save Current Filters"</strong></li><li>Click 📌 to pin — pinned presets appear on the Dashboard</li><li>Click <strong>Apply</strong> to reload filters instantly</li></ol>
        <p>Six default presets are included. Edit or delete them in Settings → Presets.</p>
      </Section>

      <Section title="5. How Scoring Works">
        <p><strong>Recruit Score</strong> — Overall fit for agency recruitment (niche, engagement, LIVE activity, posting consistency).</p>
        <p><strong>Recruitability Score</strong> — How likely the creator is to respond positively to outreach. Mid-size creators in growth phase score highest.</p>
        <p><strong>Growth Potential Score</strong> — Likelihood of significant future growth. High engagement relative to follower count is the strongest signal.</p>
        <h4>Priority Tiers</h4>
        <table className="help-table"><thead><tr><th>Tier</th><th>Recruitability</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td style={{color:'#22c55e',fontWeight:700}}>Tier 1 — High Priority</td><td>80–100</td><td>Contact immediately</td></tr>
            <tr><td style={{color:'#3b82f6',fontWeight:700}}>Tier 2 — Good Prospect</td><td>60–79</td><td>Contact this week</td></tr>
            <tr><td style={{color:'#eab308',fontWeight:700}}>Tier 3 — Possible Lead</td><td>40–59</td><td>Review further</td></tr>
            <tr><td style={{color:'#6b7280',fontWeight:700}}>Tier 4 — Low Priority</td><td>0–39</td><td>Low priority</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="6. Generating DM Drafts">
        <div className="warning-box">⚠️ CreatorRadar AI never sends messages. All drafts must be manually copied and sent by the recruiter.</div>
        <ol><li>Open any creator's Review Panel or go to the DM Generator page</li><li>Select a Tone (Warm, Professional, Friendly, High-energy, Soft Invite, Direct, Encouraging, Premium, Casual)</li><li>Click <strong>"Generate DM"</strong></li><li>Review and edit the draft</li><li>Click <strong>"Copy to Clipboard"</strong></li><li>Open TikTok and send the DM manually</li></ol>
      </Section>

      <Section title="7. Manual Outreach Workflow">
        <ol><li>Open Priority Queue for top candidates, or run a Quick Review session</li><li>Open a creator's Review Panel</li><li>Review AI Insights and scores</li><li>Generate a DM and copy to clipboard</li><li>Open TikTok and send the DM manually</li><li>Return to CreatorRadar AI and update the lead's Status to "Contacted"</li><li>Set a Follow-up Date if appropriate</li><li>Log any response in Notes</li></ol>
      </Section>

      <Section title="8. Campaign Management">
        <ol><li>Go to Campaigns → New Campaign</li><li>Enter name, target niches, follower range, minimum scores, and notes</li><li>Assign leads via the Campaign dropdown when adding/editing a lead</li></ol>
        <p>Each campaign dashboard shows: Total Leads, Tier 1, Contacted, Replied, Interested, Joined, Conversion Rate.</p>
      </Section>

      <Section title="9. Excel Export">
        <ol><li>Go to Exports in the sidebar</li><li>Choose export type: All, High Priority Only, Filtered, Selected, By Campaign, or By Recruiter</li><li>Select columns to include</li><li>Click <strong>"Generate Excel File (.xlsx)"</strong></li></ol>
        <p>The file includes styled headers, frozen first row, auto-filter, colour-coded cells, and a Summary tab.</p>
      </Section>

      <Section title="10. Settings">
        <table className="help-table"><thead><tr><th>Section</th><th>What You Can Change</th></tr></thead>
          <tbody>
            <tr><td>Branding</td><td>Company name, logo, brand colour, dark/light mode</td></tr>
            <tr><td>Recruiters</td><td>Add, edit, deactivate, remove team recruiters</td></tr>
            <tr><td>Niches</td><td>Add custom niches, remove defaults</td></tr>
            <tr><td>Scoring Weights</td><td>Adjust factor weights for Recruit Score</td></tr>
            <tr><td>DM Templates</td><td>Edit tone templates with &#123;placeholders&#125;</td></tr>
            <tr><td>Export Columns</td><td>Default columns included in every export</td></tr>
            <tr><td>Status Labels</td><td>Add or remove lead status options</td></tr>
            <tr><td>Presets</td><td>View, rename, pin, or delete saved presets</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="11. Troubleshooting">
        <table className="help-table"><thead><tr><th>Problem</th><th>Solution</th></tr></thead>
          <tbody>
            <tr><td>App won't open after install</td><td>Run installer as Administrator. Confirm Windows 10/11 64-bit.</td></tr>
            <tr><td>Database errors on startup</td><td>Delete <code>%APPDATA%\CreatorRadar AI\database.sqlite</code> and relaunch.</td></tr>
            <tr><td>Scores showing as 0</td><td>Fill in Niche, Followers, and Engagement Rate. Save the lead again.</td></tr>
            <tr><td>Excel export not saving</td><td>Check write permission. Try saving to Desktop.</td></tr>
            <tr><td>Keyboard shortcuts not working</td><td>Click on the creator card to give it focus.</td></tr>
            <tr><td>Preset not applying from Dashboard</td><td>Go to Creator Discovery and use the Apply button in the Presets panel.</td></tr>
          </tbody>
        </table>
      </Section>

    </div>
    <div className="help-footer"><p>Need additional support? Refer to the User Guide included with your installation package.</p></div>
  </div>
);
