import { NextRequest, NextResponse } from "next/server";
import { store, formatDuration } from "@/lib/store";
import { sendAlertToDiscord } from "@/lib/discordWebhook";
import { formatBadsideMemberName, getBadsideTag } from "@/lib/badside-tag";
import { getMembers } from "@/lib/discord";
import { GANG_ROLES } from "@/lib/roles";

type IngestEvent =
  | { type: "join"; serverId: number; identifiers: Record<string, string>; name: string }
  | { type: "leave"; serverId: number; reason?: string }
  | { type: "character"; serverId: number; characterId: number; fullName: string; job?: string; faction?: string }
  | { type: "heartbeat"; players: { serverId: number; ping: number; area?: string; vehicle?: string }[] };

const now = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

export async function POST(req: NextRequest) {
  const secret = process.env.FIVEM_API_SECRET;
  const headerSecret = req.headers.get("x-api-key") || req.headers.get("x-api-secret");
  
  if (!secret || headerSecret !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: IngestEvent;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  switch (body.type) {
    case "join": {
      const license = body.identifiers.license;
      if (!license) return NextResponse.json({ error: "license identifier required" }, { status: 400 });

      const rawDiscord = body.identifiers.discord?.replace("discord:", "") || "";
      let p = store.getPlayerById(license) || (rawDiscord ? store.getPlayerById(rawDiscord) : undefined);

      // Resolve Discord info if available
      let discordMember = null;
      if (rawDiscord) {
        try {
          const allMembers = await getMembers();
          discordMember = allMembers.find((m) => m.id === rawDiscord) || null;
        } catch {
          // Fallback if discord unavailable
        }
      }

      // Determine gang / faction from Discord roles or existing player group
      const resolvedRoleIds = discordMember?.roleIds || [];
      const badsideTag = getBadsideTag(resolvedRoleIds) || getBadsideTag(p?.groupName);
      
      const matchedGang = GANG_ROLES.find(
        (g) => g.tag === badsideTag || (discordMember && discordMember.roleIds.includes(g.id))
      );
      const groupName = matchedGang ? matchedGang.name : p?.groupName || undefined;

      const rawDisplayName = discordMember?.displayName || p?.name || body.name;
      const formattedDisplayName = badsideTag
        ? formatBadsideMemberName(rawDisplayName, badsideTag)
        : rawDisplayName;

      const nowIso = new Date().toISOString();
      const newSession = {
        id: `sess-${Date.now()}`,
        playerId: p?.id || license,
        serverId: body.serverId,
        joinedAt: nowIso,
        durationSec: 0,
        lastHeartbeat: nowIso,
      };

      p = store.addOrUpdatePlayer({
        id: p?.id || license,
        license,
        name: formattedDisplayName,
        steam: body.identifiers.steam ?? p?.steam,
        discordId: rawDiscord || p?.discordId,
        isOnline: true,
        currentServerId: body.serverId,
        lastSeen: nowIso,
        groupName: groupName,
        currentSession: newSession,
      });

      const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
      const charName = c?.fullName || formattedDisplayName;

      store.logEvent({
        playerId: p.id,
        playerName: charName,
        eventType: "JOIN_CITY",
        eventData: `Masuk ke kota (Server ID #${body.serverId}) [${badsideTag || "Civilian"}]`,
        severity: "INFO",
        timestamp: now(),
      });

      if (p.isWatchlisted) {
        const alert = store.addAlert({
          type: "WATCHLIST_ONLINE",
          playerId: p.id,
          characterName: charName,
          groupName: p.groupName,
          title: "TARGET WATCHLIST MASUK KOTA",
          message: `${charName} telah memasuki kota (ID #${body.serverId}).`,
          severity: p.watchlistPriority === "HIGH" ? "CRITICAL" : "WARNING",
        });
        await sendAlertToDiscord(alert, { serverId: body.serverId });
      }

      return NextResponse.json({ ok: true, known: true, tag: badsideTag, name: formattedDisplayName });
    }

    case "leave": {
      // Automatic Off-Duty when player leaves the city
      const p = store.endPlayerSession(body.serverId, body.reason || "Disconnect");
      if (p) {
        const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
        const displayName = c?.fullName || p.name || "Unknown";
        
        store.logEvent({
          playerId: p.id,
          playerName: displayName,
          eventType: "LEAVE_CITY",
          eventData: `Keluar kota (Auto Off-Duty) — Alasan: ${body.reason || "Disconnect"}`,
          severity: "NOTICE",
          timestamp: now(),
        });

        console.log(`[Badside Ingest] Auto Off-Duty executed for ${displayName} (Server #${body.serverId})`);
      }
      return NextResponse.json({ ok: true });
    }

    case "character": {
      const p = store.getPlayerByServerId(body.serverId);
      if (p) {
        const prev = p.characters.find((ch) => ch.isActive);
        p.characters.forEach((ch) => (ch.isActive = ch.characterId === body.characterId));

        store.logEvent({
          playerId: p.id,
          playerName: body.fullName,
          eventType: "CHAR_SWITCH",
          eventData: `Memuat karakter ${body.fullName} (CID #${body.characterId})`,
          severity: "INFO",
          timestamp: now(),
        });

        if (prev && prev.characterId !== body.characterId) {
          const alert = store.addAlert({
            type: "CHAR_CHANGED",
            playerId: p.id,
            characterName: body.fullName,
            title: "GANTI KARAKTER",
            message: `${prev.fullName} (#${prev.characterId}) → ${body.fullName} (#${body.characterId})`,
            severity: "WARNING",
          });
          if (p.isWatchlisted) await sendAlertToDiscord(alert, { serverId: body.serverId });
        }
      }
      return NextResponse.json({ ok: true });
    }

    case "heartbeat": {
      const ts = new Date().toISOString();
      const activeServerIds = new Set(body.players.map((hb) => hb.serverId));

      // 1. Update online players in this heartbeat batch
      for (const hb of body.players) {
        const p = store.getPlayerByServerId(hb.serverId);
        if (!p) continue;
        store.updatePlayer(p.id, {
          ping: hb.ping,
          currentArea: hb.area ?? p.currentArea,
          currentVehicle: hb.vehicle ?? p.currentVehicle,
          lastSeen: ts,
          currentSession: p.currentSession && { ...p.currentSession, lastHeartbeat: ts },
        });
      }

      // 2. AUTO OFF-DUTY DETECTION:
      // Any player currently marked isOnline whose serverId is missing from this heartbeat batch
      // has lost connection or crashed -> immediately auto off-duty / end session!
      const onlinePlayers = store.getPlayers().filter((p) => p.isOnline);
      let autoOffDutyCount = 0;

      for (const p of onlinePlayers) {
        if (p.currentServerId && !activeServerIds.has(p.currentServerId)) {
          const closed = store.endPlayerSession(p.id, "Koneksi terputus / Timeout keluar kota");
          if (closed) {
            autoOffDutyCount++;
            store.logEvent({
              playerId: p.id,
              playerName: p.name || "Unknown",
              eventType: "LEAVE_CITY",
              eventData: `Koneksi terputus / Timeout keluar kota (Auto Off Duty)`,
              severity: "NOTICE",
              timestamp: now(),
            });
            console.log(`[Badside Heartbeat] Auto Off-Duty timeout executed for ${p.name}`);
          }
        }
      }

      return NextResponse.json({
        ok: true,
        received: body.players.length,
        autoOffDutied: autoOffDutyCount,
      });
    }

    default:
      return NextResponse.json({ error: "unknown event type" }, { status: 400 });
  }
}
