import React from 'react';
interface Props { status: string; size?: 'sm'|'md'; }
const STYLES: Record<string,{bg:string;color:string}> = {
  'New Lead':         {bg:'#f3f4f6',color:'#6b7280'},
  'Reviewed':         {bg:'#dbeafe',color:'#1d4ed8'},
  'High Priority':    {bg:'#dcfce7',color:'#16a34a'},
  'Ready to Contact': {bg:'#ede9fe',color:'#7c3aed'},
  'Contacted':        {bg:'#cffafe',color:'#0e7490'},
  'Replied':          {bg:'#fef9c3',color:'#a16207'},
  'Interested':       {bg:'#d9f99d',color:'#4d7c0f'},
  'Joined':           {bg:'#bbf7d0',color:'#166534'},
  'Not a Fit':        {bg:'#fee2e2',color:'#b91c1c'},
  'Do Not Contact':   {bg:'#fecaca',color:'#dc2626'},
  'Follow Up Later':  {bg:'#fed7aa',color:'#c2410c'},
};
const D = {bg:'#f3f4f6',color:'#6b7280'};
export const StatusBadge: React.FC<Props> = ({ status, size='md' }) => {
  const {bg,color} = STYLES[status]||D;
  return <span className="status-badge" style={{backgroundColor:bg,color,fontSize:size==='sm'?10:12,padding:size==='sm'?'1px 7px':'2px 9px',fontWeight:600,borderRadius:9999,whiteSpace:'nowrap',display:'inline-block'}}>{status}</span>;
};
