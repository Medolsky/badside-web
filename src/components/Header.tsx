"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Flame,
  UserCheck
} from "lucide-react";
import { OmnibarModal } from "./OmnibarModal";
import { store } from "@/lib/store";
import { AlertNotification, UserRole } from "@/types";

export function Header() {
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("OWNER");
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    setAlerts(store.getAlerts());

    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }) + " WIB"
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOmnibarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <>
      <header className="h-16 border-b border-[#232B38] bg-[#0E1218]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 pl-72">
        {/* Left Side: Server Status Badge & Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141A24] border border-[#232D3E]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-radar-dot shrink-0" />
            <span className="text-xs font-mono font-semibold text-emerald-400 tracking-wide">
              SERVER ONLINE
            </span>
            <span className="text-slate-400 text-xs">|</span>
            <span className="text-xs font-mono text-slate-300">
              <strong className="text-slate-100 font-bold">127</strong> PLAYERS
            </span>
            <span className="text-slate-400 text-xs">|</span>
            <span className="text-xs font-mono text-rose-400">
              <strong className="text-rose-300 font-bold">8</strong> WATCHED
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#12161F] px-2.5 py-1.5 rounded border border-[#1E2634]">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>PING: <strong className="text-slate-200">34ms</strong></span>
            <span>TICK: <strong className="text-slate-200">64.2Hz</strong></span>
          </div>
        </div>

        {/* Center / Right: Omnibar Search + Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Omnibar Launcher */}
          <button
            onClick={() => setIsOmnibarOpen(true)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#141A24] hover:bg-[#1A2230] border border-[#232D3E] hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition-all text-xs font-mono shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search player, IC, Steam, Discord...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#1C2533] text-[10px] text-slate-400 border border-[#2A3546]">
              Ctrl+K
            </kbd>
          </button>

          {/* Active Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 rounded-lg bg-[#141A24] hover:bg-[#1A2230] border border-[#232D3E] text-slate-300 hover:text-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-mono font-bold flex items-center justify-center text-white animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Alerts Dropdown */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#12161F] border border-[#2A3546] rounded-xl shadow-2xl z-50 p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#232B38]">
                  <span className="text-xs font-bold text-slate-200 font-mono">TACTICAL DISPATCH ALERTS</span>
                  <Link
                    href="/alerts"
                    onClick={() => setIsAlertsOpen(false)}
                    className="text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    View All ({alerts.length})
                  </Link>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {alerts.slice(0, 4).map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-2 rounded text-xs border ${
                        alt.severity === "CRITICAL"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between font-mono">
                        <span>{alt.title}</span>
                        <span className="text-[10px] text-slate-400">Live</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{alt.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher (RBAC) */}
          <div className="flex items-center gap-1.5 bg-[#141A24] border border-[#232D3E] px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 font-mono font-semibold focus:outline-none cursor-pointer"
            >
              <option value="OWNER" className="bg-[#12161F] text-slate-200">ROLE: OWNER</option>
              <option value="ADMINISTRATOR" className="bg-[#12161F] text-slate-200">ROLE: ADMIN</option>
              <option value="STAFF" className="bg-[#12161F] text-slate-200">ROLE: STAFF</option>
              <option value="VIEWER" className="bg-[#12161F] text-slate-200">ROLE: VIEWER</option>
            </select>
          </div>

          {/* Live Clock Display */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-cyan-300 bg-[#12161F] px-2.5 py-1.5 rounded-lg border border-[#1E2634]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeString || "11:25:00 WIB"}</span>
          </div>
        </div>
      </header>

      <OmnibarModal isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} />
    </>
  );
}
