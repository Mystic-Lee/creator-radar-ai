// src/shared/types.ts
export interface CreatorLead {
  id?:                      number;
  username:                 string;
  display_name:             string;
  profile_url:              string;
  profile_image_url:        string;
  bio:                      string;
  niche:                    string;
  sub_niche:                string;
  followers:                number;
  estimated_likes:          number;
  estimated_avg_views:      number;
  engagement_rate:          number;
  live_activity:            string;
  posting_frequency:        string;
  recruit_score:            number;
  recruitability_score:     number;
  growth_potential_score:   number;
  priority_tier:            string;
  fit_summary:              string;
  why_good_candidate:       string;
  recruitability_reason:    string;
  growth_signals_summary:   string;
  growth_category:          string;
  ai_summary:               string;
  ai_niche_detection:       string;
  ai_content_tags:          string;
  ai_live_potential:        string;
  ai_outreach_angle:        string;
  suggested_dm_tone:        string;
  personalized_dm:          string;
  dm_short:                 string;
  dm_standard:              string;
  dm_warm:                  string;
  dm_professional:          string;
  dm_strong_cta:            string;
  status:                   string;
  assigned_recruiter_id:    number | null;
  campaign_id:              number | null;
  tags:                     string;
  notes:                    string;
  date_contacted:           string;
  response_status:          string;
  follow_up_date:           string;
  outcome_notes:            string;
  date_added:               string;
  created_at:               string;
  updated_at:               string;
  recruiter_name?:          string;
  campaign_name?:           string;
}

export interface Campaign {
  id?:                  number;
  name:                 string;
  target_niches:        string;
  min_followers:        number;
  max_followers:        number;
  min_recruit_score:    number;
  min_recruitability:   number;
  target_content_style: string;
  notes:                string;
  assigned_recruiters:  string;
  created_at:           string;
  status:               string;
  total_leads?:         number;
}

export interface CampaignStats {
  campaign_id:        number;
  total_leads:        number;
  tier1_leads:        number;
  contacted:          number;
  replied:            number;
  interested:         number;
  joined:             number;
  conversion_rate:    number;
  avg_recruitability: number;
}

export interface Recruiter {
  id?:    number;
  name:   string;
  email:  string;
  active: boolean;
}

export interface DmTemplate {
  id?:           number;
  tone:          string;
  template_text: string;
  is_default:    boolean;
}

export interface AppSettings {
  companyName:        string;
  logoPath?:          string;
  themeColor:         string;
  darkMode:           boolean;
  onboardingComplete: boolean;
}

export interface DashboardStats {
  leadsToday:      number;
  highPriority:    number;
  contactedToday:  number;
  repliesReceived: number;
  interested:      number;
  joined:          number;
  followUpsDue:    number;
  recentLeads:     Partial<CreatorLead>[];
  topPriority:     Partial<CreatorLead>[];
  nicheBreakdown:  { niche: string; count: number }[];
}

export interface ExportParams {
  exportType:   string;
  columns:      string[];
  filters?:     Record<string, unknown>;
  selectedIds?: number[];
  outputPath:   string;
}

export interface ExportResult { success: boolean; path: string; }

export interface CampaignReport {
  campaign_name: string; total_leads: number; tier1_leads: number;
  contacted: number; replied: number; interested: number; joined: number;
  conversion_rate: number; avg_recruitability: number;
}
export interface NicheReport { niche: string; total: number; interested: number; joined: number; }
export interface RecruiterReport { recruiter_name: string; total_assigned: number; contacted: number; interested: number; joined: number; }

export interface SearchFilters {
  niche?:                   string;
  sub_niche?:               string;
  minFollowers?:            number;
  maxFollowers?:            number;
  minRecruitScore?:         number;
  minRecruitabilityScore?:  number;
  minGrowthScore?:          number;
  liveActivity?:            string;
  status?:                  string;
  campaignId?:              number;
  priorityTier?:            string;
  dateFrom?:                string;
  dateTo?:                  string;
}

export interface SearchPreset {
  id?:         number;
  name:        string;
  filters:     SearchFilters;
  pinned:      boolean;
  created_at?: string;
  updated_at?: string;
}

export type QueueSource = 'unreviewed' | 'today' | 'high-growth' | 'niche' | 'campaign' | 'custom';
export type ReviewAction = 'high-priority' | 'save' | 'skip' | 'not-a-fit';

export interface ElectronAPI {
  getLeads:            (filters?: Record<string, unknown>) => Promise<CreatorLead[]>;
  getLead:             (id: number) => Promise<CreatorLead>;
  saveLead:            (lead: Partial<CreatorLead>) => Promise<CreatorLead>;
  deleteLead:          (id: number) => Promise<{ success: boolean }>;
  checkDuplicates:     (params: Record<string, unknown>) => Promise<Partial<CreatorLead>[]>;
  getDashboardStats:   () => Promise<DashboardStats>;
  getPriorityQueue:    () => Promise<CreatorLead[]>;
  searchCreators:      (filters: Record<string, unknown>) => Promise<CreatorLead[]>;
  getRisingCreators:   (filters: Record<string, unknown>) => Promise<CreatorLead[]>;
  getCampaigns:        () => Promise<Campaign[]>;
  getCampaign:         (id: number) => Promise<Campaign>;
  saveCampaign:        (campaign: Partial<Campaign>) => Promise<Campaign>;
  deleteCampaign:      (id: number) => Promise<{ success: boolean }>;
  getCampaignStats:    (id: number) => Promise<CampaignStats>;
  getCampaignReports:  () => Promise<CampaignReport[]>;
  getNicheReports:     () => Promise<NicheReport[]>;
  getRecruiterReports: () => Promise<RecruiterReport[]>;
  getAppSettings:      () => Promise<AppSettings>;
  saveAppSettings:     (settings: Partial<AppSettings>) => Promise<void>;
  getRecruiters:       () => Promise<Recruiter[]>;
  saveRecruiter:       (r: Partial<Recruiter>) => Promise<Recruiter>;
  deleteRecruiter:     (id: number) => Promise<{ success: boolean }>;
  getNiches:           () => Promise<string[]>;
  saveNiches:          (niches: string[]) => Promise<void>;
  getScoringWeights:   () => Promise<Record<string, number> | null>;
  saveScoringWeights:  (w: Record<string, number>) => Promise<void>;
  getDmTemplates:      () => Promise<DmTemplate[]>;
  saveDmTemplate:      (t: Partial<DmTemplate>) => Promise<DmTemplate>;
  deleteDmTemplate:    (id: number) => Promise<{ success: boolean }>;
  getExportColumns:    () => Promise<string[]>;
  saveExportColumns:   (cols: string[]) => Promise<void>;
  getStatusLabels:     () => Promise<string[]>;
  saveStatusLabels:    (labels: string[]) => Promise<void>;
  selectLogoFile:      () => Promise<string | null>;
  exportToExcel:       (params: ExportParams) => Promise<ExportResult>;
  selectExportPath:    () => Promise<string | null>;
  getReviewQueue:      (source: string, filters: Record<string, unknown>) => Promise<CreatorLead[]>;
  processReviewAction: (leadId: number, action: string) => Promise<CreatorLead>;
  getPresets:          () => Promise<SearchPreset[]>;
  savePreset:          (preset: Partial<SearchPreset>) => Promise<SearchPreset>;
  deletePreset:        (id: number) => Promise<{ success: boolean }>;
  togglePresetPin:     (id: number) => Promise<SearchPreset>;
}

declare global { interface Window { electronAPI: ElectronAPI; } }
