import { useState } from "react";
import type { Creator } from "../../types";
import { ScoreBadge, NicheTag, Spinner, Card } from "../../components/shared";

interface DiscoveryProps {
  onCreatorAdded: () => void;
}

type Step = "url" | "form" | "scoring" | "done";

const STEPS = ["Enter URL", "Creator Details", "AI Analysis", "Done"];

export default function Discovery({ onCreatorAdded }: DiscoveryProps) {
  const [step, setStep] = useState<Step>("url");
  const [profileUrl, setProfileUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [formData, setFormData] = useState<Partial<Creator>>({ status: "New Lead", live_active: false, followers: 0, engagement_rate: 0 });
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<null | {
    recruit_score: { value: number; reasoning: string };
    recruitability_score: { value: number; reasoning: string };
    growth_score: { value: number; reasoning: string };
    ai_summary: string; outreach_angle: string;
    content_style_tags: string[]; live_potential: string;
  }>(null);
  const [saving, setSaving] = useState(false);

  const stepIndex = ["url","form","scoring","done"].indexOf(step);

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = profileUrl.trim();
    if (!url.includes("tiktok.com/@")) {
      setUrlError("Please enter a valid TikTok profile URL (e.g. https://www.tiktok.com/@username)");
      return;
    }
    const username = url.split("@")[1]?.split("?")[0]?.split("/")[0] ?? "";
    setFormData((p) => ({ ...p, profile_url: url, username }));
    setUrlError("");
    setStep("form");
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setScoring(true);
    setStep("scoring");
    const agencyNiche = await window.creatorRadar.settings.get("agency_niche_focus");
    const result = await window.creatorRadar.ai.scoreCreator({ ...formData, agency_niche: agencyNiche ?? undefined });
    if ("error" in result) {
      setScoreResult(null);
    } else {
      setScoreResult(result.data);
      setFormData((p) => ({
        ...p,
        recruit_score: result.data.recruit_score.value,
        recruitability_score: result.data.recruitability_score.value,
        growth_score: result.data.growth_score.value,
        ai_summary: result.data.ai_summary,
        outreach_angle: result.data.outreach_angle,
        content_style_tags: result.data.content_style_tags,
        live_potential: result.data.live_potential as Creator["live_potential"],
      }));
    }
    setScoring(false);
  }

  async function handleSave() {
    setSaving(true);
    await window.creatorRadar.creators.add(formData);
    setSaving(false);
    setStep("done");
  }

  function handleReset() {
    setStep("url"); setProfileUrl("");
    setFormData({ status: "New Lead", live_active: false, followers: 0, engagement_rate: 0 });
    setScoreResult(null);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-7">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: i === stepIndex ? "var(--cr-brand)" : i < stepIndex ? "var(--cr-tier1)" : "var(--cr-bg-subtle)",
                  color: i <= stepIndex ? "#fff" : "var(--cr-text-hint)",
                }}>
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <span className="text-xs hidden sm:inline" style={{ color: i === stepIndex ? "var(--cr-text)" : "var(--cr-text-hint)" }}>
                {label}
              </span>
            </div>
            {i < 3 && <div className="w-8 h-px" style={{ background: "var(--cr-border)" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: URL */}
      {step === "url" && (
        <Card>
          <h2 className="text-base font-semibold mb-1" style={{ color: "var(--cr-text)" }}>Add a TikTok Creator</h2>
          <p className="text-sm mb-5" style={{ color: "var(--cr-text-sec)" }}>
            Paste a profile URL. No login or scraping — you'll enter details manually.
          </p>
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--cr-text-sec)" }}>TikTok Profile URL</label>
              <input type="url" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@username" className="cr-input" autoFocus />
              {urlError && <p className="text-xs mt-1.5" style={{ color: "var(--cr-tier4-text)" }}>{urlError}</p>}
            </div>
            <button type="submit" className="cr-btn cr-btn-primary w-full py-2.5">Continue →</button>
          </form>
        </Card>
      )}

      {/* Step 2: Form */}
      {step === "form" && (
        <form onSubmit={handleFormSubmit}>
          <Card>
            <h2 className="text-base font-semibold mb-1" style={{ color: "var(--cr-text)" }}>Creator Details</h2>
            <p className="text-sm mb-5" style={{ color: "var(--cr-text-sec)" }}>
              Fill in details for <span style={{ color: "var(--cr-brand)", fontWeight: 500 }}>@{formData.username}</span>.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username *">
                <input required value={formData.username ?? ""} onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))} className="cr-input" />
              </Field>
              <Field label="Display Name">
                <input value={formData.display_name ?? ""} onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))} className="cr-input" />
              </Field>
              <Field label="Niche">
                <input value={formData.niche ?? ""} placeholder="e.g. Fitness, Beauty" onChange={(e) => setFormData((p) => ({ ...p, niche: e.target.value }))} className="cr-input" />
              </Field>
              <Field label="Sub-niche">
                <input value={formData.sub_niche ?? ""} placeholder="e.g. Home Workouts" onChange={(e) => setFormData((p) => ({ ...p, sub_niche: e.target.value }))} className="cr-input" />
              </Field>
              <Field label="Followers">
                <input type="number" min={0} value={formData.followers ?? 0} onChange={(e) => setFormData((p) => ({ ...p, followers: Number(e.target.value) }))} className="cr-input" />
              </Field>
              <Field label="Engagement Rate (%)">
                <input type="number" min={0} step={0.1} value={formData.engagement_rate ?? 0} onChange={(e) => setFormData((p) => ({ ...p, engagement_rate: Number(e.target.value) }))} className="cr-input" />
              </Field>
              <Field label="Posting Frequency">
                <select value={formData.posting_frequency ?? ""} onChange={(e) => setFormData((p) => ({ ...p, posting_frequency: e.target.value }))} className="cr-input">
                  <option value="">Select…</option>
                  <option>Multiple times daily</option>
                  <option>Daily</option>
                  <option>3-5x per week</option>
                  <option>1-2x per week</option>
                  <option>A few times a month</option>
                  <option>Irregular</option>
                </select>
              </Field>
              <Field label="Campaign Tag">
                <input value={formData.campaign_tag ?? ""} placeholder="Optional" onChange={(e) => setFormData((p) => ({ ...p, campaign_tag: e.target.value }))} className="cr-input" />
              </Field>
            </div>
            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <input type="checkbox" checked={formData.live_active ?? false}
                onChange={(e) => setFormData((p) => ({ ...p, live_active: e.target.checked }))}
                className="w-4 h-4" style={{ accentColor: "var(--cr-brand)" }} />
              <span className="text-sm" style={{ color: "var(--cr-text)" }}>Creator is active on LIVE</span>
            </label>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setStep("url")} className="cr-btn cr-btn-ghost px-4 py-2.5">← Back</button>
              <button type="submit" className="cr-btn cr-btn-primary flex-1 py-2.5">Analyze with AI →</button>
            </div>
          </Card>
        </form>
      )}

      {/* Step 3: Scoring */}
      {step === "scoring" && (
        <Card>
          {scoring ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Spinner size="lg" />
              <p className="text-sm" style={{ color: "var(--cr-text-sec)" }}>Analyzing @{formData.username}…</p>
              <p className="text-xs" style={{ color: "var(--cr-text-hint)" }}>Scoring recruit fit, recruitability, and growth potential</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold mb-1" style={{ color: "var(--cr-text)" }}>AI Analysis Complete</h2>
                <p className="text-sm" style={{ color: "var(--cr-text-sec)" }}>Review scores and insights before saving.</p>
              </div>
              {scoreResult ? (
                <>
                  <div className="flex gap-3">
                    <ScoreBadge label="Recruit Score"   value={scoreResult.recruit_score.value} size="lg" />
                    <ScoreBadge label="Recruitability"  value={scoreResult.recruitability_score.value} size="lg" />
                    <ScoreBadge label="Growth"          value={scoreResult.growth_score.value} size="lg" />
                  </div>
                  <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--cr-text-sec)" }}>AI Summary</p>
                      <p className="text-sm" style={{ color: "var(--cr-text)" }}>{scoreResult.ai_summary}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--cr-text-sec)" }}>Suggested Outreach Angle</p>
                      <p className="text-sm" style={{ color: "var(--cr-brand)" }}>{scoreResult.outreach_angle}</p>
                    </div>
                    {scoreResult.content_style_tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {scoreResult.content_style_tags.map((tag) => <NicheTag key={tag} label={tag} />)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Recruit Score reasoning", text: scoreResult.recruit_score.reasoning },
                      { label: "Recruitability reasoning", text: scoreResult.recruitability_score.reasoning },
                      { label: "Growth reasoning", text: scoreResult.growth_score.reasoning },
                    ].map((r) => (
                      <details key={r.label} className="rounded-lg" style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}>
                        <summary className="px-4 py-2.5 text-xs cursor-pointer" style={{ color: "var(--cr-text-sec)" }}>{r.label}</summary>
                        <p className="px-4 pb-3 text-sm" style={{ color: "var(--cr-text)" }}>{r.text}</p>
                      </details>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl p-4" style={{ background: "var(--cr-tier3-bg)", border: "1px solid var(--cr-tier3)" }}>
                  <p className="text-sm" style={{ color: "var(--cr-tier3-text)" }}>
                    No API key configured — creator will be saved without AI scores. Add your Anthropic API key in Settings.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep("form")} className="cr-btn cr-btn-ghost px-4 py-2.5">← Edit</button>
                <button onClick={handleSave} disabled={saving} className="cr-btn flex-1 py-2.5"
                  style={{ background: "var(--cr-tier1)", color: "#fff" }}>
                  {saving ? "Saving…" : "Save to Leads ✓"}
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "var(--cr-tier1-bg)", color: "var(--cr-tier1)" }}>✓</div>
            <h2 className="text-base font-semibold mb-2" style={{ color: "var(--cr-text)" }}>@{formData.username} added!</h2>
            <p className="text-sm mb-6" style={{ color: "var(--cr-text-sec)" }}>Creator saved and ready for outreach.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleReset} className="cr-btn cr-btn-ghost px-5 py-2.5">Add Another</button>
              <button onClick={onCreatorAdded} className="cr-btn cr-btn-primary px-5 py-2.5">View All Leads →</button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs block mb-1.5 font-medium" style={{ color: "var(--cr-text-sec)" }}>{label}</label>
      {children}
    </div>
  );
}
