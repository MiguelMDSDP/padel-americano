-- All code in ENGLISH, UI labels in PORTUGUESE
-- Script to clear all tournaments from database
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/sql

-- WARNING: This will DELETE ALL tournaments permanently!
-- Make sure you want to do this before running.

DELETE FROM public.tournaments;

-- Verify deletion
SELECT COUNT(*) as remaining_tournaments FROM public.tournaments;

-- Expected result: remaining_tournaments = 0
