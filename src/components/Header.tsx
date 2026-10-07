"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Clock } from "lucide-react";
import { OmnibarModal } from "./OmnibarModal";
import { store } from "@/lib/store";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [time, setTime] = useState("");
  const [stats, setStats] = useState({ online: 0, watched: 0, alerts: 0 });

  useEffect(() => {
    const refresh = () => {
      fetch("/api/fivem/sync")
        .catch(() => {})
        .finally(() => {
          const o = store.getServerOverview();
          setStats({ online: o.playersOnline, watched: o.watchedOnline, alerts: o.activeAlertsCount });
          setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }));
        });
    };
    refresh();
    const i = setInterval(refresh, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#252525] bg-[#0c0c0c]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/ophelia-logo.png"
                alt="Ophelia Roleplay"
                className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(229,9,20,0.35)]"
              />
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E50914]/15 text-[#FF1E2D] border border-[#E50914]/30">
                BADSIDE
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#161616] border border-[#252525]">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-radar-dot" />
              <span className="text-neutral-300">Kota online</span>
              <span className="text-white">{stats.online} player</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161616] hover:bg-[#1f1f1f] border border-[#252525] text-xs text-neutral-400 hover:text-white transition"
              aria-label="Cari player"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Cari player...</span>
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-[#0c0c0c] border border-[#2a2a2a] text-neutral-500">Ctrl K</kbd>
            </button>

            <Link
              href="/alerts"
              className="relative p-2 rounded-xl bg-[#161616] hover:bg-[#1f1f1f] border border-[#252525] text-neutral-300 hover:text-white transition"
              aria-label={`${stats.alerts} notifikasi belum dibaca`}
            >
              <Bell className="h-4 w-4" />
              {stats.alerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E50914] text-[10px] font-bold flex items-center justify-center">
                  {stats.alerts}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 pl-2.5 border-l border-[#252525] text-xs text-neutral-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono-telemetry text-white">{time || "--:--"}</span>
              <span>WIB</span>
            </div>
          </div>
        </div>
      </header>

      <OmnibarModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
