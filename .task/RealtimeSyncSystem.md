# 🧩 TASK: Realtime Sync System

## 🎯 Objective
Ensure all clients see the same game state in realtime.

---

## 📥 Input
- Game events from backend

---

## 📤 Expected Output
- UI updates instantly across all clients

---

## 📏 Constraints

- Frontend MUST NOT manage source of truth
- All updates come from server events

---

## 🔄 Flow

1. Backend updates state
2. Emit event via SignalR/WebSocket
3. Frontend receives event
4. Update UI state

---

## 🧠 Affected Components

Backend:
- GameHub

Frontend:
- WebSocket provider
- State store

---

## 🧪 Validation Checklist

- [ ] All players see same score
- [ ] Turn updates correctly
- [ ] Phrase sync works