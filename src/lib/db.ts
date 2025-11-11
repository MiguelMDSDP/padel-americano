// All code in ENGLISH, UI labels in PORTUGUESE
// Supabase database client and helper functions

import { supabase } from './supabase';
import type { Tournament } from './types';

// Database helper functions

/**
 * Convert Tournament object to Supabase format
 */
function tournamentToSupabase(tournament: Tournament) {
  return {
    id: tournament.id,
    name: tournament.name,
    start_date: tournament.startDate.toISOString(),
    players: tournament.players,
    rounds: tournament.rounds,
    status: tournament.status,
    is_active: tournament.isActive,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Convert Supabase row to Tournament object
 */
function supabaseToTournament(row: any): Tournament {
  return {
    id: row.id,
    name: row.name,
    startDate: new Date(row.start_date),
    players: row.players,
    rounds: row.rounds.map((round: any) => ({
      ...round,
      configuredAt: round.configuredAt ? new Date(round.configuredAt) : undefined,
      matches: round.matches.map((match: any) => ({
        ...match,
        startTime: match.startTime ? new Date(match.startTime) : undefined,
        endTime: match.endTime ? new Date(match.endTime) : undefined,
      })),
    })),
    status: row.status,
    isActive: row.is_active ?? true, // Default to true for backwards compatibility
    lastUpdated: new Date(row.last_updated),
  };
}

/**
 * Save tournament to Supabase
 */
export async function saveTournament(tournament: Tournament): Promise<void> {
  try {
    const data = tournamentToSupabase(tournament);

    const { error } = await supabase
      .from('tournaments')
      .upsert(data, { onConflict: 'id' });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
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
      .select('*')
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

    return data ? supabaseToTournament(data) : null;
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
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Supabase error:', error);
      throw error;
    }

    return data ? supabaseToTournament(data) : null;
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
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data ? data.map(supabaseToTournament) : [];
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
