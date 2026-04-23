"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ActionPanel } from "@/components/game/ActionPanel";
import { EventFeed } from "@/components/game/EventFeed";
import { PhraseBoard } from "@/components/game/PhraseBoard";
import { Scoreboard } from "@/components/game/Scoreboard";
import { ToastStack, type ToastItem, type ToastType } from "@/components/game/ToastStack";
import { TopBar } from "@/components/game/TopBar";
import { Wheel } from "@/components/game/Wheel";
import { api } from "@/lib/api";
import { clearIdentity, loadIdentity, saveIdentity } from "@/lib/storage";
import { getSocket } from "@/lib/socket";
import type { PlayerIdentity, PublicGameSession, WheelResultPayload } from "@/lib/types";
import { WHEEL_SEGMENTS } from "@/lib/wheel";

const ERROR_TRANSLATIONS: Record<string, string> = {
  "Session not found.": "Không tìm thấy phòng chơi.",
  "Cannot join because game has already started.": "Ván chơi đã bắt đầu, không thể vào thêm.",
  "Session is full.": "Phòng đã đủ đội chơi.",
  "Team name already exists in this session.": "Tên đội đã tồn tại trong phòng.",
  "All teams must join before starting the game.": "Cần đủ số đội mới có thể bắt đầu.",
  "Only the current team can perform this action.": "Chỉ đội đang tới lượt mới được thực hiện thao tác.",
  "You must finish your guess before spinning again.": "Hãy hoàn tất lượt đoán trước khi quay tiếp.",
  "You need to spin before guessing a consonant.": "Bạn cần quay vòng trước khi đoán phụ âm.",
  "Use buy vowel action for vowels.": "Hãy dùng chức năng mua nguyên âm.",
  "Only vowels can be bought.": "Chỉ có thể mua nguyên âm.",
  "Not enough score to buy a vowel.": "Không đủ điểm để mua nguyên âm.",
  "Letter has already been guessed.": "Chữ cái này đã được đoán trước đó.",
  "Solve attempt cannot be empty.": "Nội dung giải không được để trống.",
  "Game has already started.": "Ván chơi đã bắt đầu.",
  "Game is not active.": "Ván chơi chưa ở trạng thái đang chơi.",
};

function mapErrorToVietnamese(message: string): string {
  return ERROR_TRANSLATIONS[message] ?? message;
}

function initialIdentity(): PlayerIdentity | null {
  return loadIdentity();
}

