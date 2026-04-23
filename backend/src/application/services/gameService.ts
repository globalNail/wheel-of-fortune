import { randomUUID } from "node:crypto";
import {
  DEFAULT_SOLVE_BONUS,
  DEFAULT_TURN_DURATION_SECONDS,
  DEFAULT_VOWEL_COST,
  VOWELS,
  WHEEL_SEGMENTS,
} from "../../domain/constants";
import type {
  GameEvent,
  GameEventType,
  GameSession,
  PublicGameSession,
  Team,
  WheelSegment,
} from "../../domain/gameTypes";
import type { SessionRepository } from "../ports/sessionRepository";
import { AppError } from "./errors";
import type { RealtimeGateway } from "../../infrastructure/realtime/realtimeGateway";

interface CreateSessionInput {
  phrase: string;
  category?: string;
  numberOfTeams: number;
}

interface JoinSessionInput {
  code: string;
  teamName: string;
}

interface StartGameInput {
  code: string;
  hostToken: string;
}

interface SetTurnOrderInput {
  code: string;
  hostToken: string;
  orderedTeamIds: string[];
}

interface TeamActionInput {
  code: string;
  teamToken: string;
}

interface GuessInput extends TeamActionInput {
  letter: string;
}

interface BuyVowelInput extends TeamActionInput {
  letter: string;
}

interface SolveInput extends TeamActionInput {
  attempt: string;
}

interface ResetInput {
  code: string;
  hostToken: string;
  phrase: string;
  category?: string;
  numberOfTeams?: number;
}

export class GameService {
  private readonly teamTokens = new Map<string, { sessionCode: string; teamId: string }>();
  private realtimeGateway: RealtimeGateway | null = null;

  constructor(private readonly repository: SessionRepository) {}

  setRealtimeGateway(gateway: RealtimeGateway): void {
    this.realtimeGateway = gateway;
  }

  async createSession(input: CreateSessionInput): Promise<{ session: PublicGameSession; code: string; hostToken: string }> {
    const phrase = input.phrase.trim();
    if (phrase.length < 2) {
      throw new AppError("Phrase must contain at least 2 characters.");
    }
    if (input.numberOfTeams < 2 || input.numberOfTeams > 8) {
      throw new AppError("Number of teams must be between 2 and 8.");
    }

    const code = await this.generateUniqueSessionCode();
    const now = new Date().toISOString();
    const hostToken = randomUUID();
    const session: GameSession = {
      id: randomUUID(),
      code,
      phrase,
      category: input.category?.trim() || undefined,
      maskedPhrase: this.createMaskedPhrase(phrase, []),
      status: "waiting",
      maxTeams: input.numberOfTeams,
      hostToken,
      teams: [],
      currentTurnTeamId: null,
      guessedLetters: [],
      pendingWheelValue: null,
      lastWheelSegmentId: null,
      lastWheelResultLabel: null,
      winnerTeamId: null,
      solveBonus: DEFAULT_SOLVE_BONUS,
      vowelCost: DEFAULT_VOWEL_COST,
      turnDurationSeconds: DEFAULT_TURN_DURATION_SECONDS,
      turnEndsAt: null,
      createdAt: now,
      updatedAt: now,
      events: [],
    };

    this.pushEvent(session, "SESSION_CREATED", {
      code: session.code,
      maxTeams: session.maxTeams,
      category: session.category,
    });

    await this.repository.create(session);
    return { session: this.toPublicSession(session), code: session.code, hostToken };
  }

  async joinSession(input: JoinSessionInput): Promise<{ session: PublicGameSession; teamId: string; teamToken: string }> {
    const session = await this.requireSession(input.code);
    if (session.status !== "waiting") {
      throw new AppError("Cannot join because game has already started.");
    }

    const normalizedName = input.teamName.trim();
    if (normalizedName.length < 2 || normalizedName.length > 30) {
      throw new AppError("Team name must be between 2 and 30 characters.");
    }
    if (session.teams.some((team) => team.name.toLowerCase() === normalizedName.toLowerCase())) {
      throw new AppError("Team name already exists in this session.");
    }
    if (session.teams.length >= session.maxTeams) {
      throw new AppError("Session is full.");
    }

    const teamId = randomUUID();
    const team: Team = {
      id: teamId,
      name: normalizedName,
      score: 0,
      order: session.teams.length,
    };
    session.teams.push(team);
    session.updatedAt = new Date().toISOString();

    this.pushEvent(session, "TEAM_JOINED", {
      teamId,
      teamName: team.name,
    });

    const teamToken = randomUUID();
    this.teamTokens.set(teamToken, { sessionCode: session.code, teamId: team.id });

    await this.repository.update(session);
    this.publishSessionState(session);

    return { session: this.toPublicSession(session), teamId: team.id, teamToken };
  }

