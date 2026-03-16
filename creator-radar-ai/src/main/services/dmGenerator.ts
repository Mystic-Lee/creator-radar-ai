import type { CreatorLead } from '../../shared/types';

export interface DmVariants { short: string; standard: string; warm: string; professional: string; strong_cta: string; }

let _agency = 'our agency';
export function setAgencyName(n: string): void { _agency = n || 'our agency'; }
export function getAgencyName(): string { return _agency; }

export function generateDmVariants(lead: Partial<CreatorLead>): DmVariants {
  const name   = lead.display_name || `@${lead.username}` || 'there';
  const niche  = lead.niche || 'content';
  const agency = _agency;
  const f = lead.followers||0;
  const fs = f>=1e6?`${(f/1e6).toFixed(1)}M`:f>=1e3?`${(f/1e3).toFixed(1)}K`:f>0?String(f):'';
  return {
    short:        `Hey ${name}! Love your ${niche} content — I work with ${agency} and think you'd be a great fit. Open to a quick chat? 😊`,
    standard:     `Hey ${name}! Your ${niche} content is impressive${fs?` and your ${fs} following clearly loves it`:''}.  I work with ${agency} and we help creators grow their platform and earn more. Would you be open to a quick conversation?`,
    warm:         `Hey ${name}! 👋 I came across your ${niche} content and honestly loved your vibe. I work with ${agency} and we help creators like you grow their audience, increase income, and build a real presence on LIVE. Would love to chat if you're open to it! 😊`,
    professional: `Hi ${name}, I'm reaching out from ${agency}. We specialise in supporting ${niche} creators in growing their platform and exploring monetisation opportunities. I'd love to connect and share more about what we offer. Let me know if you're interested.`,
    strong_cta:   `${name}!! Your ${niche} content is exactly what we're looking for ${fs?`and ${fs} followers is a great base`:'and your engagement is outstanding'}. I'm with ${agency} and we're actively recruiting ${niche} creators right now. This could be a real game-changer — hit me back! 🚀`,
  };
}

export function generateDmForTone(lead: Partial<CreatorLead>, tone: string, templateOverride?: string): string {
  const name = lead.display_name||`@${lead.username}`||'there';
  const niche = lead.niche||'content';
  if (templateOverride) return templateOverride.replace(/\{creator_name\}/g,name).replace(/\{niche\}/g,niche).replace(/\{agency_name\}/g,_agency);
  const v = generateDmVariants(lead);
  const t = tone.toLowerCase();
  if (['warm','friendly','encouraging','soft invite'].includes(t)) return v.warm;
  if (['professional','premium'].includes(t)) return v.professional;
  if (['high-energy','strong cta','direct'].includes(t)) return v.strong_cta;
  if (['short','casual'].includes(t)) return v.short;
  return v.standard;
}
