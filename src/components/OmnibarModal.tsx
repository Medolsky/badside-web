"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, Shield, Terminal, ArrowRight, Crosshair } from "lucide-react";
import { store } from "@/lib/store";
import { Player } from "@/types";

interface OmnibarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OmnibarModal({ isOpen, onClose }: OmnibarModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPlayers(store.getPlayers());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return players.slice(0, 6);
    const q = query.toLowerCase().trim();

    return players.filter((p) => {
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
    });
  }, [query, players]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#12161F] border border-[#2A3546] rounded-xl shadow-2xl overflow-hidden shadow-cyan-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#232B38] bg-[#0E1218]">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search by IC Name, Character #CID, Steam Hex, Discord ID, License, Server ID..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none font-mono-telemetry"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1C2433] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-[#1A212D]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              NO MATCH FOUND FOR "{query}". CHECK LICENSE OR STEAM FORMAT.
            </div>
          ) : (
            filtered.map((player) => {
              const activeChar = player.characters.find((c) => c.isActive) || player.characters[0];
              return (
                <div
                  key={player.id}
                  onClick={() => {
                    router.push(`/players/${player.id}`);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1A2230] cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded flex items-center justify-center font-mono font-bold text-xs ${
                        player.isOnline
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {player.isOnline ? `ID ${player.currentServerId}` : "OFF"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {activeChar?.fullName || "Unregistered Character"}
                        </span>
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[#1C2533] text-cyan-300 border border-cyan-800/40">
                          #{activeChar?.characterId}
                        </span>
                        {player.isWatchlisted && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Crosshair className="w-2.5 h-2.5" />
                            {player.watchlistPriority}
                          </span>
                        )}
                        {activeChar?.faction && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {activeChar.faction}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-3">
                        <span>Loc: {player.currentArea || "Offline"}</span>
                        <span>Discord: {player.discordId ? "Linked" : "No"}</span>
                        <span>Steam: {player.steam ? "Linked" : "No"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 group-hover:text-cyan-400">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#0E1218] border-t border-[#232B38] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>[ESC] Close</span>
            <span>[ENTER] Select</span>
          </div>
          <div className="text-cyan-400">SOC Fast Identifier Cross-Reference</div>
        </div>
      </div>
    </div>
  );
}