  async startGame(input: StartGameInput): Promise<PublicGameSession> {
    const session = await this.requireSession(input.code);
    this.requireHost(session, input.hostToken);

    if (session.status !== "waiting") {
      throw new AppError("Game has already started.");
    }
    if (session.teams.length !== session.maxTeams) {
      throw new AppError("All teams must join before starting the game.");
    }

    const firstTeam = this.getTeamsInTurnOrder(session)[0];
    if (!firstTeam) {
      throw new AppError("No teams in session.");
    }

    session.status = "playing";
    session.currentTurnTeamId = firstTeam.id;
    session.turnEndsAt = this.nextTurnDeadline(session.turnDurationSeconds);
    session.updatedAt = new Date().toISOString();
    this.pushEvent(session, "GAME_STARTED", { firstTeamId: firstTeam.id });

    await this.repository.update(session);
    this.publishSessionState(session);
    this.publishTurnChange(session);

    return this.toPublicSession(session);
  }

  async setTurnOrder(input: SetTurnOrderInput): Promise<PublicGameSession> {
    const session = await this.requireSession(input.code);
    this.requireHost(session, input.hostToken);

    if (session.status !== "waiting") {
      throw new AppError("Turn order can only be changed before game start.");
    }
    if (input.orderedTeamIds.length !== session.teams.length) {
      throw new AppError("Turn order list must include all teams exactly once.");
    }

    const unique = new Set(input.orderedTeamIds);
    if (unique.size !== input.orderedTeamIds.length) {
      throw new AppError("Turn order contains duplicated teams.");
    }

    const byId = new Map(session.teams.map((team) => [team.id, team]));
    input.orderedTeamIds.forEach((teamId, index) => {
      const team = byId.get(teamId);
      if (!team) {
        throw new AppError(`Unknown team in order: ${teamId}`);
      }
      team.order = index;
    });

    session.updatedAt = new Date().toISOString();
    this.pushEvent(session, "TURN_CHANGED", { reason: "HOST_REORDER" });
    await this.repository.update(session);
    this.publishSessionState(session);

    return this.toPublicSession(session);
  }

  async spin(input: TeamActionInput): Promise<{ session: PublicGameSession; segment: WheelSegment; segmentIndex: number }> {
    const session = await this.requireSession(input.code);
    const team = this.requireCurrentTeamByToken(session, input.teamToken);

    if (session.status !== "playing") {
      throw new AppError("Game is not active.");
    }
    if (session.pendingWheelValue !== null) {
      throw new AppError("You must finish your guess before spinning again.");
    }

    const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segment = WHEEL_SEGMENTS[segmentIndex];
    session.lastWheelSegmentId = segment.id;
    session.lastWheelResultLabel = segment.label;

    if (segment.type === "score" && segment.value) {
      session.pendingWheelValue = segment.value;
      this.pushEvent(session, "SPIN", {
        teamId: team.id,
        result: segment.label,
        type: "score",
        value: segment.value,
      });
    }

    if (segment.type === "lose-turn") {
      session.pendingWheelValue = null;
      this.advanceTurn(session, "LOSE_TURN");
      this.pushEvent(session, "SPIN", {
        teamId: team.id,
        result: segment.label,
        type: "lose-turn",
      });
    }

    if (segment.type === "bankrupt") {
      const targetTeam = session.teams.find((item) => item.id === team.id);
      if (targetTeam) {
        targetTeam.score = 0;
      }
      session.pendingWheelValue = null;
      this.advanceTurn(session, "BANKRUPT");
      this.pushEvent(session, "SPIN", {
        teamId: team.id,
        result: segment.label,
        type: "bankrupt",
      });
    }

    session.updatedAt = new Date().toISOString();
    await this.repository.update(session);

    this.publishWheelResult(session, segment);
    if (segment.type === "bankrupt") {
      this.publishScoreUpdate(session);
    }
    this.publishSessionState(session);

    return {
      session: this.toPublicSession(session),
      segment,
      segmentIndex,
    };
  }

