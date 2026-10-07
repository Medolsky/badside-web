"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, UsersRound } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Group } from "@/types";
import { PageHeader, GroupLogo, OnlineBadge, PriorityBadge } from "@/components/ui";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => setGroups(store.getGroups()), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Grup" icon={UsersRound} subtitle="Pantau kelompok sekaligus. Pilih grup untuk melihat siapa saja yang sedang di kota." />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((g) => (
          <Link
            key={g.id}
            href={`/groups/${g.slug}`}
            className="rounded-2xl bg-[#111111] border border-[#222] hover:border-[#E50914]/60 p-5 transition group flex flex-col"
          >
            <div className="flex items-start justify-between gap-3">
              <GroupLogo name={g.slug} size="h-14 w-14" />
              <PriorityBadge priority={g.priority} short />
            </div>
            <div className="mt-4">
              <div className="text-base font-bold text-white group-hover:text-[#FF1E2D] transition">{g.name}</div>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{g.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1f1f1f] grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Online</div>
                <div className="mt-1">
                  <OnlineBadge online={(g.onlineCount ?? 0) > 0} label={`${g.onlineCount ?? 0}`} />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Main hari ini</div>
                <div className="font-mono-telemetry font-bold text-white mt-1">{formatDuration(g.totalSessionTodaySec || 0).slice(0, 7)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Terakhir</div>
                <div className="font-mono-telemetry text-neutral-300 mt-1">{g.lastActivity || "—"}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
              Lihat anggota <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
