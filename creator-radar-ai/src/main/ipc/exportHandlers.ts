import { ipcMain, dialog } from 'electron';
import * as ExcelJS from 'exceljs';
import { getDatabase } from '../database/connection';

const TIER_FILL: Record<string,string>={'Tier 1':'C8E6C9','Tier 2':'BBDEFB','Tier 3':'FFF9C4','Tier 4':'F5F5F5'};
const STATUS_FILL: Record<string,string>={'Joined':'C8E6C9','Interested':'DCEDC8','Replied':'FFF9C4','Contacted':'B3E5FC','Ready to Contact':'E1BEE7','High Priority':'C8E6C9','New Lead':'ECEFF1','Not a Fit':'FFCDD2','Do Not Contact':'FFCDD2'};

export function registerExportHandlers(): void {
  ipcMain.handle('export:selectPath', async ()=>{
    const r=await dialog.showSaveDialog({title:'Save Export',defaultPath:`CreatorRadar-Export-${new Date().toISOString().slice(0,10)}.xlsx`,filters:[{name:'Excel',extensions:['xlsx']}]});
    return r.canceled?null:r.filePath;
  });

  ipcMain.handle('export:toExcel', async (_e, params: {exportType:string;columns:string[];selectedIds?:number[];outputPath:string})=>{
    const db=getDatabase();
    let leads: any[];
    switch(params.exportType){
      case 'high-priority': leads=db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.priority_tier='Tier 1' ORDER BY cl.recruitability_score DESC`).all(); break;
      case 'selected': if(!params.selectedIds?.length) return {success:false,path:''}; leads=db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.id IN (${params.selectedIds.map(()=>'?').join(',')})`).all(...params.selectedIds); break;
      case 'by-campaign': leads=db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.campaign_id IS NOT NULL ORDER BY c.name,cl.recruitability_score DESC`).all(); break;
      case 'by-recruiter': leads=db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id WHERE cl.assigned_recruiter_id IS NOT NULL ORDER BY r.name,cl.recruitability_score DESC`).all(); break;
      default: leads=db.prepare(`SELECT cl.*,r.name AS recruiter_name,c.name AS campaign_name FROM creator_leads cl LEFT JOIN recruiters r ON cl.assigned_recruiter_id=r.id LEFT JOIN campaigns c ON cl.campaign_id=c.id ORDER BY cl.recruit_score DESC`).all();
    }

    const COLS: [string,string|(((l:any)=>any))][]=[
      ['Date Found','date_added'],['Recruiter Name','recruiter_name'],['Username','username'],['Display Name','display_name'],
      ['Profile URL','profile_url'],['Niche','niche'],['Sub-Niche','sub_niche'],['Followers','followers'],
      ['Est. Likes','estimated_likes'],['Est. Avg Views','estimated_avg_views'],
      ['Engagement Rate',l=>l.engagement_rate?`${l.engagement_rate.toFixed(1)}%`:''],
      ['LIVE Activity','live_activity'],['Posting Frequency','posting_frequency'],
      ['Recruit Score','recruit_score'],['Recruitability Score','recruitability_score'],['Growth Potential Score','growth_potential_score'],
      ['Priority Tier','priority_tier'],['Priority Reason','fit_summary'],['Fit Summary','fit_summary'],['Why Good Candidate','why_good_candidate'],
      ['DM Tone','suggested_dm_tone'],['Personalized DM Draft','personalized_dm'],['Status','status'],
      ['Campaign','campaign_name'],['Assigned Recruiter','recruiter_name'],['Date Contacted','date_contacted'],
      ['Response Status','response_status'],['Follow-Up Date','follow_up_date'],['Notes','notes'],
      ['Growth Category','growth_category'],['Growth Signals Summary','growth_signals_summary'],
    ];

    const selCols=params.columns.length?COLS.filter(([n])=>params.columns.includes(n)):COLS;
    const wb=new ExcelJS.Workbook(); wb.creator='CreatorRadar AI'; wb.created=new Date();
    const ws=wb.addWorksheet('Creator Leads',{views:[{state:'frozen',ySplit:1}]});
    ws.columns=selCols.map(([n])=>({header:n,key:n,width:Math.min(40,Math.max(12,n.length+4))}));
    const hdr=ws.getRow(1); hdr.font={bold:true,color:{argb:'FFFFFFFF'},size:11}; hdr.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF4338CA'}}; hdr.height=22;
    ws.autoFilter={from:{row:1,column:1},to:{row:1,column:selCols.length}};
    for(const lead of leads){
      const row: Record<string,any>={};
      for(const [n,f] of selCols) row[n]=typeof f==='function'?f(lead):lead[f]??'';
      const r=ws.addRow(row); r.alignment={wrapText:false,vertical:'top'};
      const ti=selCols.findIndex(([n])=>n==='Priority Tier');
      if(ti>=0){const c=r.getCell(ti+1);c.fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${TIER_FILL[lead.priority_tier]||'FFFFFF'}`}};}
      const si=selCols.findIndex(([n])=>n==='Status');
      if(si>=0){const c=r.getCell(si+1);c.fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${STATUS_FILL[lead.status]||'FFFFFF'}`}};}
    }
    const sum=wb.addWorksheet('Summary');
    sum.getCell('A1').value='CreatorRadar AI — Export'; sum.getCell('A1').font={bold:true,size:14,color:{argb:'FF4338CA'}};
    sum.getCell('A3').value='Export Date'; sum.getCell('B3').value=new Date().toLocaleDateString();
    sum.getCell('A4').value='Total Leads'; sum.getCell('B4').value=leads.length;
    const nc: Record<string,number>={};
    for(const l of leads) if(l.niche) nc[l.niche]=(nc[l.niche]||0)+1;
    let row=6; sum.getCell(`A${row}`).value='Niche Breakdown'; sum.getCell(`A${row}`).font={bold:true}; row++;
    for(const [n,c] of Object.entries(nc).sort(([,a],[,b])=>b-a)){sum.getCell(`A${row}`).value=n;sum.getCell(`B${row}`).value=c;row++;}
    sum.getColumn('A').width=28; sum.getColumn('B').width=14;
    await wb.xlsx.writeFile(params.outputPath);
    return {success:true,path:params.outputPath};
  });
}
