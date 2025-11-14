-- All code in ENGLISH, UI labels in PORTUGUESE
-- Fix match_order constraint to allow values greater than 2
-- Execute this SQL in Supabase SQL Editor if you already created the schema with the old constraint

-- Drop the old constraint
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_match_order_check;

-- Add the new constraint (allows any positive integer)
ALTER TABLE public.matches ADD CONSTRAINT matches_match_order_check CHECK (match_order > 0);
