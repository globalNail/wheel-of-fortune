interface TurnTimerProps {
  remainingSeconds: number | null;
  totalSeconds: number;
  isCurrentTeam: boolean;
}

export function TurnTimer({ remainingSeconds, totalSeconds, isCurrentTeam }: TurnTimerProps) {
  const hasTimer = remainingSeconds !== null;
  const safeRemaining = remainingSeconds ?? totalSeconds;
  const clamped = Math.min(totalSeconds, Math.max(0, safeRemaining));
  const progress = (clamped / totalSeconds) * 100;
  const urgent = hasTimer && clamped <= 5;

  return (
    <section className="rounded-2xl border border-[#e7d6b7] bg-[#fff9ee] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d6b43]">Timer</p>
        <span
          className={[
            "rounded-full px-2 py-1 text-xs font-bold",
            urgent
              ? "animate-[blink_760ms_steps(1,start)_infinite] bg-[#ffe0e0] text-[#a23535]"
              : "bg-[#e5f5ef] text-[#236a59]",
          ].join(" ")}
        >
          {hasTimer ? `${clamped}s` : "--"}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#f0e5d2]">
        <div
          className={[
            "h-full transition-[width] duration-300",
            urgent ? "bg-[#df5c5c]" : "bg-[#2f9f85]",
          ].join(" ")}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-[#7f6442]">
        {isCurrentTeam
          ? "Đến lượt của bạn. Hãy thao tác trước khi hết giờ."
          : "Đang chờ đội khác thao tác."}
      </p>
    </section>
  );
}
