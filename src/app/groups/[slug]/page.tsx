"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Group } from "@/types";

export default function GroupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [group, setGroup] = useState<Group | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setGroup(store.getGroupById(slug));
    setLoaded(true);
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [slug]);

  if (!loaded) return <div className="p-12 text-center text-xs font-mono text-slate-400">Loading group...</div>;
  if (!group) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400 space-y-3">
        <p>Grup &quot;{slug}&quot; tidak ditemukan.</p>
        <Link href="/groups" className="text-cyan-400 hover:underline">Kembali ke daftar grup</Link>
      </div>
    );
  }

  const online = group.members.filter((m) => m.isOnline);
  const offline = group.members.filter((m) => !m.isOnline);
  const mostActive = [...online].sort(
    (a, b) => (b.currentSessionDurationSec || 0) - (a.currentSessionDurationSec || 0)
  )[0];
  const lastOnline = [...online].sort(
    (a, b) => (a.currentSessionDurationSec || 0) - (b.currentSessionDurationSec || 0)
  )[0];

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <Link href="/groups" className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> All groups
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: group.color }} />
            <h1 className="text-2xl font-bold font-mono text-slate-100">{group.name}</h1>
            <span className="text-xs font-mono text-slate-400">{group.tag}</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl">{group.description}</p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Discord role: <span className="text-slate-200">{group.discordRoleId ? `••••${group.discordRoleId.slice(-4)}` : "—"}</span>
        </div>
      </div>

      {/* Overview strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px rounded-xl overflow-hidden border border-[#232B38] bg-[#232B38] text-xs font-mono">
        {[
          { label: "Online", value: `${online.length} / ${group.members.length || group.onlineCount}`, cls: "text-emerald-400" },
          { label: "Playtime today", value: formatDuration(group.totalSessionTodaySec || 0).slice(0, 7), cls: "text-slate-100" },
          { label: "Last activity", value: group.lastActivity || "—", cls: "text-cyan-300" },
          { label: "Most active", value: mostActive?.characterName || "—", cls: "text-slate-100" },
          { label: "Last member online", value: lastOnline?.characterName || "—", cls: "text-slate-100" },
        ].map((s) => (
          <div key={s.label} className="bg-[#12161F] p-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">{s.label}</span>
            <span className={`text-base font-bold mt-1 block truncate ${s.cls}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {group.members.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-[#232B38] text-xs font-mono text-slate-400">
          Anggota grup ini belum disinkronkan. Data akan terisi otomatis setelah resource FiveM mengirim job/faction player.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-radar-dot" /> Current sessions ({online.length})
            </h2>
            <div className="rounded-xl border border-[#232B38] bg-[#12161F] divide-y divide-[#1A212D]">
              {online.map((m) => (
                <Link
                  key={m.id}
                  href={`/players/${m.playerId}`}
                  className="flex items-center justify-between p-3 hover:bg-[#161D29] transition-colors text-xs font-mono"
                >
                  <div>
                    <div className="text-slate-100 font-semibold">
                      {m.characterName} <span className="text-cyan-300">#{m.characterId}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{m.roleTitle}</div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono-telemetry">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration((m.currentSessionDurationSec || 0) + tick)}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-400">
              Offline ({offline.length})
            </h2>
            <div className="rounded-xl border border-[#232B38] bg-[#12161F] divide-y divide-[#1A212D]">
              {offline.length === 0 && (
                <div className="p-3 text-xs font-mono text-slate-400">Semua anggota yang terlacak sedang online.</div>
              )}
              {offline.map((m) => (
                <Link
                  key={m.id}
                  href={`/players/${m.playerId}`}
                  className="flex items-center justify-between p-3 hover:bg-[#161D29] transition-colors text-xs font-mono"
                >
                  <div>
                    <div className="text-slate-300 font-semibold">
                      {m.characterName} <span className="text-slate-400">#{m.characterId}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{m.roleTitle}</div>
                  </div>
                  <span className="text-slate-400">OFFLINE</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
