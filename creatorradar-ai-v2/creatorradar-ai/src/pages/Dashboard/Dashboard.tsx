import { useState, useEffect } from "react";
import type { Page } from "../../App";
import type { DashboardStats, Creator } from "../../types";
import { StatusBadge, ScoreBadge, formatFollowers, EmptyState, Spinner, Card } from "../../components/shared";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [statsData, leads] = await Promise.all([
      window.creatorRadar.creators.getStats(),
      window.creatorRadar.creators.list({ limit: 5, sort_by: "date_added", sort_dir: "DESC" }),
    ]);
    setStats(statsData);
    setRecentLeads(leads);
    setLoading(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  const statusMap = Object.fromEntries((stats?.byStatus ?? []).map((s) => [s.status, s.count]));

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Leads"       value={stats?.total ?? 0}         sub="in database"        color="brand" />
        <KPICard label="High Priority"     value={stats?.highPriority ?? 0}  sub="ready to contact"   color="tier3" onClick={() => onNavigate("leads")} />
        <KPICard label="Contacted"         value={stats?.contacted ?? 0}     sub="in outreach"        color="tier1" />
        <KPICard label="Follow-ups Due"    value={stats?.followUpDue ?? 0}   sub="need attention"     color={stats?.followUpDue ? "tier4" : "tier1"} />
      </div>

      {/* Avg scores */}
      {(stats?.avgScores?.avg_recruit ?? 0) > 0 && (
        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--cr-text)" }}>
            Average Scores Across All Leads
          </p>
          <div className="flex gap-4">
            <ScoreBadge label="Recruit"        value={Math.round(stats!.avgScores.avg_recruit ?? 0)} size="lg" />
            <ScoreBadge label="Recruitability" value={Math.round(stats!.avgScores.avg_recruitability ?? 0)} size="lg" />
            <ScoreBadge label="Growth"         value={Math.round(stats!.avgScores.avg_growth ?? 0)} size="lg" />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline */}
        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--cr-text)" }}>Pipeline Overview</p>
          {stats?.total === 0 ? (
            <EmptyState icon="◈" title="No leads yet" description="Add your first creator"
              action={
                <button onClick={() => onNavigate("discovery")}
                  className="text-sm font-medium" style={{ color: "var(--cr-brand)" }}>
                  Add a creator →
                </button>
              }
            />
          ) : (
            <div className="space-y-2">
              {["New Lead","Reviewed","High Priority","Ready to Contact","Contacted","Replied","Interested","Joined","Not a Fit"].map((status) => {
                const count = statusMap[status] ?? 0;
                const pct = stats?.total ? (count / stats.total) * 100 : 0;
                const barColor = status === "Joined" ? "var(--cr-tier1)" :
                  status === "Not a Fit" ? "var(--cr-tier4)" :
                  status === "High Priority" ? "var(--cr-tier3)" :
                  "var(--cr-brand)";
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-xs w-32 flex-shrink-0" style={{ color: "var(--cr-text-sec)" }}>{status}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--cr-bg-subtle)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <span className="text-xs w-5 text-right" style={{ color: "var(--cr-text-hint)" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Leads */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--cr-text)" }}>Recently Added</p>
            <button onClick={() => onNavigate("leads")} className="text-xs font-medium" style={{ color: "var(--cr-brand)" }}>
              View all →
            </button>
          </div>
          {recentLeads.length === 0 ? (
            <EmptyState icon="+" title="No leads yet" />
          ) : (
            <div className="space-y-1">
              {recentLeads.map((creator) => (
                <div key={creator.id}
                  className="flex items-center gap-3 py-2.5 rounded-lg px-2 cr-card-hover"
                  style={{ borderBottom: "1px solid var(--cr-border)" }}
                >
                  <Avatar name={creator.display_name ?? creator.username} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--cr-text)" }}>@{creator.username}</p>
                    <p className="text-xs truncate" style={{ color: "var(--cr-text-sec)" }}>
                      {creator.niche ?? "Unknown"} · {formatFollowers(creator.followers)}
                    </p>
                  </div>
                  <StatusBadge status={creator.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        <QuickAction icon="⊕" label="Add Creator"   desc="Paste a TikTok URL to analyze"   onClick={() => onNavigate("discovery")} />
        <QuickAction icon="▷" label="Quick Review"  desc="Rapidly evaluate pending leads"   onClick={() => onNavigate("quick-review")} />
        <QuickAction icon="↓" label="Export Leads"  desc="Download leads as Excel"          onClick={() => onNavigate("exports")} />
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function KPICard({ label, value, sub, color, onClick }: {
  label: string; value: number; sub: string;
  color: "brand" | "tier1" | "tier3" | "tier4";
  onClick?: () => void;
}) {
  const colorMap = {
    brand: "var(--cr-brand)",
    tier1: "var(--cr-tier1)",
    tier3: "var(--cr-tier3-text)",
    tier4: "var(--cr-tier4-text)",
  };
  return (
    <div onClick={onClick}
      className={`cr-card p-5 ${onClick ? "cursor-pointer cr-card-hover" : ""}`}
    >
      <p className="text-xs mb-2" style={{ color: "var(--cr-text-sec)" }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color: colorMap[color] }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "var(--cr-text-hint)" }}>{sub}</p>
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick }: { icon: string; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="cr-card p-5 text-left cr-card-hover w-full group transition-all"
      style={{ cursor: "pointer" }}
    >
      <span className="text-xl block mb-3 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--cr-brand)" }}>{icon}</span>
      <p className="text-sm font-semibold" style={{ color: "var(--cr-text)" }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--cr-text-sec)" }}>{desc}</p>
    </button>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: "var(--cr-brand)", fontSize: size < 32 ? "10px" : "12px" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
