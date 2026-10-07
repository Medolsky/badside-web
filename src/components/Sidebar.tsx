"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Crosshair,
  UsersRound,
  MessageSquare,
  History,
  Bell,
  BarChart3,
  Network,
  ShieldAlert,
  ShieldCheck,
  Settings,
  ChevronDown,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const SECTIONS: { title: string; tone?: "red" | "amber"; items: NavItem[] }[] = [
  {
    title: "Pantau",
    items: [
      { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
      { name: "Daftar Player", href: "/players", icon: Users },
      { name: "Watchlist", href: "/watchlist", icon: Crosshair },
      { name: "Grup", href: "/groups", icon: UsersRound },
      { name: "Discord", href: "/discord", icon: MessageSquare },
    ],
  },
  {
    title: "Riwayat",
    tone: "red",
    items: [
      { name: "Riwayat Aktivitas", href: "/history", icon: History },
      { name: "Notifikasi", href: "/alerts", icon: Bell },
      { name: "Statistik", href: "/analytics", icon: BarChart3 },
      { name: "Relasi Player", href: "/intel-graph", icon: Network },
    ],
  },
  {
    title: "Admin",
    tone: "amber",
    items: [
      { name: "Management Staff", href: "/management", icon: ShieldCheck },
      { name: "Audit Log", href: "/audit-log", icon: ShieldAlert },
      { name: "Pengaturan", href: "/settings", icon: Settings },
    ],
  },
];

const ALL = SECTIONS.flatMap((s) => s.items);

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = ALL.find((i) => isActive(pathname, i.href)) ?? ALL[0];

  const titleColor = (tone?: "red" | "amber") =>
    tone === "red" ? "text-[#FF1E2D]" : tone === "amber" ? "text-amber-400" : "text-neutral-400";
  const activeBg = (tone?: "red" | "amber") =>
    tone === "amber" ? "bg-amber-600 text-white shadow-lg" : "bg-[#E50914] text-white shadow-lg glow-red-sm";

  return (
    <>
      {/* Mobile: chips + drawer */}
      <div className="lg:hidden w-full border-b border-[#252525] bg-[#0c0c0c]/95 backdrop-blur-md sticky top-16 z-20 px-3 py-2">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-bold uppercase tracking-wider min-w-0">
            <LayoutGrid className="h-3.5 w-3.5 text-[#FF1E2D] shrink-0" />
            <span className="text-white font-semibold truncate">{current.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#181818] border border-[#2a2a2a] text-[10px] font-bold text-neutral-300 hover:text-white transition"
          >
            {open ? "Tutup" : "Semua Menu"}
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap -mx-1 px-1">
          {SECTIONS[0].items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                  active ? "bg-[#E50914] text-white glow-red-sm" : "bg-[#141414] text-neutral-400 hover:text-white border border-[#222]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {open && (
          <div className="mt-2 space-y-3 bg-[#111111] p-3 rounded-2xl border border-[#262626] shadow-xl">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${titleColor(s.tone)}`}>{s.title}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {s.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition ${
                          active ? activeBg(s.tone) : "text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[#252525] bg-[#0c0c0c] p-5 min-h-[calc(100vh-4rem)]">
        <div className="sticky top-21 space-y-6">
          {SECTIONS.map((s, idx) => (
            <div key={s.title} className={idx > 0 ? "pt-4 border-t border-[#202020]" : ""}>
              <div className={`px-3 text-[11px] font-bold uppercase tracking-wider mb-2 ${titleColor(s.tone)}`}>{s.title}</div>
              <nav className="space-y-1">
                {s.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        active ? activeBg(s.tone) : "text-neutral-400 hover:text-white hover:bg-[#161616]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-white" : "text-neutral-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
