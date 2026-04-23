import type { PublicGameSession, WheelSegment } from "../../domain/gameTypes";

export interface RealtimeGateway {
  publishSessionState(sessionCode: string, session: PublicGameSession): void;
  publishPhraseUpdate(sessionCode: string, session: PublicGameSession): void;
  publishScoreUpdate(sessionCode: string, session: PublicGameSession): void;
  publishTurnChange(sessionCode: string, session: PublicGameSession): void;
  publishWheelResult(sessionCode: string, segment: WheelSegment, session: PublicGameSession): void;
}
