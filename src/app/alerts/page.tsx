"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCheck, Check } from "lucide-react";
import { store } from "@/lib/store";
import { AlertNotification } from "@/types";

const sev: Record<AlertNotification["severity"], string> = {
  CRITICAL: "border-l-rose-500 bg-rose-500/5",
  WARNING: "border-l-amber-500 bg-amber-500/5",
  INFO: "border-l-cyan-500 bg-cyan-500/5",
};
const sevText: Record<AlertNotification["severity"], string> = {
  CRITICAL: "text-rose-300",
  WARNING: "text-amber-300",
  INFO: "text-cyan-300",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const refresh = () => setAlerts([...store.getAlerts()]);
  useEffect(refresh, []);

  const unread = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Alerts & Dispatch</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{unread} alert belum dibaca</p>
        </div>
        <button
          onClick={() => {
            store.dismissAllAlerts();
            refresh();
          }}
          disabled={unread === 0}
          className="px-3 py-1.5 rounded-lg bg-[#141A24] border border-[#232B38] text-xs font-mono text-slate-300 hover:text-slate-100 disabled:opacity-40 flex items-center gap-1.5"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-4 rounded-lg border border-[#232B38] border-l-4 ${sev[a.severity]} ${a.isRead ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${sevText[a.severity]}`}>{a.title}</span>
                  <span className="text-[10px] text-slate-400">{a.severity}</span>
                  {!a.isRead && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                </div>
                <p className="text-slate-300">{a.message}</p>
                <div className="text-[11px] text-slate-400 flex gap-3">
                  <span>{new Date(a.createdAt).toLocaleTimeString("id-ID")}</span>
                  {a.playerId && (
                    <Link href={`/players/${a.playerId}`} className="text-cyan-400 hover:underline">
                      Open player
                    </Link>
                  )}
                </div>
              </div>
              {!a.isRead && (
                <button
                  onClick={() => {
                    store.markAlertRead(a.id);
                    refresh();
                  }}
                  className="p-1.5 rounded border border-[#232B38] text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