  async guessConsonant(input: GuessInput): Promise<PublicGameSession> {
    const session = await this.requireSession(input.code);
    const team = this.requireCurrentTeamByToken(session, input.teamToken);

    if (session.status !== "playing") {
      throw new AppError("Game is not active.");
    }
    if (session.pendingWheelValue === null) {
      throw new AppError("You need to spin before guessing a consonant.");
    }

    const letter = this.normalizeLetter(input.letter);
    if (VOWELS.has(letter)) {
      throw new AppError("Use buy vowel action for vowels.");
    }

    this.ensureLetterAvailable(session, letter);

    const occurrences = this.countOccurrences(session.phrase, letter);
    session.guessedLetters.push(letter);
    session.maskedPhrase = this.createMaskedPhrase(session.phrase, session.guessedLetters);

    if (occurrences > 0) {
      const scoreAward = occurrences * session.pendingWheelValue;
      const targetTeam = session.teams.find((item) => item.id === team.id);
      if (targetTeam) {
        targetTeam.score += scoreAward;
      }
      this.pushEvent(session, "GUESS", {
        teamId: team.id,
        letter,
        occurrences,
        scoreAward,
      });
    } else {
      this.pushEvent(session, "GUESS", {
        teamId: team.id,
        letter,
        occurrences,
      });
      this.advanceTurn(session, "WRONG_GUESS");
    }

    session.pendingWheelValue = null;
    this.applySolvedStateIfComplete(session, team.id);
    session.updatedAt = new Date().toISOString();

    await this.repository.update(session);
    this.publishPhraseUpdate(session);
    this.publishScoreUpdate(session);
    this.publishSessionState(session);

    return this.toPublicSession(session);
  }

  async buyVowel(input: BuyVowelInput): Promise<PublicGameSession> {
    const session = await this.requireSession(input.code);
    const team = this.requireCurrentTeamByToken(session, input.teamToken);

    if (session.status !== "playing") {
      throw new AppError("Game is not active.");
    }
    if (session.pendingWheelValue !== null) {
      throw new AppError("Resolve current wheel spin before buying a vowel.");
    }

    const letter = this.normalizeLetter(input.letter);
    if (!VOWELS.has(letter)) {
      throw new AppError("Only vowels can be bought.");
    }

    this.ensureLetterAvailable(session, letter);

    const currentTeam = session.teams.find((item) => item.id === team.id);
    if (!currentTeam) {
      throw new AppError("Team not found.", 404);
    }
    if (currentTeam.score < session.vowelCost) {
      throw new AppError("Not enough score to buy a vowel.");
    }

    currentTeam.score -= session.vowelCost;

    const occurrences = this.countOccurrences(session.phrase, letter);
    session.guessedLetters.push(letter);
    session.maskedPhrase = this.createMaskedPhrase(session.phrase, session.guessedLetters);

    if (occurrences === 0) {
      this.advanceTurn(session, "WRONG_VOWEL");
    }

    this.pushEvent(session, "BUY_VOWEL", {
      teamId: team.id,
      letter,
      occurrences,
      cost: session.vowelCost,
    });

    this.applySolvedStateIfComplete(session, team.id);
    session.updatedAt = new Date().toISOString();

    await this.repository.update(session);
    this.publishPhraseUpdate(session);
    this.publishScoreUpdate(session);
    this.publishSessionState(session);

    return this.toPublicSession(session);
  }

  async solve(input: SolveInput): Promise<PublicGameSession> {
    const session = await this.requireSession(input.code);
    const team = this.requireCurrentTeamByToken(session, input.teamToken);

    if (session.status !== "playing") {
      throw new AppError("Game is not active.");
    }

    const attempt = input.attempt.trim();
    if (!attempt) {
      throw new AppError("Solve attempt cannot be empty.");
    }

    const isCorrect = this.normalizePhrase(attempt) === this.normalizePhrase(session.phrase);
    if (isCorrect) {
      const currentTeam = session.teams.find((item) => item.id === team.id);
      if (!currentTeam) {
        throw new AppError("Team not found.", 404);
      }
      currentTeam.score += session.solveBonus;
      session.maskedPhrase = this.createMaskedPhrase(session.phrase, this.extractUniqueLetters(session.phrase));
      session.status = "finished";
      session.winnerTeamId = team.id;
      session.pendingWheelValue = null;
      session.turnEndsAt = null;
    } else {
      session.pendingWheelValue = null;
      this.advanceTurn(session, "WRONG_SOLVE");
    }

    this.pushEvent(session, "SOLVE", {
      teamId: team.id,
      isCorrect,
    });

    session.updatedAt = new Date().toISOString();
    await this.repository.update(session);

    this.publishPhraseUpdate(session);
    this.publishScoreUpdate(session);
    this.publishSessionState(session);

    return this.toPublicSession(session);
  }

