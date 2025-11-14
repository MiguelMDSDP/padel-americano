// All code in ENGLISH, UI labels in PORTUGUESE
// Supabase database client and helper functions

import { supabase } from './supabase';
import type { Tournament, Player, Round, Match, Court, TournamentConfig } from './types';
import type { Database } from './database.types';
import { getDefaultTournamentConfig, getDefaultCourts } from './utils/calculations';

type DbPlayer = Database['public']['Tables']['players']['Row'];
type DbRound = Database['public']['Tables']['rounds']['Row'];
type DbMatch = Database['public']['Tables']['matches']['Row'];

// Court type from database
interface DbCourt {
  id: string;
  tournament_id: string;
  name: string;
  color: string;
  court_order: number;
  created_at: string;
}

// Database helper functions

/**
 * Convert database player to application Player type
 */
function dbPlayerToPlayer(dbPlayer: DbPlayer): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    position: dbPlayer.position as 'drive' | 'backhand',
    points: dbPlayer.points,
    balance: dbPlayer.balance,
    scored: dbPlayer.scored,
    conceded: dbPlayer.conceded,
    wins: dbPlayer.wins,
    draws: dbPlayer.draws,
    losses: dbPlayer.losses,
    gamesPlayed: dbPlayer.games_played,
  };
}

/**
 * Convert application Player to database format
 */
function playerToDbPlayer(player: Player, tournamentId: string): Database['public']['Tables']['players']['Insert'] {
  return {
    id: player.id,
    tournament_id: tournamentId,
    name: player.name,
    position: player.position,
    points: player.points,
    balance: player.balance,
    scored: player.scored,
    conceded: player.conceded,
    wins: player.wins,
    draws: player.draws,
    losses: player.losses,
    games_played: player.gamesPlayed,
  };
}

/**
 * Convert database court to application Court type
 */
function dbCourtToCourt(dbCourt: DbCourt): Court {
  return {
    id: dbCourt.id,
    tournamentId: dbCourt.tournament_id,
    name: dbCourt.name,
    color: dbCourt.color,
    order: dbCourt.court_order,
  };
}

/**
 * Convert application Court to database format
 */
function courtToDbCourt(court: Court, tournamentId: string): Omit<DbCourt, 'created_at'> {
  return {
    id: court.id,
    tournament_id: tournamentId,
    name: court.name,
    color: court.color,
    court_order: court.order,
  };
}

/**
 * Convert database match with player data to application Match type
 */
function dbMatchToMatch(
  dbMatch: DbMatch,
  playersMap: Map<string, Player>,
  roundNumber: number
): Match {
  const pair1DrivePlayer = playersMap.get(dbMatch.pair1_drive_player_id);
  const pair1BackhandPlayer = playersMap.get(dbMatch.pair1_backhand_player_id);
  const pair2DrivePlayer = playersMap.get(dbMatch.pair2_drive_player_id);
  const pair2BackhandPlayer = playersMap.get(dbMatch.pair2_backhand_player_id);

  if (!pair1DrivePlayer || !pair1BackhandPlayer || !pair2DrivePlayer || !pair2BackhandPlayer) {
    throw new Error('Invalid match data: missing player references');
  }

  return {
    id: dbMatch.id,
    round: roundNumber,
    court: dbMatch.court as 'stone' | 'cresol',
    pair1: {
      drivePlayer: pair1DrivePlayer,
      backhandPlayer: pair1BackhandPlayer,
    },
    pair2: {
      drivePlayer: pair2DrivePlayer,
      backhandPlayer: pair2BackhandPlayer,
    },
    pair1Score: dbMatch.pair1_score,
    pair2Score: dbMatch.pair2_score,
    status: dbMatch.status as 'waiting' | 'in_progress' | 'finished',
    order: dbMatch.match_order,
    startTime: dbMatch.start_time ? new Date(dbMatch.start_time) : undefined,
    endTime: dbMatch.end_time ? new Date(dbMatch.end_time) : undefined,
  };
}

/**
 * Convert application Match to database format
 */
function matchToDbMatch(match: Match, roundId: string): Database['public']['Tables']['matches']['Insert'] {
  return {
    id: match.id,
    round_id: roundId,
    court: match.court,
    pair1_drive_player_id: match.pair1.drivePlayer.id,
    pair1_backhand_player_id: match.pair1.backhandPlayer.id,
    pair2_drive_player_id: match.pair2.drivePlayer.id,
    pair2_backhand_player_id: match.pair2.backhandPlayer.id,
    pair1_score: match.pair1Score,
    pair2_score: match.pair2Score,
    status: match.status,
    match_order: match.order,
    start_time: match.startTime?.toISOString(),
    end_time: match.endTime?.toISOString(),
  };
}

/**
 * Load tournament data with all related entities from database
 */
