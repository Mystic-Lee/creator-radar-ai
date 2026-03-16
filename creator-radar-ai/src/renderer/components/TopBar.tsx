import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const TopBar: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const onSearch = (e: FormEvent) => { e.preventDefault(); if (q.trim()) { navigate(`/leads?search=${encodeURIComponent(q.trim())}`); setQ(''); }};
  return (
    <header className="top-bar">
      <form className="search-form" onSubmit={onSearch}>
        <span className="search-icon">🔍</span>
        <input className="search-input" type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search creators, campaigns, notes…" />
        {q && <button type="button" style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:14}} onClick={()=>setQ('')}>×</button>}
      </form>
      <div className="top-bar-actions">
        <button className="icon-btn" onClick={()=>updateSettings({darkMode:!settings.darkMode})} title={settings.darkMode?'Light Mode':'Dark Mode'}>{settings.darkMode?'☀️':'🌙'}</button>
        <button className="icon-btn" onClick={()=>navigate('/exports')} title="Export Leads">📊</button>
        <button className="icon-btn" onClick={()=>navigate('/settings')} title="Settings">⚙️</button>
      </div>
    </header>
  );
};