export function GameClient() {
  const [identity, setIdentity] = useState<PlayerIdentity | null>(initialIdentity);
  const [session, setSession] = useState<PublicGameSession | null>(null);
  const [sessionCode, setSessionCode] = useState(() => initialIdentity()?.sessionCode ?? "");
  const [loading, setLoading] = useState(false);

  const [createPhrase, setCreatePhrase] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [createTeams, setCreateTeams] = useState(3);

  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");

  const [resetPhrase, setResetPhrase] = useState("");
  const [resetCategory, setResetCategory] = useState("");
  const [resetTeams, setResetTeams] = useState(3);

  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelAnimating, setWheelAnimating] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimers = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((toastId: string) => {
    const timer = toastTimers.current.get(toastId);
    if (timer) {
      window.clearTimeout(timer);
      toastTimers.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const pushToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type, message }]);

    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      toastTimers.current.delete(id);
    }, 3800);

    toastTimers.current.set(id, timer);
  }, []);

  useEffect(() => {
    const timerMap = toastTimers.current;

    return () => {
      timerMap.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timerMap.clear();
    };
  }, []);

  const applySession = useCallback((nextSession: PublicGameSession): void => {
    setSession(nextSession);
    setNowMs(Date.now());
    setDraftOrder(nextSession.teams.map((team) => team.id));
    setResetTeams(nextSession.maxTeams);
  }, []);

  const animateWheelTo = useCallback((segmentId: string): void => {
    const index = WHEEL_SEGMENTS.findIndex((segment) => segment.id === segmentId);
    if (index < 0) {
      return;
    }

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetCenter = index * segmentAngle + segmentAngle / 2;

    setWheelAnimating(true);
    setWheelRotation((previous) => {
      const normalized = ((previous % 360) + 360) % 360;
      return previous - normalized + (360 - targetCenter) + 1440;
    });

    window.setTimeout(() => {
      setWheelAnimating(false);
    }, 4100);
  }, []);

  useEffect(() => {
    if (!sessionCode) {
      return;
    }

    let mounted = true;
    const normalizedCode = sessionCode.toUpperCase();
    const socket = getSocket();

    socket.emit("session:join-room", normalizedCode);

    api
      .getSession(normalizedCode)
      .then(({ session: current }) => {
        if (!mounted) return;
        applySession(current);
      })
      .catch((caught: unknown) => {
        if (!mounted) return;
        pushToast("error", caught instanceof Error ? mapErrorToVietnamese(caught.message) : "Không thể tải phòng chơi.");
      });

    const handleSession = (nextSession: PublicGameSession) => {
      if (!mounted || nextSession.code !== normalizedCode) return;
      applySession(nextSession);
    };

    const handleWheel = (payload: WheelResultPayload) => {
      if (!mounted || payload.session.code !== normalizedCode) return;
      animateWheelTo(payload.segment.id);
      applySession(payload.session);
    };

    socket.on("sessionState", handleSession);
    socket.on("onScoreUpdate", handleSession);
    socket.on("onTurnChange", handleSession);
    socket.on("onPhraseUpdate", handleSession);
    socket.on("onWheelResult", handleWheel);

    return () => {
      mounted = false;
      socket.emit("session:leave-room", normalizedCode);
      socket.off("sessionState", handleSession);
      socket.off("onScoreUpdate", handleSession);
      socket.off("onTurnChange", handleSession);
      socket.off("onPhraseUpdate", handleSession);
      socket.off("onWheelResult", handleWheel);
    };
  }, [sessionCode, applySession, animateWheelTo, pushToast]);

  useEffect(() => {
    if (session?.status !== "playing" || !session.turnEndsAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => {
      window.clearInterval(timerId);
    };
  }, [session?.status, session?.turnEndsAt]);

  const myTeam = !session || identity?.role !== "team" || !identity.teamId
    ? null
    : session.teams.find((team) => team.id === identity.teamId) ?? null;

  const totalTurnSeconds = session?.turnDurationSeconds ?? 20;
  const turnEndsAtMs = session?.turnEndsAt ? new Date(session.turnEndsAt).getTime() : null;
  const countdownSeconds =
    session?.status === "playing" && turnEndsAtMs !== null
      ? Math.max(0, Math.ceil((turnEndsAtMs - nowMs) / 1000))
      : null;

  const isCurrentTeam = !!myTeam && session?.currentTurnTeamId === myTeam.id;
  const isHost = identity?.role === "host";
  const currentTurnTeam = session?.teams.find((team) => team.id === session.currentTurnTeamId) ?? null;

  const canSpin = isCurrentTeam && session?.pendingWheelValue === null;
  const canGuessConsonant = isCurrentTeam && session?.pendingWheelValue !== null;
  const canBuyVowel = isCurrentTeam && session?.pendingWheelValue === null;

  const winnerTeam = session?.teams.find((team) => team.id === session.winnerTeamId) || null;

  async function runAction<T>(action: () => Promise<T>, successMessage?: string): Promise<T | null> {
    try {
      const result = await action();
      if (successMessage) {
        pushToast("success", successMessage);
      }
      return result;
    } catch (caught: unknown) {
      const message = caught instanceof Error ? mapErrorToVietnamese(caught.message) : "Thao tác thất bại.";
      pushToast("error", message);
      return null;
    }
  }

  async function handleCreateSession(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const result = await runAction(() =>
      api.createSession({
        phrase: createPhrase,
        category: createCategory || undefined,
        numberOfTeams: createTeams,
      }),
    );

    if (result) {
      const hostIdentity: PlayerIdentity = {
        role: "host",
        sessionCode: result.code,
        token: result.hostToken,
      };

      setIdentity(hostIdentity);
      saveIdentity(hostIdentity);
      applySession(result.session);
      setSessionCode(result.code);
      setJoinCode(result.code);
      pushToast("success", `Đã tạo phòng ${result.code}. Hãy gửi mã này cho các đội.`);
      setResetPhrase("");
      setResetCategory("");
    }

    setLoading(false);
  }

  async function handleJoinSession(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    const result = await runAction(() =>
      api.joinSession({
        code: joinCode.toUpperCase(),
        teamName,
      }),
    );

    if (result) {
      const teamIdentity: PlayerIdentity = {
        role: "team",
        sessionCode: result.session.code,
        token: result.teamToken,
        teamId: result.teamId,
        teamName,
      };

      setIdentity(teamIdentity);
      saveIdentity(teamIdentity);
      applySession(result.session);
      setSessionCode(result.session.code);
      pushToast("success", `Đã vào phòng ${result.session.code} với tên đội ${teamName}.`);
    }

    setLoading(false);
  }

  async function handleStartGame() {
    if (!identity || identity.role !== "host" || !session) return;
    await runAction(async () => {
      const response = await api.startGame({ code: session.code, hostToken: identity.token });
      applySession(response.session);
      return response;
    }, "Ván chơi đã bắt đầu.");
  }

  async function handleSaveTurnOrder() {
    if (!identity || identity.role !== "host" || !session) return;
    await runAction(async () => {
      const response = await api.setTurnOrder({
        code: session.code,
        hostToken: identity.token,
        orderedTeamIds: draftOrder,
      });
      applySession(response.session);
      return response;
    }, "Đã cập nhật thứ tự lượt chơi.");
  }

  function handleMoveTeam(teamId: string, direction: "up" | "down") {
    setDraftOrder((current) => {
      const index = current.indexOf(teamId);
      if (index < 0) return current;

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSpin() {
    if (!identity || identity.role !== "team" || !session) return;
    await runAction(async () => {
      const result = await api.spin({ code: session.code, teamToken: identity.token });
      applySession(result.session);
      animateWheelTo(result.segment.id);
      pushToast("info", `Kết quả vòng quay: ${result.segment.label}`);
      return result;
    });
  }

  async function handleGuess(letter: string) {
    if (!identity || identity.role !== "team" || !session) return;
    await runAction(async () => {
      const result = await api.guess({ code: session.code, teamToken: identity.token, letter });
      applySession(result.session);
      return result;
    });
  }

  async function handleBuyVowel(letter: string) {
    if (!identity || identity.role !== "team" || !session) return;
    await runAction(async () => {
      const result = await api.buyVowel({ code: session.code, teamToken: identity.token, letter });
      applySession(result.session);
      return result;
    });
  }

  async function handleSolve(attempt: string) {
    if (!identity || identity.role !== "team" || !session) return;
    await runAction(async () => {
      const result = await api.solve({ code: session.code, teamToken: identity.token, attempt });
      applySession(result.session);
      return result;
    });
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault();
    if (!identity || identity.role !== "host" || !session) return;

    await runAction(async () => {
      const result = await api.reset({
        code: session.code,
        hostToken: identity.token,
        phrase: resetPhrase,
        category: resetCategory || undefined,
        numberOfTeams: resetTeams,
      });
      applySession(result.session);
      return result;
    }, "Đã đặt lại ván mới.");
  }

  function handleLeave() {
    clearIdentity();
    setIdentity(null);
    setSession(null);
    setSessionCode("");
    setDraftOrder([]);
    pushToast("info", "Đã rời phòng chơi.");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#ffe8bf_0%,#f5d9b0_26%,#efc896_45%,#d9eee8_75%,#b7d8d6_100%)] p-1 md:p-2">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="mx-auto w-full max-w-7xl space-y-2">
        <TopBar session={session} identity={identity} countdownSeconds={countdownSeconds} onLeaveSession={handleLeave} />

        {session ? (
          <div className="rounded-2xl border border-[#e6d4b7] bg-[#fff7ea] px-4 py-2 text-sm text-[#674b2a]">
            Lượt hiện tại: <strong>{currentTurnTeam?.name ?? "--"}</strong>
            {session.pendingWheelValue !== null ? <span> | Điểm vòng quay đang chờ: {session.pendingWheelValue}</span> : null}
            {session.lastWheelResultLabel ? <span> | Ô quay gần nhất: {session.lastWheelResultLabel}</span> : null}
          </div>
        ) : null}

        {!identity ? (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-3xl border border-[#f0d4ac] bg-[#fff8ea] p-5 shadow-lg shadow-[#c79a59]/10">
              <h2 className="mb-4 text-lg font-bold text-[#6a4a24]">Chủ phòng: Tạo phiên chơi</h2>
              <form className="space-y-3" onSubmit={handleCreateSession}>
                <textarea
                  required
                  value={createPhrase}
                  onChange={(event) => setCreatePhrase(event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-[#e2c59a] bg-white px-3 py-2 text-sm text-[#49331a] outline-none focus:border-[#2a9d8f]"
                  placeholder="Nhập đáp án"
                />
                <input
                  value={createCategory}
                  onChange={(event) => setCreateCategory(event.target.value)}
                  className="w-full rounded-2xl border border-[#e2c59a] bg-white px-3 py-2 text-sm text-[#49331a] outline-none focus:border-[#2a9d8f]"
                  placeholder="Chủ đề (tùy chọn)"
                />
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={createTeams}
                  onChange={(event) => setCreateTeams(Number(event.target.value))}
                  className="w-full rounded-2xl border border-[#e2c59a] bg-white px-3 py-2 text-sm text-[#49331a] outline-none focus:border-[#2a9d8f]"
                  placeholder="Số đội"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#1f6f78] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition enabled:hover:bg-[#174f56] disabled:opacity-50"
                >
                  Tạo phiên
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-[#d3e9e2] bg-[#f2fffb] p-5 shadow-lg shadow-[#6ca39b]/10">
              <h2 className="mb-4 text-lg font-bold text-[#204f54]">Người chơi: Vào phiên</h2>
              <form className="space-y-3" onSubmit={handleJoinSession}>
                <input
                  required
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-[#b5d8d2] bg-white px-3 py-2 text-sm uppercase text-[#1d3c40] outline-none focus:border-[#2b9f8f]"
                  placeholder="Mã phiên"
                />
                <input
                  required
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  className="w-full rounded-2xl border border-[#b5d8d2] bg-white px-3 py-2 text-sm text-[#1d3c40] outline-none focus:border-[#2b9f8f]"
                  placeholder="Tên đội"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#2f9f85] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition enabled:hover:bg-[#257e69] disabled:opacity-50"
                >
                  Vào phiên
                </button>
              </form>
            </section>
          </div>
        ) : null}

        {identity && session ? (
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-2">
              {winnerTeam ? (
                <div className="relative overflow-hidden rounded-3xl border border-[#f2d49a] bg-gradient-to-r from-[#fff4d9] to-[#ffe9be] px-5 py-4 text-[#7f531e]">
                  <div className="absolute inset-0 confetti-overlay" />
                  <p className="relative text-lg font-bold uppercase tracking-[0.16em]">
                    Đội thắng: {winnerTeam.name} (+{session.solveBonus} điểm thưởng)
                  </p>
                </div>
              ) : null}

              <Wheel
                segments={WHEEL_SEGMENTS}
                rotation={wheelRotation}
                isAnimating={wheelAnimating}
                lastResultLabel={session.lastWheelResultLabel}
              />
              <PhraseBoard maskedPhrase={session.maskedPhrase} />

              {/* <section className="rounded-2xl border border-[#e8d7bc] bg-[#fff8ee] p-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a40]">Chữ đã mở</h3>
                <div className="flex flex-wrap gap-2">
                  {session.guessedLetters.length > 0 ? (
                    session.guessedLetters.map((letter) => (
                      <span
                        key={letter}
                        className="rounded-full border border-[#d6bc95] bg-white px-3 py-1 text-xs font-semibold text-[#664a27]"
                      >
                        {letter}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-[#927454]">Chưa có chữ nào được đoán.</p>
                  )}
                </div>
              </section> */}

              {identity.role === "team" ? (
                <ActionPanel
                  session={session}
                  isCurrentTeam={isCurrentTeam}
                  canSpin={!!canSpin}
                  canGuessConsonant={!!canGuessConsonant}
                  canBuyVowel={!!canBuyVowel}
                  teamScore={myTeam?.score ?? 0}
                  onSpin={handleSpin}
                  onGuess={handleGuess}
                  onBuyVowel={handleBuyVowel}
                  onSolve={handleSolve}
                  countdownSeconds={countdownSeconds}
                  totalTurnSeconds={totalTurnSeconds}
                />
              ) : null}

              {identity.role === "host" ? (
                <section className="rounded-3xl border border-[#ebd7b8] bg-[#fff8ec] p-4">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8f6b41]">Bảng điều khiển chủ phòng</h2>
                  <form className="grid gap-2 md:grid-cols-3" onSubmit={handleReset}>
                    <input
                      required
                      value={resetPhrase}
                      onChange={(event) => setResetPhrase(event.target.value)}
                      className="rounded-xl border border-[#dfc39c] px-3 py-2 text-sm text-[#5f4628]"
                      placeholder="Đáp án mới"
                    />
                    <input
                      value={resetCategory}
                      onChange={(event) => setResetCategory(event.target.value)}
                      className="rounded-xl border border-[#dfc39c] px-3 py-2 text-sm text-[#5f4628]"
                      placeholder="Chủ đề (tùy chọn)"
                    />
                    <input
                      type="number"
                      min={2}
                      max={8}
                      value={resetTeams}
                      onChange={(event) => setResetTeams(Number(event.target.value))}
                      className="rounded-xl border border-[#dfc39c] px-3 py-2 text-sm text-[#5f4628]"
                      placeholder="Số đội"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#cc7251] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ad5f42] md:col-span-3"
                    >
                      Đặt lại ván mới
                    </button>
                  </form>
                </section>
              ) : null}
            </div>

            <div className="space-y-4">
              <Scoreboard
                session={session}
                playerTeamId={identity.teamId}
                isHost={isHost}
                draftOrder={draftOrder}
                onMoveTeam={handleMoveTeam}
                onSaveOrder={handleSaveTurnOrder}
                onStartGame={handleStartGame}
              />
              {/* <EventFeed events={session.events} /> */}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
