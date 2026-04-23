import type { PlayerIdentity } from "./types";

const IDENTITY_KEY = "wof-player-identity";

export function loadIdentity(): PlayerIdentity | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(IDENTITY_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PlayerIdentity;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: PlayerIdentity): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
}

export function clearIdentity(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(IDENTITY_KEY);
}
