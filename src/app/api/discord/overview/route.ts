import { NextRequest, NextResponse } from "next/server";
import { DiscordError, getGuildInfo, getMembers, getRoles, isDiscordConfigured, clearDiscordCache } from "@/lib/discord";
import { ROLE_IDS, isUserAdminOrHandler } from "@/lib/roles";

// GET /api/discord/overview[?refresh=1]
// Returns guild, real roles, and real members with verified Admin & Badside Handler flags
export async function GET(req: NextRequest) {
  if (!isDiscordConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  const force = req.nextUrl.searchParams.get("refresh") === "1";
  if (force) clearDiscordCache();
  try {
    const [guild, rawRoles] = await Promise.all([getGuildInfo(force), getRoles(force)]);
    let members = null;
    let warning: string | undefined;
    try {
      const rawMembers = await getMembers(force);
      members = rawMembers
        .filter((m) => !m.bot)
        .map((m) => {
          const auth = isUserAdminOrHandler(m.roleIds);
          return {
            ...m,
            isAdmin: auth.isAdmin,
            isBadsideHandler: auth.isBadsideHandler,
            isStaff: auth.isStaff,
          };
        });
    } catch (e) {
      if (e instanceof DiscordError && e.code === "MISSING_INTENT") warning = e.message;
      else throw e;
    }

    const roles = rawRoles.map((r) => ({
      ...r,
      isAdmin: r.id === ROLE_IDS.ADMIN || r.id === ROLE_IDS.HIGH_COMMAND,
      isBadsideHandler: r.id === ROLE_IDS.BADSIDE_HANDLER,
      isStaff: r.id === ROLE_IDS.ADMIN || r.id === ROLE_IDS.BADSIDE_HANDLER || r.id === ROLE_IDS.HIGH_COMMAND,
    }));

    const staffMembers = members ? members.filter((m) => !m.bot && m.isStaff) : [];
    const adminMembers = members ? members.filter((m) => !m.bot && m.isAdmin) : [];
    const handlerMembers = members ? members.filter((m) => !m.bot && m.isBadsideHandler) : [];

    return NextResponse.json({
      configured: true,
      guild,
      roles,
      members,
      management: {
        adminCount: adminMembers.length,
        handlerCount: handlerMembers.length,
        totalStaffCount: staffMembers.length,
        staffList: staffMembers,
      },
      warning,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof DiscordError) {
      return NextResponse.json({ configured: true, error: e.message, code: e.code }, { status: e.status });
    }
    console.error("[discord] overview failed:", e);
    return NextResponse.json({ configured: true, error: "Gagal menghubungi Discord" }, { status: 502 });
  }
}
