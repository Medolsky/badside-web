export default function SettingsPage() {
  const rows: [string, string][] = [
    ["Ingest endpoint", "POST /api/fivem/ingest"],
    ["Auth header", "x-api-key: $FIVEM_API_SECRET"],
    ["Heartbeat interval", "5–10 detik (Config.HeartbeatInterval)"],
    ["Heartbeat timeout", `${process.env.DEFAULT_HEARTBEAT_TIMEOUT_SEC || 30} detik → SUSPECTED → OFFLINE`],
    ["Identifier masking", process.env.ENABLE_IDENTIFIER_MASKING === "false" ? "Disabled" : "Enabled"],
    ["Audit on reveal", process.env.REQUIRE_AUDIT_ON_REVEAL === "false" ? "Disabled" : "Required"],
    ["Discord guild", process.env.DISCORD_GUILD_ID ? "Configured" : "Not configured"],
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Engine & FiveM Sync</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Konfigurasi dibaca dari .env (read-only di UI).</p>
      </div>

      <dl className="rounded-xl border border-[#232B38] bg-[#12161F] divide-y divide-[#1A212D] text-xs font-mono">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[200px_1fr] gap-4 px-4 py-3">
            <dt className="text-slate-400">{k}</dt>
            <dd className="text-slate-200">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="space-y-2">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-200">Install resource FiveM</h2>
        <pre className="p-4 rounded-xl bg-[#0A0D12] border border-[#1A212D] text-[11px] font-mono text-slate-300 overflow-x-auto">{`1. Copy folder fivem-resource/badside_intel ke resources/
2. Edit config.lua → Config.Endpoint & Config.ApiKey
3. Tambahkan di server.cfg:
     ensure badside_intel
4. Restart server — heartbeat muncul di dashboard.`}</pre>
      </section>
    </div>
  );
}
