import React from 'react';
interface Props { score: number; size?: 'sm'|'md'|'lg'; label?: string; }
const level = (s: number) => s>=70?'high':s>=45?'medium':'low';
const COLOR  = { high:'#22c55e', medium:'#3b82f6', low:'#6b7280' };
const BG     = { high:'#dcfce7', medium:'#dbeafe', low:'#f3f4f6' };
const PAD    = { sm:'1px 7px', md:'2px 10px', lg:'4px 14px' };
const FS     = { sm:11, md:13, lg:17 };
export const ScoreBadge: React.FC<Props> = ({ score=0, size='md', label }) => {
  const lv = level(score);
  return (
    <span data-score-level={lv} style={{display:'inline-block',backgroundColor:BG[lv],color:COLOR[lv],fontSize:FS[size||'md'],padding:PAD[size||'md'],borderRadius:12,fontWeight:700,whiteSpace:'nowrap'}} title={`Score: ${score}/100`}>
      {label?`${label} ${score}`:score}
    </span>
  );
};
