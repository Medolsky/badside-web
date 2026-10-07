"use client";

import { useEffect, useState } from "react";
import type { DiscordMember, DiscordRole } from "@/lib/discord";

type State =
  | { status: "loading" }
  | { status: "not-configured" }
  | { status: "not-in-guild" }
  | { status: "error"; message: string }
  | { status: "ok"; member: DiscordMember; roles: DiscordRole[] };

export function DiscordMemberRoles({ discordId }: { discordId: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const id = discordId.replace("discord:", "");
    fetch(`/api/discord/member/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.configured) setState({ status: "not-configured" });
        else if (d.error) setState({ status: "error", message: d.error });
        else if (!d.inGuild) setState({ status: "not-in-guild" });
        else setState({ status: "ok", member: d.member, roles: d.roles });
      })
      .catch(() => !cancelled && setState({ status: "error", message: "Gagal memuat data Discord" }));
    return () => {
      cancelled = true;
    };
  }, [discordId]);

  if (state.status === "loading") return <p className="text-[10px] text-slate-500 pt-1">Memuat role Discord...</p>;
  if (state.status === "not-configured") {
    return (
      <p className="text-[10px] text-slate-500 pt-1">
        Role belum bisa dibaca. <a href="/discord" className="text-cyan-400 hover:underline">Hubungkan bot Discord</a>
      </p>
    );
  }
  if (state.status === "not-in-guild") return <p className="text-[10px] text-amber-400 pt-1">Tidak ada di server Discord</p>;
  if (state.status === "error") return <p className="text-[10px] text-rose-400 pt-1">{state.message}</p>;

  const roles = [...state.roles].sort((a, b) => b.position - a.position);
  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.member.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
        <span className="text-slate-200">{state.member.displayName}</span>
        <span className="text-[10px] text-slate-400">@{state.member.username}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {roles.length === 0 && <span className="text-[10px] text-slate-500">Tidak punya role</span>}
        {roles.map((r) => (
          <span
            key={r.id}
            className="px-1.5 py-0.5 rounded text-[10px] border"
            style={{
              color: r.color || "#CBD5E1",
              borderColor: `${r.color || "#64748B"}55`,
              backgroundColor: `${r.color || "#64748B"}14`,
            }}
          >
            @{r.name}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-slate-500">
        Join server {new Date(state.member.joinedAt).toLocaleDateString("id-ID")}
      </p>
    </div>
  );
}
