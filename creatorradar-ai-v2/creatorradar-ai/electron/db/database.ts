import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

export function initDatabase(): void {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "creatorradar.db");

  db = new Database(dbPath);

  // Performance settings
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");

  createTables();
  seedDefaultSettings();

  console.log(`[DB] Initialized at ${dbPath}`);
}

function createTables(): void {
  db.exec(`
    -- ─── Creators ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS creators (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      username              TEXT NOT NULL,
      display_name          TEXT,
      profile_url           TEXT NOT NULL UNIQUE,
      niche                 TEXT,
      sub_niche             TEXT,
      followers             INTEGER DEFAULT 0,
      engagement_rate       REAL DEFAULT 0,
      posting_frequency     TEXT,
      live_active           INTEGER DEFAULT 0,  -- boolean 0/1

      -- Scores (0-100, NULL until scored)
      recruit_score         INTEGER,
      recruitability_score  INTEGER,
      growth_score          INTEGER,

      -- AI outputs
      ai_summary            TEXT,
      outreach_angle        TEXT,
      content_style_tags    TEXT,   -- JSON array stored as string
      live_potential        TEXT,   -- 'High' | 'Medium' | 'Low'

      -- CRM fields
      status                TEXT NOT NULL DEFAULT 'New Lead',
      campaign_tag          TEXT,
      date_added            TEXT NOT NULL DEFAULT (datetime('now')),
      date_contacted        TEXT,
      follow_up_date        TEXT,

      -- Timestamps
      created_at            TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─── Creator Notes ───────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS creator_notes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id  INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
      note_text   TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─── Outreach Drafts ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS outreach_drafts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id  INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
      tone        TEXT NOT NULL,
      draft_text  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─── Score History (for tracking re-scores over time) ────────
    CREATE TABLE IF NOT EXISTS score_history (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id            INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
      recruit_score         INTEGER,
      recruitability_score  INTEGER,
      growth_score          INTEGER,
      reasoning             TEXT,   -- JSON with per-score reasoning
      scored_at             TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─── Settings ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT,
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ─── Indexes ─────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_creators_status      ON creators(status);
    CREATE INDEX IF NOT EXISTS idx_creators_niche       ON creators(niche);
    CREATE INDEX IF NOT EXISTS idx_creators_date_added  ON creators(date_added);
    CREATE INDEX IF NOT EXISTS idx_creators_follow_up   ON creators(follow_up_date);
    CREATE INDEX IF NOT EXISTS idx_notes_creator        ON creator_notes(creator_id);
    CREATE INDEX IF NOT EXISTS idx_drafts_creator       ON outreach_drafts(creator_id);

    -- ─── Triggers ────────────────────────────────────────────────
    CREATE TRIGGER IF NOT EXISTS creators_updated_at
    AFTER UPDATE ON creators
    BEGIN
      UPDATE creators SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);
}

function seedDefaultSettings(): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  const defaults: [string, string][] = [
    ["anthropic_api_key", ""],
    ["theme", "auto"],
    ["default_dm_tone", "Warm"],
    ["agency_name", ""],
    ["agency_niche_focus", ""],
    ["recruiter_name", ""],
    ["onboarding_complete", "false"],
  ];

  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const [key, value] of rows) {
      insert.run(key, value);
    }
  });

  insertMany(defaults);
}
