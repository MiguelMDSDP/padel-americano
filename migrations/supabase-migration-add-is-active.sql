-- All code in ENGLISH, UI labels in PORTUGUESE
-- Migration: Add is_active field to tournaments table
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/sql

-- Add is_active column (default true for new tournaments)
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Set existing tournaments to active (if any exist)
UPDATE public.tournaments
SET is_active = true
WHERE is_active IS NULL;

-- Create index for faster queries on active tournaments
CREATE INDEX IF NOT EXISTS idx_tournaments_is_active ON public.tournaments(is_active);

-- Add comment
COMMENT ON COLUMN public.tournaments.is_active IS 'Indicates if tournament is currently active/visible to users';
