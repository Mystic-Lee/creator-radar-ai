import { useState, useEffect } from "react";
import { useTheme, type ThemeMode } from "../../context/ThemeContext";
import { Card } from "../../components/shared";

export default function Settings() {
  const { mode, setMode } = useTheme();
  const [settings, setSettings] = useState({
    anthropic_api_key: "", agency_name: "", agency_niche_focus: "",
    recruiter_name: "", default_dm_tone: "Warm",
  });
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    const all = await window.creatorRadar.settings.getAll();
    setSettings({
      anthropic_api_key: all.anthropic_api_key ?? "",
      agency_name: all.agency_name ?? "",
      agency_niche_focus: all.agency_niche_focus ?? "",
      recruiter_name: all.recruiter_name ?? "",
      default_dm_tone: all.default_dm_tone ?? "Warm",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await window.creatorRadar.settings.set(key, value);
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const THEMES: { value: ThemeMode; label: string; icon: string; desc: string }[] = [
    { value: "light", label: "Light", icon: "☀", desc: "Always light interface" },
    { value: "dark",  label: "Dark",  icon: "☾", desc: "Always dark interface" },
    { value: "auto",  label: "Auto",  icon: "⊙", desc: "Follows your OS setting" },
  ];

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSave} className="space-y-4">

        {/* Theme */}
        <Card>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--cr-text)" }}>Appearance</p>
          <p className="text-xs mb-4" style={{ color: "var(--cr-text-sec)" }}>Choose how CreatorRadar looks on your screen.</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button key={t.value} type="button" onClick={() => setMode(t.value)}
                className="rounded-xl p-3 text-center transition-all"
                style={{
                  background: mode === t.value ? "var(--cr-brand-light)" : "var(--cr-bg-subtle)",
                  border: `2px solid ${mode === t.value ? "var(--cr-brand)" : "var(--cr-border)"}`,
                  color: mode === t.value ? "var(--cr-brand)" : "var(--cr-text-sec)",
                }}>
                <span className="text-2xl block mb-1.5">{t.icon}</span>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-2xs mt-0.5 opacity-70">{t.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* AI Config */}
        <Card>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--cr-text)" }}>AI Configuration</p>
          <p className="text-xs mb-4" style={{ color: "var(--cr-text-sec)" }}>Connect CreatorRadar to Claude AI for scoring and DM generation.</p>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--cr-text-sec)" }}>Anthropic API Key</label>
            <div className="relative">
              <input type={showKey ? "text" : "password"} value={settings.anthropic_api_key}
                onChange={(e) => setSettings((p) => ({ ...p, anthropic_api_key: e.target.value }))}
                placeholder="sk-ant-…" className="cr-input pr-16" data-selectable />
              <button type="button" onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: "var(--cr-brand)" }}>
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--cr-text-hint)" }}>
              Get your key at{" "}
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--cr-brand)" }}>console.anthropic.com</a>.
              Stored locally only.
            </p>
          </div>
        </Card>

        {/* Agency */}
        <Card>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--cr-text)" }}>Agency Profile</p>
          <p className="text-xs mb-4" style={{ color: "var(--cr-text-sec)" }}>Personalizes AI scoring and DM generation.</p>
          <div className="space-y-4">
            {[
              { key: "recruiter_name", label: "Recruiter Name", ph: "Your name" },
              { key: "agency_name", label: "Agency Name", ph: "Your agency name" },
              { key: "agency_niche_focus", label: "Niche Focus", ph: "e.g. Fitness, Lifestyle, Beauty" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--cr-text-sec)" }}>{f.label}</label>
                <input value={(settings as Record<string,string>)[f.key]}
                  onChange={(e) => setSettings((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.ph} className="cr-input" />
              </div>
            ))}
          </div>
        </Card>

        {/* Defaults */}
        <Card>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--cr-text)" }}>Defaults</p>
          <div className="mt-3">
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--cr-text-sec)" }}>Default DM Tone</label>
            <select value={settings.default_dm_tone}
              onChange={(e) => setSettings((p) => ({ ...p, default_dm_tone: e.target.value }))}
              className="cr-input text-sm">
              {["Warm","Professional","Friendly","Direct","Encouraging"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </Card>

        <button type="submit" disabled={saving} className="cr-btn cr-btn-primary w-full py-3 text-sm font-medium">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