async function loadTournamentData(tournamentId: string): Promise<Tournament | null> {
  // Load tournament
  const { data: tournamentData, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tournamentError) {
    if (tournamentError.code === 'PGRST116') {
      return null;
    }
    throw tournamentError;
  }

  // Load players
  const { data: playersData, error: playersError } = await supabase
    .from('players')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (playersError) throw playersError;

  const players = (playersData || []).map(dbPlayerToPlayer);
  const playersMap = new Map(players.map(p => [p.id, p]));

  // Load courts
  const { data: courtsData, error: courtsError } = await supabase
    .from('courts')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('court_order', { ascending: true });

  if (courtsError) throw courtsError;

  const courts = (courtsData || []).map(dbCourtToCourt);

  // If no courts found, use defaults
  const finalCourts = courts.length > 0 ? courts : getDefaultCourts(tournamentId);

  // Build tournament config from database fields or use defaults
  const config: TournamentConfig = {
    totalPlayers: tournamentData.total_players ?? 24,
    totalRounds: tournamentData.total_rounds ?? 5,
    matchDurationMinutes: tournamentData.match_duration_minutes ?? 15,
    intervalMinutes: tournamentData.interval_minutes ?? 5,
  };

  // Load rounds
  const { data: roundsData, error: roundsError } = await supabase
    .from('rounds')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('number', { ascending: true });

  if (roundsError) throw roundsError;

  // Load all matches for all rounds
  const roundIds = (roundsData || []).map(r => r.id);
  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .in('round_id', roundIds.length > 0 ? roundIds : ['']);

  if (matchesError) throw matchesError;

  // Group matches by round_id
  const matchesByRound = new Map<string, DbMatch[]>();
  (matchesData || []).forEach(match => {
    const matches = matchesByRound.get(match.round_id) || [];
    matches.push(match);
    matchesByRound.set(match.round_id, matches);
  });

  // Build rounds with matches
  const rounds: Round[] = (roundsData || []).map(dbRound => {
    const roundMatches = matchesByRound.get(dbRound.id) || [];
    return {
      number: dbRound.number,
      matches: roundMatches.map(m => dbMatchToMatch(m, playersMap, dbRound.number)),
      status: dbRound.status as 'configured' | 'in_progress' | 'finished',
      configuredAt: dbRound.configured_at ? new Date(dbRound.configured_at) : undefined,
    };
  });

  return {
    id: tournamentData.id,
    name: tournamentData.name,
    startDate: new Date(tournamentData.start_date),
    players,
    rounds,
    status: tournamentData.status as 'setup' | 'in_progress' | 'finished',
    isActive: tournamentData.is_active,
    lastUpdated: new Date(tournamentData.last_updated),
    config,
    courts: finalCourts,
  };
}

/**
 * Save tournament to Supabase (with all related entities)
 */
export async function saveTournament(tournament: Tournament): Promise<void> {
  try {
    // Save tournament metadata with config
    const { error: tournamentError } = await supabase
      .from('tournaments')
      .upsert({
        id: tournament.id,
        name: tournament.name,
        start_date: tournament.startDate.toISOString(),
        status: tournament.status,
        is_active: tournament.isActive,
        last_updated: new Date().toISOString(),
        total_players: tournament.config.totalPlayers,
        total_rounds: tournament.config.totalRounds,
        match_duration_minutes: tournament.config.matchDurationMinutes,
        interval_minutes: tournament.config.intervalMinutes,
      }, { onConflict: 'id' });

    if (tournamentError) {
      console.error('Supabase error (tournament):', tournamentError);
      throw tournamentError;
    }

    // Save courts (delete existing + insert new)
    await supabase
      .from('courts')
      .delete()
      .eq('tournament_id', tournament.id);

    if (tournament.courts.length > 0) {
      const courtsData = tournament.courts.map(c => courtToDbCourt(c, tournament.id));
      const { error: courtsError } = await supabase
        .from('courts')
        .insert(courtsData);

      if (courtsError) {
        console.error('Supabase error (courts):', courtsError);
        throw courtsError;
      }
    }

    // Save players
    const playersData = tournament.players.map(p => playerToDbPlayer(p, tournament.id));

    // Delete existing players for this tournament first
    await supabase
      .from('players')
      .delete()
      .eq('tournament_id', tournament.id);

    if (playersData.length > 0) {
      const { error: playersError } = await supabase
        .from('players')
        .insert(playersData);

      if (playersError) {
        console.error('Supabase error (players):', playersError);
        throw playersError;
      }
    }

    // Save rounds and matches
    for (const round of tournament.rounds) {
      const roundId = `${tournament.id}-round-${round.number}`;

      // Upsert round
      const { error: roundError } = await supabase
        .from('rounds')
        .upsert({
          id: roundId,
          tournament_id: tournament.id,
          number: round.number,
          status: round.status,
          configured_at: round.configuredAt?.toISOString(),
        }, { onConflict: 'id' });

      if (roundError) {
        console.error('Supabase error (round):', roundError);
        throw roundError;
      }

      // Delete existing matches for this round
      await supabase
        .from('matches')
        .delete()
        .eq('round_id', roundId);

      // Insert matches
      if (round.matches.length > 0) {
        const matchesData = round.matches.map(m => matchToDbMatch(m, roundId));
        const { error: matchesError } = await supabase
          .from('matches')
          .insert(matchesData);

        if (matchesError) {
          console.error('Supabase error (matches):', matchesError);
          throw matchesError;
        }
      }
    }
  } catch (error) {
    console.error('Error saving tournament:', error);
    throw new Error('Failed to save tournament');
  }
}

