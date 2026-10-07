import { NextRequest, NextResponse } from "next/server";
import { DiscordError, getGuildInfo, getMembers, getRoles, isDiscordConfigured } from "@/lib/discord";

// GET /api/discord/overview[?refresh=1]
// If the member list is blocked (Server Members Intent off), guild + roles are still returned with members: null.
export async function GET(req: NextRequest) {
  if (!isDiscordConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  const force = req.nextUrl.searchParams.get("refresh") === "1";
  try {
    const [guild, roles] = await Promise.all([getGuildInfo(force), getRoles(force)]);
    let members = null;
    let warning: string | undefined;
    try {
      members = await getMembers();
    } catch (e) {
      if (e instanceof DiscordError && e.code === "MISSING_INTENT") warning = e.message;
      else throw e;
    }
    return NextResponse.json({ configured: true, guild, roles, members, warning, fetchedAt: new Date().toISOString() });
  } catch (e) {
    if (e instanceof DiscordError) {
      return NextResponse.json({ configured: true, error: e.message, code: e.code }, { status: e.status });
    }
    console.error("[discord] overview failed:", e);
    return NextResponse.json({ configured: true, error: "Gagal menghubungi Discord" }, { status: 502 });
  }
}
