import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const LOG_FILE = resolve(__dirname, "../../../logs/session.log");

function ensureLogDir(): void {
  const dir = dirname(LOG_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export type SessionAction = "JOIN" | "REJOIN" | "LEAVE" | "DISCONNECT" | "REMOVED";

export function logSessionEvent(
  sessionCode: string,
  teamId: string,
  ip: string,
  action: SessionAction,
  extra?: string,
): void {
  ensureLogDir();
  const line = `[${formatTimestamp()}] ${sessionCode} ${teamId} ${ip} ${action}${extra ? ` ${extra}` : ""}\n`;
  try {
    appendFileSync(LOG_FILE, line, "utf-8");
  } catch (error) {
    console.error("Failed to write session log:", error);
  }
}
