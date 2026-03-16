import { ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import { getDatabase } from '../database/connection';

const DEFAULT_NICHES=['Beauty','Gaming','Lifestyle','Fashion','Comedy','Food & Cooking','Fitness','Motivational','Spiritual / Tarot','Music','Dance','Education','Tech','Finance','Parenting','Mental Health','Art & Creativity','Outdoors & Adventure','Esports','Health & Wellness'];
const DEFAULT_STATUSES=['New Lead','Reviewed','High Priority','Ready to Contact','Contacted','Replied','Interested','Joined','Not a Fit','Do Not Contact','Follow Up Later'];
const DEFAULT_EXPORT_COLS=['Date Found','Username','Display Name','Niche','Followers','Engagement Rate','Recruit Score','Recruitability Score','Growth Potential Score','Priority Tier','Status','LIVE Activity','Date Contacted','Response Status','Notes'];

function getConfig(db: any, key: string): any {
  const r=db.prepare('SELECT value FROM app_config WHERE key=?').get(key) as any;
  if (!r) return null;
  try { return JSON.parse(r.value); } catch { return r.value; }
}
function setConfig(db: any, key: string, value: any): void {
  const v=typeof value==='string'?value:JSON.stringify(value);
  db.prepare('INSERT INTO app_config (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,v);
}

export function registerSettingsHandlers(): void {
  const db=()=>getDatabase();
  ipcMain.handle('settings:getAll', async ()=>getConfig(db(),'app_settings')||{companyName:'',themeColor:'#6366f1',darkMode:true,onboardingComplete:false});
  ipcMain.handle('settings:saveAll', async (_e,s: unknown)=>setConfig(db(),'app_settings',s));
  ipcMain.handle('settings:getRecruiters', async ()=>db().prepare('SELECT * FROM recruiters ORDER BY name ASC').all());
  ipcMain.handle('settings:saveRecruiter', async (_e,r: any)=>{
    const d=db();
    if(r.id){d.prepare('UPDATE recruiters SET name=?,email=?,active=? WHERE id=?').run(r.name,r.email||'',r.active?1:0,r.id);return d.prepare('SELECT * FROM recruiters WHERE id=?').get(r.id);}
    const res=d.prepare('INSERT INTO recruiters (name,email,active) VALUES (?,?,?)').run(r.name,r.email||'',r.active?1:0);
    return d.prepare('SELECT * FROM recruiters WHERE id=?').get(res.lastInsertRowid);
  });
  ipcMain.handle('settings:deleteRecruiter', async (_e,id: number)=>{ const d=db(); d.prepare('UPDATE creator_leads SET assigned_recruiter_id=NULL WHERE assigned_recruiter_id=?').run(id); d.prepare('DELETE FROM recruiters WHERE id=?').run(id); return {success:true}; });
  ipcMain.handle('settings:getNiches', async ()=>getConfig(db(),'niches')||DEFAULT_NICHES);
  ipcMain.handle('settings:saveNiches', async (_e,n: string[])=>setConfig(db(),'niches',n));
  ipcMain.handle('settings:getScoringWeights', async ()=>getConfig(db(),'scoring_weights'));
  ipcMain.handle('settings:saveScoringWeights', async (_e,w: Record<string,number>)=>setConfig(db(),'scoring_weights',w));
  ipcMain.handle('settings:getDmTemplates', async ()=>db().prepare('SELECT * FROM dm_templates ORDER BY is_default DESC,tone ASC').all());
  ipcMain.handle('settings:saveDmTemplate', async (_e,t: any)=>{
    const d=db();
    if(t.id){d.prepare('UPDATE dm_templates SET tone=?,template_text=?,is_default=? WHERE id=?').run(t.tone,t.template_text,t.is_default?1:0,t.id);return d.prepare('SELECT * FROM dm_templates WHERE id=?').get(t.id);}
    const r=d.prepare('INSERT INTO dm_templates (tone,template_text,is_default) VALUES (?,?,?)').run(t.tone,t.template_text,t.is_default?1:0);
    return d.prepare('SELECT * FROM dm_templates WHERE id=?').get(r.lastInsertRowid);
  });
  ipcMain.handle('settings:deleteDmTemplate', async (_e,id: number)=>{ db().prepare('DELETE FROM dm_templates WHERE id=?').run(id); return {success:true}; });
  ipcMain.handle('settings:getExportColumns', async ()=>getConfig(db(),'export_columns')||DEFAULT_EXPORT_COLS);
  ipcMain.handle('settings:saveExportColumns', async (_e,c: string[])=>setConfig(db(),'export_columns',c));
  ipcMain.handle('settings:getStatusLabels', async ()=>getConfig(db(),'status_labels')||DEFAULT_STATUSES);
  ipcMain.handle('settings:saveStatusLabels', async (_e,l: string[])=>setConfig(db(),'status_labels',l));
  ipcMain.handle('settings:selectLogoFile', async ()=>{
    const r=await dialog.showOpenDialog({title:'Select Logo',properties:['openFile'],filters:[{name:'Images',extensions:['png','jpg','jpeg','webp']}]});
    if(r.canceled||!r.filePaths.length) return null;
    const fp=r.filePaths[0];
    if(fs.statSync(fp).size>2*1024*1024) return null;
    const ext=fp.split('.').pop()?.toLowerCase()||'png';
    const mime=ext==='jpg'||ext==='jpeg'?'image/jpeg':ext==='webp'?'image/webp':'image/png';
    return `data:${mime};base64,${fs.readFileSync(fp).toString('base64')}`;
  });
}
