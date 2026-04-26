"use client";

import { FormEvent, useState } from "react";
import type { PublicGameSession } from "@/lib/types";

interface HostActionPanelProps {
  session: PublicGameSession;
  onGuess: (letter: string) => Promise<void>;
  onSolve: (attempt: string) => Promise<void>;
  onNextTurn: () => Promise<void>;
  onSetTimer: (seconds: number) => Promise<void>;
  onStartTimer: () => Promise<void>;
  onStopTimer: () => Promise<void>;
  onNextQuestion: () => Promise<void>;
  nowMs: number;
  wheelAnimating: boolean;
}

export function HostActionPanel({
  session,
  onGuess,
  onSolve,
  onNextTurn,
  onSetTimer,
  onStartTimer,
  onStopTimer,
  onNextQuestion,
  nowMs,
  wheelAnimating,
}: HostActionPanelProps) {
  const [guessLetter, setGuessLetter] = useState("");
  const [solveAttempt, setSolveAttempt] = useState("");
  const [timerInput, setTimerInput] = useState(session.turnDurationSeconds.toString());
  const [isTimerDirty, setIsTimerDirty] = useState(false);

  const [loadingGuess, setLoadingGuess] = useState(false);
  const [loadingSolve, setLoadingSolve] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(false);

  const timerDisplayValue = isTimerDirty ? timerInput : session.turnDurationSeconds.toString();

  async function handleGuess(event: FormEvent) {
    event.preventDefault();
    if (!guessLetter.trim()) return;
    setLoadingGuess(true);
    try {
      await onGuess(guessLetter);
      setGuessLetter("");
    } finally {
      setLoadingGuess(false);
    }
  }

  async function handleSolve(event: FormEvent) {
    event.preventDefault();
    if (!solveAttempt.trim()) return;
    setLoadingSolve(true);
    try {
      await onSolve(solveAttempt);
      setSolveAttempt("");
    } finally {
      setLoadingSolve(false);
    }
  }

  async function handleSetTimer(event: FormEvent) {
    event.preventDefault();
    const seconds = parseInt(timerDisplayValue, 10);
    if (isNaN(seconds) || seconds < 5) return;
    setLoadingTimer(true);
    try {
      await onSetTimer(seconds);
      setIsTimerDirty(false);
    } finally {
      setLoadingTimer(false);
    }
  }

  const canGuess = session.status === "playing" && session.gamePhase === "waiting_host_guess" && !wheelAnimating;
  const canSolve = session.status === "playing" && session.gamePhase === "waiting_host_guess" && !wheelAnimating;

  const isTimerRunning = session.timerStatus === "running";
  
  let remainingSeconds = session.turnDurationSeconds;
  if (session.timerStatus === "running" && session.timerEndsAt) {
    remainingSeconds = Math.max(0, Math.ceil((session.timerEndsAt - nowMs) / 1000));
  } else if (session.timerRemainingSeconds !== null) {
    remainingSeconds = session.timerRemainingSeconds;
  }

  return (
    <section className="rounded-3xl border border-[#ebd7b8] bg-[#fff8ec] p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8f6b41]">Điều khiển trò chơi</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Timer Control */}
        <div className="space-y-3 rounded-2xl border border-[#e8d7bc] bg-white p-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#855f36]">Thời gian (Giây: {remainingSeconds})</h3>
          
          <form onSubmit={handleSetTimer} className="flex gap-2">
            <input
              type="number"
              title="i_timer"
              min={5}
              value={timerDisplayValue}
              onChange={(e) => {
                setTimerInput(e.target.value);
                setIsTimerDirty(true);
              }}
              className="w-16 rounded-xl border border-[#dbc4a0] px-3 py-2 text-center text-sm outline-none focus:border-[#1f6f78]"
            />
            <button
              type="submit"
              title="btn_save"
              disabled={loadingTimer || isTimerRunning || wheelAnimating}
              className="rounded-xl bg-[#8f6b41] px-3 py-2 text-xs font-semibold text-white transition enabled:hover:bg-[#7a5934] disabled:opacity-50"
            >
              Cài đặt
            </button>
          </form>

          <div className="flex gap-2">
            {!isTimerRunning ? (
              <button
                type="button"
                title="btn_start"
                onClick={onStartTimer}
                disabled={session.status !== "playing" || wheelAnimating}
                className="flex-1 rounded-xl bg-[#2f9f85] px-3 py-2 text-xs font-semibold text-white transition enabled:hover:bg-[#26806b] disabled:opacity-50"
              >
                Bắt đầu
              </button>
            ) : (
              <button
                type="button"
                  title="btn_pause"
                onClick={onStopTimer}
                disabled={wheelAnimating}
                className="flex-1 rounded-xl bg-[#f08b37] px-3 py-2 text-xs font-semibold text-white transition enabled:hover:bg-[#d97828] disabled:opacity-50"
              >
                Tạm dừng
              </button>
            )}
            
            <button
              type="button"
              title="btn_next"
              onClick={async () => {
                setLoadingNext(true);
                try {
                  await onNextTurn();
                } finally {
                  setLoadingNext(false);
                }
              }}
              disabled={loadingNext || session.status !== "playing" || wheelAnimating}
              className="flex-1 rounded-xl bg-[#d9534f] px-3 py-2 text-xs font-semibold text-white transition enabled:hover:bg-[#c9302c] disabled:opacity-50"
            >
              Qua lượt
            </button>
          </div>
        </div>

        {/* Game Actions */}
        <div className="space-y-3">
          <form onSubmit={handleGuess} className="space-y-2 rounded-2xl border border-[#e8d7bc] bg-white p-3">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#855f36]">Đoán chữ</label>
            <div className="flex gap-2">
              <input
                value={guessLetter}
                maxLength={1}
                onChange={(event) => setGuessLetter(event.target.value.toUpperCase())}
                placeholder="A"
                className="w-16 rounded-xl border border-[#dbc4a0] px-3 py-2 text-center text-lg font-bold uppercase text-[#5b4327] outline-none focus:border-[#1f6f78]"
                title="i_guess"
              />
              <button
                type="submit"
                disabled={!canGuess || loadingGuess}
                className="flex-1 rounded-xl bg-[#f08b37] px-3 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[#d97828] disabled:cursor-not-allowed disabled:opacity-50"
                title="btn_guess"
              >
                {loadingGuess ? "Đang gửi..." : "Đoán"}
              </button>
            </div>
            {/* {!canGuess && <p className="text-[10px] text-red-500">Chỉ đoán khi đang chờ (Game Phase: {session.gamePhase})</p>} */}
          </form>

          <form onSubmit={handleSolve} className="space-y-2 rounded-2xl border border-[#e8d7bc] bg-white p-3">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#855f36]">Giải đáp án</label>
            <div className="flex gap-2">
              <input
                value={solveAttempt}
                onChange={(event) => setSolveAttempt(event.target.value)}
                className="flex-1 rounded-xl border border-[#dbc4a0] px-3 py-2 text-sm text-[#5b4327] outline-none focus:border-[#1f6f78]"
                placeholder="Nhập đáp án đầy đủ"
                title="i_solve"
              />
              <button
                type="submit"
                disabled={!canSolve || loadingSolve}
                className="rounded-xl bg-[#315f72] px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[#254a5a] disabled:cursor-not-allowed disabled:opacity-50"
                title="btn_solve"
              >
                {loadingSolve ? "Đang gửi..." : "Giải"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}
