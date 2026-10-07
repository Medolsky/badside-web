"use client";

import { useMemo } from "react";

// Sample hourly online counts (00–23). Replace with /api data once the monitoring DB is live.
const HOURLY = [42, 31, 22, 15, 11, 9, 14, 28, 46, 63, 81, 97, 112, 118, 121, 127, 139, 152, 168, 184, 179, 161, 120, 78];
const GROUP_HOURS = [
  { name: "LSPD", hours: 48.0, color: "#38BDF8" },
  { name: "BADside", hours: 34.35, color: "#8B5CF6" },
  { name: "EMS", hours: 22.0, color: "#10B981" },
  { name: "Ballas", hours: 18.0, color: "#EC4899" },
];

export default function AnalyticsPage() {
  const W = 720;
  const H = 220;
  const max = Math.max(...HOURLY);
  const { line, area } = useMemo(() => {
    const pts = HOURLY.map((v, i) => [(i / (HOURLY.length - 1)) * W, H - (v / max) * (H - 20)] as const);
    const l = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return { line: l, area: `${l} L${W},${H} L0,${H} Z` };
  }, [max]);

  const avg = Math.round(HOURLY.reduce((a, b) => a + b, 0) / HOURLY.length);
  const peakHour = HOURLY.indexOf(max);
  const maxGroup = Math.max(...GROUP_HOURS.map((g) => g.hours));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Telemetry Analytics</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Aktivitas server 24 jam terakhir.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-[#232B38] bg-[#232B38] text-xs font-mono">
        {[
          { l: "Peak online", v: `${max}`, s: `at ${String(peakHour).padStart(2, "0")}:00` },
          { l: "Average online", v: `${avg}`, s: "per hour" },
          { l: "Total sessions", v: "697", s: "412 join / 285 leave" },
          { l: "Total playtime", v: "1,284h", s: "all players" },
        ].map((k) => (
          <div key={k.l} className="bg-[#12161F] p-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">{k.l}</span>
            <div className="text-2xl font-bold text-slate-100 mt-1 font-mono-telemetry">{k.v}</div>
            <span className="text-[11px] text-slate-400">{k.s}</span>
          </div>
        ))}
      </div>

      <section className="p-5 rounded-xl bg-[#12161F] border border-[#232B38] space-y-3">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-200">Players online / hour</h2>
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-auto" role="img" aria-label="Players online per hour">
          <defs>
            <linearGradient id="fillOnline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#1A212D" strokeDasharray="3 4" />
          ))}
          <path d={area} fill="url(#fillOnline)" />
          <path d={line} fill="none" stroke="#38BDF8" strokeWidth="2" />
          {[0, 6, 12, 18, 23].map((h) => (
            <text
              key={h}
              x={(h / 23) * W}
              y={H + 16}
              fill="#64748B"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              textAnchor={h === 0 ? "start" : h === 23 ? "end" : "middle"}
            >
              {String(h).padStart(2, "0")}:00
            </text>
          ))}
        </svg>
      </section>

      <section className="p-5 rounded-xl bg-[#12161F] border border-[#232B38] space-y-3">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-200">Group playtime today</h2>
        <div className="space-y-2.5">
          {GROUP_HOURS.map((g) => (
            <div key={g.name} className="grid grid-cols-[80px_1fr_70px] items-center gap-3 text-xs font-mono">
              <span className="text-slate-300">{g.name}</span>
              <div className="h-2 rounded-full bg-[#0A0D12] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(g.hours / maxGroup) * 100}%`, backgroundColor: g.color }} />
              </div>
              <span className="text-right text-slate-200">{Math.floor(g.hours)}h {Math.round((g.hours % 1) * 60)}m</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
