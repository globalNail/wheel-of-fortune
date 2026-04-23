"use client";

import { FormEvent, useState } from "react";
import { TurnTimer } from "@/components/game/TurnTimer";
import type { PublicGameSession } from "@/lib/types";

interface ActionPanelProps {
  session: PublicGameSession;
  isCurrentTeam: boolean;
  canSpin: boolean;
  canGuessConsonant: boolean;
  canBuyVowel: boolean;
  teamScore: number;
  onSpin: () => Promise<void>;
  onGuess: (letter: string) => Promise<void>;
  onBuyVowel: (letter: string) => Promise<void>;
  onSolve: (attempt: string) => Promise<void>;
  countdownSeconds: number | null;
  totalTurnSeconds: number;
}

export function ActionPanel({
  session,
  isCurrentTeam,
  canSpin,
  canGuessConsonant,
  canBuyVowel,
  teamScore,
  onSpin,
  onGuess,
  onBuyVowel,
  onSolve,
  countdownSeconds,
  totalTurnSeconds,
}: ActionPanelProps) {
  const [guessLetter, setGuessLetter] = useState("");
  const [vowelLetter, setVowelLetter] = useState("");
  const [solveAttempt, setSolveAttempt] = useState("");

  const [loadingSpin, setLoadingSpin] = useState(false);
  const [loadingGuess, setLoadingGuess] = useState(false);
  const [loadingVowel, setLoadingVowel] = useState(false);
  const [loadingSolve, setLoadingSolve] = useState(false);

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

  async function handleBuyVowel(event: FormEvent) {
    event.preventDefault();
    if (!vowelLetter.trim()) return;
    setLoadingVowel(true);
    try {
      await onBuyVowel(vowelLetter);
      setVowelLetter("");
    } finally {
      setLoadingVowel(false);
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

  return (
    <section className="rounded-3xl border border-[#efddc1] bg-[#fff9ee] p-4 shadow-lg shadow-[#c99d58]/10">
      <div className="flex"> 
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8f6c44]">Thao tác</h2>

        <p className="mb-3 rounded-xl border border-[#f0ddc0] bg-white px-2 text-sm text-[#6c5132]">
          {isCurrentTeam ? "Đang đến lượt bạn. Chọn hành động." : "Đang chờ đội khác thao tác"}
        </p>
      </div>
     
      {/* <div className="mb-4">
        <TurnTimer
          remainingSeconds={countdownSeconds}
          totalSeconds={totalTurnSeconds}
          isCurrentTeam={isCurrentTeam}
        />
      </div> */}

      {/* <p className="mb-4 rounded-xl border border-[#ebdcc8] bg-[#fffaf1] px-3 py-2 text-xs text-[#7a6141]">
        Điểm hiện tại của đội bạn: <strong>{teamScore}</strong>
      </p> */}

      <div className="space-y-4">
        <button
          type="button"
          onClick={async () => {
            setLoadingSpin(true);
            try {
              await onSpin();
            } finally {
              setLoadingSpin(false);
            }
          }}
          disabled={!isCurrentTeam || !canSpin || loadingSpin || session.status !== "playing"}
          className="w-full rounded-2xl bg-[#1f6f78] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition enabled:hover:bg-[#185860] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingSpin ? "Đang quay..." : "Quay vòng"}
        </button>

        <form onSubmit={handleGuess} className="space-y-2 rounded-2xl border border-[#ecd9ba] bg-white p-3">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#855f36]">Đoán phụ âm</label>
          <div className="flex gap-2">
            <input
              value={guessLetter}
              maxLength={1}
              onChange={(event) => setGuessLetter(event.target.value.toUpperCase())}
              placeholder="A"
              className="w-16 rounded-xl border border-[#dbc4a0] px-3 py-2 text-center text-lg font-bold uppercase text-[#5b4327] outline-none focus:border-[#1f6f78]"
            />
            <button
              type="submit"
              disabled={!isCurrentTeam || !canGuessConsonant || loadingGuess || session.status !== "playing"}
              className="flex-1 rounded-xl bg-[#f08b37] px-3 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[#d97828] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingGuess ? "Đang gửi..." : "Đoán"}
            </button>
          </div>
        </form>

        <form onSubmit={handleBuyVowel} className="space-y-2 rounded-2xl border border-[#ecd9ba] bg-white p-3">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#855f36]">
            Mua nguyên âm (-{session.vowelCost})
          </label>
          <div className="flex gap-2">
            <input
              value={vowelLetter}
              maxLength={1}
              onChange={(event) => setVowelLetter(event.target.value.toUpperCase())}
              placeholder="A"
              className="w-16 rounded-xl border border-[#dbc4a0] px-3 py-2 text-center text-lg font-bold uppercase text-[#5b4327] outline-none focus:border-[#1f6f78]"
            />
            <button
              type="submit"
              disabled={!isCurrentTeam || !canBuyVowel || teamScore < session.vowelCost || loadingVowel || session.status !== "playing"}
              className="flex-1 rounded-xl bg-[#2f9f85] px-3 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[#26806b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingVowel ? "Đang gửi..." : "Mua"}
            </button>
          </div>
        </form>

        <form onSubmit={handleSolve} className="space-y-2 rounded-2xl border border-[#ecd9ba] bg-white p-3">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#855f36]">Giải đáp án</label>
          <div className="flex gap-2">
            <input
              value={solveAttempt}
              onChange={(event) => setSolveAttempt(event.target.value)}
              className="flex-1 rounded-xl border border-[#dbc4a0] px-3 py-2 text-sm text-[#5b4327] outline-none focus:border-[#1f6f78]"
              placeholder="Nhập đáp án đầy đủ"
            />
            <button
              type="submit"
              disabled={!isCurrentTeam || loadingSolve || session.status !== "playing"}
              className="rounded-xl bg-[#315f72] px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[#254a5a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSolve ? "Đang gửi..." : "Giải"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
