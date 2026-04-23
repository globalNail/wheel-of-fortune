import { useState } from "react";
import type { PlayerIdentity, PublicGameSession } from "@/lib/types";

interface TopBarProps {
  session: PublicGameSession | null;
  identity: PlayerIdentity | null;
  countdownSeconds: number | null;
  onLeaveSession: () => void;
}

export function TopBar({ session, identity, countdownSeconds, onLeaveSession }: TopBarProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const statusLabel =
    session?.status === "waiting"
      ? "chờ bắt đầu"
      : session?.status === "playing"
        ? "đang chơi"
        : session?.status === "finished"
          ? "kết thúc"
          : "chưa vào phòng";

  return (
    <>
      <header className="rounded-3xl border border-[#efcfa4] bg-gradient-to-r from-[#1f6f78] via-[#1a5259] to-[#143e43] px-5 py-4 text-[#f9f3e8] shadow-xl shadow-[#0d2e32]/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#f8b76b]/60 bg-[#f8b76b]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd6a5]">
              Phòng
            </span>
            <strong className="text-xl tracking-[0.18em] select-text">{session?.code ?? "------"}</strong>
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
                onClick={() => setShowConfirm(true)}
                className="rounded-full bg-[#f96666] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de5353]"
              >
                Rời phòng
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#fff8ee] p-6 shadow-2xl shadow-black/40">
            <h2 className="text-xl font-bold text-[#5f4628]">Cảnh báo rời phòng</h2>
            <p className="mt-2 text-[#855f36]">
              Bạn có chắc chắn muốn rời khỏi phòng không? Bạn không thể vào lại khi trò chơi đang diễn ra.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl bg-[#e8d7bc] px-4 py-2 text-sm font-semibold text-[#5f4628] transition hover:bg-[#dbc4a0]"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  onLeaveSession();
                }}
                className="flex-1 rounded-xl bg-[#f96666] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de5353]"
              >
                Rời phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
