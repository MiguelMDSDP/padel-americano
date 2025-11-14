-- All code in ENGLISH, UI labels in PORTUGUESE
-- Migration Script: Convert JSONB structure to normalized tables
-- Execute this SQL in Supabase SQL Editor AFTER running supabase-schema-normalized.sql
-- This script migrates existing data from the old tournaments table to the new normalized structure

-- WARNING: This migration assumes you've already created the new tables with supabase-schema-normalized.sql
-- Make sure to BACKUP your data before running this migration!

DO $$
DECLARE
  tournament_record RECORD;
  player_record JSONB;
  round_record JSONB;
  match_record JSONB;
  round_id TEXT;
BEGIN
  -- Check if old schema exists (tournaments table has 'players' and 'rounds' columns)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments'
    AND column_name = 'players'
    AND data_type = 'jsonb'
  ) THEN
    RAISE NOTICE 'Found old schema with JSONB columns. Starting migration...';

    -- Iterate through all tournaments in old format
    FOR tournament_record IN
      SELECT id, name, start_date, status,
             COALESCE(is_active, true) as is_active,
             players, rounds,
             last_updated, created_at
      FROM tournaments
    LOOP
      RAISE NOTICE 'Migrating tournament: %', tournament_record.name;

      -- Migrate players
      IF tournament_record.players IS NOT NULL THEN
        FOR player_record IN
          SELECT * FROM jsonb_array_elements(tournament_record.players)
        LOOP
          INSERT INTO players (
            id, tournament_id, name, position,
            points, balance, scored, conceded,
            wins, draws, losses, games_played
          ) VALUES (
            player_record->>'id',
            tournament_record.id,
            player_record->>'name',
            player_record->>'position',
            COALESCE((player_record->>'points')::integer, 0),
            COALESCE((player_record->>'balance')::integer, 0),
            COALESCE((player_record->>'scored')::integer, 0),
            COALESCE((player_record->>'conceded')::integer, 0),
            COALESCE((player_record->>'wins')::integer, 0),
            COALESCE((player_record->>'draws')::integer, 0),
            COALESCE((player_record->>'losses')::integer, 0),
            COALESCE((player_record->>'gamesPlayed')::integer, 0)
          ) ON CONFLICT (id) DO NOTHING;
        END LOOP;
      END IF;

      -- Migrate rounds and matches
      IF tournament_record.rounds IS NOT NULL THEN
        FOR round_record IN
          SELECT * FROM jsonb_array_elements(tournament_record.rounds)
        LOOP
          round_id := tournament_record.id || '-round-' || (round_record->>'number');

          -- Insert round
          INSERT INTO rounds (
            id, tournament_id, number, status, configured_at
          ) VALUES (
            round_id,
            tournament_record.id,
            (round_record->>'number')::integer,
            COALESCE(round_record->>'status', 'configured'),
            CASE
              WHEN round_record->>'configuredAt' IS NOT NULL
              THEN (round_record->>'configuredAt')::timestamptz
              ELSE NULL
            END
          ) ON CONFLICT (id) DO NOTHING;

          -- Migrate matches for this round
          IF round_record->'matches' IS NOT NULL THEN
            FOR match_record IN
              SELECT * FROM jsonb_array_elements(round_record->'matches')
            LOOP
              INSERT INTO matches (
                id, round_id, court,
                pair1_drive_player_id,
                pair1_backhand_player_id,
                pair2_drive_player_id,
                pair2_backhand_player_id,
                pair1_score, pair2_score,
                status, match_order,
                start_time, end_time
              ) VALUES (
                match_record->>'id',
                round_id,
                match_record->>'court',
                match_record->'pair1'->'drivePlayer'->>'id',
                match_record->'pair1'->'backhandPlayer'->>'id',
                match_record->'pair2'->'drivePlayer'->>'id',
                match_record->'pair2'->'backhandPlayer'->>'id',
                COALESCE((match_record->>'pair1Score')::integer, 0),
                COALESCE((match_record->>'pair2Score')::integer, 0),
                COALESCE(match_record->>'status', 'waiting'),
                COALESCE((match_record->>'order')::integer, 1),
                CASE
                  WHEN match_record->>'startTime' IS NOT NULL
                  THEN (match_record->>'startTime')::timestamptz
                  ELSE NULL
                END,
                CASE
                  WHEN match_record->>'endTime' IS NOT NULL
                  THEN (match_record->>'endTime')::timestamptz
                  ELSE NULL
                END
              ) ON CONFLICT (id) DO NOTHING;
            END LOOP;
          END IF;
        END LOOP;
      END IF;
    END LOOP;

    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Please verify the data in the new tables before dropping the old columns.';
    RAISE NOTICE 'To complete the migration, you can drop the old columns with:';
    RAISE NOTICE 'ALTER TABLE tournaments DROP COLUMN players, DROP COLUMN rounds;';
  ELSE
    RAISE NOTICE 'Old schema not found or already migrated. Skipping migration.';
  END IF;
END $$;

-- After verifying the migration was successful, uncomment these lines to remove old columns:
-- ALTER TABLE tournaments DROP COLUMN IF EXISTS players;
-- ALTER TABLE tournaments DROP COLUMN IF EXISTS rounds;
