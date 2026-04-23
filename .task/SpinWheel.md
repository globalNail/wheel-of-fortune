# 🧩 TASK: Spin Wheel

## 🎯 Objective
Allow current team to spin the wheel and broadcast result to all players in realtime.

---

## 📥 Input
POST /game/spin

Body:
{
  sessionCode: "ABC123",
  teamId: "team-1"
}

---

## 📤 Expected Output
- Random wheel result:
  - score value OR special (BANKRUPT / LOSE_TURN)
- Emit WebSocket event:
  - onWheelResult
- Update game state

---

## 📏 Constraints
- Only currentTurnTeamId can spin
- Session must be in "playing" state
- Prevent multiple spins simultaneously

---

## 🔄 Flow

1. Validate session exists
2. Validate team is current turn
3. Generate random wheel result
4. Apply logic:
   - BANKRUPT → score = 0
   - LOSE TURN → move next team
5. Save state
6. Emit WebSocket event to all clients

---

## 🧠 Affected Components

Backend:
- GameController
- GameService
- SessionRepository

Realtime:
- GameHub (SignalR)

Frontend:
- Wheel component
- Scoreboard

---

## 🧪 Validation Checklist

- [ ] Only current team can spin
- [ ] Wheel result visible to all players
- [ ] Bankrupt resets score
- [ ] Lose turn changes turn

---

## ⚠️ Edge Cases

- User spam spin request
- Network delay causing duplicate spin
- Session not started

---

## 🚫 Anti-patterns

- Do not generate wheel result on frontend
- Do not trust client teamId