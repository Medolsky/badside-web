// Server-side only. Reads guild, roles and members through the Discord REST API using a bot token.
// Never import this from a "use client" component: it needs DISCORD_BOT_TOKEN.

const API = "https://discord.com/api/v10";
const CACHE_TTL_MS = 60_000;
const MAX_MEMBER_PAGES = 20; // 20 x 1000 = 20k members

export interface DiscordRole {
  id: string;
  name: string;
  color: string | null; // "#rrggbb" or null when the role has no color
  position: number;
  managed: boolean; // bot/integration roles
  memberCount: number | null; // null when the member list can't be read (intent disabled)
}

export interface DiscordMember {
  id: string;
  username: string;
  displayName: string;
  nickname: string | null;
  avatarUrl: string;
  bot: boolean;
  roleIds: string[];
  joinedAt: string;
}

export interface DiscordGuildInfo {
  id: string;
  name: string;
  iconUrl: string | null;
  memberCount: number;
  onlineCount: number;
}

export class DiscordError extends Error {
  constructor(public code: "NOT_CONFIGURED" | "INVALID_TOKEN" | "NO_ACCESS" | "MISSING_INTENT" | "NOT_FOUND" | "UPSTREAM", message: string, public status = 502) {
    super(message);
  }
}

interface RawRole { id: string; name: string; color: number; position: number; managed: boolean }
interface RawUser { id: string; username: string; global_name: string | null; avatar: string | null; bot?: boolean; discriminator?: string }
interface RawMember { user: RawUser; nick: string | null; avatar: string | null; roles: string[]; joined_at: string }

const cache = new Map<string, { at: number; value: unknown }>();

function config() {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  if (!token || !guildId) {
    throw new DiscordError("NOT_CONFIGURED", "DISCORD_BOT_TOKEN dan DISCORD_GUILD_ID belum diisi di .env", 503);
  }
  return { token, guildId };
}

export function isDiscordConfigured(): boolean {
  return Boolean(process.env.DISCORD_BOT_TOKEN?.trim() && process.env.DISCORD_GUILD_ID?.trim());
}

async function discordGet<T>(path: string, attempt = 0): Promise<T> {
  const { token } = config();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bot ${token}`, "User-Agent": "DiscordBot (https://localhost, 1.0.0) BadsideMonitor" },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  if (res.ok) return (await res.json()) as T;

  if (res.status === 429 && attempt < 2) {
    const body = (await res.json().catch(() => ({}))) as { retry_after?: number };
    await new Promise((r) => setTimeout(r, Math.min((body.retry_after ?? 1) * 1000, 10_000)));
    return discordGet<T>(path, attempt + 1);
  }

  const body = (await res.json().catch(() => ({}))) as { code?: number; message?: string };
  if (res.status === 401) throw new DiscordError("INVALID_TOKEN", "Bot token ditolak Discord. Cek DISCORD_BOT_TOKEN.", 502);
  if (res.status === 404 && body.code === 10004) {
    throw new DiscordError("NO_ACCESS", "Bot belum ada di server ini. Invite bot dulu lewat OAuth2 URL, atau cek DISCORD_GUILD_ID.", 502);
  }
  if (res.status === 404) throw new DiscordError("NOT_FOUND", body.message || "Tidak ditemukan", 404);
  if (res.status === 403) {
    // 50001 Missing Access: bot not in guild / wrong guild id. Listing members without the intent also returns 403.
    if (path.includes("/members?")) {
      throw new DiscordError("MISSING_INTENT", "Bot tidak bisa membaca daftar member. Aktifkan 'Server Members Intent' di Discord Developer Portal → Bot.", 502);
    }
    throw new DiscordError("NO_ACCESS", "Bot tidak punya akses ke server ini. Pastikan bot sudah di-invite dan DISCORD_GUILD_ID benar.", 502);
  }
  throw new DiscordError("UPSTREAM", `Discord API ${res.status}: ${body.message || res.statusText}`, 502);
}

async function cached<T>(key: string, load: () => Promise<T>, force = false): Promise<T> {
  const hit = cache.get(key);
  if (!force && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as T;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

export function clearDiscordCache() {
  cache.clear();
}

const toHex = (c: number) => (c ? `#${c.toString(16).padStart(6, "0")}` : null);

function avatarUrl(guildId: string, m: RawMember): string {
  const u = m.user;
  if (m.avatar) return `https://cdn.discordapp.com/guilds/${guildId}/users/${u.id}/avatars/${m.avatar}.png?size=64`;
  if (u.avatar) return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`;
  const idx = Number((BigInt(u.id) >> BigInt(22)) % BigInt(6));
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

function mapMember(guildId: string, m: RawMember): DiscordMember {
  return {
    id: m.user.id,
    username: m.user.username,
    displayName: m.nick || m.user.global_name || m.user.username,
    nickname: m.nick,
    avatarUrl: avatarUrl(guildId, m),
    bot: Boolean(m.user.bot),
    roleIds: m.roles,
    joinedAt: m.joined_at,
  };
}

export async function getGuildInfo(force = false): Promise<DiscordGuildInfo> {
  const { guildId } = config();
  return cached("guild", async () => {
    const g = await discordGet<{ id: string; name: string; icon: string | null; approximate_member_count?: number; approximate_presence_count?: number }>(
      `/guilds/${guildId}?with_counts=true`
    );
    return {
      id: g.id,
      name: g.name,
      iconUrl: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
      memberCount: g.approximate_member_count ?? 0,
      onlineCount: g.approximate_presence_count ?? 0,
    };
  }, force);
}

export async function getMembers(force = false): Promise<DiscordMember[]> {
  const { guildId } = config();
  return cached("members", async () => {
    const all: DiscordMember[] = [];
    let after = "0";
    for (let page = 0; page < MAX_MEMBER_PAGES; page++) {
      const batch = await discordGet<RawMember[]>(`/guilds/${guildId}/members?limit=1000&after=${after}`);
      all.push(...batch.map((m) => mapMember(guildId, m)));
      if (batch.length < 1000) break;
      after = batch[batch.length - 1].user.id;
    }
    return all;
  }, force);
}

export async function getRoles(force = false): Promise<DiscordRole[]> {
  const { guildId } = config();
  const [raw, members] = await Promise.all([
    cached("roles", () => discordGet<RawRole[]>(`/guilds/${guildId}/roles`), force),
    getMembers(force).catch((e) => {
      if (e instanceof DiscordError && e.code === "MISSING_INTENT") return null;
      throw e;
    }),
  ]);
  const counts = new Map<string, number>();
  for (const m of members ?? []) for (const r of m.roleIds) counts.set(r, (counts.get(r) ?? 0) + 1);

  return raw
    .filter((r) => r.id !== guildId) // drop @everyone
    .map((r) => ({
      id: r.id,
      name: r.name,
      color: toHex(r.color),
      position: r.position,
      managed: r.managed,
      memberCount: members ? counts.get(r.id) ?? 0 : null,
    }))
    .sort((a, b) => b.position - a.position);
}

export async function getMember(userId: string): Promise<DiscordMember | null> {
  const { guildId } = config();
  if (!/^\d{15,22}$/.test(userId)) return null;
  const list = cache.get("members");
  if (list && Date.now() - list.at < CACHE_TTL_MS) {
    const hit = (list.value as DiscordMember[]).find((m) => m.id === userId);
    if (hit) return hit;
  }
  try {
    const raw = await discordGet<RawMember>(`/guilds/${guildId}/members/${userId}`);
    return mapMember(guildId, raw);
  } catch (e) {
    if (e instanceof DiscordError && e.code === "NOT_FOUND") return null;
    throw e;
  }
}
