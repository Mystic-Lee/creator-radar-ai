import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection';

export function registerDuplicateDetectionHandlers(): void {
  ipcMain.handle('leads:checkDuplicates', async (_e, p: {username?:string;profileUrl?:string;displayName?:string;excludeId?:number})=>{
    const db=getDatabase(), conds: string[]=[], params: unknown[]=[];
    if(p.username){conds.push('LOWER(username)=LOWER(?)');params.push(p.username);}
    if(p.profileUrl){conds.push("profile_url=? AND profile_url!=''");params.push(p.profileUrl);}
    if(p.displayName){conds.push("LOWER(display_name)=LOWER(?) AND display_name!=''");params.push(p.displayName);}
    if(!conds.length) return [];
    let sql=`SELECT id,username,display_name,niche,status,date_added FROM creator_leads WHERE (${conds.join(' OR ')})`;
    if(p.excludeId){sql+=' AND id!=?';params.push(p.excludeId);}
    sql+=' LIMIT 5';
    return db.prepare(sql).all(...params);
  });
}
