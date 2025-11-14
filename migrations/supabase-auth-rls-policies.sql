-- All code in ENGLISH, UI labels in PORTUGUESE
-- Update RLS policies for authentication
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/sql

-- Drop old public policies (everyone can access)
DROP POLICY IF EXISTS "Allow public read access" ON public.tournaments;
DROP POLICY IF EXISTS "Allow public insert access" ON public.tournaments;
DROP POLICY IF EXISTS "Allow public update access" ON public.tournaments;
DROP POLICY IF EXISTS "Allow public delete access" ON public.tournaments;

-- Create new policies with authentication

-- 1. Anyone can read tournaments (public view)
CREATE POLICY "Allow anyone to read tournaments"
  ON public.tournaments
  FOR SELECT
  USING (true);

-- 2. Only authenticated users can insert tournaments
CREATE POLICY "Allow authenticated users to insert tournaments"
  ON public.tournaments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Only authenticated users can update tournaments
CREATE POLICY "Allow authenticated users to update tournaments"
  ON public.tournaments
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Only authenticated users can delete tournaments
CREATE POLICY "Allow authenticated users to delete tournaments"
  ON public.tournaments
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE public.tournaments IS 'Tournaments table with authenticated user policies for admin operations';
