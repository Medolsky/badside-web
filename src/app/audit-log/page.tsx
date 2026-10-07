"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { store } from "@/lib/store";
import { AuditRecord } from "@/types";

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
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Audit Trail</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Setiap reveal identifier dan perubahan watchlist tercatat di sini.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="px-3 py-1.5 rounded-lg bg-[#141A24] border border-[#232B38] text-xs font-mono text-slate-300 hover:text-slate-100 flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-[#232B38] bg-[#12161F] overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#232B38] bg-[#0E1218] text-[10px] uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Staff</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A212D]">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-[#161D29]">
                <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                  {new Date(l.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-200">{l.staffName}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] ${
                      l.action === "REVEAL_IDENTIFIER"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                        : l.action === "REMOVE_WATCHLIST"
                        ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                        : "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                    }`}
                  >
                    {l.action}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-200">{l.target}</td>
                <td className="py-3 px-4 text-slate-400 min-w-[280px]">{l.metadata}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
