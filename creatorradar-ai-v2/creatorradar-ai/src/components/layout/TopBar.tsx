import { useState } from "react";
import type { Page } from "../../App";
import { useTheme, type ThemeMode } from "../../context/ThemeContext";

interface TopBarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const PAGE_TITLES: Record<Page, string> = {
  dashboard:      "Dashboard",
  discovery:      "Creator Discovery",
  leads:          "Lead CRM",
  "quick-review": "Quick Review",
  "dm-generator": "DM Generator",
  exports:        "Exports",
  settings:       "Settings",
  help:           "Help & User Guide",
};

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀" },
  { value: "dark",  label: "Dark",  icon: "☾" },
  { value: "auto",  label: "Auto",  icon: "⊙" },
];

export default function TopBar({ activePage, onNavigate }: TopBarProps) {
  const [search, setSearch] = useState("");
  const { mode, setMode } = useTheme();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) onNavigate("leads");
  }

  return (
    <header
      className="h-14 flex-shrink-0 flex items-center gap-4 px-5"
      style={{
        background: "var(--cr-bg-card)",
        borderBottom: "1px solid var(--cr-border)",
        boxShadow: "var(--cr-shadow)",
      }}
    >
      {/* Page title */}
      <h1
        className="text-sm font-semibold w-36 flex-shrink-0"
        style={{ color: "var(--cr-text)" }}
      >
        {PAGE_TITLES[activePage]}
      </h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            width="14" height="14" viewBox="0 0 14 14"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            style={{ color: "var(--cr-text-hint)" }}
          >
            <circle cx="6" cy="6" r="4.5"/>
            <line x1="9.5" y1="9.5" x2="13" y2="13"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators, niches…"
            className="cr-input pl-8 py-1.5 text-xs"
            style={{ height: "32px" }}
          />
        </div>
      </form>

      <div className="flex-1" />

      {/* Theme toggle */}
      <div
        className="flex items-center rounded-lg p-0.5 gap-0.5"
        style={{ background: "var(--cr-bg-subtle)", border: "1px solid var(--cr-border)" }}
      >
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            title={opt.label + " mode"}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150"
            style={
              mode === opt.value
                ? {
                    background: "var(--cr-brand)",
                    color: "#fff",
                    boxShadow: "0 1px 3px rgba(47,128,237,0.4)",
                  }
                : { color: "var(--cr-text-sec)", background: "transparent" }
            }
          >
            <span style={{ fontSize: "11px" }}>{opt.icon}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Add Creator */}
      <button
        onClick={() => onNavigate("discovery")}
        className="cr-btn cr-btn-primary no-drag text-xs px-3 py-1.5"
        style={{ height: "32px" }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
        </svg>
        Add Creator
      </button>

      {/* User avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ background: "var(--cr-brand)" }}
      >
        R
      </div>
    </header>
  );
}
