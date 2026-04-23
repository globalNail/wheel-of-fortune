<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

# 🤖 Agent Execution Guide - Wheel Of Fortune

## 🎯 Purpose

This document defines how the AI coding agent should operate when working on this project.

---

## 🧩 Task Execution Workflow

For every task:

1. Understand requirement
2. Locate related modules
3. Identify affected layers (Domain / Application / API / UI)
4. Implement change
5. Validate game flow
6. Ensure realtime consistency

---

## 🗂️ Code Navigation Rules

### Backend

- Game logic → Application layer
- Entities → Domain layer
- WebSocket → Infrastructure
- API → Controllers

### Frontend

- UI components → /components
- Game state → WebSocket store
- API calls → /services

---

## 🔄 Realtime Handling Rules

- Every state change MUST:
  - update server state
  - emit event via WebSocket

- Never update UI state directly without server confirmation

---

## 🎮 Game Flow Validation Checklist

After any change, ensure:

- Session can be created
- Teams can join
- Turn system works correctly
- Wheel spin result syncs to all clients
- Score updates correctly
- Phrase updates correctly
- Only current team can act

---

## 🧠 Decision Rules

When unsure:

- Prefer server-side logic over client-side
- Prefer explicit state over implicit state
- Prefer immutability in game state

---

## 🔧 Common Tasks

### Add new feature
- Update domain model if needed
- Add use case in application layer
- Expose API
- Emit WebSocket event
- Update frontend

### Fix bug
- Reproduce issue
- Identify state inconsistency
- Fix at source (server)
- Validate full game loop

---

## ⚠️ Edge Cases to Handle

- Multiple teams acting simultaneously
- Duplicate guesses
- Invalid session code
- Network delay / reconnect

---

## 🧪 Debug Strategy

- Log game events
- Trace state transitions
- Validate WebSocket messages

---

## 💾 State Source of Truth

- Backend = SINGLE SOURCE OF TRUTH
- Frontend = VIEW ONLY

---

## 🛑 Stop Conditions

Agent must STOP and wait if:
- unclear requirement
- conflicting game logic
- missing context

---

## 🚀 Output Quality Rules

- Code must be clean, readable, modular
- Use reusable components
- Avoid duplication
- Follow existing architecture

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
