"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { store, maskIdentifier } from "@/lib/store";
import { Player } from "@/types";

export default function IntelGraphPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedId, setSelectedId] = useState("ply-001");

  useEffect(() => setPlayers(store.getPlayers()), []);

  const p = players.find((x) => x.id === selectedId);
  if (!p) return <div className="p-12 text-xs font-mono text-slate-400">Loading...</div>;

  const peers = players.filter((x) => x.id !== p.id && x.groupName && x.groupName === p.groupName);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Intel Matrix</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Player → Identifier → Character → Group → Peers</p>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-[#0E1218] border border-[#232D3E] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
        >
          {players.map((x) => {
            const c = x.characters.find((ch) => ch.isActive) || x.characters[0];
            return (
              <option key={x.id} value={x.id}>
                {c?.fullName} (#{c?.characterId})
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        {/* Column 1: identifiers */}
        <Column title="Identifiers">
          <Node label="License" value={maskIdentifier(p.license, "license")} />
          <Node label="Steam" value={maskIdentifier(p.steam, "steam")} />
          <Node label="Discord" value={maskIdentifier(p.discordId, "discord")} />
        </Column>

        {/* Column 2: characters */}
        <Column title={`Characters (${p.characters.length})`}>
          {p.characters.map((c) => (
            <Node
              key={c.id}
              label={`#${c.characterId} · ${c.job}`}
              value={c.fullName}
              accent={c.isActive ? "border-cyan-500/50" : undefined}
            />
          ))}
        </Column>

        {/* Column 3: group */}
        <Column title="Group">
          {p.groupName ? (
            <Node label="Faction" value={p.groupName} accent="border-[#8B5CF6]/60" />
          ) : (
            <span className="text-slate-400">No group</span>
          )}
          {[...new Set(p.characters.map((c) => c.faction).filter(Boolean))]
            .filter((f) => f !== p.groupName)
            .map((f) => (
              <Node key={f} label="Alt-character faction" value={f!} accent="border-amber-500/50" />
            ))}
        </Column>

        {/* Column 4: peers */}
        <Column title={`Peers (${peers.length})`}>
          {peers.length === 0 && <span className="text-slate-400">No linked peers</span>}
          {peers.map((x) => {
            const c = x.characters.find((ch) => ch.isActive) || x.characters[0];
            return (
              <button key={x.id} onClick={() => setSelectedId(x.id)} className="block w-full text-left">
                <Node label={x.isOnline ? "ONLINE" : "OFFLINE"} value={c?.fullName || "—"} />
              </button>
            );
          })}
        </Column>
      </div>

      <p className="text-[11px] font-mono text-slate-400">
        Faksi karakter alternatif yang berbeda dari grup utama ditandai kuning — berguna untuk mendeteksi satu license yang punya karakter di dua sisi.{" "}
        <Link href={`/players/${p.id}`} className="text-cyan-400 hover:underline">Open full dossier</Link>
      </p>
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 pb-1 border-b border-[#232B38]">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Node({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`p-2.5 rounded-lg bg-[#12161F] border ${accent || "border-[#232B38]"} hover:bg-[#161D29] transition-colors`}>
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="text-slate-100 truncate">{value}</div>
    </div>
  );
}