  async reset(input: ResetInput): Promise<PublicGameSession> {
    const session = await this.requireSession(input.code);
    this.requireHost(session, input.hostToken);

    const phrase = input.phrase.trim();
    if (phrase.length < 2) {
      throw new AppError("Phrase must contain at least 2 characters.");
    }

    if (input.numberOfTeams !== undefined) {
      if (input.numberOfTeams < session.teams.length || input.numberOfTeams > 8 || input.numberOfTeams < 2) {
        throw new AppError("New team count must be between current team amount and 8.");
      }
      session.maxTeams = input.numberOfTeams;
    }

    session.phrase = phrase;
    session.category = input.category?.trim() || undefined;
    session.maskedPhrase = this.createMaskedPhrase(phrase, []);
    session.status = "waiting";
    session.currentTurnTeamId = null;
    session.guessedLetters = [];
    session.pendingWheelValue = null;
    session.lastWheelSegmentId = null;
    session.lastWheelResultLabel = null;
    session.winnerTeamId = null;
    session.turnEndsAt = null;

    session.teams = this.getTeamsInTurnOrder(session).map((team, index) => ({
      ...team,
      score: 0,
      order: index,
    }));

    this.pushEvent(session, "RESET", {
      maxTeams: session.maxTeams,
      category: session.category,
    });

    session.updatedAt = new Date().toISOString();
    await this.repository.update(session);
    this.publishSessionState(session);

    return this.toPublicSession(session);
  }

  async getSession(code: string): Promise<PublicGameSession> {
    const session = await this.requireSession(code);
    return this.toPublicSession(session);
  }

  async enforceTurnTimers(): Promise<void> {
    const sessions = await this.repository.findAll();
    const nowMs = Date.now();

    for (const session of sessions) {
      if (session.status !== "playing" || !session.turnEndsAt || !session.currentTurnTeamId) {
        continue;
      }

      if (new Date(session.turnEndsAt).getTime() >= nowMs) {
        continue;
      }

      this.advanceTurn(session, "TIMEOUT");
      this.pushEvent(session, "TURN_CHANGED", { reason: "TIMEOUT" });
      session.pendingWheelValue = null;
      session.updatedAt = new Date().toISOString();
      await this.repository.update(session);
      this.publishTurnChange(session);
      this.publishSessionState(session);
    }
  }

  private publishSessionState(session: GameSession): void {
    this.realtimeGateway?.publishSessionState(session.code, this.toPublicSession(session));
  }

  private publishPhraseUpdate(session: GameSession): void {
    this.realtimeGateway?.publishPhraseUpdate(session.code, this.toPublicSession(session));
  }

  private publishScoreUpdate(session: GameSession): void {
    this.realtimeGateway?.publishScoreUpdate(session.code, this.toPublicSession(session));
  }

  private publishTurnChange(session: GameSession): void {
    this.realtimeGateway?.publishTurnChange(session.code, this.toPublicSession(session));
  }

  private publishWheelResult(session: GameSession, segment: WheelSegment): void {
    this.realtimeGateway?.publishWheelResult(session.code, segment, this.toPublicSession(session));
  }

  private async requireSession(code: string): Promise<GameSession> {
    const session = await this.repository.findByCode(code.toUpperCase());
    if (!session) {
      throw new AppError("Session not found.", 404);
    }
    return session;
  }

  private requireHost(session: GameSession, hostToken: string): void {
    if (!hostToken || hostToken !== session.hostToken) {
      throw new AppError("Host authorization failed.", 403);
    }
  }

  private requireCurrentTeamByToken(session: GameSession, token: string): Team {
    const auth = this.teamTokens.get(token);
    if (!auth || auth.sessionCode !== session.code) {
      throw new AppError("Team authorization failed.", 403);
    }

    const team = session.teams.find((item) => item.id === auth.teamId);
    if (!team) {
      throw new AppError("Team not found.", 404);
    }
    if (session.currentTurnTeamId !== team.id) {
      throw new AppError("Only the current team can perform this action.", 403);
    }

    return team;
  }

