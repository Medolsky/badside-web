"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { store } from "@/lib/store";
import { EventLog } from "@/types";

const TYPES: { key: EventLog["eventType"] | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "JOIN_CITY", label: "Login" },
  { key: "LEAVE_CITY", label: "Logout" },
  { key: "CHAR_SWITCH", label: "Character" },
  { key: "VEHICLE_CHANGE", label: "Vehicle" },
  { key: "DISTRICT_MOVE", label: "Area" },
  { key: "DISCORD_LINK", label: "Discord" },
  { key: "ADMIN_ACTION", label: "Admin" },
];

const dotColor: Record<EventLog["eventType"], string> = {
  JOIN_CITY: "bg-emerald-500",
  LEAVE_CITY: "bg-rose-500",
  CHAR_SWITCH: "bg-purple-500",
  VEHICLE_CHANGE: "bg-amber-500",
  DISTRICT_MOVE: "bg-cyan-500",
  DISCORD_LINK: "bg-indigo-400",
  ADMIN_ACTION: "bg-slate-400",
};

export default function HistoryPage() {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [type, setType] = useState<(typeof TYPES)[number]["key"]>("ALL");
  const [q, setQ] = useState("");

  useEffect(() => setEvents(store.getEvents()), []);

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (type === "ALL" || e.eventType === type) &&
          (!q.trim() || `${e.playerName} ${e.eventData} ${e.location}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [events, type, q]
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Session & Event History</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
                type === t.key
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                  : "bg-[#141A24] text-slate-400 border-[#232B38] hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by player / area..."
          className="w-full md:w-64 px-3 py-1.5 rounded-lg bg-[#0E1218] border border-[#232D3E] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <ol className="relative border-l border-[#232B38] ml-2 space-y-4">
        {filtered.length === 0 && <li className="pl-6 text-xs font-mono text-slate-400">Tidak ada event yang cocok.</li>}
        {filtered.map((e) => (
          <li key={e.id} className="pl-6 relative">
            <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${dotColor[e.eventType]}`} />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs font-mono">
              <span className="text-cyan-300 font-bold font-mono-telemetry">{e.timestamp}</span>
              <Link href={`/players/${e.playerId}`} className="text-slate-100 font-semibold hover:text-cyan-300">
                {e.playerName}
              </Link>
              <span className="text-[10px] text-slate-400">{e.eventType.replace("_", " ")}</span>
            </div>
            <p className="text-xs font-mono text-slate-300 mt-1">{e.eventData}</p>
            {e.location && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {e.location}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
