// ─── Creator & CRM Types ─────────────────────────────────────────────

export type CreatorStatus =
  | "New Lead"
  | "Reviewed"
  | "High Priority"
  | "Ready to Contact"
  | "Contacted"
  | "Replied"
  | "Interested"
  | "Joined"
  | "Not a Fit";

export const CREATOR_STATUSES: CreatorStatus[] = [
  "New Lead",
  "Reviewed",
  "High Priority",
  "Ready to Contact",
  "Contacted",
  "Replied",
  "Interested",
  "Joined",
  "Not a Fit",
];

// Status colors are now handled via CSS variables in StatusBadge component
// This object is kept for legacy compatibility but not actively used
export const STATUS_COLORS: Record<CreatorStatus, string> = {
  "New Lead":          "",
  "Reviewed":          "",
  "High Priority":     "",
  "Ready to Contact":  "",
  "Contacted":         "",
  "Replied":           "",
  "Interested":        "",
  "Joined":            "",
  "Not a Fit":         "",
};

export type DMTone = "Warm" | "Professional" | "Friendly" | "Direct" | "Encouraging";

export const DM_TONES: DMTone[] = [
  "Warm",
  "Professional",
  "Friendly",
  "Direct",
  "Encouraging",
];

export interface Creator {
  id: number;
  username: string;
  display_name: string | null;
  profile_url: string;
  niche: string | null;
  sub_niche: string | null;
  followers: number;
  engagement_rate: number;
  posting_frequency: string | null;
  live_active: boolean;

  // Scores
  recruit_score: number | null;
  recruitability_score: number | null;
  growth_score: number | null;

  // AI outputs
  ai_summary: string | null;
  outreach_angle: string | null;
  content_style_tags: string[];
  live_potential: "High" | "Medium" | "Low" | null;

  // CRM
  status: CreatorStatus;
  campaign_tag: string | null;
  date_added: string;
  date_contacted: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatorNote {
  id: number;
  creator_id: number;
  note_text: string;
  created_at: string;
}

export interface OutreachDraft {
  id: number;
  creator_id: number;
  tone: DMTone;
  draft_text: string;
  created_at: string;
}

// ─── Score Types ──────────────────────────────────────────────────────

export interface ScoreResult {
  recruit_score: { value: number; reasoning: string };
  recruitability_score: { value: number; reasoning: string };
  growth_score: { value: number; reasoning: string };
  ai_summary: string;
  outreach_angle: string;
  content_style_tags: string[];
  live_potential: "High" | "Medium" | "Low";
}

// ─── Dashboard Stats ──────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  byStatus: { status: string; count: number }[];
  highPriority: number;
  contacted: number;
  followUpDue: number;
  avgScores: {
    avg_recruit: number;
    avg_recruitability: number;
    avg_growth: number;
  };
}

// ─── Filters ──────────────────────────────────────────────────────────

export interface CreatorFilters {
  status?: CreatorStatus | "";
  niche?: string;
  search?: string;
  campaign_tag?: string;
  sort_by?: keyof Creator;
  sort_dir?: "ASC" | "DESC";
  limit?: number;
}

// ─── Settings ─────────────────────────────────────────────────────────

export interface AppSettings {
  anthropic_api_key: string;
  theme: "dark" | "light";
  default_dm_tone: DMTone;
  agency_name: string;
  agency_niche_focus: string;
  recruiter_name: string;
  onboarding_complete: string;
}

// ─── Window Bridge Type ───────────────────────────────────────────────

declare global {
  interface Window {
    creatorRadar: {
      creators: {
        add: (data: Partial<Creator>) => Promise<{ id: number; success: boolean }>;
        list: (filters?: CreatorFilters) => Promise<Creator[]>;
        get: (id: number) => Promise<Creator | null>;
        update: (id: number, data: Partial<Creator>) => Promise<{ success: boolean }>;
        updateStatus: (id: number, status: CreatorStatus) => Promise<{ success: boolean }>;
        delete: (id: number) => Promise<{ success: boolean }>;
        addNote: (creatorId: number, text: string) => Promise<{ id: number; success: boolean }>;
        getNotes: (creatorId: number) => Promise<CreatorNote[]>;
        getStats: () => Promise<DashboardStats>;
      };
      ai: {
        scoreCreator: (data: Partial<Creator> & { agency_niche?: string }) => Promise<
          { success: boolean; data: ScoreResult } | { error: string }
        >;
        generateDM: (creatorId: number, tone: DMTone) => Promise<
          { success: boolean; draft: string } | { error: string }
        >;
        saveDraft: (creatorId: number, tone: string, text: string) => Promise<{ success: boolean }>;
        getDrafts: (creatorId: number) => Promise<OutreachDraft[]>;
      };
      export: {
        toExcel: (filters?: {
          status?: string;
          niche?: string;
          date_from?: string;
          date_to?: string;
        }) => Promise<{ success: boolean; path: string; count: number } | { error: string } | { canceled: boolean }>;
      };
      settings: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<{ success: boolean }>;
        getAll: () => Promise<AppSettings>;
      };
    };
  }
}
