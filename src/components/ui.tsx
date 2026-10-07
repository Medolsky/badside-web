import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";

/* Shared building blocks so every page follows the Ophelia Duty look:
   black surfaces, one red accent, green only for "online". */

export const input =
  "w-full bg-[#080808] border border-[#252525] focus:border-[#E50914] text-xs text-white placeholder-neutral-500 px-3 py-2.5 rounded-xl outline-none transition";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#FF1E2D] active:scale-[0.98] text-white text-xs font-bold glow-red-sm transition disabled:opacity-40 disabled:pointer-events-none";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#161616] hover:bg-[#1f1f1f] border border-[#252525] text-neutral-300 hover:text-white text-xs font-semibold transition disabled:opacity-40 disabled:pointer-events-none";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  back,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition">
          <ChevronLeft className="h-3.5 w-3.5" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="h-11 w-11 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-[#FF1E2D]" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function Card({
  title,
  icon: Icon,
  action,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}: {
  title?: React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-2xl bg-[#111111] border border-[#222] overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#1f1f1f]">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white min-w-0">
            {Icon && <Icon className="h-4 w-4 text-[#FF1E2D] shrink-0" />}
            <span className="truncate">{title}</span>
          </h2>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: "neutral" | "red" | "green" | "amber";
}) {
  const toneCls = {
    neutral: "text-white",
    red: "text-[#FF1E2D]",
    green: "text-green-400",
    amber: "text-amber-400",
  }[tone];
  const iconBg = {
    neutral: "bg-[#1a1a1a] text-neutral-300 border-[#2a2a2a]",
    red: "bg-[#E50914]/10 text-[#FF1E2D] border-[#E50914]/30",
    green: "bg-green-500/10 text-green-400 border-green-500/25",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  }[tone];
  return (
    <div className="rounded-2xl bg-[#111111] border border-[#222] p-4 sm:p-5 flex items-start justify-between gap-3 hover:border-[#333] transition">
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{label}</div>
        <div className={`text-2xl sm:text-3xl font-bold mt-1.5 font-mono-telemetry ${toneCls}`}>{value}</div>
        {hint && <div className="text-[11px] text-neutral-500 mt-1 truncate">{hint}</div>}
      </div>
      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export function OnlineBadge({ online, label }: { online: boolean; label?: string }) {
  return online ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/30 whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-radar-dot" />
      {label ?? "DI KOTA"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1a1a1a] text-neutral-500 text-[10px] font-bold border border-[#2a2a2a] whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
      {label ?? "OFFLINE"}
    </span>
  );
}

const PRIORITY = {
  HIGH: { label: "Prioritas Tinggi", cls: "bg-[#E50914]/15 text-[#FF1E2D] border-[#E50914]/40" },
  MEDIUM: { label: "Prioritas Sedang", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  LOW: { label: "Prioritas Rendah", cls: "bg-[#1a1a1a] text-neutral-300 border-[#2a2a2a]" },
} as const;

export function PriorityBadge({ priority, short = false }: { priority?: "HIGH" | "MEDIUM" | "LOW"; short?: boolean }) {
  if (!priority) return null;
  const p = PRIORITY[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${p.cls}`}>
      {short ? p.label.replace("Prioritas ", "") : p.label}
    </span>
  );
}

export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "red" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap ${
        tone === "red" ? "bg-[#E50914]/10 text-[#FF1E2D] border-[#E50914]/30" : "bg-[#181818] text-neutral-300 border-[#2a2a2a]"
      }`}
    >
      {children}
    </span>
  );
}

const GROUP_LOGO: Record<string, string> = {
  badside: "/logos/ophelia-logo.png",
  "petinggi-badside": "/logos/ophelia-logo.png",
  "petinggi badside": "/logos/ophelia-logo.png",
  "petinggi badside🔴": "/logos/ophelia-logo.png",
  "ophelia-badside": "/logos/ophelia-logo.png",
};

export function GroupLogo({ name, size = "h-11 w-11" }: { name?: string; size?: string }) {
  const key = (name || "").toLowerCase();
  const src = GROUP_LOGO[key];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${size} rounded-xl object-cover border border-[#2a2a2a] bg-black shrink-0`} />;
  }
  const initials = (name || "?").replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`${size} rounded-xl bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-sm font-bold text-neutral-300 shrink-0`}>
      {initials || "?"}
    </div>
  );
}

export function Avatar({ name, online }: { name?: string; online?: boolean }) {
  const initials = (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="relative shrink-0">
      <div className="h-11 w-11 rounded-xl bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-sm font-bold text-white">
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#111111] ${online ? "bg-green-500" : "bg-neutral-600"}`}
        />
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc?: string }) {
  return (
    <div className="py-12 px-6 text-center">
      <Icon className="h-10 w-10 mx-auto text-neutral-700 mb-2" />
      <div className="text-sm font-semibold text-neutral-300">{title}</div>
      {desc && <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">{desc}</p>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-[#0c0c0c] border border-[#222]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            value === o.value ? "bg-[#E50914] text-white glow-red-sm" : "text-neutral-400 hover:text-white hover:bg-[#181818]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