  private ensureLetterAvailable(session: GameSession, letter: string): void {
    if (!/^[\p{L}]$/u.test(letter)) {
      throw new AppError("Letter must be a single alphabetic character.");
    }
    if (session.guessedLetters.includes(letter)) {
      throw new AppError("Letter has already been guessed.");
    }
  }

  private pushEvent(session: GameSession, type: GameEventType, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: randomUUID(),
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    session.events.unshift(event);
    session.events = session.events.slice(0, 60);
  }

  private advanceTurn(session: GameSession, reason: string): void {
    const orderedTeams = this.getTeamsInTurnOrder(session);
    if (!orderedTeams.length) {
      session.currentTurnTeamId = null;
      session.turnEndsAt = null;
      return;
    }

    if (!session.currentTurnTeamId) {
      session.currentTurnTeamId = orderedTeams[0].id;
    } else {
      const currentIndex = orderedTeams.findIndex((team) => team.id === session.currentTurnTeamId);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % orderedTeams.length;
      session.currentTurnTeamId = orderedTeams[nextIndex].id;
    }

    session.turnEndsAt = this.nextTurnDeadline(session.turnDurationSeconds);
    this.pushEvent(session, "TURN_CHANGED", {
      reason,
      currentTurnTeamId: session.currentTurnTeamId,
    });
  }

  private applySolvedStateIfComplete(session: GameSession, teamId: string): void {
    const isSolved = this.createMaskedPhrase(session.phrase, session.guessedLetters) === this.createMaskedPhrase(session.phrase, this.extractUniqueLetters(session.phrase));
    if (!isSolved) {
      return;
    }

    session.status = "finished";
    session.winnerTeamId = teamId;
    session.turnEndsAt = null;
  }

  private createMaskedPhrase(phrase: string, guessedLetters: string[]): string {
    const guessed = new Set(guessedLetters.map((letter) => letter.toUpperCase()));

    return Array.from(phrase)
      .map((character) => {
        if (!/[\p{L}]/u.test(character)) {
          return character;
        }

        return guessed.has(character.toUpperCase()) ? character : "_";
      })
      .join("");
  }

  private extractUniqueLetters(phrase: string): string[] {
    const letters = new Set<string>();
    for (const char of Array.from(phrase)) {
      if (/[\p{L}]/u.test(char)) {
        letters.add(char.toUpperCase());
      }
    }
    return Array.from(letters);
  }

  private countOccurrences(phrase: string, letter: string): number {
    const normalized = letter.toUpperCase();
    let count = 0;
    for (const char of Array.from(phrase)) {
      if (char.toUpperCase() === normalized) {
        count += 1;
      }
    }
    return count;
  }

  private normalizeLetter(letter: string): string {
    const normalized = letter.trim().toUpperCase();
    if (Array.from(normalized).length !== 1) {
      throw new AppError("Please provide exactly one letter.");
    }
    return normalized;
  }

  private normalizePhrase(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  private getTeamsInTurnOrder(session: GameSession): Team[] {
    return [...session.teams].sort((left, right) => left.order - right.order);
  }

  private nextTurnDeadline(seconds: number): string {
    return new Date(Date.now() + seconds * 1000).toISOString();
  }

  private toPublicSession(session: GameSession): PublicGameSession {
    return {
      id: session.id,
      code: session.code,
      category: session.category,
      maskedPhrase: session.maskedPhrase,
      status: session.status,
      teams: this.getTeamsInTurnOrder(session),
      maxTeams: session.maxTeams,
      currentTurnTeamId: session.currentTurnTeamId,
      guessedLetters: [...session.guessedLetters],
      pendingWheelValue: session.pendingWheelValue,
      lastWheelSegmentId: session.lastWheelSegmentId,
      lastWheelResultLabel: session.lastWheelResultLabel,
      winnerTeamId: session.winnerTeamId,
      solveBonus: session.solveBonus,
      vowelCost: session.vowelCost,
      turnDurationSeconds: session.turnDurationSeconds,
      turnEndsAt: session.turnEndsAt,
      events: [...session.events],
    };
  }

  private async generateUniqueSessionCode(): Promise<string> {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
      const exists = await this.repository.findByCode(code);
      if (!exists) {
        return code;
      }
    }

    throw new AppError("Unable to allocate a unique session code.", 500);
  }
}
