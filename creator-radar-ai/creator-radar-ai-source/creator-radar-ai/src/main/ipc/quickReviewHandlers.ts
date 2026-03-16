import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection';

export function registerQuickReviewHandlers(): void {
  const db=()=>getDatabase();

  ipcMain.handle('quickReview:getQueue', async (_e, source: string, filters: Record<string,unknown>)=>{
    const d=db(), conds: string[]=[], params: unknown[]=[];
    switch(source){
      case 'unreviewed': conds.push("cl.status='New Lead'"); break;
      case 'today':      conds.push("cl.date_added=date('now')"); break;
      case 'high-growth':conds.push('cl.growth_potential_score>=70'); conds.push("cl.status NOT IN ('Not a Fit','Do Not Contact','Joined')"); break;
      case 'niche':      if(filters.niche){conds.push('LOWER(cl.niche)=LOWER(?)');params.push(filters.niche);} break;
      case 'campaign':   if(filters.campaignId){conds.push('cl.campaign_id=?');params.push(filters.campaignId);} break;
    }
    if(filters.niche && source!=='niche'){conds.push('LOWER(cl.niche)=LOWER(?)');params.push(filters.niche);}
    if(filters.minRecruitabilityScore){conds.push('cl.recruitability_score>=?');params.push(filters.minRecruitabilityScore);}
    if(filters.minGrowthScore){conds.push('cl.growth_potential_score>=?');params.push(filters.minGrowthScore);}
    if(filters.status){conds.push('cl.status=?');params.push(filters.status);}
    if(filters.campaignId && source!=='campaign'){conds.push('cl.campaign_id=?');params.push(filters.campaignId);}
    if(!filters.status) conds.push("cl.status NOT IN ('Do Not Contact')");
    const where=conds.length?`WHERE ${conds.join(' AND ')}`:'';
    return d.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id ${where} ORDER BY cl.recruitability_score DESC,cl.recruit_score DESC LIMIT 200`).all(...params);
  });

  ipcMain.handle('quickReview:processAction', async (_e, leadId: number, action: string)=>{
    const d=db(), lead=d.prepare('SELECT * FROM creator_leads WHERE id=?').get(leadId) as any;
    if(!lead) throw new Error(`Lead ${leadId} not found`);
    let status=lead.status, tier=lead.priority_tier;
    if(action==='high-priority'){status='High Priority';tier='Tier 1';}
    else if(action==='save'){status='Reviewed';if(tier==='Tier 3'||tier==='Tier 4') tier='Tier 2';}
    else if(action==='not-a-fit') status='Not a Fit';
    if(action!=='skip') d.prepare("UPDATE creator_leads SET status=?,priority_tier=?,updated_at=datetime('now') WHERE id=?").run(status,tier,leadId);
    return d.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.id=?`).get(leadId);
  });

  ipcMain.handle('presets:getAll', async ()=>{
    const rows=db().prepare('SELECT * FROM search_presets ORDER BY pinned DESC,name ASC').all() as any[];
    return rows.map(r=>({...r,filters:(()=>{try{return JSON.parse(r.filters);}catch{return {};}})(),pinned:Boolean(r.pinned)}));
  });
  ipcMain.handle('presets:save', async (_e, preset: any)=>{
    const d=db(), fj=JSON.stringify(preset.filters||{}), now=new Date().toISOString();
    if(preset.id){
      d.prepare('UPDATE search_presets SET name=?,filters=?,pinned=?,updated_at=? WHERE id=?').run(preset.name,fj,preset.pinned?1:0,now,preset.id);
      return {...preset,filters:preset.filters,updated_at:now};
    }
    const r=d.prepare('INSERT INTO search_presets (name,filters,pinned,created_at,updated_at) VALUES (?,?,?,?,?)').run(preset.name,fj,preset.pinned?1:0,now,now);
    return {...preset,id:r.lastInsertRowid,created_at:now,updated_at:now};
  });
  ipcMain.handle('presets:delete', async (_e,id: number)=>{ db().prepare('DELETE FROM search_presets WHERE id=?').run(id); return {success:true}; });
  ipcMain.handle('presets:togglePin', async (_e,id: number)=>{
    const d=db(), row=d.prepare('SELECT * FROM search_presets WHERE id=?').get(id) as any;
    if(!row) throw new Error(`Preset ${id} not found`);
    const np=row.pinned?0:1;
    d.prepare("UPDATE search_presets SET pinned=?,updated_at=datetime('now') WHERE id=?").run(np,id);
    return {...row,filters:(()=>{try{return JSON.parse(row.filters);}catch{return {};}})(),pinned:Boolean(np)};
  });
}
