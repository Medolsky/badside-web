import { Settings, Server, Download } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";

export default function SettingsPage() {
  const on = (v: boolean) => (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${v ? "text-green-400" : "text-neutral-500"}`}>
      <span className={`h-2 w-2 rounded-full ${v ? "bg-green-500" : "bg-neutral-600"}`} />
      {v ? "Aktif" : "Nonaktif"}
    </span>
  );

  const rows: [string, React.ReactNode][] = [
    ["Endpoint data FiveM", <code key="e" className="font-mono-telemetry text-white">POST /api/fivem/ingest</code>],
    ["Header keamanan", <code key="h" className="font-mono-telemetry text-white">x-api-key: FIVEM_API_SECRET</code>],
    ["Kirim data tiap", "5–10 detik (Config.HeartbeatInterval)"],
    ["Dianggap keluar kota setelah", `${process.env.DEFAULT_HEARTBEAT_TIMEOUT_SEC || 30} detik tanpa kabar`],
    ["Samarkan identifier", on(process.env.ENABLE_IDENTIFIER_MASKING !== "false")],
    ["Catat saat identifier dibuka", on(process.env.REQUIRE_AUDIT_ON_REVEAL !== "false")],
    ["Server Discord", on(Boolean(process.env.DISCORD_GUILD_ID))],
    ["Notifikasi webhook Discord", on(Boolean(process.env.DISCORD_ALERT_WEBHOOK_URL))],
  ];

  const steps = [
    <>Copy folder <code className="text-white">fivem-resource/badside_intel</code> ke folder <code className="text-white">resources/</code> server.</>,
    <>Buka <code className="text-white">config.lua</code>, isi <code className="text-white">Config.Endpoint</code> dan <code className="text-white">Config.ApiKey</code>.</>,
    <>Tambahkan <code className="text-white">ensure badside_intel</code> di <code className="text-white">server.cfg</code>.</>,
    <>Restart server. Player yang masuk akan muncul di Beranda.</>,
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Pengaturan" icon={Settings} subtitle="Dibaca dari file .env di server (hanya bisa dilihat)." />

      <Card title="Koneksi" icon={Server} bodyClassName="divide-y divide-[#1a1a1a]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-4 sm:px-5 py-3.5 text-xs">
            <span className="text-neutral-400">{k}</span>
            <span className="text-neutral-200 sm:text-right">{v}</span>
          </div>
        ))}
      </Card>

      <Card title="Pasang resource di server FiveM" icon={Download} bodyClassName="divide-y divide-[#1a1a1a]">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4 px-4 sm:px-5 py-3.5 text-xs text-neutral-300">
            <span className="h-7 w-7 rounded-full bg-[#E50914] text-white font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <p className="pt-1.5">{s}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
