import { NextRequest, NextResponse } from "next/server";
import { sendAlertToDiscord } from "@/lib/discordWebhook";

// POST /api/discord/test  (header x-api-key: $FIVEM_API_SECRET)
// Sends one sample alert to DISCORD_ALERT_WEBHOOK_URL to verify the integration.
export async function POST(req: NextRequest) {
  const secret = process.env.FIVEM_API_SECRET;
  if (!secret || req.headers.get("x-api-key") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.DISCORD_ALERT_WEBHOOK_URL) {
    return NextResponse.json({ error: "DISCORD_ALERT_WEBHOOK_URL is not set" }, { status: 400 });
  }

  const sent = await sendAlertToDiscord({
    id: `test-${Date.now()}`,
    type: "WATCHLIST_ONLINE",
    title: "TEST: Badside Monitor connected",
    message: "Webhook aktif. Alert watchlist dan pergantian karakter akan dikirim ke channel ini.",
    severity: "CRITICAL",
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: sent }, { status: sent ? 200 : 502 });
}
