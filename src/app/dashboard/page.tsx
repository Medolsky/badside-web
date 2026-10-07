"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Crosshair, 
  ShieldAlert, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle, 
  Radio, 
  Car, 
  MapPin, 
  ChevronRight,
  ExternalLink,
  Flame,
  CheckCircle,
  Eye
} from "lucide-react";
import { store, formatDuration } from "@/lib/store";
import { Player, Group, WatchlistEntry, EventLog, AlertNotification, ServerOverview } from "@/types";

export default function DashboardPage() {
  const [overview, setOverview] = useState<ServerOverview>(store.getServerOverview());
  const [players, setPlayers] = useState<Player[]>([]);
  const [watchedPlayers, setWatchedPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const p = store.getPlayers();
    setPlayers(p);
    setWatchedPlayers(p.filter((ply) => ply.isWatchlisted && ply.isOnline));
    setGroups(store.getGroups());
    setEvents(store.getEvents());
    setAlerts(store.getAlerts());
    setOverview(store.getServerOverview());

    // Live session clock ticker every second
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner: SOC Mission Control Status */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#141A24] via-[#10141C] to-[#12161F] border border-[#232B38] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
            <Radio className="w-6 h-6 animate-pulse text-[#8B5CF6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono tracking-wide text-slate-100">
                TACTICAL SOC TELEMETRY // OPHELIA FIVEM ECOSYSTEM
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE STREAM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Targeted Syndicate & Player Surveillance Engine • Real-time Heartbeat Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/players"
            className="px-3.5 py-2 rounded-lg bg-[#1C2533] hover:bg-[#232F42] border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Open Player Registry</span>
          </Link>
          <Link
            href="/watchlist"
            className="px-3.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Crosshair className="w-4 h-4" />
            <span>Target Watchlist</span>
          </Link>
        </div>
      </div>

      {/* Primary SOC Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Players Online */}
        <div className="p-4 rounded-xl bg-[#12161F] border border-[#1E2634] space-y-2 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Players Online</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-100">
              {overview.playersOnline}
            </span>
            <span className="text-xs font-mono text-slate-400">/ {overview.maxSlots} slots</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Peak today: 184 at 21:00</span>
          </div>
        </div>

        {/* Metric 2: Watched Players Online */}
        <div className="p-4 rounded-xl bg-[#12161F] border border-[#1E2634] space-y-2 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold">
              Watched In City
            </span>
            <Crosshair className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-rose-300">
              {overview.watchedOnline}
            </span>
            <span className="text-xs font-mono text-slate-400">active targets</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>BADside: 8 active</span>
            <span className="text-rose-400 font-semibold">CRITICAL</span>
          </div>
        </div>

        {/* Metric 3: Active Alerts */}
        <div className="p-4 rounded-xl bg-[#12161F] border border-[#1E2634] space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Active Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-amber-300">
              {overview.activeAlertsCount}
            </span>
            <span className="text-xs font-mono text-slate-400">unresolved</span>
          </div>
          <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
            <span>2 Watchlist • 2 Convergence</span>
          </div>
        </div>

        {/* Metric 4: Average Session */}
        <div className="p-4 rounded-xl bg-[#12161F] border border-[#1E2634] space-y-2 relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Avg Session Time</span>
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-purple-200">
              {formatDuration(overview.averageSessionDurationSec).slice(0, 7)}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            <span>Total joined today: <strong>{overview.playersEnteredToday}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Watched Targets HUD (Left) vs Watchlist Activity Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Watched Targets in City */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                Watched Targets Currently In City ({watchedPlayers.length})
              </h2>
            </div>
            <Link
              href="/players?filter=watchlist"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Targets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {watchedPlayers.map((player) => {
              const activeChar = player.characters.find((c) => c.isActive) || player.characters[0];
              const sessionSec = (player.currentSession?.durationSec || 0) + tick;

              return (
                <div
                  key={player.id}
                  className="p-4 rounded-xl bg-[#12161F] border border-[#232B38] hover:border-rose-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {activeChar?.fullName}
                        </span>
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[#1C2533] text-cyan-300 border border-cyan-800/40">
                          #{activeChar?.characterId}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {player.watchlistPriority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {activeChar?.faction || "Independent"} • {activeChar?.job}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>SRV #{player.currentServerId}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                        {player.ping}ms ping
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Readout */}
                  <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D] space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        In City:
                      </span>
                      <strong className="text-emerald-400 font-mono-telemetry font-bold">
                        {formatDuration(sessionSec)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        Zone:
                      </span>
                      <span className="text-slate-200 truncate max-w-[180px]">
                        {player.currentArea || "Unknown Zone"}
                      </span>
                    </div>

                    {player.currentVehicle && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-amber-400" />
                          Vehicle:
                        </span>
                        <span className="text-amber-300 font-medium truncate max-w-[180px]">
                          {player.currentVehicle}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">
                      License: {player.license.substring(0, 14)}...
                    </span>
                    <Link
                      href={`/players/${player.id}`}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Full Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group Overview Quick HUD: BADside Syndicate Focus */}
          <div className="p-4 rounded-xl bg-[#12161F] border border-[#232B38] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#8B5CF6]" />
                <h3 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                  Primary Surveillance: BADSIDE Group
                </h3>
              </div>
              <Link
                href="/groups/badside"
                className="text-xs font-mono text-[#8B5CF6] hover:underline flex items-center gap-1"
              >
                <span>Group Intel Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D]">
                <span className="text-slate-400 text-[10px] block">Total Members</span>
                <span className="text-base font-bold text-slate-100">27</span>
              </div>
              <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D]">
                <span className="text-slate-400 text-[10px] block">Active In City</span>
                <span className="text-base font-bold text-emerald-400">8 Online</span>
              </div>
              <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D]">
                <span className="text-slate-400 text-[10px] block">Total Duty Today</span>
                <span className="text-base font-bold text-purple-300">34h 21m</span>
              </div>
              <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D]">
                <span className="text-slate-400 text-[10px] block">Last Activity</span>
                <span className="text-base font-bold text-cyan-400">10:52:32</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Watchlist Activity Ticker & Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                Live Watchlist Activity
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">AUTO-REFRESH 1s</span>
          </div>

          <div className="p-4 rounded-xl bg-[#12161F] border border-[#232B38] space-y-3">
            <div className="space-y-2.5">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A212D] text-xs font-mono space-y-1 hover:border-[#2E3849] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-cyan-400 font-bold">
                      {evt.timestamp}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        evt.eventType === "JOIN_CITY"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : evt.eventType === "LEAVE_CITY"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {evt.eventType.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-slate-200 font-medium">
                    {evt.playerName}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {evt.eventData}
                  </p>

                  {evt.location && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Link
              href="/history"
              className="block text-center py-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 border-t border-[#1E2634] mt-2"
            >
              View Full Surveillance Timeline →
            </Link>
          </div>

          {/* System Heartbeat & FiveM Hook Integrity */}
          <div className="p-4 rounded-xl bg-[#12161F] border border-[#232B38] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>FIVEM RESOURCE INTEGRITY</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              `badside_intel` Lua resource is transmitting heartbeats every 5.0 seconds. No packet anomalies detected in last 24h.
            </p>
            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>Heartbeat Loss Timeout: 30s</span>
              <span>Next Sync: in 3s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
