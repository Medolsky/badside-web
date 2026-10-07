"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Crosshair, Plus, Trash2, X, UsersRound, User, ChevronRight } from "lucide-react";
import { store } from "@/lib/store";
import { WatchlistEntry, Player } from "@/types";

const priorityStyle: Record<WatchlistEntry["priority"], string> = {
  HIGH: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  MEDIUM: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  LOW: "bg-yellow-500/10 text-yellow-200 border-yellow-500/30",
};

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    targetId: "",
    priority: "HIGH" as WatchlistEntry["priority"],
    category: "SUSPECT" as WatchlistEntry["category"],
    reason: "",
    notes: "",
  });

  const refresh = () => {
    setEntries([...store.getWatchlist()]);
    setPlayers([...store.getPlayers()]);
  };

  useEffect(refresh, []);

  const candidates = players.filter((p) => !p.isWatchlisted);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = players.find((ply) => ply.id === form.targetId);
    if (!p || !form.reason.trim()) return;
    const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
    store.addWatchlistEntry({
      targetType: "PLAYER",
      targetId: p.id,
      targetName: `${c?.fullName} (CID #${c?.characterId})`,
      priority: form.priority,
      category: form.category,
      reason: form.reason.trim(),
      notes: form.notes.trim() || undefined,
      createdBy: "STAFF_MONITOR",
    });
    setForm({ targetId: "", priority: "HIGH", category: "SUSPECT", reason: "", notes: "" });
    setIsFormOpen(false);
    refresh();
  };

  const remove = (id: string) => {
    store.removeWatchlistEntry(id);
    refresh();
  };

  const grouped = (["HIGH", "MEDIUM", "LOW"] as const).map((pr) => ({
    priority: pr,
    items: entries.filter((e) => e.priority === pr),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-slate-100 uppercase">Target Watchlist</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Player dan kelompok yang dipantau. Setiap perubahan tercatat di audit log.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-mono font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Target
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={submit}
          className="p-5 rounded-xl bg-[#12161F] border border-rose-500/30 space-y-4 text-xs font-mono"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100 uppercase tracking-wide">New Watchlist Target</span>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-slate-400">Player</span>
              <select
                required
                value={form.targetId}
                onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                className="w-full bg-[#0E1218] border border-[#232D3E] rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">Select player...</option>
                {candidates.map((p) => {
                  const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
                  return (
                    <option key={p.id} value={p.id}>
                      {c?.fullName} (#{c?.characterId})
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Priority</span>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as WatchlistEntry["priority"] })}
                className="w-full bg-[#0E1218] border border-[#232D3E] rounded px-2.5 py-2 text-slate-200 focus:outline-none"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as WatchlistEntry["category"] })}
                className="w-full bg-[#0E1218] border border-[#232D3E] rounded px-2.5 py-2 text-slate-200 focus:outline-none"
              >
                <option value="SUSPECT">SUSPECT</option>
                <option value="SYNDICATE">SYNDICATE</option>
                <option value="HIGH_VALUE">HIGH_VALUE</option>
                <option value="INVESTIGATION">INVESTIGATION</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-slate-400">Reason (wajib)</span>
            <input
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full bg-[#0E1218] border border-[#232D3E] rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              placeholder="Kenapa player ini dipantau?"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-slate-400">Notes</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-[#0E1218] border border-[#232D3E] rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold transition-colors"
            >
              Save Target
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {grouped.map(({ priority, items }) => (
          <section key={priority} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded border font-bold ${priorityStyle[priority]}`}>{priority} PRIORITY</span>
              <span className="text-slate-400">{items.length} target</span>
            </div>
            {items.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#232B38] text-xs font-mono text-slate-400">
                Belum ada target di prioritas ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {items.map((w) => {
                  const p = w.targetType === "PLAYER" ? players.find((ply) => ply.id === w.targetId) : undefined;
                  const href = w.targetType === "GROUP" ? `/groups/badside` : `/players/${w.targetId}`;
                  return (
                    <div key={w.id} className="p-4 rounded-xl bg-[#12161F] border border-[#232B38] space-y-3 text-xs font-mono">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded bg-[#0A0D12] border border-[#1A212D] flex items-center justify-center">
                            {w.targetType === "GROUP" ? (
                              <UsersRound className="w-4 h-4 text-[#A855F7]" />
                            ) : (
                              <User className="w-4 h-4 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-100">{w.targetName}</div>
                            <div className="text-[11px] text-slate-400">
                              {w.targetType} • {w.category}
                            </div>
                          </div>
                        </div>
                        {p && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] border ${
                              p.isOnline
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {p.isOnline ? `IN CITY #${p.currentServerId}` : "OFFLINE"}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{w.reason}</p>
                      {w.notes && <p className="text-slate-400 border-l-2 border-[#2E3849] pl-2">{w.notes}</p>}
                      <div className="flex items-center justify-between pt-2 border-t border-[#1E2634] text-[11px] text-slate-400">
                        <span>
                          by {w.createdBy} • {new Date(w.createdAt).toLocaleDateString("id-ID")}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => remove(w.id)}
                            className="p-1.5 rounded border border-[#232B38] hover:border-rose-500/40 hover:text-rose-300 transition-colors"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link href={href} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                            Open <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <Crosshair className="w-3.5 h-3.5 text-rose-400" />
        Target online akan memicu alert otomatis dari resource FiveM.
      </div>
    </div>
  );
}
