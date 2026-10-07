import { Player, Group, WatchlistEntry, EventLog, AlertNotification, AuditRecord, ServerOverview } from "@/types";
import { GANG_ROLES } from "./roles";

export const initialServerOverview: ServerOverview = {
  isOnline: true,
  playersOnline: 0,
  maxSlots: 128,
  watchedOnline: 0,
  watchedGroupsOnline: 0,
  activeAlertsCount: 0,
  playersEnteredToday: 0,
  playersExitedToday: 0,
  averageSessionDurationSec: 0,
  uptimeHours: 24,
  serverPing: 18,
  lastHeartbeat: new Date().toISOString(),
};

// Ready for live FiveM ingestion - all fake mock players removed!
export const initialPlayers: Player[] = [];

// Real Discord gangs & factions for Ophelia Darkside
export const initialGroups: Group[] = GANG_ROLES.map((g) => ({
  id: `grp-${g.slug}`,
  name: g.name,
  slug: g.slug,
  tag: `[${g.tag}]`,
  description: `Faksi / Organisasi resmi ${g.name} terdaftar di server Discord OPHELIA DARKSIDE.`,
  color: g.color,
  priority: g.priority,
  discordRoleId: g.id,
  onlineCount: 0,
  totalSessionTodaySec: 0,
  lastActivity: "Standby",
  members: [],
}));

export const initialWatchlist: WatchlistEntry[] = [
  {
    id: "wl-01",
    targetType: "GROUP",
    targetId: "grp-high-table",
    targetName: "HIGH TABLE",
    priority: "HIGH",
    category: "SYNDICATE",
    reason: "Monitoring terkoordinasi untuk faksi High Table Ophelia",
    notes: "Pantau aktivitas anggota dan perizinan khusus.",
    createdBy: "BADSIDE_HANDLER",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "wl-02",
    targetType: "GROUP",
    targetId: "grp-white-tiger",
    targetName: "WHITE TIGER",
    priority: "HIGH",
    category: "SYNDICATE",
    reason: "Pengawasan operasional faksi White Tiger",
    notes: "Perhatikan pergerakan konvoi dan zona wilayah.",
    createdBy: "ADMIN",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const initialAlerts: AlertNotification[] = [];

export const initialEvents: EventLog[] = [];

export const initialAuditLogs: AuditRecord[] = [
  {
    id: "aud-01",
    staffId: "ophelia-core",
    staffName: "Ophelia System",
    action: "CONFIG_CHANGE",
    target: "Ophelia Badside Production System",
    metadata: "Website siap pakai aktif. Terhubung ke Guild 1480806468604264529.",
    createdAt: new Date().toISOString(),
  },
];
