export type UserRole = "OWNER" | "ADMINISTRATOR" | "STAFF" | "VIEWER";

export interface Player {
  id: string;
  license: string;
  steam?: string;
  discordId?: string;
  xbox?: string;
  live?: string;
  rockstar?: string;
  ipAddress?: string;
  isOnline: boolean;
  currentServerId?: number;
  currentArea?: string;
  currentVehicle?: string;
  ping?: number;
  firstSeen: string;
  lastSeen: string;
  characters: Character[];
  currentSession?: Session;
  isWatchlisted?: boolean;
  watchlistPriority?: "HIGH" | "MEDIUM" | "LOW";
  groupName?: string;
}

export interface Character {
  id: string;
  playerId: string;
  characterId: number; // e.g. 245
  firstName: string;
  lastName: string;
  fullName: string;
  job: string;
  jobGrade: string;
  faction?: string;
  cash?: number;
  bank?: number;
  phoneNumber?: string;
  dateCreated: string;
  lastSeen: string;
  isActive: boolean;
}

export interface Session {
  id: string;
  playerId: string;
  characterId?: string;
  characterName?: string;
  serverId: number; // e.g. 128
  joinedAt: string;
  leftAt?: string;
  durationSec: number;
  lastHeartbeat: string;
  currentArea?: string;
  currentVehicle?: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  tag?: string;
  description?: string;
  color: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  discordRoleId?: string;
  members: GroupMember[];
  onlineCount?: number;
  totalSessionTodaySec?: number;
  lastActivity?: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  playerId: string;
  playerName: string;
  characterId?: number;
  characterName: string;
  roleTitle: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isOnline: boolean;
  currentSessionDurationSec?: number;
  addedAt: string;
}

export interface WatchlistEntry {
  id: string;
  targetType: "PLAYER" | "GROUP";
  targetId: string;
  targetName: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: "SYNDICATE" | "SUSPECT" | "HIGH_VALUE" | "INVESTIGATION";
  reason: string;
  notes?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface EventLog {
  id: string;
  playerId: string;
  playerName: string;
  eventType: "JOIN_CITY" | "LEAVE_CITY" | "CHAR_SWITCH" | "VEHICLE_CHANGE" | "DISTRICT_MOVE" | "DISCORD_LINK" | "ADMIN_ACTION";
  eventData: string;
  location?: string;
  severity: "INFO" | "NOTICE" | "WARNING" | "CRITICAL";
  timestamp: string;
}

export interface AlertNotification {
  id: string;
  type: "WATCHLIST_ONLINE" | "GROUP_MASS_ONLINE" | "CHAR_CHANGED" | "ROLE_CHANGED" | "HEARTBEAT_LOST";
  playerId?: string;
  characterName?: string;
  groupName?: string;
  title: string;
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  isRead: boolean;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  staffId: string;
  staffName: string;
  action: "REVEAL_IDENTIFIER" | "ADD_WATCHLIST" | "REMOVE_WATCHLIST" | "EXPORT_DATA" | "CONFIG_CHANGE";
  target: string;
  metadata?: string;
  createdAt: string;
}

export interface ServerOverview {
  isOnline: boolean;
  playersOnline: number;
  maxSlots: number;
  watchedOnline: number;
  watchedGroupsOnline: number;
  activeAlertsCount: number;
  playersEnteredToday: number;
  playersExitedToday: number;
  averageSessionDurationSec: number;
  uptimeHours: number;
  serverPing: number;
  lastHeartbeat: string;
}
