import "dotenv/config";
import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { GameService } from "./application/services/gameService";
import { env } from "./config/env";
import { InMemorySessionRepository } from "./infrastructure/repositories/inMemorySessionRepository";
import { JsonQuestionRepository } from "./infrastructure/repositories/jsonQuestionRepository";
import { SocketRealtimeGateway } from "./infrastructure/realtime/socketRealtimeGateway";
import { createRouter } from "./interfaces/http/createRouter";

const app = express();
app.set("trust proxy", true);
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://wof-vnr.vercel.app",
  ],
}));
app.use(express.json());

const repository = new InMemorySessionRepository();
const questionRepository = new JsonQuestionRepository();
const gameService = new GameService(repository, questionRepository);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://wof-vnr.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

const realtimeGateway = new SocketRealtimeGateway(io);
realtimeGateway.bindConnectionHandlers();
gameService.setRealtimeGateway(realtimeGateway);
realtimeGateway.setGameService(gameService);

app.use("/api", createRouter(gameService));

setInterval(() => {
  gameService.enforceTurnTimers().catch((error) => {
    console.error("Timer enforcement failed", error);
  });
}, 1000);

server.listen(env.PORT, () => {
  console.log(`Wheel of Fortune API + Socket listening on port ${env.PORT}`);
});
