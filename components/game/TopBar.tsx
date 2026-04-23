import type { PlayerIdentity, PublicGameSession } from "@/lib/types";

interface TopBarProps {
  session: PublicGameSession | null;
  identity: PlayerIdentity | null;
  countdownSeconds: number | null;
  onLeaveSession: () => void;
}

export function TopBar({ session, identity, countdownSeconds, onLeaveSession }: TopBarProps) {
  const statusLabel =
    session?.status === "waiting"
      ? "chờ bắt đầu"
      : session?.status === "playing"
        ? "đang chơi"
        : session?.status === "finished"
          ? "kết thúc"
          : "chưa vào phòng";

  return (
    <header className="rounded-3xl border border-[#efcfa4] bg-gradient-to-r from-[#1f6f78] via-[#1a5259] to-[#143e43] px-5 py-4 text-[#f9f3e8] shadow-xl shadow-[#0d2e32]/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#f8b76b]/60 bg-[#f8b76b]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd6a5]">
            Phiên
          </span>
          <strong className="text-xl tracking-[0.18em]">{session?.code ?? "------"}</strong>
          <span className="rounded-full border border-[#9ad6c0]/50 bg-[#9ad6c0]/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#b8f0da]">
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {countdownSeconds !== null ? (
            <div className="rounded-full border border-[#ffce86]/60 bg-[#ffce86]/20 px-4 py-1 text-sm font-semibold text-[#ffe4bc]">
              Timer: {countdownSeconds}s
            </div>
          ) : null}

          {identity ? (
            <div className="rounded-full border border-[#c9f9df]/40 bg-[#c9f9df]/10 px-4 py-1 text-sm text-[#d6ffea]">
              {identity.role === "host" ? "Chủ phòng" : `Đội: ${identity.teamName || "Unknown"}`}
            </div>
          ) : null}

          {identity ? (
            <button
              type="button"
              onClick={onLeaveSession}
              className="rounded-full bg-[#f96666] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de5353]"
            >
              Rời phòng
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
