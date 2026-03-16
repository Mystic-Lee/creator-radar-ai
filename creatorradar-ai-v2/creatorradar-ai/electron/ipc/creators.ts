import type { IpcMain } from "electron";
import { getDb } from "../db/database";

export function registerCreatorHandlers(ipcMain: IpcMain): void {
  // ─── Add Creator ─────────────────────────────────────────────────
  ipcMain.handle("creators:add", (_event, data: CreatorInput) => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO creators (
        username, display_name, profile_url, niche, sub_niche,
        followers, engagement_rate, posting_frequency, live_active,
        recruit_score, recruitability_score, growth_score,
        ai_summary, outreach_angle, content_style_tags, live_potential,
        status, campaign_tag, follow_up_date
      ) VALUES (
        @username, @display_name, @profile_url, @niche, @sub_niche,
        @followers, @engagement_rate, @posting_frequency, @live_active,
        @recruit_score, @recruitability_score, @growth_score,
        @ai_summary, @outreach_angle, @content_style_tags, @live_potential,
        @status, @campaign_tag, @follow_up_date
      )
    `);

    const result = stmt.run({
      username: data.username ?? "",
      display_name: data.display_name ?? null,
      profile_url: data.profile_url,
      niche: data.niche ?? null,
      sub_niche: data.sub_niche ?? null,
      followers: data.followers ?? 0,
      engagement_rate: data.engagement_rate ?? 0,
      posting_frequency: data.posting_frequency ?? null,
      live_active: data.live_active ? 1 : 0,
      recruit_score: data.recruit_score ?? null,
      recruitability_score: data.recruitability_score ?? null,
      growth_score: data.growth_score ?? null,
      ai_summary: data.ai_summary ?? null,
      outreach_angle: data.outreach_angle ?? null,
      content_style_tags: data.content_style_tags
        ? JSON.stringify(data.content_style_tags)
        : null,
      live_potential: data.live_potential ?? null,
      status: data.status ?? "New Lead",
      campaign_tag: data.campaign_tag ?? null,
      follow_up_date: data.follow_up_date ?? null,
    });

    return { id: result.lastInsertRowid, success: true };
  });

  // ─── List Creators ───────────────────────────────────────────────
  ipcMain.handle("creators:list", (_event, filters?: CreatorFilters) => {
    const db = getDb();

    let query = "SELECT * FROM creators WHERE 1=1";
    const params: unknown[] = [];

    if (filters?.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }
    if (filters?.niche) {
      query += " AND niche LIKE ?";
      params.push(`%${filters.niche}%`);
    }
    if (filters?.search) {
      query += " AND (username LIKE ? OR display_name LIKE ? OR niche LIKE ?)";
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }
    if (filters?.campaign_tag) {
      query += " AND campaign_tag = ?";
      params.push(filters.campaign_tag);
    }

    query += ` ORDER BY ${filters?.sort_by ?? "date_added"} ${filters?.sort_dir ?? "DESC"}`;

    if (filters?.limit) {
      query += " LIMIT ?";
      params.push(filters.limit);
    }

    const rows = db.prepare(query).all(...params) as CreatorRow[];
    return rows.map(parseCreatorRow);
  });

  // ─── Get Single Creator ──────────────────────────────────────────
  ipcMain.handle("creators:get", (_event, id: number) => {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM creators WHERE id = ?")
      .get(id) as CreatorRow | undefined;
    return row ? parseCreatorRow(row) : null;
  });

  // ─── Update Creator ──────────────────────────────────────────────
  ipcMain.handle("creators:update", (_event, id: number, data: Partial<CreatorInput>) => {
    const db = getDb();

    // Build dynamic SET clause from provided fields
    const fields = Object.keys(data)
      .filter((k) => k !== "id")
      .map((k) => `${k} = @${k}`)
      .join(", ");

    if (!fields) return { success: false, error: "No fields to update" };

    const stmt = db.prepare(`UPDATE creators SET ${fields} WHERE id = @id`);
    stmt.run({ ...data, id });

    return { success: true };
  });

  // ─── Update Status Only ──────────────────────────────────────────
  ipcMain.handle("creators:updateStatus", (_event, id: number, status: string) => {
    const db = getDb();
    db.prepare("UPDATE creators SET status = ? WHERE id = ?").run(status, id);
    return { success: true };
  });

  // ─── Delete Creator ──────────────────────────────────────────────
  ipcMain.handle("creators:delete", (_event, id: number) => {
    const db = getDb();
    db.prepare("DELETE FROM creators WHERE id = ?").run(id);
    return { success: true };
  });

  // ─── Add Note ────────────────────────────────────────────────────
  ipcMain.handle("creators:addNote", (_event, creatorId: number, text: string) => {
    const db = getDb();
    const result = db
      .prepare("INSERT INTO creator_notes (creator_id, note_text) VALUES (?, ?)")
      .run(creatorId, text);
    return { id: result.lastInsertRowid, success: true };
  });

  // ─── Get Notes ───────────────────────────────────────────────────
  ipcMain.handle("creators:getNotes", (_event, creatorId: number) => {
    const db = getDb();
    return db
      .prepare("SELECT * FROM creator_notes WHERE creator_id = ? ORDER BY created_at DESC")
      .all(creatorId);
  });

  // ─── Stats / Dashboard Metrics ───────────────────────────────────
  ipcMain.handle("creators:stats", () => {
    const db = getDb();

    const total = (db.prepare("SELECT COUNT(*) as n FROM creators").get() as { n: number }).n;
    const byStatus = db
      .prepare("SELECT status, COUNT(*) as count FROM creators GROUP BY status")
      .all() as { status: string; count: number }[];
    const highPriority = (
      db
        .prepare("SELECT COUNT(*) as n FROM creators WHERE status = 'High Priority'")
        .get() as { n: number }
    ).n;
    const contacted = (
      db
        .prepare("SELECT COUNT(*) as n FROM creators WHERE status IN ('Contacted','Replied','Interested','Joined')")
        .get() as { n: number }
    ).n;
    const followUpDue = (
      db
        .prepare(
          "SELECT COUNT(*) as n FROM creators WHERE follow_up_date IS NOT NULL AND follow_up_date <= date('now')"
        )
        .get() as { n: number }
    ).n;
    const avgScores = db
      .prepare(
        `SELECT
          ROUND(AVG(recruit_score),1) as avg_recruit,
          ROUND(AVG(recruitability_score),1) as avg_recruitability,
          ROUND(AVG(growth_score),1) as avg_growth
         FROM creators WHERE recruit_score IS NOT NULL`
      )
      .get() as { avg_recruit: number; avg_recruitability: number; avg_growth: number };

    return { total, byStatus, highPriority, contacted, followUpDue, avgScores };
  });
}

// ─── Types ─────────────────────────────────────────────────────────

interface CreatorInput {
  username: string;
  display_name?: string;
  profile_url: string;
  niche?: string;
  sub_niche?: string;
  followers?: number;
  engagement_rate?: number;
  posting_frequency?: string;
  live_active?: boolean;
  recruit_score?: number;
  recruitability_score?: number;
  growth_score?: number;
  ai_summary?: string;
  outreach_angle?: string;
  content_style_tags?: string[];
  live_potential?: string;
  status?: string;
  campaign_tag?: string;
  follow_up_date?: string;
}

interface CreatorFilters {
  status?: string;
  niche?: string;
  search?: string;
  campaign_tag?: string;
  sort_by?: string;
  sort_dir?: "ASC" | "DESC";
  limit?: number;
}

interface CreatorRow {
  id: number;
  content_style_tags: string | null;
  live_active: number;
  [key: string]: unknown;
}

function parseCreatorRow(row: CreatorRow) {
  return {
    ...row,
    live_active: row.live_active === 1,
    content_style_tags: row.content_style_tags
      ? JSON.parse(row.content_style_tags as string)
      : [],
  };
}
