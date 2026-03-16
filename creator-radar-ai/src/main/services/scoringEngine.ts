import type { CreatorLead } from '../../shared/types';

export interface ScoringResult {
  recruit_score: number; recruitability_score: number; growth_potential_score: number;
  priority_tier: string; fit_summary: string; why_good_candidate: string;
  recruitability_reason: string; growth_signals_summary: string; growth_category: string;
  ai_summary: string; ai_live_potential: string; ai_outreach_angle: string;
  ai_content_tags: string; ai_niche_detection: string;
  dm_short: string; dm_standard: string; dm_warm: string; dm_professional: string;
  dm_strong_cta: string; suggested_dm_tone: string; personalized_dm: string;
}

function clamp(n: number): number { return Math.max(0, Math.min(100, Math.round(n))); }
function seed(username: string): number { return username.split('').reduce((s,c) => s + c.charCodeAt(0), 0); }
function variation(s: number): number { const x = Math.sin(s)*10000; return Math.floor((x-Math.floor(x))*9)-3; }

const HIGH_LIVE = new Set(['Gaming','Esports','Spiritual / Tarot','Comedy','Music','Dance','Fitness','Food & Cooking','Art & Creativity']);
const MED_LIVE  = new Set(['Beauty','Fashion','Lifestyle','Motivational','Finance','Parenting','Education','Health & Wellness']);

function livePotential(lead: Partial<CreatorLead>): 'High'|'Medium'|'Low' {
  const a = (lead.live_activity||'').toLowerCase();
  if (a.includes('active')||a.includes('streamer')) return 'High';
  if (a.includes('occasional')||a.includes('monthly')) return 'Medium';
  if (lead.niche && HIGH_LIVE.has(lead.niche)) return 'High';
  if (lead.niche && MED_LIVE.has(lead.niche))  return 'Medium';
  return 'Low';
}

function followerTier(f: number) {
  if (f < 1000)    return {rs:30,rb:5};
  if (f < 5000)    return {rs:45,rb:15};
  if (f < 10000)   return {rs:55,rb:20};
  if (f < 50000)   return {rs:75,rb:25};
  if (f < 100000)  return {rs:80,rb:20};
  if (f < 500000)  return {rs:72,rb:10};
  return               {rs:55,rb:5};
}

function engBonus(r: number): number {
  if (r>=10) return 25; if (r>=7) return 20; if (r>=5) return 15;
  if (r>=3)  return 8;  if (r>=1) return 2;  return -5;
}

function postBonus(f: string): number {
  const s = f.toLowerCase();
  if (s.includes('multiple')||s.includes('2-3x')||s.includes('3-4x')) return 15;
  if (s.includes('daily')||s.includes('1x')) return 12;
  if (s.includes('week')) return 8;
  if (s.includes('bi')||s.includes('twice')) return 4;
  if (s.includes('month')) return -5;
  return 5;
}

function bioOpen(bio: string): number {
  return ['collab','open','partner','brand','deal','dm','inquiry','management','booking','agency','work with']
    .filter(s => bio.toLowerCase().includes(s)).length * 4;
}

function fmt(n: number): string {
  if (n>=1e6) return `${(n/1e6).toFixed(1)}M`;
  if (n>=1e3) return `${(n/1e3).toFixed(1)}K`;
  return String(n);
}

