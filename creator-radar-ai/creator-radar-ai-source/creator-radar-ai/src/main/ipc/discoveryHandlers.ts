import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection';

export function registerDiscoveryHandlers(): void {
  ipcMain.handle('discovery:searchCreators', async (_e, f: Record<string,unknown>={})=>{
    const db=getDatabase(), conds: string[]=[], params: unknown[]=[];
    if(f.niche){conds.push('LOWER(cl.niche)=LOWER(?)');params.push(f.niche);}
    if(f.priorityTier){conds.push('cl.priority_tier=?');params.push(f.priorityTier);}
    if(f.status){conds.push('cl.status=?');params.push(f.status);}
    if(f.campaignId){conds.push('cl.campaign_id=?');params.push(f.campaignId);}
    if(f.minFollowers){conds.push('cl.followers>=?');params.push(f.minFollowers);}
    if(f.maxFollowers){conds.push('cl.followers<=?');params.push(f.maxFollowers);}
    if(f.minRecruitScore){conds.push('cl.recruit_score>=?');params.push(f.minRecruitScore);}
    if(f.minRecruitabilityScore){conds.push('cl.recruitability_score>=?');params.push(f.minRecruitabilityScore);}
    if(f.minGrowthScore){conds.push('cl.growth_potential_score>=?');params.push(f.minGrowthScore);}
    if(f.liveActivity){conds.push('LOWER(cl.live_activity) LIKE LOWER(?)');params.push(`%${f.liveActivity}%`);}
    const where=conds.length?`WHERE ${conds.join(' AND ')}`:'';
    return db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id ${where} ORDER BY cl.recruit_score DESC,cl.recruitability_score DESC LIMIT 300`).all(...params);
  });
  ipcMain.handle('discovery:getRisingCreators', async (_e, f: Record<string,unknown>={})=>{
    const db=getDatabase();
    const minG=(f.minGrowthScore as number)||60, minR=(f.minRecruitabilityScore as number)||50, maxF=(f.maxFollowers as number)||100000;
    const conds=['cl.growth_potential_score>=?','cl.recruitability_score>=?','cl.followers<=?',"cl.status NOT IN ('Not a Fit','Do Not Contact','Joined')"];
    const params: unknown[]=[minG,minR,maxF];
    if(f.niche){conds.push('LOWER(cl.niche)=LOWER(?)');params.push(f.niche);}
    return db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE ${conds.join(' AND ')} ORDER BY cl.growth_potential_score DESC,cl.recruitability_score DESC LIMIT 100`).all(...params);
  });
}
