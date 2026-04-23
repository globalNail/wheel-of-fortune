import { useState } from "react";
import type { PublicGameSession, Team } from "@/lib/types";

interface ScoreboardProps {
  session: PublicGameSession;
  playerTeamId?: string;
  isHost: boolean;
  draftOrder: string[];
  onMoveTeam: (teamId: string, direction: "up" | "down") => void;
  onSaveOrder: () => void;
  onStartGame: () => void;
}

function sortByScore(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => b.score - a.score || a.order - b.order);
}

export function Scoreboard({
  session,
  playerTeamId,
  isHost,
  draftOrder,
  onMoveTeam,
  onSaveOrder,
  onStartGame,
}: ScoreboardProps) {
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const byId = new Map(session.teams.map((team) => [team.id, team]));
  const orderedTeams = draftOrder.map((id) => byId.get(id)).filter(Boolean) as Team[];
  const rankings = sortByScore(session.teams);

  return (
    <section className="rounded-3xl border border-[#e7d9be] bg-[#fffaf1] p-4 shadow-lg shadow-[#c09a66]/10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#89663d]">Bảng điểm</h2>
        {session.status === "waiting" ? (
          <span className="rounded-full bg-[#ffe7bf] px-3 py-1 text-xs font-semibold text-[#8f622d]">
            Đang chờ ({session.teams.length}/{session.maxTeams})
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        {orderedTeams.map((team, index) => {
          const isCurrent = session.currentTurnTeamId === team.id;
          const isPlayer = playerTeamId === team.id;
          const isLeft = team.status === "left";

          return (
            <div
              key={team.id}
              className={[
                "rounded-2xl border px-3 py-3",
                isLeft
                  ? "border-[#e0d0c0] bg-[#f5f0ea] opacity-60"
                  : isCurrent
                    ? "border-[#2f9f85] bg-[#dff8f2]"
                    : "border-[#f0dfc4] bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#574022]">
                    {index + 1}. {team.name}
                    {isPlayer ? " (Bạn)" : ""}
                    {isLeft ? (
                      <span className="ml-2 rounded-full bg-[#e8d7bc] px-2 py-0.5 text-[10px] font-semibold text-[#8f6b41]">
                        Đã rời phòng
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-[#8d7454]">Điểm: {team.score}</p>
                </div>

                {isHost && session.status === "waiting" && !isLeft ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMoveTeam(team.id, "up")}
                      className="rounded-lg border border-[#d9bc92] px-2 py-1 text-xs hover:bg-[#fff1d7]"
                    >
                      Lên
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTeam(team.id, "down")}
                      className="rounded-lg border border-[#d9bc92] px-2 py-1 text-xs hover:bg-[#fff1d7]"
                    >
                      Xuống
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {isHost && session.status === "waiting" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSaveOrder}
            className="rounded-full bg-[#315f72] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#274c5b]"
          >
            Lưu thứ tự lượt
          </button>
          <button
            type="button"
            onClick={() => setShowStartConfirm(true)}
            disabled={session.teams.length !== session.maxTeams}
            className="rounded-full bg-[#f08b37] px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[#d97724] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bắt đầu
          </button>
        </div>
      ) : null}

      <div className="mt-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6c45]">Xếp hạng</h3>
        <ol className="space-y-1 text-sm text-[#60492d]">
          {rankings.map((team, index) => (
            <li key={team.id}>
              #{index + 1} {team.name} - {team.score}
            </li>
          ))}
        </ol>
      </div>

      {/* Start Confirmation Modal */}
      {showStartConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#fff8ee] p-6 shadow-2xl shadow-black/40">
            <h2 className="text-xl font-bold text-[#5f4628]">Xác nhận bắt đầu</h2>
            <p className="mt-2 text-[#855f36]">
              Bạn đã kiểm tra kỹ thứ tự lượt chưa? Trò chơi sẽ bắt đầu ngay bây giờ.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="flex-1 rounded-xl bg-[#e8d7bc] px-4 py-2 text-sm font-semibold text-[#5f4628] transition hover:bg-[#dbc4a0]"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowStartConfirm(false);
                  onStartGame();
                }}
                className="flex-1 rounded-xl bg-[#2f9f85] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#26806b]"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
