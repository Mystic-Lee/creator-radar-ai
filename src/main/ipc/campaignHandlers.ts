// campaignHandlers.ts
import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection';

export function registerCampaignHandlers(): void {
  const db=()=>getDatabase();
  ipcMain.handle('campaigns:getAll', async ()=>db().prepare(`SELECT c.*,COUNT(cl.id) AS total_leads FROM campaigns c LEFT JOIN creator_leads cl ON cl.campaign_id=c.id GROUP BY c.id ORDER BY c.created_at DESC`).all());
  ipcMain.handle('campaigns:getById', async (_e,id: number)=>db().prepare('SELECT * FROM campaigns WHERE id=?').get(id));
  ipcMain.handle('campaigns:save', async (_e,c: any)=>{
    const d=db(), now=new Date().toISOString();
    if(c.id){
      d.prepare('UPDATE campaigns SET name=?,target_niches=?,min_followers=?,max_followers=?,min_recruit_score=?,min_recruitability=?,target_content_style=?,notes=?,status=? WHERE id=?').run(c.name||'',c.target_niches||'[]',c.min_followers||0,c.max_followers||9999999,c.min_recruit_score||0,c.min_recruitability||0,c.target_content_style||'',c.notes||'',c.status||'Active',c.id);
      return d.prepare('SELECT * FROM campaigns WHERE id=?').get(c.id);
    }
    const r=d.prepare('INSERT INTO campaigns (name,target_niches,min_followers,max_followers,min_recruit_score,min_recruitability,target_content_style,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(c.name||'',c.target_niches||'[]',c.min_followers||0,c.max_followers||9999999,c.min_recruit_score||0,c.min_recruitability||0,c.target_content_style||'',c.notes||'',c.status||'Active',now);
    return d.prepare('SELECT * FROM campaigns WHERE id=?').get(r.lastInsertRowid);
  });
  ipcMain.handle('campaigns:delete', async (_e,id: number)=>{ const d=db(); d.prepare('UPDATE creator_leads SET campaign_id=NULL WHERE campaign_id=?').run(id); d.prepare('DELETE FROM campaigns WHERE id=?').run(id); return {success:true}; });
  ipcMain.handle('campaigns:getStats', async (_e,id: number)=>db().prepare(`SELECT ? AS campaign_id,COUNT(*) AS total_leads,SUM(CASE WHEN priority_tier='Tier 1' THEN 1 ELSE 0 END) AS tier1_leads,SUM(CASE WHEN status='Contacted' OR date_contacted!='' THEN 1 ELSE 0 END) AS contacted,SUM(CASE WHEN status='Replied' THEN 1 ELSE 0 END) AS replied,SUM(CASE WHEN status IN ('Interested','Joined') THEN 1 ELSE 0 END) AS interested,SUM(CASE WHEN status='Joined' THEN 1 ELSE 0 END) AS joined,ROUND(CAST(SUM(CASE WHEN status='Joined' THEN 1 ELSE 0 END) AS REAL)/NULLIF(COUNT(*),0)*100,1) AS conversion_rate,ROUND(AVG(recruitability_score),0) AS avg_recruitability FROM creator_leads WHERE campaign_id=?`).get(id,id));
}
