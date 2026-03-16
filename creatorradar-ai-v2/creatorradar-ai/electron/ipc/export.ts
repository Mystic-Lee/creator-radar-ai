import type { IpcMain } from "electron";
import { getDb } from "../db/database";
import { app, dialog } from "electron";
import path from "path";
import * as XLSX from "xlsx";

export function registerExportHandlers(ipcMain: IpcMain): void {
  ipcMain.handle("export:excel", async (_event, filters?: ExportFilters) => {
    const db = getDb();

    // Build query with optional filters
    let query = `
      SELECT
        date_added        AS "Date Found",
        username          AS "Username",
        display_name      AS "Display Name",
        profile_url       AS "TikTok Profile URL",
        niche             AS "Niche",
        sub_niche         AS "Sub-niche",
        followers         AS "Followers",
        engagement_rate   AS "Engagement Rate (%)",
        posting_frequency AS "Posting Frequency",
        CASE live_active WHEN 1 THEN 'Yes' ELSE 'No' END AS "LIVE Active",
        recruit_score         AS "Recruit Score",
        recruitability_score  AS "Recruitability Score",
        growth_score          AS "Growth Score",
        status                AS "Status",
        campaign_tag          AS "Campaign Tag",
        date_contacted        AS "Date Contacted",
        follow_up_date        AS "Follow-up Date",
        ai_summary            AS "AI Summary",
        outreach_angle        AS "Suggested DM Angle"
      FROM creators
      WHERE 1=1
    `;

    const params: unknown[] = [];

    if (filters?.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }
    if (filters?.niche) {
      query += " AND niche LIKE ?";
      params.push(`%${filters.niche}%`);
    }
    if (filters?.date_from) {
      query += " AND date_added >= ?";
      params.push(filters.date_from);
    }
    if (filters?.date_to) {
      query += " AND date_added <= ?";
      params.push(filters.date_to);
    }

    query += " ORDER BY date_added DESC";

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];

    if (rows.length === 0) {
      return { error: "No creators found with the selected filters." };
    }

    // Also fetch best DM draft per creator
    const draftsQuery = db.prepare(`
      SELECT creator_id, draft_text FROM outreach_drafts
      WHERE id IN (
        SELECT MAX(id) FROM outreach_drafts GROUP BY creator_id
      )
    `);
    const drafts = draftsQuery.all() as { creator_id: number; draft_text: string }[];
    const draftMap = new Map(drafts.map((d) => [d.creator_id, d.draft_text]));

    // Fetch notes per creator (concatenated)
    const notesQuery = db.prepare(`
      SELECT creator_id, GROUP_CONCAT(note_text, ' | ') as notes
      FROM creator_notes GROUP BY creator_id
    `);
    const notes = notesQuery.all() as { creator_id: number; notes: string }[];
    const notesMap = new Map(notes.map((n) => [n.creator_id, n.notes]));

    // Inject drafts and notes (need IDs for mapping)
    const rowsWithIds = db
      .prepare(`SELECT id, username FROM creators`)
      .all() as { id: number; username: string }[];
    const idMap = new Map(rowsWithIds.map((r) => [r.username, r.id]));

    const enrichedRows = rows.map((row) => {
      const id = idMap.get(row["Username"] as string);
      return {
        ...row,
        "Suggested DM": id ? (draftMap.get(id) ?? "") : "",
        Notes: id ? (notesMap.get(id) ?? "") : "",
      };
    });

    // Build workbook
    const worksheet = XLSX.utils.json_to_sheet(enrichedRows);

    // Style headers (bold + background)
    const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellRef]) continue;
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" },
        border: {
          bottom: { style: "thin", color: { rgb: "7C3AED" } },
        },
      };
    }

    // Set column widths
    worksheet["!cols"] = [
      { wch: 14 }, // Date Found
      { wch: 20 }, // Username
      { wch: 22 }, // Display Name
      { wch: 40 }, // TikTok URL
      { wch: 16 }, // Niche
      { wch: 16 }, // Sub-niche
      { wch: 12 }, // Followers
      { wch: 18 }, // Engagement Rate
      { wch: 18 }, // Posting Frequency
      { wch: 12 }, // LIVE Active
      { wch: 14 }, // Recruit Score
      { wch: 20 }, // Recruitability Score
      { wch: 16 }, // Growth Score
      { wch: 16 }, // Status
      { wch: 16 }, // Campaign Tag
      { wch: 16 }, // Date Contacted
      { wch: 16 }, // Follow-up Date
      { wch: 50 }, // AI Summary
      { wch: 40 }, // Outreach Angle
      { wch: 60 }, // Suggested DM
      { wch: 40 }, // Notes
    ];

    // Enable autofilter on header row
    worksheet["!autofilter"] = { ref: worksheet["!ref"] ?? "A1" };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Creator Leads");

    // Add a summary sheet
    const summaryData = [
      ["CreatorRadar AI — Export Summary"],
      ["Generated:", new Date().toLocaleString()],
      ["Total Creators:", enrichedRows.length],
      [],
      ["Status", "Count"],
    ];

    const statusCounts = enrichedRows.reduce<Record<string, number>>((acc, row) => {
      const s = (row["Status"] as string) ?? "Unknown";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});

    for (const [status, count] of Object.entries(statusCounts)) {
      summaryData.push([status, count as unknown as string]);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Save dialog
    const defaultPath = path.join(
      app.getPath("downloads"),
      `CreatorRadar-Export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath,
      filters: [{ name: "Excel Workbook", extensions: ["xlsx"] }],
      title: "Export Creator Leads",
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    XLSX.writeFile(workbook, filePath, { bookType: "xlsx" });
    return { success: true, path: filePath, count: enrichedRows.length };
  });
}

interface ExportFilters {
  status?: string;
  niche?: string;
  date_from?: string;
  date_to?: string;
}
