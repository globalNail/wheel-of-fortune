import type { Question } from "../../domain/gameTypes";

export interface QuestionRepository {
  getNextQuestion(usedIds: string[]): Promise<Question | null>;
}
