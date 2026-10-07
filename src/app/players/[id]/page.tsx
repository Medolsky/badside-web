"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, Car, Crosshair, Eye, EyeOff, Copy, Check, ShieldCheck, Network, IdCard, History, UserRound } from "lucide-react";
import { store, maskIdentifier, formatDuration, formatCurrency } from "@/lib/store";
import { Player } from "@/types";
import { formatBadsideMemberName } from "@/lib/badside-tag";
import { DiscordMemberRoles } from "@/components/DiscordMemberRoles";
import { PageHeader, Card, OnlineBadge, PriorityBadge, Tag, GroupLogo, btnPrimary, btnGhost } from "@/components/ui";

const TIMELINE = [
  { time: "10:55", title: "Sedang di kota", desc: "Pillbox Hill / Downtown LS, naik Sultan RS [B4DS-01]", dot: "bg-green-500" },
  { time: "10:21", title: "Masuk area Sandy Shores", desc: "Terdeteksi melaju cepat di Senora Freeway", dot: "bg-neutral-400" },
  { time: "09:43", title: "Ganti karakter", desc: "Dari Jonathan Smith (CID #891) ke John Smith (CID #245)", dot: "bg-white" },
  { time: "08:35", title: "Ganti kendaraan", desc: "Ambil Sultan RS dari garasi Alta Street", dot: "bg-amber-400" },
  { time: "08:14", title: "Masuk kota", desc: "Server ID #128", dot: "bg-green-500" },
];

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: playerId } = use(params);

  const [player, setPlayer] = useState<Player | undefined>(undefined);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setPlayer(store.getPlayerById(playerId));
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [playerId]);

  if (!player && tick > 0) return notFound();
  if (!player) return <div className="py-16 text-center text-sm text-neutral-500">Memuat data player...</div>;

  const c = player.characters.find((ch) => ch.isActive) || player.characters[0];
  const sec = player.isOnline ? (player.currentSession?.durationSec || 0) + tick : 0;

  const handleReveal = () => {
    if (!isRevealed) {
      store.revealPlayerIdentifier(player.id, "Staff Moderator (Kamu)");
      setAuditMessage("Identifier ditampilkan. Aksi ini sudah dicatat di Audit Log.");
      setTimeout(() => setAuditMessage(null), 6000);
    }
    setIsRevealed(!isRevealed);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleWatchlist = () => {
    if (player.isWatchlisted) {
      const wl = store.getWatchlist().find((w) => w.targetId === player.id);
      if (wl) store.removeWatchlistEntry(wl.id);
      player.isWatchlisted = false;
    } else {
      store.addWatchlistEntry({
        targetType: "PLAYER",
        targetId: player.id,
        targetName: `${c?.fullName} (CID #${c?.characterId})`,
        priority: "HIGH",
        category: "SUSPECT",
        reason: "Ditandai manual dari halaman detail player.",
        createdBy: "STAFF_MONITOR",
      });
      player.isWatchlisted = true;
      player.watchlistPriority = "HIGH";
    }
    setPlayer({ ...player });
  };

  const idRows: { key: string; label: string; raw?: string; masked: string }[] = [
    { key: "license", label: "FiveM License", raw: player.license, masked: maskIdentifier(player.license, "license") },
    { key: "steam", label: "Steam Hex", raw: player.steam, masked: maskIdentifier(player.steam, "steam") },
    {
      key: "xbox",
      label: "Xbox",
      raw: player.xbox,
      masked: player.xbox ? "******" + player.xbox.slice(-4) : "Tidak terhubung",
    },
    {
      key: "rockstar",
      label: "Rockstar",
      raw: player.rockstar,
      masked: player.rockstar ? "******" + player.rockstar.slice(-4) : "Tidak terhubung",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title={formatBadsideMemberName(c?.fullName || player.name || "Tanpa nama", player.groupName)}
        back={{ href: "/players", label: "Daftar Player" }}
        subtitle={
          <span className="flex flex-wrap items-center gap-2 mt-1">
            <OnlineBadge online={player.isOnline} label={player.isOnline ? `DI KOTA · #${player.currentServerId}` : undefined} />
            <Tag>CID #{c?.characterId || "—"}</Tag>
            {(player.groupName || c?.faction) && (
              <Tag tone="red">{player.groupName || c?.faction}</Tag>
            )}
            {player.isWatchlisted && <PriorityBadge priority={player.watchlistPriority} />}
          </span>
        }
      >
        <button onClick={toggleWatchlist} className={player.isWatchlisted ? btnGhost : btnPrimary}>
          <Crosshair className="h-4 w-4" />
          {player.isWatchlisted ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
        </button>
        <Link href="/intel-graph" className={btnGhost}>
          <Network className="h-4 w-4" /> Relasi
        </Link>
      </PageHeader>

      {auditMessage && (
        <div role="status" className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {auditMessage}
          </span>
          <Link href="/audit-log" className="underline font-semibold shrink-0">Lihat log</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Session */}
          <Card title="Sesi sekarang" icon={Clock}>
            <div className="rounded-2xl bg-[#0c0c0c] border border-[#1f1f1f] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Sudah berapa lama di kota</div>
                <div className={`text-3xl sm:text-4xl font-bold font-mono-telemetry mt-1 ${player.isOnline ? "text-[#FF1E2D]" : "text-neutral-600"}`}>
                  {player.isOnline ? formatDuration(sec) : "Offline"}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {player.currentSession?.joinedAt
                    ? `Masuk jam ${new Date(player.currentSession.joinedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
                    : `Terakhir terlihat ${new Date(player.lastSeen).toLocaleString("id-ID")}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:text-right">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">ID Server</div>
                  <div className="text-lg font-bold font-mono-telemetry text-white">{player.currentServerId ? `#${player.currentServerId}` : "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Ping</div>
                  <div className="text-lg font-bold font-mono-telemetry text-white">{player.ping ? `${player.ping}ms` : "—"}</div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl bg-[#0c0c0c] border border-[#1f1f1f] p-3.5">
                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Lokasi</div>
                <div className="text-sm font-semibold text-white mt-1">{player.currentArea || "—"}</div>
              </div>
              <div className="rounded-xl bg-[#0c0c0c] border border-[#1f1f1f] p-3.5">
                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5"><Car className="h-3.5 w-3.5" /> Kendaraan</div>
                <div className="text-sm font-semibold text-white mt-1">{player.currentVehicle || "Jalan kaki"}</div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#1f1f1f]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2.5">Sesi hari ini</div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-[#0c0c0c] border border-[#1f1f1f] p-3">
                  <div className="text-neutral-500">Sesi 1</div>
                  <div className="font-mono-telemetry text-white font-semibold mt-0.5">08:12 → 11:43</div>
                  <div className="text-neutral-400">3j 31m</div>
                </div>
                <div className="rounded-xl bg-[#0c0c0c] border border-[#1f1f1f] p-3">
                  <div className="text-neutral-500">Sesi 2 (sekarang)</div>
                  <div className="font-mono-telemetry text-white font-semibold mt-0.5">14:02 → sekarang</div>
                  <div className="text-green-400">{formatDuration(sec).slice(0, 7)}</div>
                </div>
                <div className="rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 p-3">
                  <div className="text-neutral-400">Total hari ini</div>
                  <div className="text-lg font-bold font-mono-telemetry text-[#FF1E2D] mt-0.5">± 7j 00m</div>
                  <div className="text-neutral-500">2 sesi</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card title="Riwayat aktivitas" icon={History}>
            <ol className="relative border-l border-[#252525] ml-1.5 space-y-5">
              {TIMELINE.map((t) => (
                <li key={t.time} className="pl-5 relative">
                  <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#111111] ${t.dot}`} />
                  <div className="flex items-baseline gap-3 text-xs">
                    <span className="font-mono-telemetry text-neutral-500">{t.time}</span>
                    <span className="font-bold text-white">{t.title}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{t.desc}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Identifiers */}
          <Card
            title="Identitas akun"
            icon={IdCard}
            action={
              <button onClick={handleReveal} className="text-xs font-semibold flex items-center gap-1.5 text-neutral-300 hover:text-white">
                {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {isRevealed ? "Sembunyikan" : "Tampilkan"}
              </button>
            }
          >
            <p className={`text-[11px] mb-3 ${isRevealed ? "text-amber-400" : "text-neutral-500"}`}>
              {isRevealed ? "Identifier sedang ditampilkan dan sudah tercatat di Audit Log." : "Disamarkan demi privasi. Klik Tampilkan untuk melihat (tercatat di Audit Log)."}
            </p>
            <div className="space-y-2">
              {idRows.map((r) => (
                <div key={r.key} className="rounded-xl bg-[#0c0c0c] border border-[#1f1f1f] p-3">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{r.label}</span>
                    {r.raw && isRevealed && (
                      <button onClick={() => copy(r.raw!, r.key)} className="hover:text-white" aria-label={`Salin ${r.label}`}>
                        {copiedKey === r.key ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                  <div className="text-xs font-mono-telemetry text-white break-all mt-1">
                    {r.raw ? (isRevealed ? r.raw : r.masked) : "Tidak terhubung"}
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-[#0c0c0c] border border-[#1f1f1f] p-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Discord</span>
                  {player.discordId && isRevealed && (
                    <button onClick={() => copy(player.discordId!, "discord")} className="hover:text-white" aria-label="Salin Discord ID">
                      {copiedKey === "discord" ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                <div className="text-xs font-mono-telemetry text-white mt-1">
                  {player.discordId ? (isRevealed ? player.discordId : maskIdentifier(player.discordId, "discord")) : "Tidak terhubung"}
                </div>
                {player.discordId && (
                  <div className="text-xs mt-1">
                    <DiscordMemberRoles discordId={player.discordId} />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Characters */}
          <Card title={`Karakter (${player.characters.length})`} icon={UserRound} bodyClassName="p-3 space-y-2">
            {player.characters.map((ch) => (
              <div
                key={ch.id}
                className={`rounded-xl p-3.5 border text-xs ${ch.isActive ? "bg-[#E50914]/[0.06] border-[#E50914]/40" : "bg-[#0c0c0c] border-[#1f1f1f]"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GroupLogo name={ch.faction} size="h-8 w-8" />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{ch.fullName}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{ch.job} · {ch.jobGrade}</div>
                    </div>
                  </div>
                  <Tag>#{ch.characterId}</Tag>
                </div>
                <div className="flex justify-between mt-2.5 pt-2 border-t border-[#1f1f1f] text-[11px]">
                  <span className="text-neutral-500">Bank {formatCurrency(ch.bank)}</span>
                  <span className={ch.isActive ? "text-[#FF1E2D] font-bold" : "text-neutral-500"}>{ch.isActive ? "Dipakai sekarang" : "Tidak aktif"}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
