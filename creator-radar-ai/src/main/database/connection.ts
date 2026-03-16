import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs   from 'fs';
import { app }   from 'electron';
import { applySchema }    from './schema';
import { seedSampleData } from './sampleData';

let db: Database.Database | null = null;

export function initializeDatabase(): void {
  if (db) return;
  const dir = app.getPath('userData');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const dbPath = path.join(dir, 'database.sqlite');
  const isNew  = !fs.existsSync(dbPath);
  console.log(`[database] Opening: ${dbPath}`);
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -8000');
  db.pragma('temp_store = MEMORY');
  applySchema(db);
  console.log('[database] Schema applied');
  if (isNew) { try { seedSampleData(db); console.log('[database] Sample data seeded'); } catch(e) { console.warn('[database] Seed failed (non-fatal):', e); } }
  console.log('[database] Ready');
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('[database] Not initialised — call initializeDatabase() first');
  return db;
}

export function closeDatabase(): void {
  if (db) { try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch(e) { console.error(e); } finally { db = null; } }
}
