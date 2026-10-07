"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Crosshair, Bell, Clock, MapPin, Car, ChevronRight, Activity, Radio, UsersRound } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Player, Group, EventLog, ServerOverview } from "@/types";
import { formatBadsideMemberName } from "@/lib/badside-tag";
import { Card, StatCard, Avatar, OnlineBadge, PriorityBadge, GroupLogo, EmptyState, btnPrimary, btnGhost } from "@/components/ui";

const EVENT_LABEL: Record<EventLog["eventType"], string> = {
  JOIN_CITY: "Masuk kota",
  LEAVE_CITY: "Keluar kota",
  CHAR_SWITCH: "Ganti karakter",
  VEHICLE_CHANGE: "Ganti kendaraan",
  DISTRICT_MOVE: "Pindah area",
  DISCORD_LINK: "Discord",
  ADMIN_ACTION: "Aksi admin",
};

const EVENT_DOT: Record<EventLog["eventType"], string> = {
  JOIN_CITY: "bg-green-500",
  LEAVE_CITY: "bg-[#E50914]",
  CHAR_SWITCH: "bg-white",
  VEHICLE_CHANGE: "bg-amber-400",
  DISTRICT_MOVE: "bg-neutral-400",
  DISCORD_LINK: "bg-neutral-400",
  ADMIN_ACTION: "bg-neutral-500",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<ServerOverview>(store.getServerOverview());
  const [watched, setWatched] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [tick, setTick] = useState(0);
  const [hello, setHello] = useState("Halo");

  const refreshState = () => {
    const p = store.getPlayers();
    setWatched(p.filter((ply) => ply.isWatchlisted && ply.isOnline));
    setGroups(store.getGroups());
    setEvents(store.getEvents().slice(0, 6));
    setOverview(store.getServerOverview());
  };

  useEffect(() => {
    refreshState();
    setHello(greeting());

    // Live sync with server every 5 seconds
    const syncInterval = setInterval(() => {
      fetch("/api/fivem/sync")
        .then(() => refreshState())
        .catch(() => refreshState());
    }, 5000);

    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(i);
      clearInterval(syncInterval);
    };
  }, []);

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl border border-[#222] bg-[#111111] p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_right,rgba(229,9,20,0.14),transparent_70%)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="text-xs text-neutral-500 capitalize">{today}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">{hello}, Staff 👋</h1>
            <p className="text-sm text-neutral-400 mt-1.5 max-w-xl">
              Ada <strong className="text-[#FF1E2D]">{watched.length} target watchlist</strong> yang sedang di kota sekarang.
              Klik nama untuk lihat detail lengkapnya.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/watchlist" className={btnPrimary}>
              <Crosshair className="h-4 w-4" /> Kelola Watchlist
            </Link>
            <Link href="/players" className={btnGhost}>
              <Users className="h-4 w-4" /> Daftar Player
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Player di kota" value={overview.playersOnline} hint={`dari ${overview.maxSlots} slot`} icon={Users} tone="green" />
        <StatCard label="Target di kota" value={overview.watchedOnline} hint="dari watchlist" icon={Crosshair} tone="red" />
        <StatCard label="Notifikasi baru" value={overview.activeAlertsCount} hint="belum dibaca" icon={Bell} tone="amber" />
        <StatCard
          label="Rata-rata main"
          value={formatDuration(overview.averageSessionDurationSec).slice(0, 7)}
          hint={`${overview.playersEnteredToday} player masuk hari ini`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Watched in city */}
        <div className="xl:col-span-2 space-y-6">
          <Card
            title={`Target yang sedang di kota (${watched.length})`}
            icon={Radio}
            action={
              <Link href="/players?filter=watchlist" className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1">
                Lihat semua <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {watched.length === 0 ? (
              <EmptyState icon={Radio} title="Tidak ada target di kota" desc="Semua player di watchlist sedang offline." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {watched.map((player) => {
                  const c = player.characters.find((ch) => ch.isActive) || player.characters[0];
                  const sec = (player.currentSession?.durationSec || 0) + tick;
                  const displayName = formatBadsideMemberName(c?.fullName || player.name || "Target", player.groupName);
                  return (
                    <Link
                      key={player.id}
                      href={`/players/${player.id}`}
                      className="rounded-2xl bg-[#141414] border border-[#252525] hover:border-[#E50914]/60 p-4 transition group block"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={displayName} online />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white group-hover:text-[#FF1E2D] transition truncate">{displayName}</div>
                            <div className="text-[11px] text-neutral-400 truncate">
                              {player.groupName || c?.faction || "Tanpa grup"} · CID #{c?.characterId || "—"}
                            </div>
                          </div>
                        </div>
                        <PriorityBadge priority={player.watchlistPriority} short />
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#202020] grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Lama di kota</div>
                          <div className="font-mono-telemetry font-bold text-[#FF1E2D] mt-0.5 text-sm whitespace-nowrap">{formatDuration(sec)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">ID Server</div>
                          <div className="font-mono-telemetry text-neutral-200 mt-0.5 text-sm">#{player.currentServerId}</div>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1.5">
                        <div className="text-[11px] text-neutral-400 bg-[#0d0d0d] px-2.5 py-1.5 rounded-lg border border-[#1f1f1f] flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <span className="truncate">{player.currentArea || "Lokasi tidak diketahui"}</span>
                        </div>
                        {player.currentVehicle && (
                          <div className="text-[11px] text-neutral-400 bg-[#0d0d0d] px-2.5 py-1.5 rounded-lg border border-[#1f1f1f] flex items-center gap-1.5 min-w-0">
                            <Car className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">{player.currentVehicle}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Groups */}
          <Card
            title="Grup yang dipantau"
            icon={UsersRound}
            action={
              <Link href="/groups" className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1">
                Semua grup <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            }
            bodyClassName="divide-y divide-[#1c1c1c]"
          >
            {groups.map((g) => (
              <Link key={g.id} href={`/groups/${g.slug}`} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#161616] transition group">
                <div className="flex items-center gap-3 min-w-0">
                  <GroupLogo name={g.slug} size="h-10 w-10" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-[#FF1E2D] transition truncate">{g.name}</div>
                    <div className="text-[11px] text-neutral-500">Aktivitas terakhir {g.lastActivity || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <OnlineBadge online={(g.onlineCount ?? 0) > 0} label={`${g.onlineCount ?? 0} ONLINE`} />
                  <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white" />
                </div>
              </Link>
            ))}
          </Card>
        </div>

        {/* Activity */}
        <div className="space-y-6">
          <Card
            title="Aktivitas terbaru"
            icon={Activity}
            action={
              <Link href="/history" className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1">
                Riwayat <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {events.length === 0 ? (
              <EmptyState icon={Activity} title="Belum ada aktivitas" desc="Menunggu event player dari server FiveM." />
            ) : (
              <ol className="relative border-l border-[#252525] ml-1.5 space-y-4">
                {events.map((e) => (
                  <li key={e.id} className="pl-5 relative">
                    <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#111111] ${EVENT_DOT[e.eventType]}`} />
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <Link href={`/players/${e.playerId}`} className="font-bold text-white hover:text-[#FF1E2D] truncate">
                        {e.playerName}
                      </Link>
                      <span className="font-mono-telemetry text-[11px] text-neutral-500 shrink-0">{e.timestamp}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-neutral-300 mt-0.5">{EVENT_LABEL[e.eventType]}</div>
                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">{e.eventData}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <div className="rounded-2xl bg-[#111111] border border-[#222] p-4 sm:p-5 flex items-start gap-3">
            <span className="h-2.5 w-2.5 mt-1.5 rounded-full bg-green-500 animate-radar-dot shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-white">Koneksi FiveM aktif</div>
              <p className="text-neutral-400 mt-0.5 leading-relaxed">
                Resource <code className="text-neutral-200">badside_intel</code> mengirim data tiap 5 detik. Player dianggap
                keluar kalau tidak ada kabar 30 detik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
