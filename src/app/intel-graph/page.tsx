"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Network, IdCard, UserRound, UsersRound, Link2, ChevronRight, AlertTriangle } from "lucide-react";
import { store, maskIdentifier } from "@/lib/store";
import { Player } from "@/types";
import { PageHeader, Card, GroupLogo, input } from "@/components/ui";

export default function IntelGraphPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedId, setSelectedId] = useState("ply-001");

  useEffect(() => setPlayers(store.getPlayers()), []);

  const p = players.find((x) => x.id === selectedId);
  if (!p) return <div className="py-16 text-center text-sm text-neutral-500">Memuat...</div>;

  const peers = players.filter((x) => x.id !== p.id && x.groupName && x.groupName === p.groupName);
  const altFactions = [...new Set(p.characters.map((c) => c.faction).filter(Boolean))].filter((f) => f !== p.groupName) as string[];

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader title="Relasi Player" icon={Network} subtitle="Akun → Karakter → Grup → Teman satu grup">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={`${input} w-auto min-w-56`} aria-label="Pilih player">
          {players.map((x) => {
            const c = x.characters.find((ch) => ch.isActive) || x.characters[0];
            return (
              <option key={x.id} value={x.id}>
                {c?.fullName} (#{c?.characterId})
              </option>
            );
          })}
        </select>
      </PageHeader>

      {altFactions.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <p>
            Satu akun ini punya karakter di grup lain: <strong className="text-amber-300">{altFactions.join(", ")}</strong>. Perlu dicek apakah main di dua sisi.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Identitas" icon={IdCard} bodyClassName="p-3 space-y-2">
          <Node label="License" value={maskIdentifier(p.license, "license")} mono />
          <Node label="Steam" value={maskIdentifier(p.steam, "steam")} mono />
          <Node label="Discord" value={maskIdentifier(p.discordId, "discord")} mono />
        </Card>

        <Card title={`Karakter (${p.characters.length})`} icon={UserRound} bodyClassName="p-3 space-y-2">
          {p.characters.map((c) => (
            <Node key={c.id} label={`#${c.characterId} · ${c.job}`} value={c.fullName} active={c.isActive} />
          ))}
        </Card>

        <Card title="Grup" icon={UsersRound} bodyClassName="p-3 space-y-2">
          {p.groupName ? (
            <div className="flex items-center gap-3 rounded-xl bg-[#E50914]/[0.06] border border-[#E50914]/40 p-3">
              <GroupLogo name={p.groupName} size="h-9 w-9" />
              <div>
                <div className="text-[11px] text-neutral-500">Grup utama</div>
                <div className="text-sm font-bold text-white">{p.groupName}</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 p-2">Tidak punya grup</p>
          )}
          {altFactions.map((f) => (
            <div key={f} className="flex items-center gap-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/40 p-3">
              <GroupLogo name={f} size="h-9 w-9" />
              <div>
                <div className="text-[11px] text-amber-400">Karakter lain</div>
                <div className="text-sm font-bold text-white">{f}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card title={`Teman satu grup (${peers.length})`} icon={Link2} bodyClassName="p-3 space-y-2">
          {peers.length === 0 && <p className="text-xs text-neutral-500 p-2">Tidak ada</p>}
          {peers.map((x) => {
            const c = x.characters.find((ch) => ch.isActive) || x.characters[0];
            return (
              <button
                key={x.id}
                onClick={() => setSelectedId(x.id)}
                className="w-full flex items-center justify-between gap-2 rounded-xl bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#444] p-3 text-left transition"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${x.isOnline ? "bg-green-500" : "bg-neutral-600"}`} />
                  <span className="text-xs font-semibold text-white truncate">{c?.fullName || "—"}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
              </button>
            );
          })}
        </Card>
      </div>

      <Link href={`/players/${p.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF1E2D] hover:underline">
        Buka detail lengkap player <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Node({ label, value, active, mono }: { label: string; value: string; active?: boolean; mono?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${active ? "bg-[#E50914]/[0.06] border-[#E50914]/40" : "bg-[#0c0c0c] border-[#1f1f1f]"}`}>
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className={`text-xs text-white truncate mt-0.5 ${mono ? "font-mono-telemetry" : "font-semibold"}`}>{value}</div>
    </div>
  );
}
