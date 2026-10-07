"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, History, Search } from "lucide-react";
import { store } from "@/lib/store";
import { EventLog } from "@/types";
import { formatBadsideMemberName } from "@/lib/badside-tag";
import { PageHeader, Card, EmptyState, input } from "@/components/ui";

const TYPES: { key: EventLog["eventType"] | "ALL"; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "JOIN_CITY", label: "Masuk kota" },
  { key: "LEAVE_CITY", label: "Keluar kota" },
  { key: "CHAR_SWITCH", label: "Ganti karakter" },
  { key: "VEHICLE_CHANGE", label: "Kendaraan" },
  { key: "DISTRICT_MOVE", label: "Pindah area" },
  { key: "DISCORD_LINK", label: "Discord" },
  { key: "ADMIN_ACTION", label: "Admin" },
];
const LABEL = Object.fromEntries(TYPES.map((t) => [t.key, t.label])) as Record<string, string>;

const DOT: Record<EventLog["eventType"], string> = {
  JOIN_CITY: "bg-green-500",
  LEAVE_CITY: "bg-[#E50914]",
  CHAR_SWITCH: "bg-white",
  VEHICLE_CHANGE: "bg-amber-400",
  DISTRICT_MOVE: "bg-neutral-400",
  DISCORD_LINK: "bg-neutral-400",
  ADMIN_ACTION: "bg-neutral-500",
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
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Riwayat Aktivitas"
        icon={History}
        subtitle={new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      />

      <div className="rounded-2xl bg-[#111111] border border-[#222] p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama player atau lokasi..." className={`${input} pl-9`} aria-label="Cari aktivitas" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              aria-pressed={type === t.key}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                type === t.key ? "bg-[#E50914] text-white glow-red-sm" : "bg-[#161616] text-neutral-400 border border-[#222] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Card bodyClassName="p-5 sm:p-6">
        {filtered.length === 0 ? (
          <EmptyState icon={History} title="Tidak ada aktivitas" desc="Coba ganti filter atau kata kunci." />
        ) : (
          <ol className="relative border-l border-[#252525] ml-1.5 space-y-6">
            {filtered.map((e) => (
              <li key={e.id} className="pl-6 relative">
                <span className={`absolute -left-[6px] top-1 h-3 w-3 rounded-full ring-4 ring-[#111111] ${DOT[e.eventType]}`} />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="font-mono-telemetry text-neutral-500">{e.timestamp}</span>
                  <Link href={`/players/${e.playerId}`} className="text-sm font-bold text-white hover:text-[#FF1E2D]">
                    {formatBadsideMemberName(e.playerName)}
                  </Link>
                  <span className="px-2 py-0.5 rounded-md bg-[#181818] border border-[#2a2a2a] text-[10px] font-semibold text-neutral-300">{LABEL[e.eventType]}</span>
                </div>
                <p className="text-xs text-neutral-300 mt-1">{e.eventData}</p>
                {e.location && (
                  <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {e.location}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
