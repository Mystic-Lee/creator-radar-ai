import type { Page } from "../../App";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: JSX.Element;
}

// Inline SVG icons — clean 16×16 strokes
const Icons = {
  dashboard:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  discovery:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="15" y2="15"/></svg>,
  leads:        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  quickreview:  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8l3 3 7-7"/></svg>,
  dm:           <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3l3 3 3-3h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/></svg>,
  exports:      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1v9M4 6l4 4 4-4"/><path d="M2 12v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2"/></svg>,
  settings:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
  help:         <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="7"/><path d="M6 6a2 2 0 1 1 2.5 1.9c-.6.2-1 .7-1 1.4V10"/><circle cx="8" cy="12.5" r="0.5" fill="currentColor"/></svg>,
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",    label: "Dashboard",     icon: Icons.dashboard },
  { id: "discovery",    label: "Discovery",     icon: Icons.discovery },
  { id: "leads",        label: "Leads",         icon: Icons.leads },
  { id: "quick-review", label: "Quick Review",  icon: Icons.quickreview },
  { id: "dm-generator", label: "DM Generator",  icon: Icons.dm },
  { id: "exports",      label: "Exports",       icon: Icons.exports },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings", icon: Icons.settings },
  { id: "help",     label: "Help",     icon: Icons.help },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="w-[210px] flex-shrink-0 flex flex-col"
      style={{ background: "var(--cr-sidebar-bg)", borderRight: "1px solid var(--cr-sidebar-border)" }}
    >
      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: "1px solid var(--cr-sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "var(--cr-brand)" }}
          >
            CR
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: "var(--cr-sidebar-text-act)" }}>
              CreatorRadar
            </p>
            <p className="text-xs leading-tight" style={{ color: "var(--cr-sidebar-text)", opacity: 0.6 }}>
              AI Recruiter
            </p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activePage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 space-y-0.5" style={{ borderTop: "1px solid var(--cr-sidebar-border)" }}>
        {BOTTOM_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activePage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>

      {/* Version */}
      <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--cr-sidebar-border)" }}>
        <p className="text-xs" style={{ color: "var(--cr-sidebar-text)", opacity: 0.4 }}>v1.0.0</p>
      </div>
    </aside>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-150"
      style={{
        background: active ? "var(--cr-sidebar-act)" : "transparent",
        color: active ? "var(--cr-sidebar-text-act)" : "var(--cr-sidebar-text)",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--cr-sidebar-hov)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span className="flex-shrink-0" style={{ opacity: active ? 1 : 0.65 }}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {active && (
        <span
          className="w-1 h-4 rounded-full flex-shrink-0"
          style={{ background: "var(--cr-sidebar-accent)" }}
        />
      )}
    </button>
  );
}
