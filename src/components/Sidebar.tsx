"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldAlert, 
  Users, 
  Crosshair, 
  UsersRound, 
  History, 
  Network, 
  Bell, 
  BarChart3, 
  FileText, 
  Settings, 
  Radio, 
  Server,
  Terminal,
  Activity,
  MessageSquare
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { name: "SOC Dashboard", href: "/dashboard", icon: Radio },
  { name: "Player Monitoring", href: "/players", icon: Users, badge: "127" },
  { name: "Target Watchlist", href: "/watchlist", icon: Crosshair, badge: "4", badgeColor: "bg-rose-500/20 text-rose-400 border border-rose-500/30" },
  { name: "Factions & Groups", href: "/groups", icon: UsersRound, badge: "BADside" },
  { name: "Discord Members", href: "/discord", icon: MessageSquare },
  { name: "Session History", href: "/history", icon: History },
  { name: "Intel Matrix Graph", href: "/intel-graph", icon: Network },
  { name: "Alerts & Dispatch", href: "/alerts", icon: Bell, badge: "4", badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  { name: "Telemetry Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Audit Trail", href: "/audit-log", icon: FileText },
  { name: "Engine & FiveM Sync", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#232B38] bg-[#0E1218] flex flex-col h-screen fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#232B38] flex items-center justify-between bg-[#0B0D10]/80">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">
            <ShieldAlert className="w-5 h-5 text-[#8B5CF6]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-radar-dot" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-slate-100 font-mono-telemetry">BADSIDE</span>
              <span className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A855F7] border border-[#8B5CF6]/40">
                INTEL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">FIVEM SOC MONITOR // V2.4</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-wider text-slate-400">
          Surveillance Core
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all group ${
                isActive
                  ? "bg-[#1C2433] text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/40"
                  : "text-slate-300 hover:text-slate-100 hover:bg-[#151B24] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    item.badgeColor || (isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-[#1E2530] text-slate-400")
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* FiveM Live Server Status Box */}
      <div className="p-3 border-t border-[#232B38] bg-[#0A0D12]">
        <div className="p-2.5 rounded bg-[#12161F] border border-[#1E2634] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 font-mono tracking-tight">FIVEM LIVE</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">128ms / 64Hz</span>
          </div>

          <div className="space-y-1 text-[10px] font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Server Target:</span>
              <span className="text-slate-200">127.0.0.1:30120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Capacity:</span>
              <span className="text-emerald-400 font-medium">127 / 256 (50%)</span>
            </div>
            <div className="w-full bg-[#1C2330] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[50%]" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
