"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Radio, Moon, UsersRound, Clock, Users, Activity, MessageSquare } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Group } from "@/types";
import type { DiscordMember, DiscordRole } from "@/lib/discord";
import { formatBadsideMemberName } from "@/lib/badside-tag";
import { PageHeader, Card, Avatar, GroupLogo, EmptyState, StatCard, PriorityBadge } from "@/components/ui";

export default function GroupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [group, setGroup] = useState<Group | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [tick, setTick] = useState(0);
  const [discordMembers, setDiscordMembers] = useState<DiscordMember[]>([]);
  const [discordRoles, setDiscordRoles] = useState<DiscordRole[]>([]);
  const [loadingDiscord, setLoadingDiscord] = useState(true);

  useEffect(() => {
    const g = store.getGroupById(slug);
    setGroup(g);
    setLoaded(true);

    fetch("/api/discord/overview")
      .then((r) => r.json())
      .then((d) => {
        if (d?.roles) setDiscordRoles(d.roles);
        if (d?.members && g?.discordRoleId) {
          const matched = (d.members as DiscordMember[]).filter((m) =>
            m.roleIds.includes(g.discordRoleId!)
          );
          setDiscordMembers(matched);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDiscord(false));

    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [slug]);

  const roleById = useMemo(() => new Map(discordRoles.map((r) => [r.id, r])), [discordRoles]);

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
            Tag Resmi: <span className="text-white font-semibold">{group.tag || "—"}</span>
          </div>
          <div>
            Role Discord:{" "}
            <span className="text-white font-mono-telemetry">
              {group.discordRoleId ? `ID: ${group.discordRoleId}` : "Belum diatur"}
            </span>
          </div>
          <div>
            Anggota Terdaftar Discord:{" "}
            <span className="text-[#FF1E2D] font-bold font-mono-telemetry">
              {loadingDiscord ? "..." : `${discordMembers.length} Anggota`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Sedang di kota"
          value={`${online.length || group.onlineCount || 0}`}
          hint={group.members.length ? `dari ${group.members.length} karakter FiveM` : undefined}
          icon={Users}
          tone="green"
        />
        <StatCard label="Total main hari ini" value={formatDuration(group.totalSessionTodaySec || 0).slice(0, 7)} icon={Clock} />
        <StatCard label="Anggota Discord" value={loadingDiscord ? "..." : discordMembers.length} icon={MessageSquare} tone="red" />
        <StatCard label="Paling lama online" value={<span className="text-lg sm:text-xl">{mostActive?.characterName || "—"}</span>} icon={Radio} tone="red" />
      </div>

      {/* Real Discord members list */}
      <Card
        title={
          <span>
            Anggota Resmi di Discord ({discordMembers.length})
            <span className="text-neutral-400 font-normal text-xs ml-2">Sinkron realtime dari role server</span>
          </span>
        }
        icon={UsersRound}
        bodyClassName="divide-y divide-[#1a1a1a]"
      >
        {loadingDiscord ? (
          <div className="p-8 text-center text-xs text-neutral-500">Memuat anggota dari Discord...</div>
        ) : discordMembers.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="Tidak ada anggota dengan role ini di Discord"
            desc="Pastikan role sudah diberikan kepada member di server OPHELIA DARKSIDE."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
            {discordMembers.map((m) => {
              const roles = m.roleIds
                .map((id) => roleById.get(id))
                .filter((r): r is DiscordRole => Boolean(r))
                .sort((a, b) => b.position - a.position);

              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#141414] border border-[#222] hover:border-[#333] transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.avatarUrl} alt="" className="h-10 w-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] shrink-0" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">{formatBadsideMemberName(m.displayName, group.slug)}</div>
                    <div className="text-[11px] text-neutral-500 truncate">@{m.username}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {roles.slice(0, 2).map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#1a1a1a] text-neutral-300 border border-[#2a2a2a]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color || "#A3A3A3" }} />
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* FiveM ingame characters status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Sedang Di Kota FiveM (${online.length})`} icon={Radio} bodyClassName="divide-y divide-[#1a1a1a]">
          {online.length === 0 && (
            <EmptyState icon={Radio} title="Belum ada yang online di kota" desc="Menunggu player login ke server FiveM." />
          )}
          {online.map((m) => (
            <Link key={m.id} href={`/players/${m.playerId}`} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#161616] transition group">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={m.characterName} online />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white group-hover:text-[#FF1E2D] transition truncate">{formatBadsideMemberName(m.characterName, group.slug)}</div>
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

        <Card title={`Karakter FiveM Terdaftar (${offline.length})`} icon={Moon} bodyClassName="divide-y divide-[#1a1a1a]">
          {offline.length === 0 && (
            <EmptyState icon={Moon} title="Semua karakter FiveM sedang online / belum ada sesi" />
          )}
          {offline.map((m) => (
            <Link key={m.id} href={`/players/${m.playerId}`} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#161616] transition group">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={m.characterName} online={false} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-neutral-300 truncate">{formatBadsideMemberName(m.characterName, group.slug)}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{m.roleTitle}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white" />
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}
