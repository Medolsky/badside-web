"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Crosshair, Plus, Trash2, X, ChevronRight, Info } from "lucide-react";
import { store } from "@/lib/store";
import { WatchlistEntry, Player } from "@/types";
import { PageHeader, Card, Avatar, GroupLogo, OnlineBadge, PriorityBadge, Tag, EmptyState, Field, input, btnPrimary, btnGhost } from "@/components/ui";

const CATEGORY: Record<WatchlistEntry["category"], string> = {
  SUSPECT: "Tersangka",
  SYNDICATE: "Sindikat",
  HIGH_VALUE: "Target penting",
  INVESTIGATION: "Investigasi",
};

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    refresh();
  };

  const remove = (id: string, name: string) => {
    if (!window.confirm(`Hapus ${name} dari watchlist?`)) return;
    store.removeWatchlistEntry(id);
    refresh();
  };

  const sections = (["HIGH", "MEDIUM", "LOW"] as const).map((pr) => ({ priority: pr, items: entries.filter((e) => e.priority === pr) }));

  return (
    <div className="space-y-6">
      <PageHeader title="Watchlist" icon={Crosshair} subtitle={`${entries.length} target dipantau. Setiap perubahan tercatat di Audit Log.`}>
        <button onClick={() => setOpen(!open)} className={open ? btnGhost : btnPrimary}>
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {open ? "Batal" : "Tambah Target"}
        </button>
      </PageHeader>

      {open && (
        <Card title="Tambah target baru" icon={Plus} className="border-[#E50914]/40">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Player">
                <select required value={form.targetId} onChange={(e) => setForm({ ...form, targetId: e.target.value })} className={input}>
                  <option value="">Pilih player...</option>
                  {candidates.map((p) => {
                    const c = p.characters.find((ch) => ch.isActive) || p.characters[0];
                    return (
                      <option key={p.id} value={p.id}>
                        {c?.fullName} (#{c?.characterId})
                      </option>
                    );
                  })}
                </select>
              </Field>
              <Field label="Prioritas">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as WatchlistEntry["priority"] })} className={input}>
                  <option value="HIGH">Tinggi</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="LOW">Rendah</option>
                </select>
              </Field>
              <Field label="Kategori">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as WatchlistEntry["category"] })} className={input}>
                  {Object.entries(CATEGORY).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Alasan (wajib)">
              <input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={input} placeholder="Kenapa player ini dipantau?" />
            </Field>
            <Field label="Catatan">
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={input} placeholder="Opsional" />
            </Field>
            <div className="flex justify-end">
              <button type="submit" className={btnPrimary}>
                Simpan Target
              </button>
            </div>
          </form>
        </Card>
      )}

      {sections.map(({ priority, items }) => (
        <section key={priority} className="space-y-3">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={priority} />
            <span className="text-xs text-neutral-500">{items.length} target</span>
          </div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#252525]">
              <EmptyState icon={Crosshair} title="Belum ada target" desc="Tidak ada target di prioritas ini." />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
              {items.map((w) => {
                const p = w.targetType === "PLAYER" ? players.find((ply) => ply.id === w.targetId) : undefined;
                const slug = w.targetId.replace("grp-", "");
                const href = w.targetType === "GROUP" ? `/groups/${slug}` : `/players/${w.targetId}`;
                return (
                  <div key={w.id} className="rounded-2xl bg-[#111111] border border-[#222] hover:border-[#E50914]/50 p-4 sm:p-5 transition flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {w.targetType === "GROUP" ? <GroupLogo name={w.targetName} /> : <Avatar name={w.targetName} online={p?.isOnline} />}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{w.targetName}</div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Tag>{w.targetType === "GROUP" ? "Grup" : "Player"}</Tag>
                            <Tag>{CATEGORY[w.category]}</Tag>
                          </div>
                        </div>
                      </div>
                      {p && <OnlineBadge online={p.isOnline} />}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-3 flex-1">{w.reason}</p>
                    {w.notes && <p className="text-xs text-neutral-500 border-l-2 border-[#E50914]/50 pl-2.5 mt-2">{w.notes}</p>}
                    <div className="flex items-center justify-between gap-2 pt-3 mt-4 border-t border-[#1f1f1f] text-[11px] text-neutral-500">
                      <span>Ditambah {new Date(w.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => remove(w.id, w.targetName)}
                          className="h-8 w-8 rounded-lg border border-[#2a2a2a] bg-[#161616] text-neutral-400 hover:text-[#FF1E2D] hover:border-[#E50914]/50 flex items-center justify-center transition"
                          aria-label={`Hapus ${w.targetName} dari watchlist`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <Link href={href} className="h-8 px-3 rounded-lg bg-[#161616] border border-[#2a2a2a] text-neutral-300 hover:text-white flex items-center gap-1 font-semibold transition">
                          Buka <ChevronRight className="h-3.5 w-3.5" />
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

      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Info className="h-3.5 w-3.5" />
        Kalau target masuk kota, notifikasi otomatis dikirim ke Discord.
      </div>
    </div>
  );
}
