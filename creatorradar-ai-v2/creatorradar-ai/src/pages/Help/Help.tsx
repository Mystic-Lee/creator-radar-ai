import { Card } from "../../components/shared";

const sections = [
  {
    id: "getting-started", title: "Getting Started",
    items: [
      { h: "1. Configure your API key", b: "Go to Settings and enter your Anthropic API key. This enables AI-powered scoring and DM generation. Your key is stored locally and only used to contact the Anthropic API." },
      { h: "2. Set your agency profile", b: "In Settings, add your agency name, your name, and your niche focus (e.g. 'Fitness, Beauty'). This helps the AI tailor scores and outreach angles to your recruiting goals." },
      { h: "3. Add your first creator", b: "Click 'Add Creator' or go to Discovery. Paste a TikTok profile URL, fill in the creator's details, and click Analyze. The AI will score the creator and generate insights." },
    ],
  },
  {
    id: "scoring", title: "How Scoring Works",
    items: [
      { h: "Recruit Score (0–100)", b: "How well this creator fits your agency's goals. 80+ is a strong match for your niche focus, audience size preferences, and content style." },
      { h: "Recruitability Score (0–100)", b: "How likely the creator is to respond positively to outreach. Micro creators are often more responsive; high engagement boosts this score." },
      { h: "Growth Potential Score (0–100)", b: "How likely the creator is to grow significantly in the next 6–12 months, based on posting frequency, niche trends, and LIVE activity." },
    ],
  },
  {
    id: "quick-review", title: "Quick Review Mode",
    items: [
      { h: "What it does", b: "Quick Review shows all 'New Lead' creators one at a time. Rapidly categorize each without navigating a table." },
      { h: "Keyboard shortcuts", b: "Press 1 = High Priority, 2 = Ready to Contact, S = Skip, N = Not a Fit. Arrow keys navigate. Review dozens per minute." },
    ],
  },
  {
    id: "dm-generator", title: "DM Generator",
    items: [
      { h: "How to generate a DM", b: "Select a creator, choose a tone, and click Generate DM. The AI writes a personalized message using the creator's niche, style, and AI summary." },
      { h: "Editing and sending", b: "Always review and edit before sending. Click Copy, then paste into TikTok's DM interface manually. CreatorRadar never sends messages automatically." },
    ],
  },
  {
    id: "export", title: "Exporting Leads",
    items: [
      { h: "Excel export", b: "Go to Exports, optionally filter by status or date range, and click Export. A save dialog appears. The spreadsheet includes all creator data, scores, notes, and DM drafts." },
      { h: "Spreadsheet structure", b: "Two sheets: 'Creator Leads' with all records and auto-filter enabled, and a 'Summary' sheet with pipeline counts by status." },
    ],
  },
  {
    id: "troubleshooting", title: "Troubleshooting",
    items: [
      { h: "AI scoring isn't working", b: "Check your Anthropic API key in Settings. It should start with 'sk-ant-'. Verify you have API credits at console.anthropic.com." },
      { h: "Where is my data stored?", b: "All data is stored locally in a SQLite database. Windows: %APPDATA%\\CreatorRadar AI\\. macOS: ~/Library/Application Support/CreatorRadar AI/." },
    ],
  },
];

export default function Help() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="rounded-xl p-4"
        style={{ background: "var(--cr-brand-light)", border: "1px solid rgba(47,128,237,0.2)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--cr-brand)" }}>CreatorRadar AI — User Guide</p>
        <p className="text-xs" style={{ color: "var(--cr-brand-text)" }}>
          CreatorRadar AI helps you discover, score, and manage TikTok creator leads. All TikTok outreach is done manually — this software organizes your workflow.
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.id}>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--cr-text)" }}>{section.title}</p>
          <div className="space-y-4">
            {section.items.map((item) => (
              <div key={item.h}>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--cr-brand)" }}>{item.h}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--cr-text-sec)" }}>{item.b}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="text-center pb-4">
        <p className="text-xs" style={{ color: "var(--cr-text-hint)" }}>CreatorRadar AI v1.0.0</p>
      </div>
    </div>
  );
}
