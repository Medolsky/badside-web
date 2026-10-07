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

  if (state.status === "loading") return <p className="text-[11px] text-neutral-500 pt-1">Memuat role Discord...</p>;
  if (state.status === "not-configured") {
    return (
      <p className="text-[11px] text-neutral-500 pt-1">
        Role belum bisa dibaca. <a href="/discord" className="text-[#FF1E2D] font-semibold hover:underline">Hubungkan bot Discord</a>
      </p>
    );
  }
  if (state.status === "not-in-guild") return <p className="text-[11px] text-amber-400 pt-1">Tidak ada di server Discord</p>;
  if (state.status === "error") return <p className="text-[11px] text-[#FF1E2D] pt-1">{state.message}</p>;

  const roles = [...state.roles].sort((a, b) => b.position - a.position);
  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.member.avatarUrl} alt="" className="h-6 w-6 rounded-lg" />
        <span className="font-semibold text-white">{state.member.displayName}</span>
        <span className="text-[11px] text-neutral-500">@{state.member.username}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {roles.length === 0 && <span className="text-[11px] text-neutral-500">Tidak punya role</span>}
        {roles.map((r) => (
          <span
            key={r.id}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#181818] border border-[#2a2a2a] text-neutral-200"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color || "#A3A3A3" }} />
            {r.name}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-neutral-500">
        Gabung server {new Date(state.member.joinedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
