import type { Server } from "socket.io";
import type { PublicGameSession, WheelSegment } from "../../domain/gameTypes";
import type { RealtimeGateway } from "./realtimeGateway";

export class SocketRealtimeGateway implements RealtimeGateway {
  constructor(private readonly io: Server) {}

  bindConnectionHandlers(): void {
    this.io.on("connection", (socket) => {
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
