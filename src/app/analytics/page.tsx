"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, Users, Clock, Activity } from "lucide-react";
import { PageHeader, Card, StatCard, GroupLogo } from "@/components/ui";

// Sample hourly online counts (00–23). Replace with /api data once the monitoring DB is live.
const HOURLY = [42, 31, 22, 15, 11, 9, 14, 28, 46, 63, 81, 97, 112, 118, 121, 127, 139, 152, 168, 184, 179, 161, 120, 78];
const GROUP_HOURS = [
  { slug: "lspd", name: "LSPD", hours: 48.0 },
  { slug: "badside", name: "BADside", hours: 34.35 },
  { slug: "ems", name: "EMS", hours: 22.0 },
  { slug: "ballas", name: "Ballas", hours: 18.0 },
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
  const peakX = (peakHour / (HOURLY.length - 1)) * W;
  const peakY = H - (max / max) * (H - 20);

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader title="Statistik" icon={BarChart3} subtitle="Ringkasan aktivitas kota 24 jam terakhir." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Puncak online" value={max} hint={`jam ${String(peakHour).padStart(2, "0")}:00`} icon={TrendingUp} tone="red" />
        <StatCard label="Rata-rata online" value={avg} hint="per jam" icon={Users} />
        <StatCard label="Total sesi" value="697" hint="412 masuk · 285 keluar" icon={Activity} />
        <StatCard label="Total jam main" value="1.284j" hint="semua player" icon={Clock} />
      </div>

      <Card title="Player online per jam" icon={TrendingUp}>
        <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full h-auto" role="img" aria-label={`Grafik player online per jam, puncak ${max} pada jam ${peakHour}`}>
          <defs>
            <linearGradient id="fillOnline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E50914" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E50914" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#1f1f1f" strokeDasharray="3 5" />
          ))}
          <path d={area} fill="url(#fillOnline)" />
          <path d={line} fill="none" stroke="#FF1E2D" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx={peakX} cy={peakY} r="5" fill="#080808" stroke="#FF1E2D" strokeWidth="2.5" />
          <text x={peakX} y={peakY - 12} fill="#FFFFFF" fontSize="12" fontWeight="700" textAnchor="middle">
            {max}
          </text>
          {[0, 6, 12, 18, 23].map((h) => (
            <text
              key={h}
              x={(h / 23) * W}
              y={H + 18}
              fill="#737373"
              fontSize="11"
              textAnchor={h === 0 ? "start" : h === 23 ? "end" : "middle"}
            >
              {String(h).padStart(2, "0")}:00
            </text>
          ))}
        </svg>
      </Card>

      <Card title="Jam main per grup (hari ini)" icon={Clock}>
        <div className="space-y-4">
          {GROUP_HOURS.map((g, i) => (
            <div key={g.name} className="grid grid-cols-[auto_90px_1fr_80px] items-center gap-3 text-xs">
              <GroupLogo name={g.slug} size="h-8 w-8" />
              <span className="font-semibold text-white">{g.name}</span>
              <div className="h-2.5 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div
                  className={`h-full rounded-full ${i === 0 ? "bg-[#E50914]" : "bg-neutral-400"}`}
                  style={{ width: `${(g.hours / maxGroup) * 100}%` }}
                />
              </div>
              <span className="text-right font-mono-telemetry text-neutral-200">
                {Math.floor(g.hours)}j {Math.round((g.hours % 1) * 60)}m
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
