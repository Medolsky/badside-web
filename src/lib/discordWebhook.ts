// Server-side only: import this from route handlers, never from "use client" components,
// so the webhook URL stays out of the browser bundle.
import type { AlertNotification } from "@/types";

const SEVERITY_RANK: Record<AlertNotification["severity"], number> = { INFO: 0, WARNING: 1, CRITICAL: 2 };
const SEVERITY_COLOR: Record<AlertNotification["severity"], number> = {
  INFO: 0x38bdf8,
  WARNING: 0xf59e0b,
  CRITICAL: 0xef4444,
};

export interface WebhookContext {
  serverId?: number;
  area?: string;
}

function shouldSend(severity: AlertNotification["severity"]): boolean {
  const min = (process.env.DISCORD_ALERT_MIN_SEVERITY || "WARNING").toUpperCase() as AlertNotification["severity"];
  return SEVERITY_RANK[severity] >= (SEVERITY_RANK[min] ?? 1);
}

export async function sendAlertToDiscord(alert: AlertNotification, ctx: WebhookContext = {}): Promise<boolean> {
  const url = process.env.DISCORD_ALERT_WEBHOOK_URL;
  if (!url || !shouldSend(alert.severity)) return false;

  const fields: { name: string; value: string; inline: boolean }[] = [];
  if (alert.characterName) fields.push({ name: "Character", value: alert.characterName, inline: true });
  if (ctx.serverId !== undefined) fields.push({ name: "Server ID", value: `#${ctx.serverId}`, inline: true });
  if (alert.groupName) fields.push({ name: "Group", value: alert.groupName, inline: true });
  if (ctx.area) fields.push({ name: "Area", value: ctx.area, inline: true });

  // Identifiers (license/steam/discord) are deliberately not sent: the channel is outside the audit log.
  const payload = {
    username: "Badside Monitor",
    allowed_mentions: { parse: [] as string[] },
    embeds: [
      {
        title: alert.title,
        description: alert.message,
        color: SEVERITY_COLOR[alert.severity],
        fields,
        footer: { text: `${alert.severity} • ${alert.type}` },
        timestamp: alert.createdAt,
      },
    ],
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return true;
      if (res.status === 429 && attempt === 0) {
        const body = (await res.json().catch(() => ({}))) as { retry_after?: number };
        await new Promise((r) => setTimeout(r, Math.min((body.retry_after ?? 1) * 1000, 5000)));
        continue;
      }
      console.error(`[discord-webhook] ${res.status} ${await res.text().catch(() => "")}`);
      return false;
    } catch (err) {
      console.error("[discord-webhook] request failed:", err);
      return false;
    }
  }
  return false;
}
