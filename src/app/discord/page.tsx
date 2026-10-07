"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, Bot, Link2, AlertTriangle } from "lucide-react";
import { store } from "@/lib/store";
import type { DiscordGuildInfo, DiscordMember, DiscordRole } from "@/lib/discord";

type Overview =
  | { configured: false }
  | { configured: true; error: string; code?: string }
  | { configured: true; guild: DiscordGuildInfo; roles: DiscordRole[]; members: DiscordMember[] | null; warning?: string; fetchedAt: string };

const PAGE = 100;

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
    return <div className="p-12 text-center text-xs font-mono text-slate-400">Menghubungi Discord...</div>;
  }

  if (data && !data.configured) return <SetupGuide />;

  if (data && "error" in data) {
    return (
      <div className="p-6 max-w-3xl space-y-4">
        <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Discord</h1>
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs font-mono text-rose-200 flex gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p>{data.error}</p>
            <button onClick={() => load(true)} className="underline hover:text-rose-100">Coba lagi</button>
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
    <div className="p-6 space-y-6">
      {/* Guild header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {ok.guild.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ok.guild.iconUrl} alt="" className="w-12 h-12 rounded-xl border border-[#232B38]" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40" />
          )}
          <div>
            <h1 className="text-xl font-bold font-mono text-slate-100">{ok.guild.name}</h1>
            <p className="text-xs font-mono text-slate-400">
              {ok.guild.memberCount.toLocaleString("id-ID")} member •{" "}
              <span className="text-emerald-400">{ok.guild.onlineCount.toLocaleString("id-ID")} online</span> •{" "}
              {ok.roles.length} role • {linkedCount} terhubung ke FiveM
            </p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#141A24] border border-[#232B38] text-xs font-mono text-slate-300 hover:text-slate-100 disabled:opacity-50 flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync {new Date(ok.fetchedAt).toLocaleTimeString("id-ID")}
        </button>
      </div>

      {ok.warning && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-mono text-amber-200 flex gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Daftar member belum bisa dibaca</p>
            <p className="text-amber-200/80">
              Buka discord.com/developers/applications → aplikasi bot kamu → menu <strong>Bot</strong> → bagian
              Privileged Gateway Intents → nyalakan <strong>SERVER MEMBERS INTENT</strong> → Save Changes. Lalu klik Sync.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Roles */}
        <aside className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span>Roles</span>
            {roleFilter && (
              <button onClick={() => setRoleFilter(null)} className="text-cyan-400 hover:underline normal-case tracking-normal">
                Reset
              </button>
            )}
          </div>
          <div className="rounded-xl border border-[#232B38] bg-[#12161F] divide-y divide-[#1A212D] max-h-[70vh] overflow-y-auto">
            {ok.roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRoleFilter(roleFilter === r.id ? null : r.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs font-mono transition-colors ${
                  roleFilter === r.id ? "bg-[#1C2433]" : "hover:bg-[#161D29]"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color || "#64748B" }} />
                  <span className="truncate" style={{ color: r.color || "#CBD5E1" }}>{r.name}</span>
                  {r.managed && <Bot className="w-3 h-3 text-slate-500 shrink-0" />}
                </span>
                <span className="text-slate-400 shrink-0">{r.memberCount ?? "—"}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Members */}
        <section className="space-y-3 min-w-0">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari username, nickname, atau ID..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0E1218] border border-[#232D3E] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={linkedOnly} onChange={(e) => setLinkedOnly(e.target.checked)} className="accent-cyan-500" />
                Hanya yang terhubung FiveM
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={hideBots} onChange={(e) => setHideBots(e.target.checked)} className="accent-cyan-500" />
                Sembunyikan bot
              </label>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {filtered.length.toLocaleString("id-ID")} member
            {activeRole && (
              <>
                {" "}dengan role <span style={{ color: activeRole.color || "#CBD5E1" }}>@{activeRole.name}</span>
              </>
            )}
          </div>

          <div className="rounded-xl border border-[#232B38] bg-[#12161F] divide-y divide-[#1A212D]">
            {filtered.length === 0 && <div className="p-4 text-xs font-mono text-slate-400">Tidak ada member yang cocok.</div>}
            {filtered.slice(0, limit).map((m) => {
              const linked = playerByDiscord.get(m.id);
              const roles = m.roleIds
                .map((id) => roleById.get(id))
                .filter((r): r is DiscordRole => Boolean(r))
                .sort((a, b) => b.position - a.position);
              return (
                <div key={m.id} className="flex flex-col md:flex-row md:items-center gap-3 p-3 hover:bg-[#161D29] transition-colors">
                  <div className="flex items-center gap-3 md:w-72 shrink-0 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-[#0A0D12]" loading="lazy" />
                    <div className="min-w-0 text-xs font-mono">
                      <div className="text-slate-100 font-semibold truncate flex items-center gap-1.5">
                        {m.displayName}
                        {m.bot && <span className="text-[9px] px-1 rounded bg-[#5865F2] text-white">BOT</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">@{m.username}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {roles.slice(0, 6).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRoleFilter(r.id)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono border hover:brightness-125"
                        style={{
                          color: r.color || "#CBD5E1",
                          borderColor: `${r.color || "#64748B"}55`,
                          backgroundColor: `${r.color || "#64748B"}14`,
                        }}
                      >
                        {r.name}
                      </button>
                    ))}
                    {roles.length > 6 && <span className="text-[10px] font-mono text-slate-400 self-center">+{roles.length - 6}</span>}
                  </div>

                  <div className="md:w-48 shrink-0 text-xs font-mono md:text-right">
                    {linked ? (
                      <Link href={`/players/${linked.id}`} className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200">
                        <span className={`w-1.5 h-1.5 rounded-full ${linked.online ? "bg-emerald-500" : "bg-slate-600"}`} />
                        <Link2 className="w-3 h-3" />
                        {linked.name}
                      </Link>
                    ) : (
                      <span className="text-slate-500">Belum terhubung</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length > limit && (
            <button
              onClick={() => setLimit((l) => l + PAGE)}
              className="w-full py-2 rounded-lg border border-[#232B38] text-xs font-mono text-slate-300 hover:bg-[#161D29]"
            >
              Tampilkan {Math.min(PAGE, filtered.length - limit)} lagi
            </button>
          )}
        </section>
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
    ["Ambil ID server", "Di Discord: Settings → Advanced → Developer Mode ON, lalu klik kanan nama server → Copy Server ID → DISCORD_GUILD_ID"],
    ["Restart", "Stop lalu jalankan lagi npm run dev"],
  ];
  return (
    <div className={compact ? "space-y-3" : "p-6 max-w-3xl space-y-4"}>
      {!compact && (
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Discord belum terhubung</h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Webhook hanya bisa <em>mengirim</em> pesan. Untuk membaca role dan member, dashboard butuh bot Discord.
          </p>
        </div>
      )}
      <ol className="rounded-xl border border-[#232B38] bg-[#12161F] divide-y divide-[#1A212D] text-xs font-mono">
        {steps.map(([title, desc], i) => (
          <li key={title} className="grid grid-cols-[28px_140px_1fr] gap-3 px-4 py-3">
            <span className="text-cyan-400 font-bold">{i + 1}</span>
            <span className="text-slate-100">{title}</span>
            <span className="text-slate-400">{desc}</span>
          </li>
        ))}
      </ol>
      <p className="text-[11px] font-mono text-slate-500">
        Bot tidak butuh permission Administrator. Token hanya dipakai di server dan tidak pernah dikirim ke browser.
      </p>
    </div>
  );
}
