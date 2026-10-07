"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Users, 
  Clock, 
  MapPin, 
  Car, 
  Activity, 
  ShieldAlert, 
  Crosshair, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  ArrowLeft, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Network
} from "lucide-react";
import { store, maskIdentifier, formatDuration, formatCurrency } from "@/lib/store";
import { Player, Character } from "@/types";
import { DiscordMemberRoles } from "@/components/DiscordMemberRoles";

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const playerId = resolvedParams.id;

  const [player, setPlayer] = useState<Player | undefined>(undefined);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const p = store.getPlayerById(playerId);
    setPlayer(p);

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [playerId]);

  if (!player && tick > 0) {
    return notFound();
  }

  if (!player) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        SCANNING DATABASE FOR TARGET DOSSIER...
      </div>
    );
  }

  const activeChar = player.characters.find((c) => c.isActive) || player.characters[0];
  const sessionDuration = player.isOnline ? (player.currentSession?.durationSec || 0) + tick : 0;

  const handleRevealIdentifiers = () => {
    if (!isRevealed) {
      // Record to audit log
      store.revealPlayerIdentifier(player.id, "Staff Moderator (You)");
      setAuditMessage("SUCCESS: Full identifiers unmasked. Action committed to Immutable Audit Log #aud-" + Date.now().toString().slice(-4));
      setTimeout(() => setAuditMessage(null), 6000);
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
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
        targetName: `${activeChar?.fullName} (CID #${activeChar?.characterId})`,
        priority: "HIGH",
        category: "SUSPECT",
        reason: "Manually flagged for active surveillance by staff.",
        createdBy: "STAFF_MONITOR"
      });
      player.isWatchlisted = true;
      player.watchlistPriority = "HIGH";
    }
    setPlayer({ ...player });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs font-mono">
        <Link
          href="/players"
          className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Player Registry</span>
        </Link>
        <div className="text-slate-400">
          SURVEILLANCE DOSSIER // UID: {player.id}
        </div>
      </div>

      {/* Audit Notification Toast Bar */}
      {auditMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{auditMessage}</span>
          </div>
          <Link href="/audit-log" className="underline hover:text-emerald-200">
            View Audit Log →
          </Link>
        </div>
      )}

      {/* Header Banner: Player Profile & Live Status */}
      <div className="p-5 rounded-xl bg-[#12161F] border border-[#232B38] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-lg border ${
              player.isOnline
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {player.isOnline ? `ID ${player.currentServerId}` : "OFF"}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {activeChar?.fullName || "Unregistered"}
              </h1>
              <span className="px-2 py-0.5 rounded bg-[#1C2533] text-cyan-300 border border-cyan-800/40 text-xs font-mono font-bold">
                CID #{activeChar?.characterId}
              </span>
              {player.isWatchlisted && (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1">
                  <Crosshair className="w-3 h-3" />
                  WATCHLIST {player.watchlistPriority}
                </span>
              )}
              {activeChar?.faction && (
                <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A855F7] border border-[#8B5CF6]/40 text-xs font-mono font-bold">
                  {activeChar.faction}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
              <span>Job: <strong className="text-slate-200">{activeChar?.job} ({activeChar?.jobGrade})</strong></span>
              <span>•</span>
              <span>Phone: <strong className="text-cyan-300">{activeChar?.phoneNumber || "None"}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleWatchlist}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 border transition-all ${
              player.isWatchlisted
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                : "bg-[#18202D] text-slate-300 border-[#232B38] hover:border-rose-500/40 hover:text-rose-300"
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>{player.isWatchlisted ? "Remove Watchlist" : "Add to Watchlist"}</span>
          </button>

          <Link
            href="/intel-graph"
            className="px-3.5 py-2 rounded-lg bg-[#1C2533] hover:bg-[#232F42] border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-2 transition-all"
          >
            <Network className="w-4 h-4" />
            <span>View Intel Matrix</span>
          </Link>
        </div>
      </div>

      {/* Grid: Live Session Telemetry (Left) & Identifier Credentials (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Session Status & "Sudah Berapa Lama di Kota" */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Session Panel */}
          <div className="p-5 rounded-xl bg-[#12161F] border border-[#232B38] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2634] pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${player.isOnline ? "bg-emerald-500 animate-radar-dot" : "bg-slate-600"}`} />
                <h2 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                  Live Session Telemetry
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {player.isOnline ? "HEARTBEAT BROADCASTING" : "OFFLINE"}
              </span>
            </div>

            {/* Big Counter: "Sudah Berapa Lama di Kota" */}
            <div className="p-4 rounded-xl bg-[#090C10] border border-[#1A212D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Current Session Duration (In City)
                </span>
                <div className="text-3xl font-bold font-mono tracking-tight text-emerald-400 mt-1 font-mono-telemetry">
                  {player.isOnline ? formatDuration(sessionDuration) : "00h 00m 00s (Offline)"}
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Joined at {player.currentSession?.joinedAt ? new Date(player.currentSession.joinedAt).toLocaleTimeString("id-ID") : "N/A"} WIB
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="p-2 rounded bg-[#12161F] border border-[#1E2634] text-xs font-mono">
                  <span className="text-slate-400 text-[10px] block">Server ID</span>
                  <span className="font-bold text-slate-100 text-sm">
                    {player.currentServerId ? `#${player.currentServerId}` : "None"}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#12161F] border border-[#1E2634] text-xs font-mono">
                  <span className="text-slate-400 text-[10px] block">Latency</span>
                  <span className="font-bold text-cyan-300 text-sm">
                    {player.ping ? `${player.ping}ms` : "0ms"}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Spatial Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#0E1218] border border-[#1A212D] space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Current Area / District</span>
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  {player.currentArea || "Offline"}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0E1218] border border-[#1A212D] space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span>Current Vehicle</span>
                </div>
                <div className="text-sm font-semibold text-amber-300">
                  {player.currentVehicle || "On Foot / No Vehicle"}
                </div>
              </div>
            </div>

            {/* Section 8: Today's Multi-Session Breakdown */}
            <div className="pt-2 border-t border-[#1E2634] space-y-3">
              <h3 className="text-xs font-bold font-mono tracking-wide text-slate-300 uppercase">
                Today's Cumulative Playtime & Sessions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A212D]">
                  <span className="text-slate-400 text-[10px] block">Session #1 (Morning)</span>
                  <span className="text-slate-200 font-semibold">08:12 → 11:43</span>
                  <span className="text-cyan-400 text-[11px] block mt-0.5">3h 31m</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A212D]">
                  <span className="text-slate-400 text-[10px] block">Session #2 (Current)</span>
                  <span className="text-emerald-400 font-semibold">14:02 → Present</span>
                  <span className="text-emerald-300 text-[11px] block mt-0.5">
                    {formatDuration(sessionDuration).slice(0, 7)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#141A24] border border-[#232D3E]">
                  <span className="text-slate-400 text-[10px] block">Total Time In City Today</span>
                  <span className="text-base font-bold text-purple-300 block mt-0.5 font-mono-telemetry">
                    ~07h 00m
                  </span>
                  <span className="text-slate-400 text-[10px]">2 Sittings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Player History / Timeline */}
          <div className="p-5 rounded-xl bg-[#12161F] border border-[#232B38] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2634] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                  Surveillance Event Timeline
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">CHRONOLOGICAL AUDIT</span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#232B38]">
              <div className="flex items-start gap-3 pl-7 relative">
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#12161F]" />
                <div className="space-y-0.5 text-xs font-mono">
                  <div className="text-emerald-400 font-bold">10:55:00 • Currently Online & Transmitting</div>
                  <p className="text-slate-300">Pillbox Hill / Downtown LS in Sultan RS [B4DS-01]</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pl-7 relative">
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-[#12161F]" />
                <div className="space-y-0.5 text-xs font-mono">
                  <div className="text-cyan-300 font-bold">10:21:40 • Entered Sandy Shores Perimeter</div>
                  <p className="text-slate-400">High speed vehicle detection on Senora Freeway (140 MPH)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pl-7 relative">
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-[#12161F]" />
                <div className="space-y-0.5 text-xs font-mono">
                  <div className="text-purple-300 font-bold">09:43:10 • Character Switch Logged</div>
                  <p className="text-slate-400">Switched from Jonathan Smith (CID #891) to John Smith (CID #245)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pl-7 relative">
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#12161F]" />
                <div className="space-y-0.5 text-xs font-mono">
                  <div className="text-amber-300 font-bold">08:35:21 • Vehicle Swap Event</div>
                  <p className="text-slate-400">Retrieved Sultan RS from Alta Street Garage</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pl-7 relative">
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#12161F]" />
                <div className="space-y-0.5 text-xs font-mono">
                  <div className="text-emerald-400 font-bold">08:14:32 • Joined City (Server #128)</div>
                  <p className="text-slate-400">Authentication confirmed via license:4a89df8812c37e9091a271bb8912c930</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: FiveM Identifiers (Masked/Reveal) & Character Slots */}
        <div className="space-y-6">
          {/* FiveM Identifiers Card with Masking & Audit Reveal */}
          <div className="p-5 rounded-xl bg-[#12161F] border border-[#232B38] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2634] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                  FiveM Identifiers
                </h2>
              </div>
              <button
                onClick={handleRevealIdentifiers}
                className="px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 bg-[#1C2533] hover:bg-[#232F42] text-cyan-300 border border-cyan-500/40 transition-colors"
              >
                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isRevealed ? "Hide Identifiers" : "Reveal All"}</span>
              </button>
            </div>

            <p className="text-[11px] font-mono text-slate-400">
              {isRevealed ? (
                <span className="text-amber-400 font-semibold">
                  ⚠️ IDENTIFIERS UNMASKED: View recorded to staff audit log.
                </span>
              ) : (
                "Identifiers are masked by default for privacy compliance. Click Reveal to unmask."
              )}
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              {/* FiveM License */}
              <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>FiveM License</span>
                  <button
                    onClick={() => copyToClipboard(player.license, "license")}
                    className="text-cyan-400 hover:text-cyan-200"
                  >
                    {copiedKey === "license" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="font-mono text-slate-100 break-all">
                  {isRevealed ? player.license : maskIdentifier(player.license, "license")}
                </div>
              </div>

              {/* Steam Hex */}
              <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Steam Hex Identifier</span>
                  {player.steam && (
                    <button
                      onClick={() => copyToClipboard(player.steam!, "steam")}
                      className="text-cyan-400 hover:text-cyan-200"
                    >
                      {copiedKey === "steam" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <div className="font-mono text-slate-100 break-all">
                  {player.steam ? (isRevealed ? player.steam : maskIdentifier(player.steam, "steam")) : "Not Linked"}
                </div>
              </div>

              {/* Discord ID & Roles */}
              <div className="p-2.5 rounded bg-[#0A0D12] border border-[#1A212D] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Discord User & Roles</span>
                  {player.discordId && (
                    <button
                      onClick={() => copyToClipboard(player.discordId!, "discord")}
                      className="text-cyan-400 hover:text-cyan-200"
                    >
                      {copiedKey === "discord" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <div className="font-mono text-slate-100">
                  {player.discordId ? (isRevealed ? player.discordId : maskIdentifier(player.discordId, "discord")) : "Not Linked"}
                </div>
                {player.discordId && <DiscordMemberRoles discordId={player.discordId} />}
              </div>

              {/* Xbox & Live */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-[#0A0D12] border border-[#1A212D]">
                  <span className="text-[10px] text-slate-400 block">Xbox</span>
                  <span className="text-[11px] text-slate-200 truncate block">
                    {player.xbox ? (isRevealed ? player.xbox : "******" + player.xbox.slice(-4)) : "None"}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#0A0D12] border border-[#1A212D]">
                  <span className="text-[10px] text-slate-400 block">Rockstar</span>
                  <span className="text-[11px] text-slate-200 truncate block">
                    {player.rockstar ? (isRevealed ? player.rockstar : "******" + player.rockstar.slice(-4)) : "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Character Slots under this License */}
          <div className="p-5 rounded-xl bg-[#12161F] border border-[#232B38] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2634] pb-2">
              <h2 className="text-xs font-bold font-mono tracking-wide text-slate-100 uppercase">
                Characters Under This License ({player.characters.length})
              </h2>
            </div>

            <div className="space-y-2">
              {player.characters.map((char) => (
                <div
                  key={char.id}
                  className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                    char.isActive
                      ? "bg-[#182233] border-cyan-500/40 text-slate-100"
                      : "bg-[#0A0D12] border-[#1A212D] text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{char.fullName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1C2533] text-cyan-300">
                      #{char.characterId}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span>{char.job} • {char.jobGrade}</span>
                    <span className="text-purple-300 font-semibold">{char.faction || "Civilian"}</span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-[#1E2634]">
                    <span>Bank: {formatCurrency(char.bank)}</span>
                    <span className={char.isActive ? "text-emerald-400 font-bold" : "text-slate-400"}>
                      {char.isActive ? "ACTIVE SESSION" : "INACTIVE"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
