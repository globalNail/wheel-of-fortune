@AGENTS.md
# 🧠 Claude Project Context - Wheel Of Fortune System

## 📌 Project Overview
This is a fullstack realtime web application inspired by “Wheel of Fortune”.

Tech stack:
- Frontend: Next.js + TypeScript + TailwindCSS
- Backend: ASP.NET Core Web API (or Node.js)
- Realtime: SignalR / WebSocket

The system supports multiple concurrent sessions with realtime synchronization.

---

## 🏗️ Architecture

We follow Clean Architecture:

- Domain: Entities, business rules
- Application: Use cases (game logic)
- Infrastructure: DB, WebSocket, persistence
- Presentation: API controllers / WebSocket hubs

Frontend:
- Component-based (React)
- State managed via WebSocket events

---

## 🎮 Core Concepts

### Session
- Represents a game room
- Has a unique code (e.g., ABC123)
- Contains teams and game state

### Team
- Has name, score, turn order

### Game State
- Phrase (hidden)
- Masked phrase
- Current turn
- Wheel result
- Status (waiting | playing | finished)

---

## 🔄 Realtime Model

All state changes MUST be broadcast via WebSocket:

Events:
- onSessionCreated
- onTeamJoined
- onTurnChanged
- onScoreUpdated
- onPhraseUpdated
- onWheelResult

Frontend must NOT trust local state → always sync from server

---

## ⚙️ Game Rules (IMPORTANT)

- Only current team can act
- All actions must be validated on server
- Phrase letters cannot be guessed twice
- Buying vowel requires enough score
- Bankrupt → reset team score
- Lose Turn → skip turn

---

## 🔐 Security Rules

- Never trust client input
- Validate:
  - team turn
  - session existence
  - letter duplication
- Prevent race conditions in realtime actions

---

## 🧪 Testing Strategy

- Unit test game logic
- Integration test API endpoints
- Simulate gameplay flow

---

## 🧠 Agent Behavior Rules

When modifying code:
1. Understand current session/game flow
2. NEVER break realtime sync
3. ALWAYS update state centrally (server)
4. After changes → simulate a full game flow mentally

---

## 🚫 Anti-patterns (DO NOT DO)

- Do not store game logic in frontend
- Do not trust client-side validation
- Do not duplicate state in multiple places
- Do not hardcode session or team data

---

## 🎯 Goal

Build a scalable, realtime multiplayer game system that supports:
- multiple sessions
- consistent state
- smooth UI experience