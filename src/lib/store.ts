import { 
  Player, 
  Group, 
  WatchlistEntry, 
  EventLog, 
  AlertNotification, 
  AuditRecord, 
  ServerOverview,
  UserRole,
  Character
} from "@/types";
import { 
  initialPlayers, 
  initialGroups, 
  initialWatchlist, 
  initialAlerts, 
  initialEvents, 
  initialAuditLogs, 
  initialServerOverview 
} from "./mockData";

// In-memory runtime store for server & client
let players: Player[] = [...initialPlayers];
let groups: Group[] = [...initialGroups];
let watchlist: WatchlistEntry[] = [...initialWatchlist];
let alerts: AlertNotification[] = [...initialAlerts];
let events: EventLog[] = [...initialEvents];
let auditLogs: AuditRecord[] = [...initialAuditLogs];
let serverOverview: ServerOverview = { ...initialServerOverview };

export const store = {
  // Server Status
  getServerOverview(): ServerOverview {
    const onlinePlayers = players.filter(p => p.isOnline).length;
    const watchedOnline = players.filter(p => p.isOnline && p.isWatchlisted).length;
    const activeAlerts = alerts.filter(a => !a.isRead).length;

    return {
      ...serverOverview,
      playersOnline: onlinePlayers,
      watchedOnline,
      activeAlertsCount: activeAlerts,
      lastHeartbeat: new Date().toISOString()
    };
  },

  // Players
  getPlayers(): Player[] {
    return players;
  },

  getPlayerById(id: string): Player | undefined {
    return players.find(p => p.id === id || p.license === id || p.steam === id || p.discordId === id);
  },

  getPlayerByServerId(serverId: number): Player | undefined {
    return players.find(p => p.currentServerId === serverId);
  },

  updatePlayer(id: string, updates: Partial<Player>): Player | undefined {
    const index = players.findIndex(p => p.id === id);
    if (index !== -1) {
      players[index] = { ...players[index], ...updates };
      return players[index];
    }
    return undefined;
  },

  addOrUpdatePlayer(playerData: Partial<Player> & { license: string }): Player {
    const existingIndex = players.findIndex(
      p => p.id === playerData.id ||
           p.license === playerData.license ||
           (playerData.discordId && p.discordId === playerData.discordId)
    );

    if (existingIndex !== -1) {
      players[existingIndex] = { ...players[existingIndex], ...playerData };
      return players[existingIndex];
    } else {
      const newPlayer: Player = {
        id: playerData.id || playerData.license,
        license: playerData.license,
        name: playerData.name || "Unknown Player",
        steam: playerData.steam,
        discordId: playerData.discordId,
        isOnline: playerData.isOnline ?? true,
        currentServerId: playerData.currentServerId,
        firstSeen: playerData.firstSeen || new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        characters: playerData.characters || [],
        currentSession: playerData.currentSession,
        groupName: playerData.groupName,
        isWatchlisted: playerData.isWatchlisted ?? false,
      };
      players.push(newPlayer);
      return newPlayer;
    }
  },

  endPlayerSession(playerIdOrServerId: string | number, reason = "Keluar Kota"): Player | undefined {
    const player = typeof playerIdOrServerId === "number"
      ? players.find(p => p.currentServerId === playerIdOrServerId)
      : players.find(p => p.id === playerIdOrServerId || p.license === playerIdOrServerId || p.discordId === playerIdOrServerId);

    if (!player) return undefined;

    const nowIso = new Date().toISOString();
    let durationSec = 0;

    if (player.currentSession) {
      durationSec = Math.max(
        0,
        Math.round((Date.now() - new Date(player.currentSession.joinedAt).getTime()) / 1000)
      );
      player.currentSession.leftAt = nowIso;
      player.currentSession.durationSec = durationSec;
    }

    player.isOnline = false;
    player.currentServerId = undefined;
    player.lastSeen = nowIso;
    player.currentSession = undefined;

    return player;
  },

  // Groups
  getGroups(): Group[] {
    return groups.map((g) => {
      const groupPlayers = players.filter(
        (p) => p.groupName === g.name || p.groupName === g.slug
      );
      const onlineCount = groupPlayers.filter((p) => p.isOnline).length;
      return {
        ...g,
        onlineCount,
        lastActivity: onlineCount > 0 ? `${onlineCount} di kota` : g.lastActivity || "Standby",
      };
    });
  },

  getGroupById(id: string): Group | undefined {
    const g = groups.find(grp => grp.id === id || grp.slug === id);
    if (!g) return undefined;
    const groupPlayers = players.filter(
      (p) => p.groupName === g.name || p.groupName === g.slug
    );
    const onlineCount = groupPlayers.filter((p) => p.isOnline).length;
    return {
      ...g,
      onlineCount,
      lastActivity: onlineCount > 0 ? `${onlineCount} di kota` : g.lastActivity || "Standby",
    };
  },

  // Watchlist
  getWatchlist(): WatchlistEntry[] {
    return watchlist;
  },

  addWatchlistEntry(entry: Omit<WatchlistEntry, "id" | "createdAt" | "isActive">): WatchlistEntry {
    const newEntry: WatchlistEntry = {
      ...entry,
      id: `wl-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    watchlist.unshift(newEntry);

    // If target is player, update player flag
    if (entry.targetType === "PLAYER") {
      const p = players.find(ply => ply.id === entry.targetId);
      if (p) {
        p.isWatchlisted = true;
        p.watchlistPriority = entry.priority;
      }
    }

    this.logAuditAction({
      staffId: "admin",
      staffName: "Staff Moderator",
      action: "ADD_WATCHLIST",
      target: entry.targetName,
      metadata: `Added to watchlist (${entry.priority} - ${entry.category}): ${entry.reason}`
    });

    return newEntry;
  },

  removeWatchlistEntry(id: string): boolean {
    const target = watchlist.find(w => w.id === id);
    if (target) {
      if (target.targetType === "PLAYER") {
        const p = players.find(ply => ply.id === target.targetId);
        if (p) {
          p.isWatchlisted = false;
          p.watchlistPriority = undefined;
        }
      }
      watchlist = watchlist.filter(w => w.id !== id);

      this.logAuditAction({
        staffId: "admin",
        staffName: "Staff Moderator",
        action: "REMOVE_WATCHLIST",
        target: target.targetName,
        metadata: `Removed watchlist target ${target.targetName}`
      });
      return true;
    }
    return false;
  },

  // Alerts
  getAlerts(): AlertNotification[] {
    return alerts;
  },

  markAlertRead(id: string): void {
    const a = alerts.find(alt => alt.id === id);
    if (a) {
      a.isRead = true;
    }
  },

  dismissAllAlerts(): void {
    alerts = alerts.map(a => ({ ...a, isRead: true }));
  },

  addAlert(alert: Omit<AlertNotification, "id" | "isRead" | "createdAt">): AlertNotification {
    const newAlert: AlertNotification = {
      ...alert,
      id: `alt-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    alerts.unshift(newAlert);
    return newAlert;
  },

  // Events
  getEvents(): EventLog[] {
    return events;
  },

  logEvent(event: Omit<EventLog, "id">): EventLog {
    const newEvent: EventLog = {
      ...event,
      id: `evt-${Date.now()}`
    };
    events.unshift(newEvent);
    return newEvent;
  },

  // Audit Logs
  getAuditLogs(): AuditRecord[] {
    return auditLogs;
  },

  logAuditAction(record: Omit<AuditRecord, "id" | "createdAt">): AuditRecord {
    const newRecord: AuditRecord = {
      ...record,
      id: `aud-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    auditLogs.unshift(newRecord);
    return newRecord;
  },

  // Reveal Identifier with mandatory audit logging
  revealPlayerIdentifier(playerId: string, staffName: string): { player?: Player; revealedAt: string } {
    const player = players.find(p => p.id === playerId);
    const timestamp = new Date().toISOString();
    if (player) {
      const activeChar = player.characters.find((c: Character) => c.isActive) || player.characters[0];
      const charName = activeChar ? activeChar.fullName : "Unknown";

      this.logAuditAction({
        staffId: "current_staff",
        staffName: staffName || "Authorized Staff",
        action: "REVEAL_IDENTIFIER",
        target: `${charName} (${player.license.substring(0, 16)}...)`,
        metadata: `Staff unmasked full identifiers: [Steam: ${player.steam || "N/A"}] [Discord: ${player.discordId || "N/A"}] [License: ${player.license}]`
      });
    }
    return { player, revealedAt: timestamp };
  }
};

// Formatting & Masking Helpers
export function maskIdentifier(identifier?: string, type: "license" | "steam" | "discord" | "ip" = "license"): string {
  if (!identifier) return "Not Linked";
  
  if (type === "license") {
    // license:4a89...91a2
    const prefix = "license:";
    const val = identifier.startsWith("license:") ? identifier.replace("license:", "") : identifier;
    if (val.length <= 8) return `license:****${val}`;
    return `license:************${val.slice(-4).toUpperCase()}`;
  }

  if (type === "steam") {
    // steam:110000109fa7210 -> steam:110000********7210
    const val = identifier.replace("steam:", "");
    if (val.length <= 8) return `steam:****${val}`;
    return `steam:110000********${val.slice(-4).toUpperCase()}`;
  }

  if (type === "discord") {
    if (identifier.length <= 6) return `************${identifier}`;
    return `************${identifier.slice(-4)}`;
  }

  if (type === "ip") {
    const parts = identifier.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
    return "192.168.***.***";
  }

  return identifier;
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
}

export function formatTimeShort(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoString;
  }
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}
