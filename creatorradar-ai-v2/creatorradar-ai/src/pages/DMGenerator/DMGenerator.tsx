import { useState, useEffect } from "react";
import type { Creator, DMTone } from "../../types";
import { DM_TONES } from "../../types";
import { formatFollowers, Spinner, Card } from "../../components/shared";

interface DMGeneratorProps {
  initialCreatorId?: number | null;
}

const TONE_DESC: Record<DMTone, string> = {
  Warm: "Personal, genuine, knows their content",
  Professional: "Business-focused, highlights opportunity",
  Friendly: "Casual, like a peer reaching out",
  Direct: "Brief, gets to the point fast",
  Encouraging: "Uplifting, acknowledges talent first",
};

export default function DMGenerator({ initialCreatorId }: DMGeneratorProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialCreatorId ?? null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [tone, setTone] = useState<DMTone>("Warm");
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<{ id: number; tone: string; draft_text: string; created_at: string }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => { loadCreators(); }, []);
  useEffect(() => { if (selectedId) loadCreator(selectedId); }, [selectedId]);

  async function loadCreators() {
    const data = await window.creatorRadar.creators.list({ sort_by: "date_added", sort_dir: "DESC" });
    setCreators(data);
    if (!selectedId && data.length > 0) setSelectedId(data[0].id);
  }

  async function loadCreator(id: number) {
    const creator = await window.creatorRadar.creators.get(id);
    setSelectedCreator(creator);
    const drafts = await window.creatorRadar.ai.getDrafts(id);
    setSavedDrafts(drafts);
    setDraft("");
  }

  async function handleGenerate() {
    if (!selectedId) return;
    setGenerating(true); setError(""); setDraft("");
    const result = await window.creatorRadar.ai.generateDM(selectedId, tone);
    if ("error" in result) setError(result.error);
    else setDraft(result.draft);
    setGenerating(false);
  }

  async function handleSave() {
    if (!selectedId || !draft) return;
    setSaving(true);
    await window.creatorRadar.ai.saveDraft(selectedId, tone, draft);
    const drafts = await window.creatorRadar.ai.getDrafts(selectedId);
    setSavedDrafts(drafts);
    setSaving(false);
  }

  async function handleCopy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Creator selector */}
          <Card>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--cr-text-sec)" }}>Select Creator</p>
            <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))} className="cr-input text-sm">
              <option value="">Choose creator…</option>
              {creators.map((c) => <option key={c.id} value={c.id}>@{c.username} — {c.niche ?? "No niche"}</option>)}
            </select>
            {selectedCreator && (
              <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: "1px solid var(--cr-border)" }}>
                {[
                  ["Followers", formatFollowers(selectedCreator.followers)],
                  ["Niche", selectedCreator.niche ?? "—"],
                  ["Recruit Score", selectedCreator.recruit_score !== null ? String(selectedCreator.recruit_score) : "Not scored"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span style={{ color: "var(--cr-text-sec)" }}>{k}</span>
                    <span style={{ color: "var(--cr-text)" }}>{v}</span>
                  </div>
                ))}
                <a href={selectedCreator.profile_url} target="_blank" rel="noopener noreferrer"
                  className="block text-xs mt-2 font-medium" style={{ color: "var(--cr-brand)" }}>
                  Open TikTok profile ↗
                </a>
              </div>
            )}
          </Card>

          {/* Tone selector */}
          <Card>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--cr-text-sec)" }}>Message Tone</p>
            <div className="space-y-1">
              {DM_TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: tone === t ? "var(--cr-brand-light)" : "transparent",
                    color: tone === t ? "var(--cr-brand)" : "var(--cr-text-sec)",
                    border: `1px solid ${tone === t ? "rgba(47,128,237,0.3)" : "transparent"}`,
                    fontWeight: tone === t ? 500 : 400,
                  }}>
                  <span>{t}</span>
                  <span className="block text-xs mt-0.5 opacity-70">{TONE_DESC[t]}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Generator */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: "var(--cr-text)" }}>
                {selectedCreator ? `DM for @${selectedCreator.username}` : "Select a creator"}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "var(--cr-brand-light)", color: "var(--cr-brand)" }}>
                {tone}
              </span>
            </div>

            {error && (
              <div className="rounded-lg p-3 mb-4" style={{ background: "var(--cr-tier4-bg)", border: "1px solid var(--cr-tier4)" }}>
                <p className="text-sm" style={{ color: "var(--cr-tier4-text)" }}>{error}</p>
              </div>
            )}

            <div className="relative">
              {generating ? (
                <div className="flex flex-col items-center justify-center h-36 rounded-xl"
                  style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}>
                  <Spinner />
                  <p className="text-xs mt-2" style={{ color: "var(--cr-text-sec)" }}>Generating personalized DM…</p>
                </div>
              ) : (
                <textarea value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={selectedCreator ? `Click "Generate DM" to create a ${tone.toLowerCase()} message for @${selectedCreator.username}…` : "Select a creator first…"}
                  rows={7}
                  className="cr-input resize-none"
                  style={{ borderRadius: "10px", lineHeight: "1.6" }}
                  data-selectable
                />
              )}
            </div>

            {draft && (
              <p className="text-xs mt-1.5 text-right" style={{ color: "var(--cr-text-hint)" }}>
                {draft.length} chars · {draft.split(/\s+/).filter(Boolean).length} words
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={handleGenerate} disabled={!selectedId || generating}
                className="cr-btn cr-btn-primary flex-1 py-2.5">
                {generating ? "Generating…" : draft ? "Regenerate" : "Generate DM"}
              </button>
              {draft && (
                <>
                  <button onClick={handleCopy}
                    className="cr-btn cr-btn-ghost px-4 py-2.5">
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="cr-btn px-4 py-2.5"
                    style={{ background: "var(--cr-tier1-bg)", color: "var(--cr-tier1-text)", border: "1px solid var(--cr-tier1)" }}>
                    {saving ? "Saving…" : "Save Draft"}
                  </button>
                </>
              )}
            </div>

            <p className="text-xs mt-3" style={{ color: "var(--cr-text-hint)" }}>
              ℹ Review and edit before sending. Copy to clipboard, then paste into TikTok manually.
            </p>
          </Card>

          {savedDrafts.length > 0 && (
            <Card>
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--cr-text)" }}>Saved Drafts</p>
              <div className="space-y-2">
                {savedDrafts.slice(0, 5).map((d) => (
                  <div key={d.id} onClick={() => setDraft(d.draft_text)}
                    className="rounded-xl p-3 cursor-pointer transition-all cr-card-hover"
                    style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: "var(--cr-brand)" }}>{d.tone}</span>
                      <span className="text-2xs" style={{ color: "var(--cr-text-hint)" }}>
                        {new Date(d.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: "var(--cr-text-sec)" }}>{d.draft_text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
