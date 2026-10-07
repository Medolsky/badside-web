import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { formatBadsideMemberName, getBadsideTag } from "@/lib/badside-tag";
import { getMembers, DiscordMember } from "@/lib/discord";
import { GANG_ROLES } from "@/lib/roles";

/**
 * GET/POST /api/fivem/sync
 * Connects to FiveM Bridge or FiveM server to auto-sync city presence and auto off-duty absent players.
 */
export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  try {
    const bridgeUrl = process.env.FIVEM_BRIDGE_URL || "http://127.0.0.1:3001";
    const apiSecret = process.env.FIVEM_API_SECRET || "badside_soc_secret_token_99x";

    let fiveMPlayers: Array<{
      discordId?: string;
      license?: string;
      serverId: number;
      name: string;
      gang?: string;
    }> = [];

    // 1. Try to fetch from FiveM Bridge
    try {
      const res = await fetch(`${bridgeUrl}/api/players`, {
        headers: { "x-api-secret": apiSecret },
        signal: AbortSignal.timeout(3000),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.players)) {
          fiveMPlayers = data.players.map((p: any) => ({
            discordId: p.discordId,
            license: p.license,
            serverId: p.serverId || 1,
            name: p.name || p.fullname,
            gang: p.gang?.name || p.gang,
          }));
        }
      }
    } catch {
      // Bridge not reachable or running in standalone mode
    }

    // 2. Fallback to direct FiveM HTTP (port 30120) if bridge gave 0 players
    if (fiveMPlayers.length === 0) {
      const fivemIp = process.env.FIVEM_SERVER_IP || "127.0.0.1";
      const fivemPort = process.env.FIVEM_SERVER_PORT || "30120";
      try {
        const res = await fetch(`http://${fivemIp}:${fivemPort}/players.json`, {
          signal: AbortSignal.timeout(3000),
          cache: "no-store",
        });
        if (res.ok) {
          const rawList = await res.json();
          if (Array.isArray(rawList)) {
            fiveMPlayers = rawList.map((p: any) => {
              const identifiers: string[] = p.identifiers || [];
              const discordId = identifiers
                .find((id) => id.startsWith("discord:"))
                ?.replace("discord:", "");
              const license = identifiers
                .find((id) => id.startsWith("license:"))
                ?.replace("license:", "");
              return {
                discordId,
                license: license || `license:${p.id}`,
                serverId: p.id,
                name: p.name,
              };
            });
          }
        }
      } catch {
        // Direct fivem not reachable
      }
    }

    // Load Discord members to resolve gang roles
    let discordMembers: DiscordMember[] = [];
    try {
      discordMembers = await getMembers();
    } catch {
      discordMembers = [];
    }

    const nowIso = new Date().toISOString();
    const activeServerIds = new Set(fiveMPlayers.map((p) => p.serverId));
    const activeLicenses = new Set(fiveMPlayers.map((p) => p.license).filter(Boolean));
    const activeDiscordIds = new Set(fiveMPlayers.map((p) => p.discordId).filter(Boolean));

    let joinedOrUpdated = 0;
    let autoOffDutied = 0;

    // 3. Update incoming online players
    for (const p of fiveMPlayers) {
      const discordMember = p.discordId
        ? discordMembers.find((m) => m.id === p.discordId)
        : null;

      const badsideTag = getBadsideTag(discordMember?.roleIds) || getBadsideTag(p.gang);
      const matchedGang = GANG_ROLES.find(
        (g) => g.tag === badsideTag || (discordMember && discordMember.roleIds.includes(g.id))
      );
      const groupName = matchedGang ? matchedGang.name : undefined;

      const rawName = discordMember?.displayName || p.name;
      const formattedName = badsideTag ? formatBadsideMemberName(rawName, badsideTag) : rawName;

      store.addOrUpdatePlayer({
        license: p.license || `temp:${p.serverId}`,
        name: formattedName,
        discordId: p.discordId,
        isOnline: true,
        currentServerId: p.serverId,
        lastSeen: nowIso,
        groupName,
        currentSession: {
          id: `sess-${Date.now()}-${p.serverId}`,
          playerId: p.license || String(p.serverId),
          serverId: p.serverId,
          joinedAt: nowIso,
          durationSec: 0,
          lastHeartbeat: nowIso,
        },
      });
      joinedOrUpdated++;
    }

    // 4. AUTO OFF-DUTY: End sessions for players absent from the server
    const currentOnline = store.getPlayers().filter((p) => p.isOnline);
    for (const ply of currentOnline) {
      const isStillPresent =
        (ply.currentServerId && activeServerIds.has(ply.currentServerId)) ||
        (ply.license && activeLicenses.has(ply.license)) ||
        (ply.discordId && activeDiscordIds.has(ply.discordId));

      if (!isStillPresent) {
        store.endPlayerSession(ply.id, "Keluar kota / Terputus dari server");
        autoOffDutied++;
        store.logEvent({
          playerId: ply.id,
          playerName: ply.name || "Unknown",
          eventType: "LEAVE_CITY",
          eventData: `Keluar kota (Auto Off Duty)`,
          severity: "NOTICE",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour12: false }),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      serverQueried: true,
      onlineFromFiveM: fiveMPlayers.length,
      joinedOrUpdated,
      autoOffDutied,
      totalStoreOnline: store.getPlayers().filter((p) => p.isOnline).length,
      timestamp: nowIso,
    });
  } catch (err: any) {
    console.error("[FiveM Sync Error]:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
