# Wheel Of Fortune Realtime System

Complete fullstack game application similar to "Wheel of Fortune" (Vietnamese game-show style), built with:

- Frontend: Next.js + TypeScript + TailwindCSS
- Backend: Node.js + Express + Socket.IO
- Realtime: WebSocket events via Socket.IO
- Architecture: Clean Architecture style layering in backend

## 1) Folder Structure

```text
.
|-- app/
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   `-- game/
|       |-- ActionPanel.tsx
|       |-- EventFeed.tsx
|       |-- GameClient.tsx
|       |-- PhraseBoard.tsx
|       |-- Scoreboard.tsx
|       |-- TopBar.tsx
|       `-- Wheel.tsx
|-- lib/
|   |-- api.ts
|   |-- config.ts
|   |-- socket.ts
|   |-- storage.ts
|   |-- types.ts
|   `-- wheel.ts
|-- backend/
|   |-- db/
|   |   `-- schema.sql
|   `-- src/
|       |-- application/
|       |   |-- ports/
|       |   |   `-- sessionRepository.ts
|       |   `-- services/
|       |       |-- errors.ts
|       |       `-- gameService.ts
|       |-- config/
|       |   `-- env.ts
|       |-- domain/
|       |   |-- constants.ts
|       |   `-- gameTypes.ts
|       |-- infrastructure/
|       |   |-- realtime/
|       |   |   |-- realtimeGateway.ts
|       |   |   `-- socketRealtimeGateway.ts
|       |   `-- repositories/
|       |       `-- inMemorySessionRepository.ts
|       |-- interfaces/
|       |   `-- http/
|       |       `-- createRouter.ts
|       `-- server.ts
|-- .env.example
`-- package.json
```

## 2) Backend Design (Clean Architecture)

### Domain

- `backend/src/domain/gameTypes.ts`: core entities and DTOs (`GameSession`, `Team`, `GameEvent`)
- `backend/src/domain/constants.ts`: wheel segments and game constants

### Application

- `backend/src/application/services/gameService.ts`: business rules
  - create/join/start/reset sessions
  - turn system and timer timeout
  - spin/guess/buy-vowel/solve logic
  - anti-cheat checks: only current team can act
  - letter duplication guard
  - score and phrase updates

### Infrastructure

- `backend/src/infrastructure/repositories/inMemorySessionRepository.ts`: repository implementation
- `backend/src/infrastructure/realtime/socketRealtimeGateway.ts`: Socket.IO event publishing and room handling

### Interface Layer

- `backend/src/interfaces/http/createRouter.ts`: REST routes + payload validation with Zod

## 3) Database Schema

The SQL schema is provided in `backend/db/schema.sql` and includes:

- `sessions`
- `teams`
- `game_events`

This schema can be used with PostgreSQL when replacing the in-memory repository with a persistent adapter.

## 4) API Endpoints

Base URL: `http://localhost:4000/api`

- `POST /session/create`
- `POST /session/join`
- `GET /session/:code`
- `POST /session/start`
- `POST /session/set-turn-order`
- `POST /game/spin`
- `POST /game/guess`
- `POST /game/buy-vowel`
- `POST /game/solve`
- `POST /game/reset`

## 5) Realtime Events

Socket room events per session code:

- `sessionState`
- `onScoreUpdate`
- `onTurnChange`
- `onPhraseUpdate`
- `onWheelResult`

Client commands:

- `session:join-room`
- `session:leave-room`

## 6) Security and Validation

- Host-only actions validated by `hostToken`
- Team actions validated by `teamToken`
- Only `currentTurnTeamId` can spin/guess/solve/buy-vowel
- Duplicate guessed letters blocked
- Buy vowel requires enough score
- Session code and payload shape validated by Zod

## 7) Frontend UX

- Split layout:
  - Left: wheel, phrase board, team actions
  - Right: realtime scoreboard, ranking, event feed
  - Top: session code, status, role, timer, leave control
- Animated wheel spin
- Realtime sync through Socket.IO
- Winner celebration banner with confetti overlay
- Host controls for start/reset and turn-order arrangement

## 8) Run Instructions

1. Install dependencies:

```bash
npm install
```

1. Configure environment:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

1. Start frontend + backend together:

```bash
npm run dev
```

1. Open app:

- Frontend: <http://localhost:3000>
- Backend health: <http://localhost:4000/api/health>

## 9) Suggested Production Next Steps

- Replace in-memory repository with PostgreSQL repository (schema already included)
- Add JWT auth for host/team identity
- Add integration tests for full game flow
- Add Redis pub/sub for horizontal socket scaling
