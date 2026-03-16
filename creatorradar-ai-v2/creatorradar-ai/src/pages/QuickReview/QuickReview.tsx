import { useState, useEffect, useCallback } from "react";
import type { Creator, CreatorStatus } from "../../types";
import { ScoreBadge, NicheTag, formatFollowers, EmptyState, Spinner, Card } from "../../components/shared";

export default function QuickReview() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ label: string; color: string } | null>(null);

  useEffect(() => { loadPending(); }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const map: Record<string, CreatorStatus> = { "1": "High Priority", "2": "Ready to Contact", s: "Reviewed", n: "Not a Fit" };
    if (map[e.key]) { handleAction(map[e.key]); return; }
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }, [creators, index]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  async function loadPending() {
    setLoading(true);
    const data = await window.creatorRadar.creators.list({ status: "New Lead", sort_by: "date_added", sort_dir: "DESC" });
    setCreators(data);
    setLoading(false);
  }

  async function handleAction(status: CreatorStatus) {
    const creator = creators[index];
    if (!creator) return;
    await window.creatorRadar.creators.updateStatus(creator.id, status);
    const colors: Partial<Record<CreatorStatus, string>> = {
      "High Priority": "var(--cr-tier3)", "Ready to Contact": "var(--cr-tier2)",
      "Reviewed": "var(--cr-text-sec)", "Not a Fit": "var(--cr-tier4)",
    };
    setFeedback({ label: status, color: colors[status] ?? "var(--cr-brand)" });
    setTimeout(() => { setFeedback(null); next(); }, 450);
  }

  function next() { setIndex((i) => Math.min(i + 1, creators.length - 1)); }
  function prev() { setIndex((i) => Math.max(i - 1, 0)); }

  const creator = creators[index];

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (creators.length === 0) return <EmptyState icon="✓" title="All caught up!" description="No new leads to review. Add more creators in Discovery." />;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--cr-text-sec)" }}>{index + 1} / {creators.length} new leads</p>
        <div className="flex gap-1">
          {creators.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === index ? "var(--cr-brand)" : i < index ? "var(--cr-tier1)" : "var(--cr-border)" }} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="cr-card relative overflow-hidden" style={{ padding: 0,
        border: feedback ? `2px solid ${feedback.color}` : "1px solid var(--cr-border)",
        transition: "border-color 0.2s",
      }}>
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-xl font-bold px-6 py-3 rounded-xl"
              style={{ color: feedback.color, background: "rgba(0,0,0,0.06)" }}>
              {feedback.label}
            </span>
          </div>
        )}

        {creator && (
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                  style={{ background: "var(--cr-brand)" }}>
                  {(creator.display_name ?? creator.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold" style={{ color: "var(--cr-text)" }}>@{creator.username}</p>
                  {creator.display_name && <p className="text-sm" style={{ color: "var(--cr-text-sec)" }}>{creator.display_name}</p>}
                </div>
              </div>
              <a href={creator.profile_url} target="_blank" rel="noopener noreferrer"
                className="cr-btn text-xs px-2.5 py-1.5"
                style={{ background: "var(--cr-brand-light)", color: "var(--cr-brand)", border: "1px solid rgba(47,128,237,0.2)" }}>
                Open ↗
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Followers", value: formatFollowers(creator.followers) },
                { label: "Engagement", value: creator.engagement_rate > 0 ? `${creator.engagement_rate.toFixed(1)}%` : "—" },
                { label: "LIVE", value: creator.live_active ? "Active" : "No", accent: creator.live_active },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}>
                  <p className="text-base font-semibold" style={{ color: s.accent ? "var(--cr-tier1)" : "var(--cr-text)" }}>{s.value}</p>
                  <p className="text-2xs mt-0.5" style={{ color: "var(--cr-text-hint)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {(creator.niche || creator.sub_niche) && (
              <div className="flex flex-wrap gap-1.5">
                {creator.niche && <NicheTag label={creator.niche} />}
                {creator.sub_niche && <NicheTag label={creator.sub_niche} />}
                {creator.content_style_tags?.map((t) => <NicheTag key={t} label={t} />)}
              </div>
            )}

            {creator.recruit_score !== null && (
              <div className="flex gap-3">
                <ScoreBadge label="Recruit Score"  value={creator.recruit_score} size="lg" />
                <ScoreBadge label="Recruitability" value={creator.recruitability_score} size="lg" />
                <ScoreBadge label="Growth"         value={creator.growth_score} size="lg" />
              </div>
            )}

            {creator.ai_summary && (
              <div className="rounded-xl p-4" style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}>
                <p className="text-xs font-medium mb-1.5" style={{ color: "var(--cr-text-sec)" }}>AI Summary</p>
                <p className="text-sm" style={{ color: "var(--cr-text)" }}>{creator.ai_summary}</p>
                {creator.outreach_angle && (
                  <>
                    <p className="text-xs font-medium mt-3 mb-1" style={{ color: "var(--cr-text-sec)" }}>Outreach Angle</p>
                    <p className="text-sm" style={{ color: "var(--cr-brand)" }}>{creator.outreach_angle}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 grid grid-cols-4 gap-2" style={{ borderTop: "1px solid var(--cr-border)" }}>
          {[
            { label: "High Priority", key: "[1]", bg: "var(--cr-tier3-bg)", text: "var(--cr-tier3-text)", border: "var(--cr-tier3)", action: "High Priority" as CreatorStatus },
            { label: "Save Lead",     key: "[2]", bg: "var(--cr-tier2-bg)", text: "var(--cr-tier2-text)", border: "var(--cr-tier2)", action: "Ready to Contact" as CreatorStatus },
            { label: "Skip",          key: "[S]", bg: "var(--cr-bg-subtle)", text: "var(--cr-text-sec)", border: "var(--cr-border)", action: "Reviewed" as CreatorStatus },
            { label: "Not a Fit",     key: "[N]", bg: "var(--cr-tier4-bg)", text: "var(--cr-tier4-text)", border: "var(--cr-tier4)", action: "Not a Fit" as CreatorStatus },
          ].map((btn) => (
            <button key={btn.label} onClick={() => handleAction(btn.action)}
              className="flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{ background: btn.bg, color: btn.text, border: `1px solid ${btn.border}` }}>
              <span>{btn.label}</span>
              <span className="text-2xs mt-0.5 opacity-60 font-mono">{btn.key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-between mt-4">
        <button onClick={prev} disabled={index === 0}
          className="text-sm px-3 py-2 disabled:opacity-30 transition-opacity"
          style={{ color: "var(--cr-text-sec)" }}>← Previous [←]</button>
        <button onClick={next} disabled={index >= creators.length - 1}
          className="text-sm px-3 py-2 disabled:opacity-30 transition-opacity"
          style={{ color: "var(--cr-text-sec)" }}>Next [→] →</button>
      </div>

      {/* Keyboard guide */}
      <div className="mt-4 cr-card p-4">
        <p className="text-xs font-medium mb-2.5" style={{ color: "var(--cr-text-sec)" }}>Keyboard shortcuts</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {[["1","High Priority"],["2","Ready to Contact"],["S","Skip / Reviewed"],["N","Not a Fit"],["→","Next creator"],["←","Previous"]].map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="text-2xs px-1.5 py-0.5 rounded font-mono"
                style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)", color: "var(--cr-text-sec)" }}>
                {key}
              </kbd>
              <span className="text-xs" style={{ color: "var(--cr-text-hint)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
