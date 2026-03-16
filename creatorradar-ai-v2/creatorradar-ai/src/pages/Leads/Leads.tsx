import { useState, useEffect } from "react";
import type { Creator, CreatorStatus } from "../../types";
import { CREATOR_STATUSES } from "../../types";
import { StatusBadge, ScoreBadge, formatFollowers, EmptyState, Spinner, SectionHeader } from "../../components/shared";
import { Avatar } from "../Dashboard/Dashboard";

interface LeadsProps {
  onOpenDM: (id: number) => void;
  onOpenReview: () => void;
}

export default function Leads({ onOpenDM, onOpenReview }: LeadsProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CreatorStatus | "">("");
  const [sortBy, setSortBy] = useState<"date_added"|"recruit_score"|"followers">("date_added");
  const [sortDir, setSortDir] = useState<"ASC"|"DESC">("DESC");

  useEffect(() => { loadCreators(); }, [statusFilter, sortBy, sortDir]);
  useEffect(() => { const t = setTimeout(loadCreators, 280); return () => clearTimeout(t); }, [search]);

  async function loadCreators() {
    setLoading(true);
    const data = await window.creatorRadar.creators.list({
      status: statusFilter || undefined,
      search: search || undefined,
      sort_by: sortBy, sort_dir: sortDir,
    });
    setCreators(data);
    setLoading(false);
  }

  async function handleStatusChange(id: number, status: CreatorStatus) {
    await window.creatorRadar.creators.updateStatus(id, status);
    setCreators((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this creator? This cannot be undone.")) return;
    await window.creatorRadar.creators.delete(id);
    setCreators((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir((d) => d === "ASC" ? "DESC" : "ASC");
    else { setSortBy(col); setSortDir("DESC"); }
  }

  const sortIcon = (col: typeof sortBy) => sortBy === col ? (sortDir === "DESC" ? " ↓" : " ↑") : "";

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Creator Leads"
        subtitle={`${creators.length} creator${creators.length !== 1 ? "s" : ""}`}
        actions={
          <button onClick={onOpenReview} className="cr-btn cr-btn-ghost text-xs px-3 py-1.5"
            style={{ color: "var(--cr-brand)", borderColor: "var(--cr-brand)", background: "var(--cr-brand-light)" }}>
            Quick Review ▷
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search creators…" className="cr-input text-xs w-52" style={{ height: "34px" }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CreatorStatus | "")}
          className="cr-input text-xs w-44" style={{ height: "34px" }}>
          <option value="">All statuses</option>
          {CREATOR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-1">
          {(["date_added","recruit_score","followers"] as const).map((col) => (
            <button key={col} onClick={() => toggleSort(col)}
              className="cr-btn text-xs px-3 py-1.5"
              style={{
                height: "34px",
                background: sortBy === col ? "var(--cr-brand)" : "var(--cr-bg-card)",
                color: sortBy === col ? "#fff" : "var(--cr-text-sec)",
                border: `1px solid ${sortBy === col ? "var(--cr-brand)" : "var(--cr-border)"}`,
              }}
            >
              {col === "date_added" ? "Date" : col === "recruit_score" ? "Score" : "Followers"}
              {sortIcon(col)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : creators.length === 0 ? (
        <EmptyState icon="◈" title="No creators found"
          description={search || statusFilter ? "Try adjusting your filters." : "Add your first creator in Discovery."} />
      ) : (
        <div className="cr-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="w-full" style={{ fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cr-border)", background: "var(--cr-bg-subtle)" }}>
                {[
                  { label: "Creator", align: "left" },
                  { label: "Niche", align: "left" },
                  { label: "Followers", align: "right", sortable: "followers" as const },
                  { label: "Scores", align: "center", sortable: "recruit_score" as const },
                  { label: "Status", align: "left" },
                  { label: "Actions", align: "right" },
                ].map((col) => (
                  <th key={col.label}
                    className={`px-4 py-2.5 font-medium text-xs text-${col.align} ${col.sortable ? "cursor-pointer hover:opacity-80" : ""}`}
                    style={{ color: "var(--cr-text-sec)" }}
                    onClick={col.sortable ? () => toggleSort(col.sortable!) : undefined}
                  >
                    {col.label}{col.sortable ? sortIcon(col.sortable) : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creators.map((creator, i) => (
                <tr key={creator.id}
                  style={{
                    borderBottom: i < creators.length - 1 ? "1px solid var(--cr-border)" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cr-bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={creator.display_name ?? creator.username} size={32} />
                      <div>
                        <p className="font-medium" style={{ color: "var(--cr-text)" }}>@{creator.username}</p>
                        {creator.display_name && <p className="text-xs" style={{ color: "var(--cr-text-sec)" }}>{creator.display_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--cr-text-sec)" }}>
                    {creator.niche ?? "—"}
                    {creator.sub_niche && <span style={{ color: "var(--cr-text-hint)" }}> / {creator.sub_niche}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--cr-text)" }}>
                    {formatFollowers(creator.followers)}
                    {creator.engagement_rate > 0 && (
                      <div className="text-xs" style={{ color: "var(--cr-text-hint)" }}>{creator.engagement_rate.toFixed(1)}% eng</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-center">
                      <ScoreBadge label="R"  value={creator.recruit_score} size="sm" />
                      <ScoreBadge label="Rc" value={creator.recruitability_score} size="sm" />
                      <ScoreBadge label="G"  value={creator.growth_score} size="sm" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={creator.status}
                      onChange={(e) => handleStatusChange(creator.id, e.target.value as CreatorStatus)}
                      className="text-xs rounded-lg px-2 py-1 border"
                      style={{ background: "var(--cr-bg-input)", color: "var(--cr-text)", borderColor: "var(--cr-border)" }}
                    >
                      {CREATOR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <a href={creator.profile_url} target="_blank" rel="noopener noreferrer"
                        className="cr-btn cr-btn-ghost text-xs px-2 py-1" style={{ height: "auto" }}>
                        TikTok ↗
                      </a>
                      <button onClick={() => onOpenDM(creator.id)}
                        className="cr-btn text-xs px-2 py-1"
                        style={{ background: "var(--cr-brand-light)", color: "var(--cr-brand)", border: "1px solid rgba(47,128,237,0.2)", height: "auto" }}>
                        DM
                      </button>
                      <button onClick={() => handleDelete(creator.id)}
                        className="cr-btn text-xs px-2 py-1"
                        style={{ background: "var(--cr-tier4-bg)", color: "var(--cr-tier4-text)", border: "none", height: "auto" }}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
