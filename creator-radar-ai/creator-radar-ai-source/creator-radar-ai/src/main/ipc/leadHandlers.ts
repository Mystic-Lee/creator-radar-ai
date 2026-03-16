import { ipcMain } from 'electron';
import { getDatabase } from '../database/connection';
import { calculateScores } from '../services/scoringEngine';
import { generateDmVariants } from '../services/dmGenerator';

export function registerLeadHandlers(): void {
  ipcMain.handle('leads:getAll', async (_e, filters: Record<string,unknown>={}) => {
    const db=getDatabase(), conds: string[]=[], params: unknown[]=[];
    if(filters.search){conds.push(`(LOWER(cl.username) LIKE LOWER(?) OR LOWER(cl.display_name) LIKE LOWER(?) OR LOWER(cl.niche) LIKE LOWER(?) OR LOWER(cl.notes) LIKE LOWER(?))`);const q=`%${filters.search}%`;params.push(q,q,q,q);}
    if(filters.niche){conds.push('cl.niche=?');params.push(filters.niche);}
    if(filters.status){conds.push('cl.status=?');params.push(filters.status);}
    if(filters.priorityTier){conds.push('cl.priority_tier=?');params.push(filters.priorityTier);}
    if(filters.campaignId){conds.push('cl.campaign_id=?');params.push(filters.campaignId);}
    if(filters.minScore){conds.push('cl.recruit_score>=?');params.push(filters.minScore);}
    const where=conds.length?`WHERE ${conds.join(' AND ')}`:'';
    return db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id ${where} ORDER BY cl.recruit_score DESC,cl.created_at DESC`).all(...params);
  });
  ipcMain.handle('leads:getById', async (_e,id: number)=>{
    const db=getDatabase();
    return db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.id=?`).get(id);
  });
  ipcMain.handle('leads:save', async (_e, lead: Record<string,unknown>)=>{
    const db=getDatabase(), scores=calculateScores(lead as any), dms=generateDmVariants(lead as any), now=new Date().toISOString();
    const cols=[lead.username||'',lead.display_name||'',lead.profile_url||'',lead.profile_image_url||'',lead.bio||'',lead.niche||'',lead.sub_niche||'',lead.followers||0,lead.estimated_likes||0,lead.estimated_avg_views||0,lead.engagement_rate||0,lead.live_activity||'Unknown',lead.posting_frequency||'Unknown',scores.recruit_score,scores.recruitability_score,scores.growth_potential_score,scores.priority_tier,scores.fit_summary,scores.why_good_candidate,scores.recruitability_reason,scores.growth_signals_summary,scores.growth_category,scores.ai_summary,scores.ai_niche_detection,scores.ai_content_tags,scores.ai_live_potential,scores.ai_outreach_angle,lead.suggested_dm_tone||scores.suggested_dm_tone,lead.personalized_dm||scores.personalized_dm,dms.short,dms.standard,dms.warm,dms.professional,dms.strong_cta,lead.status||'New Lead',lead.assigned_recruiter_id??null,lead.campaign_id??null,lead.tags||'[]',lead.notes||'',lead.date_contacted||'',lead.response_status||'Not Contacted',lead.follow_up_date||'',lead.outcome_notes||'',now];
    if(lead.id){
      db.prepare(`UPDATE creator_leads SET username=?,display_name=?,profile_url=?,profile_image_url=?,bio=?,niche=?,sub_niche=?,followers=?,estimated_likes=?,estimated_avg_views=?,engagement_rate=?,live_activity=?,posting_frequency=?,recruit_score=?,recruitability_score=?,growth_potential_score=?,priority_tier=?,fit_summary=?,why_good_candidate=?,recruitability_reason=?,growth_signals_summary=?,growth_category=?,ai_summary=?,ai_niche_detection=?,ai_content_tags=?,ai_live_potential=?,ai_outreach_angle=?,suggested_dm_tone=?,personalized_dm=?,dm_short=?,dm_standard=?,dm_warm=?,dm_professional=?,dm_strong_cta=?,status=?,assigned_recruiter_id=?,campaign_id=?,tags=?,notes=?,date_contacted=?,response_status=?,follow_up_date=?,outcome_notes=?,updated_at=? WHERE id=?`).run(...cols,lead.id);
    } else {
      db.prepare(`INSERT INTO creator_leads (username,display_name,profile_url,profile_image_url,bio,niche,sub_niche,followers,estimated_likes,estimated_avg_views,engagement_rate,live_activity,posting_frequency,recruit_score,recruitability_score,growth_potential_score,priority_tier,fit_summary,why_good_candidate,recruitability_reason,growth_signals_summary,growth_category,ai_summary,ai_niche_detection,ai_content_tags,ai_live_potential,ai_outreach_angle,suggested_dm_tone,personalized_dm,dm_short,dm_standard,dm_warm,dm_professional,dm_strong_cta,status,assigned_recruiter_id,campaign_id,tags,notes,date_contacted,response_status,follow_up_date,outcome_notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(...cols,now);
    }
    const savedId=lead.id?lead.id:(db.prepare('SELECT last_insert_rowid() AS id').get() as {id:number}).id;
    return db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.id=?`).get(savedId);
  });
  ipcMain.handle('leads:delete', async (_e,id: number)=>{ getDatabase().prepare('DELETE FROM creator_leads WHERE id=?').run(id); return {success:true}; });
  ipcMain.handle('leads:getDashboardStats', async ()=>{
    const db=getDatabase(), today=new Date().toISOString().slice(0,10);
    const n=(sql: string,...p: unknown[])=>(db.prepare(sql).get(...p) as {n:number}).n;
    return {
      leadsToday:      n("SELECT COUNT(*) AS n FROM creator_leads WHERE date_added=date('now')"),
      highPriority:    n("SELECT COUNT(*) AS n FROM creator_leads WHERE priority_tier='Tier 1' AND status NOT IN ('Not a Fit','Do Not Contact','Joined')"),
      contactedToday:  n('SELECT COUNT(*) AS n FROM creator_leads WHERE date_contacted=?',today),
      repliesReceived: n("SELECT COUNT(*) AS n FROM creator_leads WHERE status IN ('Replied','Interested','Joined')"),
      interested:      n("SELECT COUNT(*) AS n FROM creator_leads WHERE status IN ('Interested','Joined')"),
      joined:          n("SELECT COUNT(*) AS n FROM creator_leads WHERE status='Joined'"),
      followUpsDue:    n('SELECT COUNT(*) AS n FROM creator_leads WHERE follow_up_date=?',today),
      recentLeads:     db.prepare('SELECT id,username,display_name,niche,status,priority_tier,recruit_score,recruitability_score FROM creator_leads ORDER BY created_at DESC LIMIT 8').all(),
      topPriority:     db.prepare("SELECT id,username,display_name,niche,status,priority_tier,recruit_score,recruitability_score FROM creator_leads WHERE status NOT IN ('Contacted','Replied','Interested','Joined','Not a Fit','Do Not Contact') ORDER BY recruitability_score DESC,recruit_score DESC LIMIT 5").all(),
      nicheBreakdown:  db.prepare("SELECT niche,COUNT(*) AS count FROM creator_leads WHERE niche!='' GROUP BY niche ORDER BY count DESC LIMIT 8").all(),
    };
  });
  ipcMain.handle('leads:getPriorityQueue', async ()=>{
    return getDatabase().prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.status NOT IN ('Contacted','Replied','Interested','Joined','Not a Fit','Do Not Contact') ORDER BY cl.recruitability_score DESC,cl.recruit_score DESC LIMIT 20`).all();
  });
}
