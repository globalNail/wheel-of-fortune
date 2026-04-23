import type { SessionRepository } from "../../application/ports/sessionRepository";
import type { GameSession } from "../../domain/gameTypes";

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, GameSession>();

  async create(session: GameSession): Promise<void> {
    this.sessions.set(session.code, structuredClone(session));
  }

  async update(session: GameSession): Promise<void> {
    this.sessions.set(session.code, structuredClone(session));
  }

  async findByCode(code: string): Promise<GameSession | null> {
    const session = this.sessions.get(code.toUpperCase());
    return session ? structuredClone(session) : null;
  }

  async findAll(): Promise<GameSession[]> {
    return Array.from(this.sessions.values(), (session) => structuredClone(session));
  }
}
