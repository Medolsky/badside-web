export type UserRole = "OWNER" | "ADMINISTRATOR" | "STAFF" | "VIEWER";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Player {
  id: string;
  license: string;
  name?: string;
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
  character?: Character;
  currentSession?: Session;
  isWatchlisted?: boolean;
  watchlistPriority?: Priority;
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
  priority: Priority;
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
  targetType: "PLAYER" | "GROUP" | "ROLE";
  targetId: string;
  targetName: string;
  priority: Priority;
  category: "SYNDICATE" | "SUSPECT" | "HIGH_VALUE" | "INVESTIGATION";
  reason: string;
  notes?: string;
  createdBy: string;
  isActive?: boolean;
  createdAt: string;
}

export type EventType =
  | "JOIN_CITY"
  | "LEAVE_CITY"
  | "CHAR_SWITCH"
  | "VEHICLE_CHANGE"
  | "DISTRICT_MOVE"
  | "DISCORD_LINK"
  | "ADMIN_ACTION";

export interface EventLog {
  id: string;
  playerId: string;
  playerName: string;
  eventType: EventType;
  eventData: string;
  detail?: string;
  location?: string;
  severity?: "INFO" | "NOTICE" | "WARNING" | "CRITICAL";
  timestamp: string;
  at?: string;
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
  detail?: string;
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

export interface SessionUser {
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  isAdmin: boolean;
  isBadsideHandler: boolean;
  isStaff: boolean;
  exp?: number;
}

export interface DiscordRoleItem {
  id: string;
  name: string;
  color: string | null;
  position: number;
  managed: boolean;
  memberCount: number | null;
  isAdmin?: boolean;
  isBadsideHandler?: boolean;
}

export interface DiscordMemberItem {
  id: string;
  username: string;
  displayName: string;
  nickname: string | null;
  avatarUrl: string;
  bot: boolean;
  roleIds: string[];
  joinedAt: string;
  isAdmin?: boolean;
  isBadsideHandler?: boolean;
  isStaff?: boolean;
}
