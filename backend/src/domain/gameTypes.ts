export type SessionStatus = "waiting" | "playing" | "finished";

export type SegmentType = "score" | "lose-turn" | "bankrupt";

export type GameEventType = "SESSION_CREATED" | "TEAM_JOINED" | "GAME_STARTED" | "TURN_CHANGED" | "SPIN" | "GUESS" | "BUY_VOWEL" | "SOLVE" | "RESET";

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

export interface GameSession {
  id: string;
  code: string;
  phrase: string;
  category?: string;
  maskedPhrase: string;
  status: SessionStatus;
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
  turnEndsAt: string | null;
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
  category?: string;
  maskedPhrase: string;
  status: SessionStatus;
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
  turnEndsAt: string | null;
  events: GameEvent[];
}