/**
 * Get active tournament from Supabase
 * Returns the most recently updated ACTIVE tournament
 */
export async function getActiveTournament(): Promise<Tournament | null> {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id')
      .eq('is_active', true)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no tournament exists, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Supabase error:', error);
      throw error;
    }

    return data ? await loadTournamentData(data.id) : null;
  } catch (error) {
    console.error('Error loading tournament:', error);
    throw new Error('Failed to load tournament');
  }
}

/**
 * Get tournament by ID
 */
export async function getTournamentById(id: string): Promise<Tournament | null> {
  try {
    return await loadTournamentData(id);
  } catch (error) {
    console.error('Error loading tournament by ID:', error);
    throw new Error('Failed to load tournament');
  }
}

/**
 * Delete tournament from Supabase
 */
export async function deleteTournament(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw new Error('Failed to delete tournament');
  }
}

/**
 * Get all tournaments
 */
export async function getAllTournaments(): Promise<Tournament[]> {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id')
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Load full tournament data for each tournament
    const tournaments = await Promise.all(
      data.map(async ({ id }) => {
        const tournament = await loadTournamentData(id);
        return tournament;
      })
    );

    // Filter out any null values (in case some tournaments failed to load)
    return tournaments.filter((t): t is Tournament => t !== null);
  } catch (error) {
    console.error('Error loading tournaments:', error);
    throw new Error('Failed to load tournaments');
  }
}

/**
 * Export tournament data as JSON string
 */
export function exportTournamentJSON(tournament: Tournament): string {
  try {
    return JSON.stringify(tournament, null, 2);
  } catch (error) {
    console.error('Error exporting tournament:', error);
    throw new Error('Failed to export tournament');
  }
}

/**
 * Import tournament from JSON string
 */
export async function importTournamentJSON(jsonString: string): Promise<Tournament> {
  try {
    const tournament: Tournament = JSON.parse(jsonString);

    // Validate basic structure
    if (!tournament.id || !tournament.name || !tournament.players || !tournament.rounds) {
      throw new Error('Invalid tournament data structure');
    }

    // Convert date strings back to Date objects
    tournament.startDate = new Date(tournament.startDate);
    tournament.lastUpdated = new Date(tournament.lastUpdated || new Date());

    // Convert match dates
    tournament.rounds.forEach((round) => {
      if (round.configuredAt) {
        round.configuredAt = new Date(round.configuredAt);
      }
      round.matches.forEach((match) => {
        if (match.startTime) {
          match.startTime = new Date(match.startTime);
        }
        if (match.endTime) {
          match.endTime = new Date(match.endTime);
        }
      });
    });

    // Save to database
    await saveTournament(tournament);

    return tournament;
  } catch (error) {
    console.error('Error importing tournament:', error);
    throw new Error('Failed to import tournament');
  }
}

/**
 * Finalize tournament (mark as inactive)
 * This makes the tournament no longer appear as "active"
 */
export async function finalizeTournament(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tournaments')
      .update({
        is_active: false,
        status: 'finished',
        last_updated: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error finalizing tournament:', error);
    throw new Error('Failed to finalize tournament');
  }
}

/**
 * Set tournament as active/inactive
 * When setting a tournament as active, deactivates all others
 */
export async function setTournamentActive(id: string, isActive: boolean): Promise<void> {
  try {
    if (isActive) {
      // First, deactivate all tournaments
      await supabase
        .from('tournaments')
        .update({ is_active: false })
        .neq('id', '');
    }

    // Then activate the selected one
    const { error } = await supabase
      .from('tournaments')
      .update({
        is_active: isActive,
        last_updated: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error setting tournament active status:', error);
    throw new Error('Failed to update tournament status');
  }
}

/**
 * Clear all data (for development/testing)
 */
export async function clearAllData(): Promise<void> {
  try {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .neq('id', ''); // Delete all records

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    throw new Error('Failed to clear data');
  }
}
