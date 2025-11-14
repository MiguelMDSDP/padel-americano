-- All code in ENGLISH, UI labels in PORTUGUESE
-- Supabase Database Schema for PadelAmericano BR Tournament System
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/sql

-- Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'setup',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tournaments_last_updated ON public.tournaments(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow anyone to read tournaments (public access)
CREATE POLICY "Allow public read access"
  ON public.tournaments
  FOR SELECT
  USING (true);

-- Create policy: Allow anyone to insert tournaments
-- Note: In production, you might want to restrict this to authenticated users
CREATE POLICY "Allow public insert access"
  ON public.tournaments
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Allow anyone to update tournaments
-- Note: In production, you might want to restrict this to authenticated users
CREATE POLICY "Allow public update access"
  ON public.tournaments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy: Allow anyone to delete tournaments
-- Note: In production, you might want to restrict this to authenticated users
CREATE POLICY "Allow public delete access"
  ON public.tournaments
  FOR DELETE
  USING (true);

-- Add comment to table
COMMENT ON TABLE public.tournaments IS 'Stores tournament data for Padel Americano BR system';
