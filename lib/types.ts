export type SessionStatus = "waiting" | "playing" | "finished";
export type GamePhase = "idle" | "spinning" | "waiting_host_guess";
export type TimerStatus = "idle" | "running" | "paused";

export type SegmentType = "score" | "lose-turn" | "bankrupt";

export interface WheelSegment {
  id: string;
  label: string;
  type: SegmentType;
  value?: number;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  order: number;
}

export interface GameEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface PublicGameSession {
  id: string;
  code: string;
  question: string;
  maskedPhrase: string;
  status: SessionStatus;
  gamePhase: GamePhase;
  teams: Team[];
  maxTeams: number;
  currentTurnTeamId: string | null;
  guessedLetters: string[];
  pendingWheelValue: number | null;
  lastWheelSegmentId: string | null;
  lastWheelResultLabel: string | null;
  winnerTeamId: string | null;
  solveBonus: number;
  vowelCost: number;
  turnDurationSeconds: number;
  timerStatus: TimerStatus;
  timerEndsAt: number | null;
  timerRemainingSeconds: number | null;
  events: GameEvent[];
}

export interface CreateSessionResponse {
  session: PublicGameSession;
  code: string;
  hostToken: string;
}

export interface JoinSessionResponse {
  session: PublicGameSession;
  teamId: string;
  teamToken: string;
}

export interface PlayerIdentity {
  role: "host" | "team";
  sessionCode: string;
  token: string;
  teamId?: string;
  teamName?: string;
}

export interface WheelResultPayload {
  segment: WheelSegment;
  session: PublicGameSession;
}
