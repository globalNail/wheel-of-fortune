-- PostgreSQL schema for Wheel of Fortune sessions

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  host_token UUID NOT NULL,
  phrase TEXT NOT NULL,
  category VARCHAR(120),
  masked_phrase TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  max_teams INT NOT NULL CHECK (max_teams BETWEEN 2 AND 8),
  current_turn_team_id UUID,
  guessed_letters JSONB NOT NULL DEFAULT '[]'::jsonb,
  pending_wheel_value INT,
  last_wheel_segment_id VARCHAR(60),
  last_wheel_result_label VARCHAR(60),
  winner_team_id UUID,
  solve_bonus INT NOT NULL DEFAULT 300,
  vowel_cost INT NOT NULL DEFAULT 50,
  turn_duration_seconds INT NOT NULL DEFAULT 30,
  turn_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  turn_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, name),
  UNIQUE (session_id, turn_order)
);

CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  event_type VARCHAR(40) NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_session_id ON teams (session_id);
CREATE INDEX IF NOT EXISTS idx_events_session_time ON game_events (session_id, occurred_at DESC);
