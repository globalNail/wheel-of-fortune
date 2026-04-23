import { API_BASE_URL } from "./config";
import type { CreateSessionResponse, JoinSessionResponse, PublicGameSession, WheelSegment } from "./types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  createSession(input: { phrase: string; category?: string; numberOfTeams: number }) {
    return request<CreateSessionResponse>("/session/create", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  joinSession(input: { code: string; teamName: string }) {
    return request<JoinSessionResponse>("/session/join", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getSession(code: string) {
    return request<{ session: PublicGameSession }>(`/session/${code}`);
  },

  startGame(input: { code: string; hostToken: string }) {
    return request<{ session: PublicGameSession }>("/session/start", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  setTurnOrder(input: { code: string; hostToken: string; orderedTeamIds: string[] }) {
    return request<{ session: PublicGameSession }>("/session/set-turn-order", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  spin(input: { code: string; teamToken: string }) {
    return request<{ session: PublicGameSession; segment: WheelSegment; segmentIndex: number }>("/game/spin", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  guess(input: { code: string; teamToken: string; letter: string }) {
    return request<{ session: PublicGameSession }>("/game/guess", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  buyVowel(input: { code: string; teamToken: string; letter: string }) {
    return request<{ session: PublicGameSession }>("/game/buy-vowel", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  solve(input: { code: string; teamToken: string; attempt: string }) {
    return request<{ session: PublicGameSession }>("/game/solve", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  reset(input: { code: string; hostToken: string; phrase: string; category?: string; numberOfTeams?: number }) {
    return request<{ session: PublicGameSession }>("/game/reset", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
