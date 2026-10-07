"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCheck, Check, Bell, AlertTriangle, Info, Siren, ChevronRight } from "lucide-react";
import { store } from "@/lib/store";
import { AlertNotification } from "@/types";
import { PageHeader, EmptyState, btnGhost } from "@/components/ui";

const SEV = {
  CRITICAL: { label: "Penting", icon: Siren, box: "border-l-[#E50914]", iconCls: "bg-[#E50914]/15 text-[#FF1E2D] border-[#E50914]/30" },
  WARNING: { label: "Peringatan", icon: AlertTriangle, box: "border-l-amber-500", iconCls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  INFO: { label: "Info", icon: Info, box: "border-l-neutral-500", iconCls: "bg-[#1a1a1a] text-neutral-300 border-[#2a2a2a]" },
} as const;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const refresh = () => setAlerts([...store.getAlerts()]);
  useEffect(refresh, []);

  const unread = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Notifikasi" icon={Bell} subtitle={unread ? `${unread} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}>
        <button
          onClick={() => {
            store.dismissAllAlerts();
            refresh();
          }}
          disabled={unread === 0}
          className={btnGhost}
        >
          <CheckCheck className="h-4 w-4" /> Tandai semua dibaca
        </button>
      </PageHeader>

      {alerts.length === 0 ? (
        <div className="rounded-2xl bg-[#111111] border border-[#222]">
          <EmptyState icon={Bell} title="Belum ada notifikasi" />
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const s = SEV[a.severity];
            const Icon = s.icon;
            return (
              <div
                key={a.id}
                className={`rounded-2xl bg-[#111111] border border-[#222] border-l-4 ${s.box} p-4 flex items-start gap-3 transition ${a.isRead ? "opacity-55" : ""}`}
              >
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${s.iconCls}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{a.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{s.label}</span>
                    {!a.isRead && <span className="h-2 w-2 rounded-full bg-[#E50914]" aria-label="Belum dibaca" />}
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">{a.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-neutral-500">
                    <span className="font-mono-telemetry">{new Date(a.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                    {a.playerId && (
                      <Link href={`/players/${a.playerId}`} className="font-semibold text-neutral-300 hover:text-[#FF1E2D] flex items-center gap-0.5">
                        Lihat player <ChevronRight className="h-3 w-3" />
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
                    className="h-9 w-9 rounded-xl border border-[#2a2a2a] bg-[#161616] text-neutral-400 hover:text-green-400 hover:border-green-500/40 flex items-center justify-center shrink-0 transition"
                    aria-label="Tandai dibaca"
                    title="Tandai dibaca"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
