import type { IpcMain } from "electron";
import { getDb } from "../db/database";

export function registerAIHandlers(ipcMain: IpcMain): void {
  // ─── Score Creator ────────────────────────────────────────────────
  ipcMain.handle("ai:score", async (_event, creatorData: CreatorScoreInput) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { error: "No API key configured. Please add your Anthropic API key in Settings." };
    }

    const prompt = buildScoringPrompt(creatorData);

    try {
      const response = await callClaude(apiKey, prompt);
      const parsed = parseScoreResponse(response);

      // Persist to DB if creator ID is provided
      if (creatorData.id) {
        const db = getDb();
        db.prepare(`
          UPDATE creators SET
            recruit_score = @recruit_score,
            recruitability_score = @recruitability_score,
            growth_score = @growth_score,
            ai_summary = @ai_summary,
            outreach_angle = @outreach_angle,
            content_style_tags = @content_style_tags,
            live_potential = @live_potential
          WHERE id = @id
        `).run({
          id: creatorData.id,
          recruit_score: parsed.recruit_score.value,
          recruitability_score: parsed.recruitability_score.value,
          growth_score: parsed.growth_score.value,
          ai_summary: parsed.ai_summary,
          outreach_angle: parsed.outreach_angle,
          content_style_tags: JSON.stringify(parsed.content_style_tags),
          live_potential: parsed.live_potential,
        });

        // Log to score history
        db.prepare(`
          INSERT INTO score_history (creator_id, recruit_score, recruitability_score, growth_score, reasoning)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          creatorData.id,
          parsed.recruit_score.value,
          parsed.recruitability_score.value,
          parsed.growth_score.value,
          JSON.stringify({
            recruit: parsed.recruit_score.reasoning,
            recruitability: parsed.recruitability_score.reasoning,
            growth: parsed.growth_score.reasoning,
          })
        );
      }

      return { success: true, data: parsed };
    } catch (err) {
      console.error("[AI] Score error:", err);
      return { error: String(err) };
    }
  });

  // ─── Generate DM ──────────────────────────────────────────────────
  ipcMain.handle("ai:generateDM", async (_event, creatorId: number, tone: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { error: "No API key configured." };
    }

    const db = getDb();
    const creator = db.prepare("SELECT * FROM creators WHERE id = ?").get(creatorId) as
      | Record<string, unknown>
      | undefined;

    if (!creator) {
      return { error: "Creator not found." };
    }

    const prompt = buildDMPrompt(creator, tone);

    try {
      const response = await callClaude(apiKey, prompt);
      return { success: true, draft: response.trim() };
    } catch (err) {
      console.error("[AI] DM generation error:", err);
      return { error: String(err) };
    }
  });

  // ─── Save DM Draft ────────────────────────────────────────────────
  ipcMain.handle("ai:saveDraft", (_event, creatorId: number, tone: string, text: string) => {
    const db = getDb();
    const result = db
      .prepare("INSERT INTO outreach_drafts (creator_id, tone, draft_text) VALUES (?, ?, ?)")
      .run(creatorId, tone, text);
    return { id: result.lastInsertRowid, success: true };
  });

  // ─── Get DM Drafts ────────────────────────────────────────────────
  ipcMain.handle("ai:getDrafts", (_event, creatorId: number) => {
    const db = getDb();
    return db
      .prepare("SELECT * FROM outreach_drafts WHERE creator_id = ? ORDER BY created_at DESC")
      .all(creatorId);
  });
}

// ─── Helper: Get API Key from Settings ──────────────────────────────

function getApiKey(): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'anthropic_api_key'")
    .get() as { value: string } | undefined;
  return row?.value || null;
}

// ─── Helper: Call Claude API ─────────────────────────────────────────

async function callClaude(apiKey: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errBody}`);
  }

  const data = await res.json() as {
    content: { type: string; text: string }[];
  };

  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

// ─── Prompts ──────────────────────────────────────────────────────────

function buildScoringPrompt(creator: CreatorScoreInput): string {
  return `You are an expert TikTok talent scout and recruiting analyst. Analyze this TikTok creator and provide a structured evaluation.

CREATOR DATA:
- Username: ${creator.username}
- Display Name: ${creator.display_name ?? "Unknown"}
- Niche: ${creator.niche ?? "Unknown"}
- Sub-niche: ${creator.sub_niche ?? "Unknown"}
- Followers: ${creator.followers?.toLocaleString() ?? "Unknown"}
- Estimated Engagement Rate: ${creator.engagement_rate ?? "Unknown"}%
- Posting Frequency: ${creator.posting_frequency ?? "Unknown"}
- LIVE Activity: ${creator.live_active ? "Active on LIVE" : "Not active on LIVE"}
- Recruiter Notes: ${creator.notes ?? "None"}

AGENCY CONTEXT:
- Agency Niche Focus: ${creator.agency_niche ?? "General creator agency"}

Respond ONLY with valid JSON in exactly this format (no markdown, no explanation):
{
  "recruit_score": {
    "value": <0-100 integer>,
    "reasoning": "<2-3 sentence explanation>"
  },
  "recruitability_score": {
    "value": <0-100 integer>,
    "reasoning": "<2-3 sentence explanation>"
  },
  "growth_score": {
    "value": <0-100 integer>,
    "reasoning": "<2-3 sentence explanation>"
  },
  "ai_summary": "<3-4 sentence overall creator summary>",
  "outreach_angle": "<1-2 sentence specific outreach recommendation>",
  "content_style_tags": ["<tag1>", "<tag2>", "<tag3>"],
  "live_potential": "<High|Medium|Low>"
}

Score definitions:
- Recruit Score (0-100): How well this creator fits agency recruiting goals based on niche, size, and engagement.
- Recruitability Score (0-100): How likely this creator is to respond positively to agency outreach.
- Growth Potential Score (0-100): How likely this creator is to grow significantly in the next 6-12 months.`;
}

function buildDMPrompt(creator: Record<string, unknown>, tone: string): string {
  const toneGuide: Record<string, string> = {
    Warm: "Be warm, personal, and genuine. Show you know their content.",
    Professional: "Be professional and business-focused. Highlight the opportunity clearly.",
    Friendly: "Be casual and friendly, like a peer reaching out.",
    Direct: "Be direct and concise. Get to the point quickly.",
    Encouraging: "Be encouraging and uplifting. Acknowledge their talent first.",
  };

  return `You are a TikTok creator recruiter writing a personalized direct message on TikTok.

CREATOR INFO:
- Username: @${creator.username}
- Niche: ${creator.niche ?? "content creation"}
- Sub-niche: ${creator.sub_niche ?? ""}
- Followers: ${creator.followers?.toLocaleString() ?? "Unknown"}
- AI Summary: ${creator.ai_summary ?? "Talented creator"}
- Suggested Outreach Angle: ${creator.outreach_angle ?? "General interest in working together"}

TONE: ${tone}
TONE GUIDANCE: ${toneGuide[tone] ?? toneGuide.Warm}

Write a TikTok DM that:
1. Opens with something specific to their content (not generic flattery)
2. Briefly introduces the opportunity (agency representation)
3. Has a clear, low-pressure call to action
4. Feels human, not automated
5. Is 3-5 sentences max — TikTok DMs should be short

Output ONLY the message text. No subject line, no labels, no explanation.`;
}

// ─── Parse Score Response ─────────────────────────────────────────────

function parseScoreResponse(raw: string): ScoreResult {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as ScoreResult;
  } catch {
    throw new Error("Failed to parse AI score response. Raw: " + raw.slice(0, 200));
  }
}

// ─── Types ─────────────────────────────────────────────────────────────

interface CreatorScoreInput {
  id?: number;
  username: string;
  display_name?: string;
  niche?: string;
  sub_niche?: string;
  followers?: number;
  engagement_rate?: number;
  posting_frequency?: string;
  live_active?: boolean;
  notes?: string;
  agency_niche?: string;
}

interface ScoreResult {
  recruit_score: { value: number; reasoning: string };
  recruitability_score: { value: number; reasoning: string };
  growth_score: { value: number; reasoning: string };
  ai_summary: string;
  outreach_angle: string;
  content_style_tags: string[];
  live_potential: string;
}
