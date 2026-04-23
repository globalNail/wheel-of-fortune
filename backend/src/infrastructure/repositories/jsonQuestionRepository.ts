import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { QuestionRepository } from "../../application/ports/questionRepository";
import type { Question } from "../../domain/gameTypes";

export class JsonQuestionRepository implements QuestionRepository {
  private questions: Question[] = [];
  private hasLoaded = false;

  private async loadData(): Promise<void> {
    if (this.hasLoaded) {
      return;
    }
    try {
      const dataPath = path.resolve(process.cwd(), "backend/data/questions.json");
      const content = await fs.readFile(dataPath, "utf-8");
      this.questions = JSON.parse(content);
      this.hasLoaded = true;
    } catch (error) {
      console.error("Failed to load questions data", error);
      this.questions = [];
    }
  }

  async getNextQuestion(usedIds: string[]): Promise<Question | null> {
    await this.loadData();
    if (this.questions.length === 0) {
      return null;
    }

    const usedSet = new Set(usedIds);
    for (const question of this.questions) {
      if (!usedSet.has(question.id)) {
        return question;
      }
    }

    return null; // All questions used
  }
}
