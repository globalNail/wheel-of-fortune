# 🧩 TASK: TurnTimer

## 🎯 Objective
Add countdown timer for each player turn (default 20 seconds)

---

## 🔄 Flow

1. When turn starts:
   - set timer = 20
2. Countdown every second
3. If player acts:
   - pause/reset timer
4. If timer reaches 0:
   - auto lose turn
   - switch to next team
5. Emit turn change event

---

## 🧠 Implementation

Frontend:
- useEffect + setInterval
- store timer in state

Backend:
- optional validation timeout

---

## 🧪 Validation

- Timer resets when turn changes
- Timer stops when action taken
- Auto switch turn when timeout

---

## ⚠️ Edge Cases

- multiple timers running
- reconnect resets timer incorrectly