"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, Bot, Link2, AlertTriangle, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { store } from "@/lib/store";
import type { DiscordGuildInfo, DiscordMember, DiscordRole } from "@/lib/discord";
import { PageHeader, Card, StatCard, EmptyState, input, btnGhost } from "@/components/ui";

type Overview =
  | { configured: false }
  | { configured: true; error: string; code?: string }
  | { configured: true; guild: DiscordGuildInfo; roles: DiscordRole[]; members: DiscordMember[] | null; warning?: string; fetchedAt: string };

const PAGE = 100;

function RoleChip({ role, onClick }: { role: DiscordRole; onClick?: () => void }) {
  const color = role.color || "#A3A3A3";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#181818] border border-[#2a2a2a] text-neutral-200 hover:border-[#444] transition"
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {role.name}
    </button>
  );
}

export default function DiscordPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [hideBots, setHideBots] = useState(true);
  const [linkedOnly, setLinkedOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discord/overview${refresh ? "?refresh=1" : ""}`, { cache: "no-store" });
      setData(await res.json());
    } catch {
      setData({ configured: true, error: "Tidak bisa menghubungi server dashboard." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Discord ID -> FiveM player (from the discord: identifier sent by the resource)
  const playerByDiscord = useMemo(() => {
    const map = new Map<string, { id: string; name: string; online: boolean }>();
    for (const p of store.getPlayers()) {
      if (!p.discordId) continue;
      const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
      map.set(p.discordId.replace("discord:", ""), { id: p.id, name: c?.fullName || p.id, online: p.isOnline });
    }
    return map;
  }, []);

  const ok = data && data.configured && "guild" in data ? data : null;
  const roleById = useMemo(() => new Map(ok?.roles.map((r) => [r.id, r]) ?? []), [ok]);

  const filtered = useMemo(() => {
    if (!ok?.members) return [];
    const term = q.trim().toLowerCase();
    return ok.members
      .filter((m) => !hideBots || !m.bot)
      .filter((m) => !roleFilter || m.roleIds.includes(roleFilter))
      .filter((m) => !linkedOnly || playerByDiscord.has(m.id))
      .filter(
        (m) =>
          !term ||
          m.username.toLowerCase().includes(term) ||
          m.displayName.toLowerCase().includes(term) ||
          m.id.includes(term)
      )
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [ok, q, roleFilter, hideBots, linkedOnly, playerByDiscord]);

  useEffect(() => setLimit(PAGE), [q, roleFilter, hideBots, linkedOnly]);

  if (loading && !data) {
    return <div className="py-16 text-center text-sm text-neutral-500">Menghubungi Discord...</div>;
  }

  if (data && !data.configured) return <SetupGuide />;

  if (data && "error" in data) {
    return (
      <div className="max-w-3xl space-y-5">
        <PageHeader title="Discord" icon={MessageSquare} />
        <div className="p-4 rounded-2xl border border-[#E50914]/40 bg-[#E50914]/10 text-sm text-red-200 flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#FF1E2D]" />
          <div className="space-y-2">
            <p>{data.error}</p>
            <button onClick={() => load(true)} className="font-semibold underline hover:text-white">
              Coba lagi
            </button>
          </div>
        </div>
        <SetupGuide compact />
      </div>
    );
  }

  if (!ok) return null;

  const activeRole = roleFilter ? roleById.get(roleFilter) : null;
  const linkedCount = ok.members ? ok.members.filter((m) => playerByDiscord.has(m.id)).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {ok.guild.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ok.guild.iconUrl} alt="" className="h-14 w-14 rounded-2xl border border-[#2a2a2a]" />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-[#FF1E2D]" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{ok.guild.name}</h1>
            <p className="text-xs sm:text-sm text-neutral-400">Server Discord yang terhubung ke dashboard</p>
          </div>
        </div>
        <button onClick={() => load(true)} disabled={loading} className={btnGhost}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Sinkron ulang · {new Date(ok.fetchedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Member" value={ok.guild.memberCount.toLocaleString("id-ID")} icon={Users} />
        <StatCard label="Online" value={ok.guild.onlineCount.toLocaleString("id-ID")} icon={Users} tone="green" />
        <StatCard label="Role" value={ok.roles.length} icon={ShieldCheck} tone="red" />
        <StatCard label="Terhubung FiveM" value={linkedCount} icon={Link2} />
      </div>

      {ok.warning && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-300">Daftar member belum bisa dibaca</p>
            <ol className="list-decimal list-inside space-y-0.5 text-amber-200/90">
              <li>Buka discord.com/developers/applications → pilih aplikasi bot</li>
              <li>Menu <strong>Bot</strong> → Privileged Gateway Intents</li>
              <li>Nyalakan <strong>SERVER MEMBERS INTENT</strong> → Save Changes</li>
              <li>Kembali ke sini lalu klik <strong>Sinkron ulang</strong></li>
            </ol>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        <Card
          title="Role"
          icon={ShieldCheck}
          action={
            roleFilter && (
              <button onClick={() => setRoleFilter(null)} className="text-xs font-semibold text-[#FF1E2D] hover:underline">
                Reset
              </button>
            )
          }
          bodyClassName="max-h-[65vh] overflow-y-auto p-2"
        >
          {ok.roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(roleFilter === r.id ? null : r.id)}
              aria-pressed={roleFilter === r.id}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                roleFilter === r.id ? "bg-[#E50914] text-white glow-red-sm" : "text-neutral-300 hover:bg-[#181818] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-black/40" style={{ backgroundColor: r.color || "#A3A3A3" }} />
                <span className="truncate">{r.name}</span>
                {r.managed && <Bot className="h-3 w-3 opacity-60 shrink-0" />}
              </span>
              <span className={`shrink-0 font-mono-telemetry ${roleFilter === r.id ? "text-white/80" : "text-neutral-500"}`}>{r.memberCount ?? ""}</span>
            </button>
          ))}
        </Card>

        <div className="space-y-3 min-w-0">
          <div className="rounded-2xl bg-[#111111] border border-[#222] p-3 sm:p-4 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari username, nickname, atau ID..." className={`${input} pl-9`} aria-label="Cari member" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={linkedOnly} onChange={(e) => setLinkedOnly(e.target.checked)} className="h-4 w-4 accent-[#E50914]" />
                Terhubung FiveM saja
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hideBots} onChange={(e) => setHideBots(e.target.checked)} className="h-4 w-4 accent-[#E50914]" />
                Sembunyikan bot
              </label>
            </div>
          </div>

          <Card
            title={
              <span>
                {filtered.length.toLocaleString("id-ID")} member
                {activeRole && <span className="text-neutral-400 font-normal"> dengan role {activeRole.name}</span>}
              </span>
            }
            icon={Users}
            bodyClassName="divide-y divide-[#1a1a1a]"
          >
            {filtered.length === 0 && (
              <EmptyState
                icon={Users}
                title={ok.members ? "Tidak ada member yang cocok" : "Daftar member belum tersedia"}
                desc={ok.members ? "Coba ubah filter atau kata kunci." : "Aktifkan Server Members Intent dulu (lihat petunjuk di atas)."}
              />
            )}
            {filtered.slice(0, limit).map((m) => {
              const linked = playerByDiscord.get(m.id);
              const roles = m.roleIds
                .map((id) => roleById.get(id))
                .filter((r): r is DiscordRole => Boolean(r))
                .sort((a, b) => b.position - a.position);
              return (
                <div key={m.id} className="flex flex-col md:flex-row md:items-center gap-3 px-4 sm:px-5 py-3 hover:bg-[#161616] transition">
                  <div className="flex items-center gap-3 md:w-64 shrink-0 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.avatarUrl} alt="" className="h-10 w-10 rounded-xl bg-[#181818] border border-[#2a2a2a]" loading="lazy" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                        {m.displayName}
                        {m.bot && <span className="text-[9px] px-1.5 rounded bg-[#2a2a2a] text-neutral-300">BOT</span>}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">@{m.username}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {roles.slice(0, 5).map((r) => (
                      <RoleChip key={r.id} role={r} onClick={() => setRoleFilter(r.id)} />
                    ))}
                    {roles.length > 5 && <span className="text-[10px] text-neutral-500 self-center">+{roles.length - 5}</span>}
                  </div>

                  <div className="md:w-48 shrink-0 text-xs md:text-right">
                    {linked ? (
                      <Link href={`/players/${linked.id}`} className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-[#FF1E2D]">
                        <span className={`h-2 w-2 rounded-full ${linked.online ? "bg-green-500" : "bg-neutral-600"}`} />
                        {linked.name}
                      </Link>
                    ) : (
                      <span className="text-neutral-600">Belum terhubung</span>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>

          {filtered.length > limit && (
            <button onClick={() => setLimit((l) => l + PAGE)} className={`${btnGhost} w-full`}>
              Tampilkan {Math.min(PAGE, filtered.length - limit)} lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SetupGuide({ compact = false }: { compact?: boolean }) {
  const steps: [string, string][] = [
    ["Buat aplikasi", "discord.com/developers/applications → New Application"],
    ["Ambil token", "Menu Bot → Reset Token → salin ke DISCORD_BOT_TOKEN di .env"],
    ["Aktifkan intent", "Menu Bot → Privileged Gateway Intents → nyalakan SERVER MEMBERS INTENT"],
    ["Invite bot", "Menu OAuth2 → URL Generator → scope 'bot' → permission 'View Channels' → buka URL dan pilih server"],
    ["Ambil ID server", "Discord: Settings → Advanced → Developer Mode ON, klik kanan nama server → Copy Server ID → DISCORD_GUILD_ID"],
    ["Restart", "Stop lalu jalankan lagi npm run dev"],
  ];
  return (
    <div className={compact ? "space-y-3" : "max-w-3xl space-y-5"}>
      {!compact && (
        <PageHeader
          title="Discord belum terhubung"
          icon={MessageSquare}
          subtitle="Webhook hanya bisa mengirim pesan. Untuk membaca role dan member, dashboard butuh bot Discord."
        />
      )}
      <Card title="Cara menghubungkan" bodyClassName="divide-y divide-[#1a1a1a]">
        {steps.map(([title, desc], i) => (
          <div key={title} className="flex gap-4 px-4 sm:px-5 py-3.5">
            <span className="h-7 w-7 rounded-full bg-[#E50914] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <div className="text-xs">
              <div className="font-bold text-white">{title}</div>
              <div className="text-neutral-400 mt-0.5">{desc}</div>
            </div>
          </div>
        ))}
      </Card>
      <p className="text-xs text-neutral-500">Bot tidak butuh permission Administrator. Token hanya dipakai di server dan tidak pernah dikirim ke browser.</p>
    </div>
  );
}
