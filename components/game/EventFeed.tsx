import type { GameEvent } from "@/lib/types";

interface EventFeedProps {
  events: GameEvent[];
}

export function EventFeed({ events }: EventFeedProps) {
  const eventLabelMap: Record<string, string> = {
    SESSION_CREATED: "Tạo phiên",
    TEAM_JOINED: "Đội tham gia",
    GAME_STARTED: "Bắt đầu",
    TURN_CHANGED: "Đổi lượt",
    SPIN: "Quay vòng",
    GUESS: "Đoán chữ",
    BUY_VOWEL: "Mua nguyên âm",
    SOLVE: "Giải đáp án",
    RESET: "Đặt lại",
  };

  return (
    <section className="rounded-3xl border border-[#efdfc9] bg-[#fffaf1] p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8d6e47]">Sự kiện gần đây</h3>
      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
        {events.length === 0 ? <p className="text-sm text-[#90795c]">Chưa có sự kiện.</p> : null}
        {events.slice(0, 10).map((event) => (
          <div key={event.id} className="rounded-xl border border-[#f0dfc4] bg-white px-3 py-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <strong className="tracking-[0.12em] text-[#805f37]">{eventLabelMap[event.type] ?? event.type}</strong>
              <span className="text-[#9c8668]">{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
