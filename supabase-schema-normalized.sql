-- All code in ENGLISH, UI labels in PORTUGUESE
-- Supabase Database Schema for PadelAmericano BR Tournament System (Normalized)
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/sql

-- Drop existing tables if needed (be careful with this in production!)
-- DROP TABLE IF EXISTS public.matches CASCADE;
-- DROP TABLE IF EXISTS public.rounds CASCADE;
-- DROP TABLE IF EXISTS public.players CASCADE;
-- DROP TABLE IF EXISTS public.tournaments CASCADE;

-- Create tournaments table (simplified, without JSONB)
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'setup',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('drive', 'backhand')),
  points INTEGER NOT NULL DEFAULT 0,
  balance INTEGER NOT NULL DEFAULT 0,
  scored INTEGER NOT NULL DEFAULT 0,
  conceded INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rounds table
CREATE TABLE IF NOT EXISTS public.rounds (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'configured' CHECK (status IN ('configured', 'in_progress', 'finished')),
  configured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, number)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  court TEXT NOT NULL CHECK (court IN ('stone', 'cresol')),
  pair1_drive_player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  pair1_backhand_player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  pair2_drive_player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  pair2_backhand_player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  pair1_score INTEGER NOT NULL DEFAULT 0,
  pair2_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  match_order INTEGER NOT NULL CHECK (match_order > 0),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tournaments_last_updated ON public.tournaments(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_is_active ON public.tournaments(is_active);

CREATE INDEX IF NOT EXISTS idx_players_tournament_id ON public.players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_players_points ON public.players(points DESC);

CREATE INDEX IF NOT EXISTS idx_rounds_tournament_id ON public.rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rounds_number ON public.rounds(number);

CREATE INDEX IF NOT EXISTS idx_matches_round_id ON public.matches(round_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for tournaments table
CREATE POLICY "Allow public read access on tournaments"
  ON public.tournaments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on tournaments"
  ON public.tournaments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access on tournaments"
  ON public.tournaments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on tournaments"
  ON public.tournaments
  FOR DELETE
  USING (true);

-- Create policies for players table
CREATE POLICY "Allow public read access on players"
  ON public.players
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on players"
  ON public.players
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access on players"
  ON public.players
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on players"
  ON public.players
  FOR DELETE
  USING (true);

-- Create policies for rounds table
CREATE POLICY "Allow public read access on rounds"
  ON public.rounds
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on rounds"
  ON public.rounds
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access on rounds"
  ON public.rounds
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on rounds"
  ON public.rounds
  FOR DELETE
  USING (true);

-- Create policies for matches table
CREATE POLICY "Allow public read access on matches"
  ON public.matches
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on matches"
  ON public.matches
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access on matches"
  ON public.matches
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on matches"
  ON public.matches
  FOR DELETE
  USING (true);

-- Add comments to tables
COMMENT ON TABLE public.tournaments IS 'Stores tournament metadata for Padel Americano BR system';
COMMENT ON TABLE public.players IS 'Stores player data and statistics for each tournament';
COMMENT ON TABLE public.rounds IS 'Stores round information for each tournament';
COMMENT ON TABLE public.matches IS 'Stores match details including pairs and scores';
