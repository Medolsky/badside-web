"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, UsersRound } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Group } from "@/types";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(store.getGroups());
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Factions & Groups</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Monitoring kelompok, bukan hanya individu. Pilih grup untuk melihat anggota dan sesi aktif.
        </p>
      </div>

      <div className="rounded-xl border border-[#232B38] bg-[#12161F] divide-y divide-[#1A212D] overflow-hidden">
        {groups.map((g) => {
          const total = g.members.length || g.onlineCount || 0;
          return (
            <Link
              key={g.id}
              href={`/groups/${g.slug}`}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 hover:bg-[#161D29] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: `${g.color}1A`, borderColor: `${g.color}55`, color: g.color }}
                >
                  <UsersRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 font-mono group-hover:text-cyan-300 transition-colors">
                      {g.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{g.tag}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        g.priority === "HIGH"
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                          : g.priority === "MEDIUM"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {g.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 max-w-xl">{g.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Online</span>
                  <span className="text-emerald-400 font-bold">{g.onlineCount ?? 0}</span>
                  {g.members.length > 0 && <span className="text-slate-400"> / {total} tracked</span>}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Playtime today</span>
                  <span className="text-slate-200 font-bold">
                    {formatDuration(g.totalSessionTodaySec || 0).slice(0, 7)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Last activity</span>
                  <span className="text-cyan-300 font-bold">{g.lastActivity}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
