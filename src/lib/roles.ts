// Role definition and permissions for OPHELIA DARKSIDE

export const ROLE_IDS = {
  // Staff & Management (Specified by User: Admin & Badside Handler)
  ADMIN: "1539604936914898994",
  BADSIDE_HANDLER: "1480806468642017294",
  HIGH_COMMAND: "1480806468642017296",

  // Gangs / Factions
  HIGH_TABLE: "1553258961321595000",
  WHITE_TIGER: "1526441933017190461",
  VANITY: "1527307245925437542",
  XYK: "1532387612642246777",
  CSR: "1555554460904718427",
  SOG: "1555555425968070776",
  OLIVER_CASPER: "1532388456959836322",
  GHOST_FAMS: "1556662518166855730",
} as const;

export const ADMIN_ROLE_IDS: string[] = [
  ROLE_IDS.ADMIN,
  ROLE_IDS.BADSIDE_HANDLER,
  ROLE_IDS.HIGH_COMMAND,
];

// Faksi & Gang murni Badside Ophelia
export const GANG_ROLES = [
  { id: ROLE_IDS.HIGH_TABLE, name: "HIGH TABLE", slug: "high-table", tag: "HT", color: "#D4AF37", priority: "HIGH" as const },
  { id: ROLE_IDS.WHITE_TIGER, name: "WHITE TIGER", slug: "white-tiger", tag: "WT", color: "#93c5fd", priority: "HIGH" as const },
  { id: ROLE_IDS.VANITY, name: "VANITY", slug: "vanity", tag: "VNT", color: "#f1c40f", priority: "HIGH" as const },
  { id: ROLE_IDS.XYK, name: "XYK", slug: "xyk", tag: "XYK", color: "#a3e635", priority: "MEDIUM" as const },
  { id: ROLE_IDS.CSR, name: "CSR", slug: "csr", tag: "CSR", color: "#ef4444", priority: "MEDIUM" as const },
  { id: ROLE_IDS.SOG, name: "SOG", slug: "sog", tag: "SOG", color: "#3b82f6", priority: "MEDIUM" as const },
  { id: ROLE_IDS.OLIVER_CASPER, name: "OLIVER CASPER", slug: "oliver-casper", tag: "OC", color: "#ea580c", priority: "MEDIUM" as const },
  { id: ROLE_IDS.GHOST_FAMS, name: "GHOST FAMS", slug: "ghost-fams", tag: "GF", color: "#dc2626", priority: "LOW" as const },
];

// Role bot, polisi, dan petinggi yang tidak perlu dimasukkan ke website
export const IGNORED_ROLE_NAMES = [
  "dyno",
  "serverstats",
  "koya",
  "carl-bot",
  "new role",
  "bot",
  "ophelia-badside",
  "polisi",
  "polisi👮🏻‍♂️",
  "police",
  "petinggi badside",
  "petinggi badside🔴",
];

export function isRoleIgnored(roleName: string, managed = false): boolean {
  if (managed) return true;
  const lower = roleName.trim().toLowerCase();
  if (lower === "new role" || lower === "@everyone") return true;
  return IGNORED_ROLE_NAMES.some((ign) => lower === ign || lower.includes(ign));
}

export function isStaffRole(roleId: string): boolean {
  return ADMIN_ROLE_IDS.includes(roleId);
}

export function isUserAdminOrHandler(roleIds: string[] = []): { isAdmin: boolean; isBadsideHandler: boolean; isStaff: boolean } {
  const isAdmin = roleIds.includes(ROLE_IDS.ADMIN) || roleIds.includes(ROLE_IDS.HIGH_COMMAND);
  const isBadsideHandler = roleIds.includes(ROLE_IDS.BADSIDE_HANDLER);
  const isStaff = isAdmin || isBadsideHandler;
  return { isAdmin, isBadsideHandler, isStaff };
}
