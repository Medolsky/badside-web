import { ROLE_IDS, GANG_ROLES } from "./roles";

/**
 * Standardized Badside Tag Map
 * High Table    -> [HT]
 * White Tiger   -> [WT]
 * Vanity        -> [VNT]
 * XYK           -> [XYK]
 * CSR           -> [CSR]
 * SOG           -> [SOG]
 * Oliver Casper -> [OC]
 * Ghost Fams    -> [GF]
 * Admin / HC    -> [ADMIN]
 * Handler       -> [HANDLER]
 */

export const ROLE_TO_TAG_MAP: Record<string, string> = {
  [ROLE_IDS.HIGH_TABLE]: "HT",
  [ROLE_IDS.WHITE_TIGER]: "WT",
  [ROLE_IDS.VANITY]: "VNT",
  [ROLE_IDS.XYK]: "XYK",
  [ROLE_IDS.CSR]: "CSR",
  [ROLE_IDS.SOG]: "SOG",
  [ROLE_IDS.OLIVER_CASPER]: "OC",
  [ROLE_IDS.GHOST_FAMS]: "GF",
  [ROLE_IDS.ADMIN]: "ADMIN",
  [ROLE_IDS.HIGH_COMMAND]: "ADMIN",
  [ROLE_IDS.BADSIDE_HANDLER]: "HANDLER",
};

export const SLUG_TO_TAG_MAP: Record<string, string> = {
  "high-table": "HT",
  "white-tiger": "WT",
  "vanity": "VNT",
  "xyk": "XYK",
  "csr": "CSR",
  "sog": "SOG",
  "oliver-casper": "OC",
  "ghost-fams": "GF",
  "admin": "ADMIN",
  "handler": "HANDLER",
  "badside-handler": "HANDLER",
  "high-command": "ADMIN",
};

export const NAME_TO_TAG_MAP: Record<string, string> = {
  "HIGH TABLE": "HT",
  "WHITE TIGER": "WT",
  "VANITY": "VNT",
  "XYK": "XYK",
  "CSR": "CSR",
  "SOG": "SOG",
  "OLIVER CASPER": "OC",
  "GHOST FAMS": "GF",
  "ADMIN": "ADMIN",
  "ADMINISTRATOR": "ADMIN",
  "BADSIDE HANDLER": "HANDLER",
  "HIGH COMMAND": "ADMIN",
};

const BADSIDE_PREFIX_REGEX =
  /^[!~*•@\s]*(?:\[(?:HT|WT|VNT|XYK|CSR|SOG|OC|GF|ADMIN|HANDLER|ORP|HIGH\s*TABLE|WHITE\s*TIGER|VANITY|OLIVER\s*CASPER|GHOST\s*FAMS)\]|\((?:HT|WT|VNT|XYK|CSR|SOG|OC|GF|ADMIN|HANDLER|ORP|HIGH\s*TABLE|WHITE\s*TIGER|VANITY|OLIVER\s*CASPER|GHOST\s*FAMS)\)|(?:HT|WT|VNT|XYK|CSR|SOG|OC|GF|ADMIN|HANDLER|ORP)\s*[-:|–—~•.]|\b(?:HT|WT|VNT|XYK|CSR|SOG|OC|GF|ADMIN|HANDLER)\b)\s*/i;

const BRACKET_PREFIX_REGEX =
  /^[!~*•@\s]*(?:\[|\()(?:HT|WT|VNT|XYK|CSR|SOG|OC|GF|ADMIN|HANDLER|ORP)(?:\]|\))\s*/i;

const TRAILING_TAG_REGEX =
  /\s*(?:\[|\()(?:HT|WT|VNT|XYK|CSR|SOG|OC|GF|ADMIN|HANDLER|ORP)(?:\]|\))\s*$/i;

/**
 * Resolve badside tag from a list of Discord role IDs, group slug, or group name.
 */
export function getBadsideTag(
  roleIdsOrSlugOrName?: string[] | string | null
): string | null {
  if (!roleIdsOrSlugOrName) return null;

  if (Array.isArray(roleIdsOrSlugOrName)) {
    // 1. Check gang roles first (factions)
    for (const roleId of roleIdsOrSlugOrName) {
      if (ROLE_TO_TAG_MAP[roleId] && !["ADMIN", "HANDLER"].includes(ROLE_TO_TAG_MAP[roleId])) {
        return ROLE_TO_TAG_MAP[roleId];
      }
    }
    // 2. Check staff roles
    for (const roleId of roleIdsOrSlugOrName) {
      if (ROLE_TO_TAG_MAP[roleId]) {
        return ROLE_TO_TAG_MAP[roleId];
      }
    }
    return null;
  }

  const str = roleIdsOrSlugOrName.trim();
  if (ROLE_TO_TAG_MAP[str]) return ROLE_TO_TAG_MAP[str];

  const lower = str.toLowerCase().replace(/^grp-/, "");
  if (SLUG_TO_TAG_MAP[lower]) return SLUG_TO_TAG_MAP[lower];

  const upper = str.toUpperCase();
  if (NAME_TO_TAG_MAP[upper]) return NAME_TO_TAG_MAP[upper];

  // Check substring matches
  if (lower.includes("high") && lower.includes("table")) return "HT";
  if (lower.includes("white") && lower.includes("tiger")) return "WT";
  if (lower.includes("vanity")) return "VNT";
  if (lower.includes("xyk")) return "XYK";
  if (lower.includes("csr")) return "CSR";
  if (lower.includes("sog")) return "SOG";
  if (lower.includes("oliver") || lower.includes("casper")) return "OC";
  if (lower.includes("ghost")) return "GF";
  if (lower.includes("handler")) return "HANDLER";
  if (lower.includes("admin")) return "ADMIN";

  return null;
}

/**
 * Strips existing prefix/suffix gang tags from nickname to get clean base name
 */
export function stripBadsideTags(rawName: string | null | undefined): string {
  if (!rawName) return "";
  let clean = rawName.trim();
  clean = clean.replace(TRAILING_TAG_REGEX, "").trim();

  for (let i = 0; i < 4; i++) {
    let next = clean.replace(BADSIDE_PREFIX_REGEX, "").trim();
    if (next === clean) {
      next = clean.replace(BRACKET_PREFIX_REGEX, "").trim();
    }
    if (next === clean || next.length === 0) break;
    clean = next;
  }

  // Strip leading hyphen or colon if leftover: "- Axel" -> "Axel"
  clean = clean.replace(/^[-:|–—~•.]\s*/, "").trim();

  return clean;
}

/**
 * Formats a player or member name with standardized Badside Tag:
 * Example:
 * formatBadsideMemberName("Axel", ["1526441933017190461"]) => "[WT] Axel"
 * formatBadsideMemberName("[WT] Axel", "white-tiger") => "[WT] Axel" (prevents double tag)
 */
export function formatBadsideMemberName(
  rawName: string | null | undefined,
  roleIdsOrSlugOrName?: string[] | string | null
): string {
  if (!rawName) return "";
  const tag = getBadsideTag(roleIdsOrSlugOrName);
  if (!tag) return rawName.trim();

  const cleanBaseName = stripBadsideTags(rawName);
  if (!cleanBaseName) return `[${tag}]`;

  return `[${tag}] ${cleanBaseName}`;
}
