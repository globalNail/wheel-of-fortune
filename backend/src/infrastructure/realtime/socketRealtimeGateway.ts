import type { Server } from "socket.io";
import type { PublicGameSession, WheelSegment } from "../../domain/gameTypes";
import type { RealtimeGateway } from "./realtimeGateway";
import type { GameService } from "../../application/services/gameService";

export class SocketRealtimeGateway implements RealtimeGateway {
  private gameService: GameService | null = null;

  constructor(private readonly io: Server) {}

  setGameService(gameService: GameService): void {
    this.gameService = gameService;
  }

  bindConnectionHandlers(): void {
    this.io.on("connection", (socket) => {
      let registeredTeam: { sessionCode: string; teamId: string } | null = null;

      socket.on("session:join-room", (sessionCode: string) => {
        if (typeof sessionCode !== "string") {
          return;
        }
        socket.join(sessionCode.toUpperCase());
      });

      socket.on("session:leave-room", (sessionCode: string) => {
        if (typeof sessionCode !== "string") {
          return;
        }
        socket.leave(sessionCode.toUpperCase());
      });

      // Frontend registers which team this socket belongs to
      socket.on("session:register-team", (data: { sessionCode: string; teamId: string }) => {
        if (typeof data?.sessionCode !== "string" || typeof data?.teamId !== "string") {
          return;
        }
        registeredTeam = { sessionCode: data.sessionCode.toUpperCase(), teamId: data.teamId };
      });

      socket.on("disconnect", () => {
        if (registeredTeam && this.gameService) {
          this.gameService.markTeamAsLeft(registeredTeam.sessionCode, registeredTeam.teamId).catch((error) => {
            console.error("Failed to mark team as left on disconnect:", error);
          });
        }
      });
    });
  }

  publishSessionState(sessionCode: string, session: PublicGameSession): void {
    this.io.to(sessionCode).emit("sessionState", session);
  }

  publishPhraseUpdate(sessionCode: string, session: PublicGameSession): void {
    this.io.to(sessionCode).emit("onPhraseUpdate", session);
  }

  publishScoreUpdate(sessionCode: string, session: PublicGameSession): void {
    this.io.to(sessionCode).emit("onScoreUpdate", session);
  }

  publishTurnChange(sessionCode: string, session: PublicGameSession): void {
    this.io.to(sessionCode).emit("onTurnChange", session);
  }

  publishWheelResult(sessionCode: string, segment: WheelSegment, session: PublicGameSession): void {
    this.io.to(sessionCode).emit("onWheelResult", {
      segment,
      session,
    });
  }
}
