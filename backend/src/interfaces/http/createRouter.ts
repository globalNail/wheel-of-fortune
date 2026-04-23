import { type NextFunction, type Request, type Response, Router } from "express";
import { z } from "zod";
import { AppError } from "../../application/services/errors";
import { GameService } from "../../application/services/gameService";

const createSessionSchema = z.object({
  phrase: z.string().min(2),
  category: z.string().optional(),
  numberOfTeams: z.number().int().min(2).max(8),
});

const joinSessionSchema = z.object({
  code: z.string().min(6).max(6),
  teamName: z.string().min(2).max(30),
});

const startGameSchema = z.object({
  code: z.string().min(6).max(6),
  hostToken: z.string().min(1),
});

const setTurnOrderSchema = z.object({
  code: z.string().min(6).max(6),
  hostToken: z.string().min(1),
  orderedTeamIds: z.array(z.string().min(1)).min(1),
});

const spinSchema = z.object({
  code: z.string().min(6).max(6),
  teamToken: z.string().min(1),
});

const guessSchema = z.object({
  code: z.string().min(6).max(6),
  teamToken: z.string().min(1),
  letter: z.string().min(1).max(4),
});

const solveSchema = z.object({
  code: z.string().min(6).max(6),
  teamToken: z.string().min(1),
  attempt: z.string().min(1),
});

const resetSchema = z.object({
  code: z.string().min(6).max(6),
  hostToken: z.string().min(1),
  phrase: z.string().min(2),
  category: z.string().optional(),
  numberOfTeams: z.number().int().min(2).max(8).optional(),
});

export function createRouter(gameService: GameService): Router {
  const router = Router();

  router.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  router.get("/session/:code", async (request, response, next) => {
    try {
      const session = await gameService.getSession(request.params.code);
      response.json({ session });
    } catch (error) {
      next(error);
    }
  });

  router.post("/session/create", async (request, response, next) => {
    try {
      const input = createSessionSchema.parse(request.body);
      const result = await gameService.createSession(input);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/session/join", async (request, response, next) => {
    try {
      const input = joinSessionSchema.parse(request.body);
      const result = await gameService.joinSession(input);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/session/start", async (request, response, next) => {
    try {
      const input = startGameSchema.parse(request.body);
      const session = await gameService.startGame(input);
      response.json({ session });
    } catch (error) {
      next(error);
    }
  });

  router.post("/session/set-turn-order", async (request, response, next) => {
    try {
      const input = setTurnOrderSchema.parse(request.body);
      const session = await gameService.setTurnOrder(input);
      response.json({ session });
    } catch (error) {
      next(error);
    }
  });

  router.post("/game/spin", async (request, response, next) => {
    try {
      const input = spinSchema.parse(request.body);
      const result = await gameService.spin(input);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/game/guess", async (request, response, next) => {
    try {
      const input = guessSchema.parse(request.body);
      const session = await gameService.guessConsonant(input);
      response.json({ session });
    } catch (error) {
      next(error);
    }
  });

  router.post("/game/buy-vowel", async (request, response, next) => {
    try {
      const input = guessSchema.parse(request.body);
      const session = await gameService.buyVowel(input);
      response.json({ session });
    } catch (error) {
      next(error);
    }
  });

  router.post("/game/solve", async (request, response, next) => {
    try {
      const input = solveSchema.parse(request.body);
      const session = await gameService.solve(input);
      response.json({ session });
    } catch (error) {
      next(error);
    }
  });

  router.post("/game/reset", async (request, response, next) => {
    try {
      const input = resetSchema.parse(request.body);
      const session = await gameService.reset(input);
      response.json({ session });
    } catch (error) {
      next(error);
    }
  });

  router.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    void _next;

    if (error instanceof z.ZodError) {
      response.status(400).json({
        message: "Invalid request payload.",
        issues: error.issues,
      });
      return;
    }

    if (error instanceof AppError) {
      response.status(error.statusCode).json({ message: error.message });
      return;
    }

    console.error("Unhandled server error", error);
    response.status(500).json({ message: "Internal server error." });
  });

  return router;
}
