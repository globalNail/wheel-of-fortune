export type SessionStatus = "waiting" | "playing" | "finished";
export type GamePhase = "idle" | "spinning" | "waiting_host_guess";
export type TimerStatus = "idle" | "running" | "paused";

export type SegmentType = "score" | "lose-turn" | "bankrupt";

export type GameEventType = "SESSION_CREATED" | "TEAM_JOINED" | "GAME_STARTED" | "TURN_CHANGED" | "SPIN" | "SPIN_START" | "SPIN_RESULT" | "GUESS" | "GUESS_RESULT" | "SOLVE" | "SOLVE_RESULT" | "RESET";

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
  type: GameEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
}

export interface GameSession {
  id: string;
  code: string;
  phrase: string;
  question: string;
  usedQuestionIds: string[];
  maskedPhrase: string;
  status: SessionStatus;
  gamePhase: GamePhase;
  maxTeams: number;
  hostToken: string;
  teams: Team[];
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
  createdAt: string;
  updatedAt: string;
  events: GameEvent[];
}

export interface PlayerIdentity {
  role: "host" | "team";
  token: string;
  teamId?: string;
  teamName?: string;
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
