"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronRight } from "lucide-react";
import { store } from "@/lib/store";
import { Player } from "@/types";
import { formatBadsideMemberName } from "@/lib/badside-tag";
import { Avatar, PriorityBadge } from "./ui";

interface OmnibarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OmnibarModal({ isOpen, onClose }: OmnibarModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setPlayers(store.getPlayers());
      setQuery("");
      setActive(0);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return players.slice(0, 6);
    const q = query.toLowerCase().trim();
    return players.filter((p) => {
      return (
        p.license.toLowerCase().includes(q) ||
        p.steam?.toLowerCase().includes(q) ||
        p.discordId?.toLowerCase().includes(q) ||
        p.currentServerId?.toString() === q ||
        p.characters.some(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            c.characterId.toString().includes(q) ||
            c.faction?.toLowerCase().includes(q) ||
            c.job.toLowerCase().includes(q)
        )
      );
    });
  }, [query, players]);

  const go = (p?: Player) => {
    if (!p) return;
    router.push(`/players/${p.id}`);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        go(filtered[active]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, filtered, active]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cari player"
        className="w-full max-w-xl bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1f1f1f]">
          <Search className="h-5 w-5 text-[#FF1E2D] shrink-0" />
          <input
            type="text"
            placeholder="Ketik nama IC, CID, ID server, Steam, atau Discord..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            autoFocus
          />
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1f1f1f]" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-neutral-500">Tidak ada player yang cocok dengan &quot;{query}&quot;.</div>
          ) : (
            filtered.map((p, i) => {
              const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
              const displayName = formatBadsideMemberName(c?.fullName || p.name || "Tanpa nama", p.groupName);
              return (
                <button
                  key={p.id}
                  onClick={() => go(p)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition ${i === active ? "bg-[#1a1a1a]" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={displayName} online={p.isOnline} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold truncate ${i === active ? "text-[#FF1E2D]" : "text-white"}`}>{displayName}</span>
                        {p.isWatchlisted && <PriorityBadge priority={p.watchlistPriority} short />}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        CID #{c?.characterId || "—"} · {p.groupName || c?.faction || "Tanpa grup"} · {p.isOnline ? `Di kota #${p.currentServerId}` : "Offline"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-600 shrink-0" />
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-[#1f1f1f] flex items-center gap-4 text-[11px] text-neutral-500">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#2a2a2a]">↑↓</kbd> pilih</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#2a2a2a]">Enter</kbd> buka</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#2a2a2a]">Esc</kbd> tutup</span>
        </div>
      </div>
    </div>
  );
}
