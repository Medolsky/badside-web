"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, UsersRound, Users } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Group } from "@/types";
import { PageHeader, GroupLogo, OnlineBadge, PriorityBadge } from "@/components/ui";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setGroups(store.getGroups());
    fetch("/api/discord/overview")
      .then((r) => r.json())
      .then((d) => {
        if (d?.roles) {
          const map: Record<string, number> = {};
          for (const r of d.roles) {
            if (r.memberCount !== null && r.memberCount !== undefined) {
              map[r.id] = r.memberCount;
            }
          }
          setRoleCounts(map);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grup & Faksi"
        icon={UsersRound}
        subtitle="Pantau organisasi resmi Ophelia Darkside. Sinkron langsung dengan role Discord & status FiveM."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((g) => {
          const discordCount = g.discordRoleId ? roleCounts[g.discordRoleId] : undefined;
          return (
            <Link
              key={g.id}
              href={`/groups/${g.slug}`}
              className="rounded-2xl bg-[#111111] border border-[#222] hover:border-[#E50914]/60 p-5 transition group flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <GroupLogo name={g.slug} size="h-14 w-14" />
                <div className="flex items-center gap-1.5">
                  {discordCount !== undefined && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1a1a1a] text-neutral-300 border border-[#333]">
                      <Users className="h-2.5 w-2.5 text-[#FF1E2D]" /> {discordCount} Discord
                    </span>
                  )}
                  <PriorityBadge priority={g.priority} short />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-base font-bold text-white group-hover:text-[#FF1E2D] transition">{g.name}</div>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{g.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#1f1f1f] grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Di Kota</div>
                  <div className="mt-1">
                    <OnlineBadge online={(g.onlineCount ?? 0) > 0} label={`${g.onlineCount ?? 0}`} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Main hari ini</div>
                  <div className="font-mono-telemetry font-bold text-white mt-1">{formatDuration(g.totalSessionTodaySec || 0).slice(0, 7)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Status</div>
                  <div className="font-mono-telemetry text-neutral-300 mt-1">{g.lastActivity || "Standby"}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
                Detail grup & member <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
