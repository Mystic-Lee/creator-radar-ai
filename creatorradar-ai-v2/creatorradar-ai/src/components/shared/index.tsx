import type { CreatorStatus } from "../../types";

// ─── Score helpers ──────────────────────────────────────────────────

function scoreClass(v: number | null): string {
  if (v === null) return "";
  if (v >= 75) return "cr-score-high";
  if (v >= 50) return "cr-score-mid";
  if (v >= 30) return "cr-score-review";
  return "cr-score-low";
}

function scoreDotColor(v: number | null): string {
  if (v === null) return "var(--cr-text-hint)";
  if (v >= 75) return "var(--cr-tier1)";
  if (v >= 50) return "var(--cr-tier2)";
  if (v >= 30) return "var(--cr-tier3)";
  return "var(--cr-tier4)";
}

// ─── Score Badge ────────────────────────────────────────────────────

interface ScoreBadgeProps {
  label: string;
  value: number | null;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ label, value, size = "md" }: ScoreBadgeProps) {
  const cls = scoreClass(value);
  const pad = size === "sm" ? "px-2 py-0.5" : size === "lg" ? "px-4 py-2" : "px-3 py-1";
  const numSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <div
      className={`flex flex-col items-center rounded-xl ${cls} ${pad}`}
      style={
        !cls
          ? { background: "var(--cr-bg-subtle)", color: "var(--cr-text-hint)" }
          : undefined
      }
    >
      <span className={`font-bold ${numSize} leading-tight`}>
        {value !== null ? value : "—"}
      </span>
      <span className="text-2xs mt-0.5 whitespace-nowrap opacity-80">{label}</span>
    </div>
  );
}

// ─── Score Ring ─────────────────────────────────────────────────────

export function ScoreRing({
  value,
  size = 48,
  strokeWidth = 4,
}: {
  value: number | null;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = value !== null ? (value / 100) * circ : 0;
  const color = scoreDotColor(value);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--cr-bg-subtle)" strokeWidth={strokeWidth}/>
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - filled}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="central"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${size/2}px ${size/2}px`,
          fontSize: size < 40 ? "10px" : "12px",
          fontWeight: 600,
          fill: color,
        }}
      >
        {value ?? "—"}
      </text>
    </svg>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────

const STATUS_THEME: Record<string, { bg: string; text: string }> = {
  "New Lead":          { bg: "var(--cr-tier2-bg)",   text: "var(--cr-tier2-text)" },
  "Reviewed":          { bg: "var(--cr-bg-subtle)",  text: "var(--cr-text-sec)" },
  "High Priority":     { bg: "rgba(242,201,76,0.15)", text: "var(--cr-tier3-text)" },
  "Ready to Contact":  { bg: "rgba(47,128,237,0.12)", text: "var(--cr-brand)" },
  "Contacted":         { bg: "rgba(139,92,246,0.12)", text: "#7C3AED" },
  "Replied":           { bg: "rgba(45,156,219,0.15)", text: "var(--cr-tier2-text)" },
  "Interested":        { bg: "var(--cr-tier1-bg)",   text: "var(--cr-tier1-text)" },
  "Joined":            { bg: "var(--cr-tier1-bg)",   text: "var(--cr-tier1-text)" },
  "Not a Fit":         { bg: "var(--cr-tier4-bg)",   text: "var(--cr-tier4-text)" },
};

export function StatusBadge({ status, size = "md" }: { status: CreatorStatus; size?: "sm" | "md" }) {
  const theme = STATUS_THEME[status] ?? { bg: "var(--cr-bg-subtle)", text: "var(--cr-text-sec)" };
  const pad = size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${pad}`}
      style={{ background: theme.bg, color: theme.text }}
    >
      {status}
    </span>
  );
}

// ─── Niche Tag ──────────────────────────────────────────────────────

export function NicheTag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center text-2xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: "var(--cr-brand-light)", color: "var(--cr-brand-text)" }}
    >
      {label}
    </span>
  );
}

// ─── Follower formatter ─────────────────────────────────────────────

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ─── Empty State ────────────────────────────────────────────────────

export function EmptyState({
  icon, title, description, action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ background: "var(--cr-bg-subtle)" }}
        >
          {icon}
        </div>
      )}
      <p className="font-medium mb-1" style={{ color: "var(--cr-text)" }}>{title}</p>
      {description && (
        <p className="text-sm mb-4 max-w-xs" style={{ color: "var(--cr-text-sec)" }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ─── Spinner ────────────────────────────────────────────────────────

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? 16 : size === "lg" ? 32 : 20;
  return (
    <svg
      width={s} height={s} viewBox="0 0 24 24"
      fill="none" stroke="var(--cr-brand)" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
  );
}

// ─── Section Header ─────────────────────────────────────────────────

export function SectionHeader({
  title, subtitle, actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--cr-text)" }}>{title}</h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--cr-text-sec)" }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Card wrapper ───────────────────────────────────────────────────

export function Card({
  children, className = "", padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={`cr-card ${padding ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
