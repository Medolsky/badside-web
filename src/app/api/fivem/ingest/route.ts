import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { sendAlertToDiscord } from "@/lib/discordWebhook";

type IngestEvent =
  | { type: "join"; serverId: number; identifiers: Record<string, string>; name: string }
  | { type: "leave"; serverId: number; reason?: string }
  | { type: "character"; serverId: number; characterId: number; fullName: string; job?: string; faction?: string }
  | { type: "heartbeat"; players: { serverId: number; ping: number; area?: string; vehicle?: string }[] };

const now = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

export async function POST(req: NextRequest) {
  const secret = process.env.FIVEM_API_SECRET;
  if (!secret || req.headers.get("x-api-key") !== secret) {
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
      const p = store.getPlayerById(license);
      if (!p) {
        // Unknown license: accept but don't create a profile until the character DB sync provides one.
        return NextResponse.json({ ok: true, known: false });
      }
      store.updatePlayer(p.id, {
        isOnline: true,
        currentServerId: body.serverId,
        steam: body.identifiers.steam ?? p.steam,
        discordId: body.identifiers.discord?.replace("discord:", "") ?? p.discordId,
        lastSeen: new Date().toISOString(),
        currentSession: {
          id: `sess-${Date.now()}`,
          playerId: p.id,
          serverId: body.serverId,
          joinedAt: new Date().toISOString(),
          durationSec: 0,
          lastHeartbeat: new Date().toISOString(),
        },
      });
      const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
      store.logEvent({
        playerId: p.id,
        playerName: c?.fullName || body.name,
        eventType: "JOIN_CITY",
        eventData: `Connected to server ID #${body.serverId}`,
        severity: "INFO",
        timestamp: now(),
      });
      if (p.isWatchlisted) {
        const alert = store.addAlert({
          type: "WATCHLIST_ONLINE",
          playerId: p.id,
          characterName: c?.fullName,
          groupName: p.groupName,
          title: "WATCHLIST PLAYER ONLINE",
          message: `${c?.fullName || body.name} has entered the city (ID #${body.serverId}).`,
          severity: p.watchlistPriority === "HIGH" ? "CRITICAL" : "WARNING",
        });
        await sendAlertToDiscord(alert, { serverId: body.serverId });
      }
      return NextResponse.json({ ok: true, known: true });
    }

    case "leave": {
      const p = store.getPlayerByServerId(body.serverId);
      if (p) {
        store.updatePlayer(p.id, { isOnline: false, currentServerId: undefined, lastSeen: new Date().toISOString() });
        const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
        store.logEvent({
          playerId: p.id,
          playerName: c?.fullName || "Unknown",
          eventType: "LEAVE_CITY",
          eventData: `Disconnected (${body.reason || "no reason"})`,
          severity: "NOTICE",
          timestamp: now(),
        });
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
          eventData: `Loaded character ${body.fullName} (CID #${body.characterId})`,
          severity: "INFO",
          timestamp: now(),
        });
        if (prev && prev.characterId !== body.characterId) {
          const alert = store.addAlert({
            type: "CHAR_CHANGED",
            playerId: p.id,
            characterName: body.fullName,
            title: "CHARACTER SWITCH",
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
      return NextResponse.json({ ok: true, received: body.players.length });
    }

    default:
      return NextResponse.json({ error: "unknown event type" }, { status: 400 });
  }
}
