import { useState } from "react";
import type { CreatorStatus } from "../../types";
import { CREATOR_STATUSES } from "../../types";
import { Card } from "../../components/shared";

export default function Exports() {
  const [statusFilter, setStatusFilter] = useState<CreatorStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean; path?: string; count?: number; error?: string; canceled?: boolean;
  } | null>(null);

  async function handleExport() {
    setExporting(true); setResult(null);
    const res = await window.creatorRadar.export.toExcel({
      status: statusFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
    setResult(res as typeof result);
    setExporting(false);
  }

  const COLUMNS = ["Date Found","Username","Display Name","TikTok URL","Niche","Followers","Recruit Score","Recruitability Score","Growth Score","Status","Suggested DM","Notes"];

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <h2 className="text-base font-semibold mb-1" style={{ color: "var(--cr-text)" }}>Export Creator Leads</h2>
        <p className="text-sm mb-5" style={{ color: "var(--cr-text-sec)" }}>
          Export to a formatted Excel (.xlsx) spreadsheet with scores, notes, and DM drafts.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--cr-text-sec)" }}>Filter by Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CreatorStatus | "")} className="cr-input text-sm">
              <option value="">All statuses</option>
              {CREATOR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--cr-text-sec)" }}>Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="cr-input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--cr-text-sec)" }}>Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="cr-input text-sm" />
            </div>
          </div>
        </div>

        {/* Column preview */}
        <div className="mt-5 rounded-xl p-4" style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--cr-text-sec)" }}>Included columns</p>
          <div className="flex flex-wrap gap-1.5">
            {COLUMNS.map((col) => (
              <span key={col} className="text-2xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--cr-bg-card)", border: "1px solid var(--cr-border)", color: "var(--cr-text-sec)" }}>
                {col}
              </span>
            ))}
          </div>
        </div>

        <button onClick={handleExport} disabled={exporting}
          className="cr-btn cr-btn-primary w-full py-3 mt-5 text-sm font-medium">
          {exporting ? "Exporting…" : "Export to Excel ↓"}
        </button>

        {result && (
          <div className="mt-4 rounded-xl p-4" style={{
            background: result.success ? "var(--cr-tier1-bg)" : result.canceled ? "var(--cr-bg-subtle)" : "var(--cr-tier4-bg)",
            border: `1px solid ${result.success ? "var(--cr-tier1)" : result.canceled ? "var(--cr-border)" : "var(--cr-tier4)"}`,
          }}>
            {result.success && <p className="text-sm" style={{ color: "var(--cr-tier1-text)" }}>✓ Exported {result.count} creator{result.count !== 1 ? "s" : ""} to {result.path}</p>}
            {result.canceled && <p className="text-sm" style={{ color: "var(--cr-text-sec)" }}>Export canceled.</p>}
            {result.error && <p className="text-sm" style={{ color: "var(--cr-tier4-text)" }}>{result.error}</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
