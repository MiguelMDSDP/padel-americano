-- ========================================
-- Migration: Torneios Configuráveis
-- Data: 2025-11-14
-- Descrição: Adiciona suporte para configuração dinâmica de torneios
--            (número de jogadores, quadras personalizadas, duração)
-- ========================================

-- 1. Adicionar campos de configuração à tabela tournaments
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS total_players INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS total_rounds INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS match_duration_minutes INTEGER NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS interval_minutes INTEGER NOT NULL DEFAULT 5;

-- 2. Adicionar constraints de validação
DO $$
BEGIN
  -- Drop constraints if they exist (para re-execução segura)
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_players') THEN
    ALTER TABLE tournaments DROP CONSTRAINT check_total_players;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_rounds') THEN
    ALTER TABLE tournaments DROP CONSTRAINT check_total_rounds;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_match_duration') THEN
    ALTER TABLE tournaments DROP CONSTRAINT check_match_duration;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_interval') THEN
    ALTER TABLE tournaments DROP CONSTRAINT check_interval;
  END IF;
END $$;

ALTER TABLE tournaments
  ADD CONSTRAINT check_total_players
    CHECK (total_players >= 8 AND total_players <= 128 AND total_players % 8 = 0),
  ADD CONSTRAINT check_total_rounds
    CHECK (total_rounds >= 1 AND total_rounds <= 10),
  ADD CONSTRAINT check_match_duration
    CHECK (match_duration_minutes >= 5 AND match_duration_minutes <= 60),
  ADD CONSTRAINT check_interval
    CHECK (interval_minutes >= 0);

-- 3. Criar tabela courts (quadras)
CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  court_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_courts_tournament_id ON courts(tournament_id);
CREATE INDEX IF NOT EXISTS idx_courts_order ON courts(court_order);

-- 5. Habilitar Row Level Security
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS (acesso público por enquanto)
DROP POLICY IF EXISTS "Public read access on courts" ON courts;
DROP POLICY IF EXISTS "Public insert access on courts" ON courts;
DROP POLICY IF EXISTS "Public update access on courts" ON courts;
DROP POLICY IF EXISTS "Public delete access on courts" ON courts;

CREATE POLICY "Public read access on courts"
  ON courts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access on courts"
  ON courts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access on courts"
  ON courts FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public delete access on courts"
  ON courts FOR DELETE
  TO public
  USING (true);

-- 7. Remover constraint check do campo court (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_court_check') THEN
    ALTER TABLE matches DROP CONSTRAINT matches_court_check;
  END IF;
END $$;

-- 8. Atualizar coluna court da tabela matches
-- Garantir que seja TEXT (não ENUM) para aceitar nomes dinâmicos
ALTER TABLE matches ALTER COLUMN court TYPE TEXT;

-- 9. Migrar dados existentes: atualizar torneios com valores padrão
UPDATE tournaments
SET
  total_players = 24,
  total_rounds = 5,
  match_duration_minutes = 15,
  interval_minutes = 5
WHERE total_players IS NULL OR total_players = 24;

-- 10. Criar quadras padrão para torneios existentes
-- Quadra Stone (azul)
INSERT INTO courts (id, tournament_id, name, color, court_order)
SELECT
  t.id || '-court-stone',
  t.id,
  'Stone',
  '#3b82f6',
  1
FROM tournaments t
WHERE NOT EXISTS (
  SELECT 1 FROM courts c
  WHERE c.tournament_id = t.id AND LOWER(c.name) = 'stone'
);

-- Quadra Cresol (verde)
INSERT INTO courts (id, tournament_id, name, color, court_order)
SELECT
  t.id || '-court-cresol',
  t.id,
  'Cresol',
  '#10b981',
  2
FROM tournaments t
WHERE NOT EXISTS (
  SELECT 1 FROM courts c
  WHERE c.tournament_id = t.id AND LOWER(c.name) = 'cresol'
);

-- 11. Atualizar matches existentes para usar nomes de quadras corretos
-- Converte 'stone' -> 'Stone' e 'cresol' -> 'Cresol' se necessário
UPDATE matches m
SET court = CASE
  WHEN LOWER(m.court) = 'stone' THEN 'Stone'
  WHEN LOWER(m.court) = 'cresol' THEN 'Cresol'
  ELSE m.court
END
WHERE LOWER(m.court) IN ('stone', 'cresol');

-- ========================================
-- FIM DA MIGRATION
-- ========================================

-- Verificações (opcional - comentar em produção)
-- SELECT 'Tournaments com configuração' as check_name, COUNT(*) as count FROM tournaments WHERE total_players IS NOT NULL;
-- SELECT 'Courts criadas' as check_name, COUNT(*) as count FROM courts;
-- SELECT 'Matches atualizadas' as check_name, COUNT(*) as count FROM matches WHERE court IN ('Stone', 'Cresol');