export function calculateScores(lead: Partial<CreatorLead>): ScoringResult {
  const followers  = lead.followers       || 0;
  const engagement = lead.engagement_rate || 0;
  const niche      = lead.niche           || 'Unknown';
  const freq       = lead.posting_frequency || 'Unknown';
  const bio        = lead.bio || '';
  const lp         = livePotential(lead);
  const ft         = followerTier(followers);
  const eb         = engBonus(engagement);
  const pb         = postBonus(freq);
  const lb         = lp==='High'?12 : lp==='Medium'?6 : 0;
  const bo         = bioOpen(bio);
  const v          = variation(seed(lead.username||'x'));
  const sveSignal  = followers<20000&&engagement>=5?15 : followers<50000&&engagement>=4?10 : followers>200000?-5:0;

  const recruitScore        = clamp(ft.rs + eb + pb + lb + v);
  const recruitabilityScore = clamp(ft.rb + 50 + eb*0.6 + bo + lb*0.5 + v);
  const growthScore         = clamp(ft.rs*0.6 + eb*1.2 + pb*1.1 + lb*0.8 + sveSignal + v);

  const tier = recruitabilityScore>=80?'Tier 1':recruitabilityScore>=60?'Tier 2':recruitabilityScore>=40?'Tier 3':'Tier 4';
  const growthCat = growthScore>=75?'Rising Creator':growthScore>=55?'Emerging Creator':growthScore>=35?'Developing Creator':'Low Growth Signals';
  const fd = fmt(followers);
  const lps = livePotential(lead);

  const fitSummary = recruitScore>=80
    ? `Strong agency fit. ${niche} creator with ${fd} followers and ${engagement.toFixed(1)}% engagement. ${lps} LIVE potential.`
    : `Good agency fit. ${niche} creator with ${fd} followers. ${engagement.toFixed(1)}% engagement.`;
  const why = engagement>=5 ? `${engagement.toFixed(1)}% engagement is significantly above platform average.` : `Consistent content output in ${niche} niche.`;
  const rReason = recruitabilityScore>=80 ? `Mid-size creator in growth phase. No management indicators. ${bo>0?'Bio open to collaboration.':'Consistent posting suggests openness.'}` : `${tier} creator. Standard outreach likely well-received.`;
  const gSignals = growthScore>=75 ? `Strong signals: ${engagement.toFixed(1)}% engagement at ${fd} with ${freq.toLowerCase()} posting.` : `Moderate growth signals. Currently in ${growthCat} stage.`;
  const aiSum = `${niche} creator with ${fd} followers and ${engagement.toFixed(1)}% engagement. Posts ${freq.toLowerCase()}. ${lps} LIVE potential. ${growthCat} phase. ${tier} priority.`;
  const angle = lps==='High'?`Lead with LIVE monetisation — this creator is already LIVE-active.`
    : bo>8?`Lead with the collaboration — bio signals strong openness.`
    : growthScore>=70?`Lead with growth support — agency backing at this stage is high-value.`
    : `Lead with brand partnerships in the ${niche} space.`;
  const tags: string[] = [niche];
  if (lps==='High') tags.push('LIVE-friendly');
  if (engagement>=6) tags.push('High engagement');
  if (/daily|2-3x|multiple/i.test(freq)) tags.push('High-frequency poster');
  if (growthScore>=70) tags.push('Rising talent');
  if (followers<20000) tags.push('Early-stage creator');
  if (bo>8) tags.push('Collab-open');

  const name   = lead.display_name || `@${lead.username}` || 'there';
  const agency = 'our agency';
  const dmShort    = `Hey ${name}! Love your ${niche} content — I work with ${agency} and think you'd be a great fit. Open to a quick chat? 😊`;
  const dmStandard = `Hey ${name}! Your ${niche} content is impressive. I work with ${agency} and we help creators grow their platform and earn more. Would you be open to a conversation?`;
  const dmWarm     = `Hey ${name}! 👋 I came across your ${niche} content and loved your vibe. I work with ${agency} and we help creators grow their audience, increase income, and build a real presence on LIVE. Would love to chat! 😊`;
  const dmProf     = `Hi ${name}, I'm reaching out from ${agency}. We specialise in supporting ${niche} creators in growing their platform and exploring monetisation. I'd love to connect. Let me know if you're interested.`;
  const dmCta      = `${name}!! Your ${niche} content is exactly what we're looking for. I'm with ${agency} and we're actively recruiting ${niche} creators. This could be a game-changer — hit me back! 🚀`;
  const tone       = lps==='High'?'Warm':recruitabilityScore>=80?'High-energy':recruitabilityScore>=65?'Friendly':'Professional';

  return {
    recruit_score:recruitScore, recruitability_score:recruitabilityScore, growth_potential_score:growthScore,
    priority_tier:tier, fit_summary:fitSummary, why_good_candidate:why, recruitability_reason:rReason,
    growth_signals_summary:gSignals, growth_category:growthCat, ai_summary:aiSum,
    ai_live_potential:lps, ai_outreach_angle:angle, ai_content_tags:JSON.stringify(tags),
    ai_niche_detection:niche, dm_short:dmShort, dm_standard:dmStandard, dm_warm:dmWarm,
    dm_professional:dmProf, dm_strong_cta:dmCta, suggested_dm_tone:tone, personalized_dm:dmWarm,
  };
}

export function generateAiSummary(lead: Partial<CreatorLead>): string { return calculateScores(lead).ai_summary; }
export function generateOutreachAngle(lead: Partial<CreatorLead>): string { return calculateScores(lead).ai_outreach_angle; }
export function generateContentTags(lead: Partial<CreatorLead>): string[] { try { return JSON.parse(calculateScores(lead).ai_content_tags); } catch { return []; } }
