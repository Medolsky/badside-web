"use client";

import { useEffect, useState } from "react";
import { Download, ShieldAlert } from "lucide-react";
import { store } from "@/lib/store";
import { AuditRecord } from "@/types";
import { PageHeader, Card, EmptyState, btnGhost } from "@/components/ui";

const ACTION: Record<AuditRecord["action"], { label: string; cls: string }> = {
  REVEAL_IDENTIFIER: { label: "Lihat identifier", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  ADD_WATCHLIST: { label: "Tambah watchlist", cls: "bg-[#E50914]/10 text-[#FF1E2D] border-[#E50914]/30" },
  REMOVE_WATCHLIST: { label: "Hapus watchlist", cls: "bg-[#181818] text-neutral-300 border-[#2a2a2a]" },
  EXPORT_DATA: { label: "Export data", cls: "bg-[#181818] text-neutral-300 border-[#2a2a2a]" },
  CONFIG_CHANGE: { label: "Ubah pengaturan", cls: "bg-[#181818] text-neutral-300 border-[#2a2a2a]" },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  useEffect(() => setLogs([...store.getAuditLogs()]), []);

  const exportCsv = () => {
    const rows = [
      ["time", "staff", "action", "target", "metadata"],
      ...logs.map((l) => [l.createdAt, l.staffName, l.action, l.target, l.metadata || ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" icon={ShieldAlert} subtitle="Catatan setiap staff yang membuka identifier atau mengubah watchlist.">
        <button onClick={exportCsv} disabled={logs.length === 0} className={btnGhost}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </PageHeader>

      <Card bodyClassName="">
        {logs.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="Belum ada catatan" />
        ) : (
          <div className="table-scroll-container">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-4">Staff</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-5">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#161616] transition">
                    <td className="py-3 px-5 whitespace-nowrap font-mono-telemetry text-neutral-400">
                      {new Date(l.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-white">{l.staffName}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${ACTION[l.action].cls}`}>{ACTION[l.action].label}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-200">{l.target}</td>
                    <td className="py-3 px-5 text-neutral-500 min-w-[280px]">{l.metadata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
