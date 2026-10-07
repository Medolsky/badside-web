"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Users, Search, Crosshair, ChevronRight, MapPin, Clock } from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Player } from "@/types";
import { PageHeader, Card, Avatar, OnlineBadge, PriorityBadge, Tag, EmptyState, Segmented, input } from "@/components/ui";

type StatusFilter = "ALL" | "ONLINE" | "WATCHLIST" | "OFFLINE";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [group, setGroup] = useState("ALL");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setPlayers([...store.getPlayers()]);
    if (new URLSearchParams(window.location.search).get("filter") === "watchlist") setStatus("WATCHLIST");
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const groups = useMemo(() => [...new Set(players.map((p) => p.groupName).filter(Boolean))] as string[], [players]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return players.filter((p) => {
      if (status === "ONLINE" && !p.isOnline) return false;
      if (status === "OFFLINE" && p.isOnline) return false;
      if (status === "WATCHLIST" && !p.isWatchlisted) return false;
      if (group !== "ALL" && p.groupName !== group) return false;
      if (!term) return true;
      return (
        p.license.toLowerCase().includes(term) ||
        p.steam?.toLowerCase().includes(term) ||
        p.discordId?.toLowerCase().includes(term) ||
        p.currentServerId?.toString() === term ||
        p.characters.some(
          (c) =>
            c.fullName.toLowerCase().includes(term) ||
            c.characterId.toString().includes(term) ||
            c.faction?.toLowerCase().includes(term) ||
            c.job.toLowerCase().includes(term)
        )
      );
    });
  }, [players, status, group, q]);

  const toggleWatchlist = (e: React.MouseEvent, p: Player) => {
    e.preventDefault();
    e.stopPropagation();
    if (p.isWatchlisted) {
      const wl = store.getWatchlist().find((w) => w.targetId === p.id);
      if (wl) store.removeWatchlistEntry(wl.id);
      else p.isWatchlisted = false;
    } else {
      const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
      store.addWatchlistEntry({
        targetType: "PLAYER",
        targetId: p.id,
        targetName: `${c?.fullName || "Player"} (CID #${c?.characterId})`,
        priority: "HIGH",
        category: "SUSPECT",
        reason: "Ditandai manual dari Daftar Player.",
        createdBy: "STAFF_MONITOR",
      });
    }
    setPlayers([...store.getPlayers()]);
  };

  const count = {
    ALL: players.length,
    ONLINE: players.filter((p) => p.isOnline).length,
    WATCHLIST: players.filter((p) => p.isWatchlisted).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Player"
        icon={Users}
        subtitle="Semua player yang pernah tercatat masuk kota. Klik nama untuk lihat detail."
      />

      {/* Toolbar */}
      <div className="rounded-2xl bg-[#111111] border border-[#222] p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama IC, CID, ID server, Steam, atau Discord..."
            className={`${input} pl-9`}
            aria-label="Cari player"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: "ALL", label: `Semua (${count.ALL})` },
              { value: "ONLINE", label: `Di kota (${count.ONLINE})` },
              { value: "WATCHLIST", label: `Watchlist (${count.WATCHLIST})` },
              { value: "OFFLINE", label: "Offline" },
            ]}
          />
          <select value={group} onChange={(e) => setGroup(e.target.value)} className={`${input} w-auto`} aria-label="Filter grup">
            <option value="ALL">Semua grup</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card bodyClassName="">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="Player tidak ditemukan" desc="Coba ganti kata kunci atau filter." />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block table-scroll-container">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1f1f1f] text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-5">Player</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Grup</th>
                    <th className="py-3 px-4">Lama di kota</th>
                    <th className="py-3 px-4">Lokasi</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {filtered.map((p) => {
                    const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
                    const sec = p.isOnline ? (p.currentSession?.durationSec || 0) + tick : 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#161616] transition group">
                        <td className="py-3 px-5">
                          <Link href={`/players/${p.id}`} className="flex items-center gap-3 min-w-0">
                            <Avatar name={c?.fullName} online={p.isOnline} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white group-hover:text-[#FF1E2D] transition truncate">{c?.fullName}</span>
                                {p.isWatchlisted && <PriorityBadge priority={p.watchlistPriority} short />}
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                CID #{c?.characterId} · {c?.job}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <OnlineBadge online={p.isOnline} label={p.isOnline ? `DI KOTA · #${p.currentServerId}` : undefined} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {p.groupName ? <Tag tone={p.groupName === "BADside" ? "red" : "neutral"}>{p.groupName}</Tag> : <span className="text-neutral-600">—</span>}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {p.isOnline ? (
                            <span className="font-mono-telemetry font-bold text-white">{formatDuration(sec)}</span>
                          ) : (
                            <span className="text-neutral-500">Terakhir {new Date(p.lastSeen).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 max-w-[200px] truncate">{p.isOnline ? p.currentArea || "—" : "—"}</td>
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => toggleWatchlist(e, p)}
                              title={p.isWatchlisted ? "Hapus dari watchlist" : "Tambah ke watchlist"}
                              aria-label={p.isWatchlisted ? "Hapus dari watchlist" : "Tambah ke watchlist"}
                              className={`h-8 w-8 rounded-lg flex items-center justify-center border transition ${
                                p.isWatchlisted
                                  ? "bg-[#E50914] border-[#E50914] text-white glow-red-sm"
                                  : "bg-[#161616] border-[#2a2a2a] text-neutral-400 hover:text-white hover:border-[#E50914]/50"
                              }`}
                            >
                              <Crosshair className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/players/${p.id}`}
                              className="h-8 px-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-neutral-300 hover:text-white hover:border-[#444] flex items-center gap-1 font-semibold transition"
                            >
                              Detail <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#1a1a1a]">
              {filtered.map((p) => {
                const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
                const sec = p.isOnline ? (p.currentSession?.durationSec || 0) + tick : 0;
                return (
                  <Link key={p.id} href={`/players/${p.id}`} className="block p-4 hover:bg-[#161616] transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={c?.fullName} online={p.isOnline} />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{c?.fullName}</div>
                          <div className="text-[11px] text-neutral-500 truncate">
                            CID #{c?.characterId} · {p.groupName || "Tanpa grup"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleWatchlist(e, p)}
                        aria-label={p.isWatchlisted ? "Hapus dari watchlist" : "Tambah ke watchlist"}
                        className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${
                          p.isWatchlisted ? "bg-[#E50914] border-[#E50914] text-white" : "bg-[#161616] border-[#2a2a2a] text-neutral-400"
                        }`}
                      >
                        <Crosshair className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                      <OnlineBadge online={p.isOnline} />
                      {p.isOnline && (
                        <>
                          <span className="flex items-center gap-1 font-mono-telemetry text-white">
                            <Clock className="h-3 w-3" /> {formatDuration(sec)}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3" /> {p.currentArea}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
