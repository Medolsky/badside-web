import { NextRequest, NextResponse } from "next/server";
import { DiscordError, getMember, getRoles, isDiscordConfigured } from "@/lib/discord";

// GET /api/discord/member/:id -> member profile with resolved role objects
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDiscordConfigured()) return NextResponse.json({ configured: false });
  const { id } = await params;
  try {
    const member = await getMember(id);
    if (!member) return NextResponse.json({ configured: true, inGuild: false });
    const roles = await getRoles();
    const memberRoles = roles.filter((r) => member.roleIds.includes(r.id));
    return NextResponse.json({ configured: true, inGuild: true, member, roles: memberRoles });
  } catch (e) {
    if (e instanceof DiscordError) {
      return NextResponse.json({ configured: true, error: e.message, code: e.code }, { status: e.status });
    }
    console.error("[discord] member lookup failed:", e);
    return NextResponse.json({ configured: true, error: "Gagal menghubungi Discord" }, { status: 502 });
  }
}
