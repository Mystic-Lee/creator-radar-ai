import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const NAV = [
  { path:'/dashboard',    label:'Dashboard',         icon:'▦',  group:'main' },
  { path:'/discovery',    label:'Creator Discovery',  icon:'🔍', group:'main' },
  { path:'/leads',        label:'Leads',              icon:'👥', group:'main' },
  { path:'/rising',       label:'Rising Creators',    icon:'📈', group:'main' },
  { path:'/priority',     label:'Priority Queue',     icon:'⭐', group:'main' },
  { path:'/quick-review', label:'Quick Review',       icon:'⚡', group:'main' },
  { path:'/campaigns',    label:'Campaigns',          icon:'🎯', group:'outreach' },
  { path:'/dm-generator', label:'DM Generator',       icon:'✉️', group:'outreach' },
  { path:'/exports',      label:'Exports',            icon:'📊', group:'tools' },
  { path:'/reports',      label:'Reports',            icon:'📉', group:'tools' },
  { path:'/settings',     label:'Settings',           icon:'⚙️', group:'system' },
  { path:'/help',         label:'Help / Guide',       icon:'❓', group:'system' },
];
const GROUP_LABELS: Record<string,string> = { main:'RECRUITING', outreach:'OUTREACH', tools:'TOOLS', system:'' };

export const Sidebar: React.FC = () => {
  const { settings } = useApp();
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/dashboard')} role="button" tabIndex={0} onKeyDown={e => e.key==='Enter'&&navigate('/dashboard')}>
        {settings.logoPath
          ? <img src={settings.logoPath} alt={settings.companyName||'CreatorRadar AI'} className="brand-logo" />
          : <div className="brand-text"><span className="brand-app-name">CreatorRadar AI</span>{settings.companyName&&<span className="brand-company">{settings.companyName}</span>}</div>}
      </div>
      <nav className="sidebar-nav">
        {['main','outreach','tools','system'].map(group => {
          const items = NAV.filter(i => i.group===group);
          if (!items.length) return null;
          return (
            <div key={group} className="nav-group">
              {GROUP_LABELS[group] && <span className="nav-group-label">{GROUP_LABELS[group]}</span>}
              {items.map(item => (
                <NavLink key={item.path} to={item.path} className={({isActive}) => `nav-item${isActive?' active':''}`}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer"><span>v1.0.0</span></div>
    </aside>
  );
};
