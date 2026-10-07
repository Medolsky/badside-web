"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Radio, Moon, UsersRound, Clock, Users, Activity } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Group } from "@/types";
import { PageHeader, Card, Avatar, GroupLogo, EmptyState, StatCard, PriorityBadge } from "@/components/ui";

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

  if (!loaded) return <div className="py-16 text-center text-sm text-neutral-500">Memuat grup...</div>;
  if (!group) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-neutral-400">Grup &quot;{slug}&quot; tidak ditemukan.</p>
        <Link href="/groups" className="text-sm font-semibold text-[#FF1E2D] hover:underline">
          Kembali ke daftar grup
        </Link>
      </div>
    );
  }

  const online = group.members.filter((m) => m.isOnline);
  const offline = group.members.filter((m) => !m.isOnline);
  const mostActive = [...online].sort((a, b) => (b.currentSessionDurationSec || 0) - (a.currentSessionDurationSec || 0))[0];

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader title={group.name} back={{ href: "/groups", label: "Semua grup" }} subtitle={group.description}>
        <PriorityBadge priority={group.priority} />
      </PageHeader>

      <div className="flex items-center gap-4 rounded-2xl bg-[#111111] border border-[#222] p-4 sm:p-5">
        <GroupLogo name={group.slug} size="h-16 w-16" />
        <div className="text-xs text-neutral-400 space-y-1">
          <div>
            Tag: <span className="text-white font-semibold">{group.tag || "—"}</span>
          </div>
          <div>
            Role Discord: <span className="text-white font-mono-telemetry">{group.discordRoleId ? `••••${group.discordRoleId.slice(-4)}` : "Belum diatur"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Sedang di kota" value={`${online.length || group.onlineCount || 0}`} hint={group.members.length ? `dari ${group.members.length} anggota` : undefined} icon={Users} tone="green" />
        <StatCard label="Total main hari ini" value={formatDuration(group.totalSessionTodaySec || 0).slice(0, 7)} icon={Clock} />
        <StatCard label="Aktivitas terakhir" value={group.lastActivity || "—"} icon={Activity} />
        <StatCard label="Paling lama online" value={<span className="text-lg sm:text-xl">{mostActive?.characterName || "—"}</span>} icon={Radio} tone="red" />
      </div>

      {group.members.length === 0 ? (
        <Card>
          <EmptyState icon={UsersRound} title="Anggota belum tersinkron" desc="Data terisi otomatis setelah resource FiveM mengirim job/faction player." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={`Di kota (${online.length})`} icon={Radio} bodyClassName="divide-y divide-[#1a1a1a]">
            {online.length === 0 && <EmptyState icon={Radio} title="Tidak ada yang online" />}
            {online.map((m) => (
              <Link key={m.id} href={`/players/${m.playerId}`} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#161616] transition group">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={m.characterName} online />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-[#FF1E2D] transition truncate">{m.characterName}</div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      {m.roleTitle} · CID #{m.characterId}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-500">Lama di kota</div>
                  <div className="font-mono-telemetry font-bold text-[#FF1E2D] text-sm">{formatDuration((m.currentSessionDurationSec || 0) + tick)}</div>
                </div>
              </Link>
            ))}
          </Card>

          <Card title={`Offline (${offline.length})`} icon={Moon} bodyClassName="divide-y divide-[#1a1a1a]">
            {offline.length === 0 && <EmptyState icon={Moon} title="Semua anggota sedang online" />}
            {offline.map((m) => (
              <Link key={m.id} href={`/players/${m.playerId}`} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#161616] transition group">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={m.characterName} online={false} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-300 truncate">{m.characterName}</div>
                    <div className="text-[11px] text-neutral-500 truncate">{m.roleTitle}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white" />
              </Link>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
