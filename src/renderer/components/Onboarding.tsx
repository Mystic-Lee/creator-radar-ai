import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#22c55e','#06b6d4','#3b82f6'];

export const Onboarding: React.FC = () => {
  const { completeOnboarding } = useApp();
  const [step, setStep]       = useState(1);
  const [name, setName]       = useState('');
  const [color, setColor]     = useState('#6366f1');
  const [logo, setLogo]       = useState<string|undefined>();
  const [dark, setDark]       = useState(true);
  const [saving, setSaving]   = useState(false);

  const applyColor = (c: string) => { setColor(c); document.documentElement.style.setProperty('--brand-color', c); };
  const applyTheme = (d: boolean) => { setDark(d); document.documentElement.setAttribute('data-theme', d?'dark':'light'); };

  const uploadLogo = async () => {
    const r = await window.electronAPI.selectLogoFile();
    if (r) setLogo(r);
  };

  const finish = async () => {
    setSaving(true);
    await completeOnboarding({ companyName:name.trim(), themeColor:color, logoPath:logo, darkMode:dark, onboardingComplete:true });
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1 className="onboarding-title">CreatorRadar AI</h1>
          <p className="onboarding-subtitle">Set up your recruiting workspace</p>
          <div className="step-indicators">{[1,2,3].map(s=><div key={s} className={`step-dot${step>=s?' active':''}`}/>)}</div>
        </div>

        {step===1 && (
          <div className="onboarding-step">
            <h2>What's your agency name?</h2>
            <p>This appears in the app header and exported files. Leave blank to show "CreatorRadar AI" only.</p>
            <input className="onboarding-input" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Agency / Company name (optional)" autoFocus onKeyDown={e=>e.key==='Enter'&&setStep(2)} />
            <button className="btn-primary onboarding-btn" onClick={()=>setStep(2)}>Continue →</button>
          </div>
        )}

        {step===2 && (
          <div className="onboarding-step">
            <h2>Brand Colour &amp; Logo</h2>
            <p>Choose a brand colour. Optionally upload your agency logo.</p>
            <div className="onboarding-color-row">
              <label>Brand Colour</label>
              <div className="color-picker-row">
                <input type="color" value={color} onChange={e=>applyColor(e.target.value)} className="color-input" />
                <span className="color-value">{color}</span>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                {COLORS.map(c=><button key={c} className="color-swatch-sm" style={{backgroundColor:c,outline:color===c?`2px solid ${c}`:'none',outlineOffset:2,cursor:'pointer'}} onClick={()=>applyColor(c)} title={c}/>)}
              </div>
            </div>
            <div className="onboarding-logo-area">
              {logo ? <div className="logo-preview-box"><img src={logo} alt="Logo" className="onboarding-logo-preview"/><button className="btn-ghost btn-sm" onClick={()=>setLogo(undefined)}>Remove</button></div>
                    : <button className="btn-secondary" onClick={uploadLogo}>+ Upload Logo (optional)</button>}
              <p className="field-hint">PNG or JPG, max 2 MB. Recommended: 200×60 px.</p>
            </div>
            <div className="step-nav">
              <button className="btn-ghost" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={()=>setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="onboarding-step">
            <h2>Choose Your Theme</h2>
            <p>Select the colour theme for your workspace.</p>
            <div className="theme-choice-row">
              <button className={`theme-choice${dark?' selected':''}`} onClick={()=>applyTheme(true)}><span className="theme-icon">🌙</span>Dark Mode</button>
              <button className={`theme-choice${!dark?' selected':''}`} onClick={()=>applyTheme(false)}><span className="theme-icon">☀️</span>Light Mode</button>
            </div>
            <div className="onboarding-summary">
              <div className="summary-row"><span>Agency Name</span><strong>{name||'CreatorRadar AI'}</strong></div>
              <div className="summary-row"><span>Brand Colour</span><div style={{display:'flex',alignItems:'center',gap:8}}><div className="color-swatch" style={{backgroundColor:color,width:20,height:20}}/><strong>{color}</strong></div></div>
              <div className="summary-row"><span>Theme</span><strong>{dark?'Dark Mode':'Light Mode'}</strong></div>
              <div className="summary-row"><span>Logo</span><strong>{logo?'Uploaded ✓':'None'}</strong></div>
            </div>
            <div className="step-nav">
              <button className="btn-ghost" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn-primary onboarding-btn" onClick={finish} disabled={saving}>{saving?'Setting up…':'🚀 Launch CreatorRadar AI'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
