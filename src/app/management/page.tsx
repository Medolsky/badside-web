"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Users, Search, RefreshCw, KeyRound, Radio } from "lucide-react";
import { ROLE_IDS } from "@/lib/roles";
import type { DiscordMember, DiscordRole, DiscordGuildInfo } from "@/lib/discord";
import { PageHeader, Card, StatCard, EmptyState, btnGhost, input } from "@/components/ui";

interface OverviewData {
  configured: boolean;
  guild?: DiscordGuildInfo;
  roles?: DiscordRole[];
  members?: (DiscordMember & { isAdmin?: boolean; isBadsideHandler?: boolean; isStaff?: boolean })[];
  management?: {
    adminCount: number;
    handlerCount: number;
    totalStaffCount: number;
    staffList: (DiscordMember & { isAdmin?: boolean; isBadsideHandler?: boolean; isStaff?: boolean })[];
  };
  error?: string;
  fetchedAt?: string;
}

export default function ManagementPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | "HANDLER" | "ADMIN">("ALL");
  const [q, setQ] = useState("");

  const loadData = async (refresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discord/overview${refresh ? "?refresh=1" : ""}`, { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ configured: false, error: "Gagal memuat data Discord." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rolesById = useMemo(() => {
    return new Map(data?.roles?.map((r) => [r.id, r]) ?? []);
  }, [data?.roles]);

  const staff = useMemo(() => {
    if (!data?.members) return [];
    return data.members.filter((m) => {
      const hasAdmin = m.roleIds.includes(ROLE_IDS.ADMIN) || m.roleIds.includes(ROLE_IDS.HIGH_COMMAND);
      const hasHandler = m.roleIds.includes(ROLE_IDS.BADSIDE_HANDLER);
      return hasAdmin || hasHandler;
    });
  }, [data?.members]);

  const filteredStaff = useMemo(() => {
    const term = q.trim().toLowerCase();
    return staff.filter((m) => {
      const isHandler = m.roleIds.includes(ROLE_IDS.BADSIDE_HANDLER);
      const isAdmin = m.roleIds.includes(ROLE_IDS.ADMIN) || m.roleIds.includes(ROLE_IDS.HIGH_COMMAND);

      if (tab === "HANDLER" && !isHandler) return false;
      if (tab === "ADMIN" && !isAdmin) return false;

      if (!term) return true;
      return (
        m.displayName.toLowerCase().includes(term) ||
        m.username.toLowerCase().includes(term) ||
        m.id.includes(term)
      );
    });
  }, [staff, tab, q]);

  const handlers = staff.filter((m) => m.roleIds.includes(ROLE_IDS.BADSIDE_HANDLER));
  const admins = staff.filter((m) => m.roleIds.includes(ROLE_IDS.ADMIN));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Badside Management & Staff"
          icon={ShieldCheck}
          subtitle="Daftar resmi Admin dan Badside Handler yang memiliki otorisasi penuh di Ophelia."
        />
        <button
          onClick={() => loadData(true)}
          disabled={loading}
          className={`${btnGhost} self-start sm:self-auto`}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Sinkron Discord
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Staff"
          value={loading ? "..." : staff.length}
          hint="Admin & Handler"
          icon={Users}
        />
        <StatCard
          label="Badside Handler"
          value={loading ? "..." : handlers.length}
          hint="Otorisasi Operasional"
          icon={ShieldCheck}
          tone="red"
        />
        <StatCard
          label="Admin"
          value={loading ? "..." : admins.length}
          hint="Otorisasi Sistem"
          icon={KeyRound}
          tone="amber"
        />
        <StatCard
          label="Role Server"
          value={loading ? "..." : (data?.roles?.length ?? 0)}
          hint="Role Discord aktif"
          icon={Radio}
        />
      </div>

      {/* Security Banner */}
      <div className="rounded-2xl bg-[#141414] border border-[#262626] p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E50914] animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Akses Terproteksi</h3>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            Sesuai kebijakan Ophelia Darkside, hak akses administratif dibatasi hanya untuk pemegang role{" "}
            <strong className="text-white">🛡️ BADSIDE HANDLER</strong> dan{" "}
            <strong className="text-white">🛡️ ADMIN</strong>. Seluruh tindakan unmask identifier dan perubahan watchlist dicatat ke dalam audit log.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/audit-log"
            className="px-3.5 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] text-xs font-semibold text-white transition flex items-center gap-2"
          >
            <ShieldAlert className="h-4 w-4 text-[#FF1E2D]" />
            Lihat Audit Log
          </Link>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="rounded-2xl bg-[#111111] border border-[#222] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#181818] border border-[#252525] self-start sm:self-auto">
          <button
            onClick={() => setTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === "ALL" ? "bg-[#E50914] text-white shadow-sm glow-red-sm" : "text-neutral-400 hover:text-white"
            }`}
          >
            Semua ({staff.length})
          </button>
          <button
            onClick={() => setTab("HANDLER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === "HANDLER" ? "bg-[#E50914] text-white shadow-sm glow-red-sm" : "text-neutral-400 hover:text-white"
            }`}
          >
            Badside Handler ({handlers.length})
          </button>
          <button
            onClick={() => setTab("ADMIN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === "ADMIN" ? "bg-[#E50914] text-white shadow-sm glow-red-sm" : "text-neutral-400 hover:text-white"
            }`}
          >
            Admin ({admins.length})
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau ID..."
            className={`${input} pl-9`}
            aria-label="Cari staff"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <Card
        title={
          <span>
            Daftar Management ({filteredStaff.length})
            <span className="text-neutral-400 font-normal text-xs ml-2">Data resmi dari Discord</span>
          </span>
        }
        icon={ShieldCheck}
        bodyClassName="p-3"
      >
        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-500">Memuat data staff Discord...</div>
        ) : filteredStaff.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Tidak ada staff yang cocok"
            desc="Coba ubah kata kunci atau tab filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStaff.map((m) => {
              const isHandler = m.roleIds.includes(ROLE_IDS.BADSIDE_HANDLER);
              const isAdmin = m.roleIds.includes(ROLE_IDS.ADMIN);
              const isHighCmd = m.roleIds.includes(ROLE_IDS.HIGH_COMMAND);

              const roleBadges = m.roleIds
                .map((id) => rolesById.get(id))
                .filter((r): r is DiscordRole => Boolean(r))
                .sort((a, b) => b.position - a.position);

              return (
                <div
                  key={m.id}
                  className="rounded-xl bg-[#141414] border border-[#242424] hover:border-[#383838] p-4 transition flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.avatarUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{m.displayName}</span>
                        {isHandler && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E50914] text-white glow-red-sm">
                            HANDLER
                          </span>
                        )}
                        {isAdmin && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                            ADMIN
                          </span>
                        )}
                        {isHighCmd && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                            HIGH COMMAND
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono-telemetry mt-0.5 truncate">
                        @{m.username}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono-telemetry mt-0.5">
                        ID: {m.id}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Role Discord:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {roleBadges.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1a1a1a] text-neutral-300 border border-[#2a2a2a]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color || "#888" }} />
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
