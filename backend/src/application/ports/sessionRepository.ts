import type { GameSession } from "../../domain/gameTypes";

export interface SessionRepository {
  create(session: GameSession): Promise<void>;
  update(session: GameSession): Promise<void>;
  findByCode(code: string): Promise<GameSession | null>;
  findAll(): Promise<GameSession[]>;
}
