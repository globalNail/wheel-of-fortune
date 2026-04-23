import type { WheelSegment } from "./gameTypes";

export const DEFAULT_SOLVE_BONUS = 1000;
export const DEFAULT_VOWEL_COST = 50;
export const DEFAULT_TURN_DURATION_SECONDS = 20;

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: "s-100", label: "100", type: "score", value: 100 },
  { id: "s-300", label: "300", type: "score", value: 300 },
  { id: "s-200", label: "200", type: "score", value: 200 },
  { id: "s-500", label: "500", type: "score", value: 500 },
  { id: "lose-turn-1", label: "Mất lượt", type: "lose-turn" },
  { id: "s-700", label: "700", type: "score", value: 700 },
  { id: "s-400", label: "400", type: "score", value: 400 },
  { id: "bankrupt-1", label: "Phá sản", type: "bankrupt" },
  { id: "s-1000", label: "1000", type: "score", value: 1000 },
  { id: "s-600", label: "600", type: "score", value: 600 },
  { id: "s-800", label: "800", type: "score", value: 800 },
  { id: "s-900", label: "900", type: "score", value: 900 },
];

export const VOWELS = new Set(["A", "E", "I", "O", "U"]);
