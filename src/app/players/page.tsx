"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  Crosshair, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Car, 
  MapPin,
  ChevronRight,
  Flame,
  ArrowUpDown
} from "lucide-react";
import { store, formatDuration, maskIdentifier } from "@/lib/store";
import { Player } from "@/types";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "OFFLINE" | "WATCHLIST">("ALL");
  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setPlayers(store.getPlayers());
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      // Status filter
      if (statusFilter === "ONLINE" && !p.isOnline) return false;
      if (statusFilter === "OFFLINE" && p.isOnline) return false;
      if (statusFilter === "WATCHLIST" && !p.isWatchlisted) return false;

      // Group filter
      if (groupFilter !== "ALL" && p.groupName !== groupFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchLicense = p.license.toLowerCase().includes(q);
        const matchSteam = p.steam?.toLowerCase().includes(q);
        const matchDiscord = p.discordId?.toLowerCase().includes(q);
        const matchServerId = p.currentServerId?.toString() === q;
        const matchChar = p.characters.some(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            c.characterId.toString().includes(q) ||
            c.faction?.toLowerCase().includes(q) ||
            c.job.toLowerCase().includes(q)
        );
        return matchLicense || matchSteam || matchDiscord || matchServerId || matchChar;
      }

      return true;
    });
  }, [players, statusFilter, groupFilter, searchQuery]);

  const toggleWatchlist = (e: React.MouseEvent, playerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const p = players.find((ply) => ply.id === playerId);
    if (!p) return;

    if (p.isWatchlisted) {
      // Find watchlist entry and remove
      const wl = store.getWatchlist().find((w) => w.targetId === playerId);
      if (wl) {
        store.removeWatchlistEntry(wl.id);
      } else {
        p.isWatchlisted = false;
      }
    } else {
      const activeChar = p.characters.find((c) => c.isActive) || p.characters[0];
      store.addWatchlistEntry({
        targetType: "PLAYER",
        targetId: p.id,
        targetName: `${activeChar?.fullName || "Player"} (CID #${activeChar?.characterId})`,
        priority: "HIGH",
        category: "SUSPECT",
        reason: "Manually flagged for active surveillance by staff.",
        createdBy: "STAFF_MONITOR"
      });
    }

    setPlayers([...store.getPlayers()]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">
              Player Surveillance Registry
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#1C2533] text-cyan-300 border border-cyan-800/40">
              {filteredPlayers.length} Active Targets
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time cross-referenced player identities, live session stopwatch, and identifier matrix.
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              statusFilter === "ALL"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-[#141A24] text-slate-400 border border-[#232B38] hover:text-slate-200"
            }`}
          >
            All ({players.length})
          </button>
          <button
            onClick={() => setStatusFilter("ONLINE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              statusFilter === "ONLINE"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-[#141A24] text-slate-400 border border-[#232B38] hover:text-slate-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online ({players.filter((p) => p.isOnline).length})
          </button>
          <button
            onClick={() => setStatusFilter("WATCHLIST")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              statusFilter === "WATCHLIST"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "bg-[#141A24] text-slate-400 border border-[#232B38] hover:text-slate-200"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
            Watchlist ({players.filter((p) => p.isWatchlisted).length})
          </button>
          <button
            onClick={() => setStatusFilter("OFFLINE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              statusFilter === "OFFLINE"
                ? "bg-slate-700/50 text-slate-300 border border-slate-600"
                : "bg-[#141A24] text-slate-400 border border-[#232B38] hover:text-slate-200"
            }`}
          >
            Offline
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl bg-[#12161F] border border-[#232B38] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search IC Name, Character ID, Steam, Discord..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E1218] border border-[#232D3E] text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Group:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="bg-[#0E1218] border border-[#232D3E] text-slate-200 text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Factions</option>
              <option value="BADside">BADside</option>
              <option value="LSPD">LSPD</option>
              <option value="EMS">EMS</option>
              <option value="Ballas Syndicate">Ballas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Surveillance Table */}
      <div className="rounded-xl border border-[#232B38] bg-[#12161F] overflow-hidden shadow-2xl">
        <div className="table-scroll-container">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#232B38] bg-[#0E1218] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Status & Srv</th>
                <th className="py-3.5 px-4">IC Character</th>
                <th className="py-3.5 px-4">CID</th>
                <th className="py-3.5 px-4">Faction / Group</th>
                <th className="py-3.5 px-4">Live Session Duration</th>
                <th className="py-3.5 px-4">Current Area</th>
                <th className="py-3.5 px-4">Discord</th>
                <th className="py-3.5 px-4">Steam Hex</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A212D]">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No players matching the active surveillance filters.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const activeChar = player.characters.find((c) => c.isActive) || player.characters[0];
                  const sessionSec = player.isOnline
                    ? (player.currentSession?.durationSec || 0) + tick
                    : 0;

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-[#161D29] transition-colors group"
                    >
                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {player.isOnline ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-radar-dot" />
                            <span className="font-bold text-emerald-400">
                              ONLINE #{player.currentServerId}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                            <span>OFFLINE</span>
                          </div>
                        )}
                      </td>

                      {/* IC Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/players/${player.id}`}
                          className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{activeChar?.fullName}</span>
                          {player.isWatchlisted && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {player.watchlistPriority}
                            </span>
                          )}
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {activeChar?.job}
                        </span>
                      </td>

                      {/* Character ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#1C2533] text-cyan-300 border border-cyan-800/40 font-semibold">
                          #{activeChar?.characterId}
                        </span>
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {player.groupName ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              player.groupName === "BADside"
                                ? "bg-[#8B5CF6]/20 text-[#A855F7] border-[#8B5CF6]/40"
                                : player.groupName === "LSPD"
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {player.groupName}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Session Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {player.isOnline ? (
                          <div className="flex items-center gap-1.5 text-emerald-300 font-bold font-mono-telemetry">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{formatDuration(sessionSec)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Offline</span>
                        )}
                      </td>

                      {/* Area */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        {player.isOnline ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {player.currentArea || "In City"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Last Seen {player.lastSeen.slice(0, 10)}</span>
                        )}
                      </td>

                      {/* Discord */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {player.discordId ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Linked</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Unlinked</span>
                        )}
                      </td>

                      {/* Steam */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {player.steam ? (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Linked</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Unlinked</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => toggleWatchlist(e, player.id)}
                            title={player.isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                            className={`p-1.5 rounded transition-colors ${
                              player.isWatchlisted
                                ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40"
                                : "bg-[#18202D] text-slate-400 hover:text-slate-200 border border-[#232B38]"
                            }`}
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/players/${player.id}`}
                            className="px-2.5 py-1 rounded bg-[#1C2533] hover:bg-[#232F42] border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1 transition-all"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
