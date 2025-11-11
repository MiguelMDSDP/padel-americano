// All code in ENGLISH, UI labels in PORTUGUESE
// IndexedDB configuration using Dexie.js

import Dexie, { type Table } from 'dexie';
import type { Tournament } from './types';

// Database class extending Dexie
export class PadelAmericanoDatabase extends Dexie {
  tournaments!: Table<Tournament, string>;

  constructor() {
    super('PadelAmericanoBR');

    // Define database schema
    this.version(1).stores({
      tournaments: 'id, name, startDate, status, lastUpdated',
    });
  }
}

// Create database instance
export const db = new PadelAmericanoDatabase();

// Database helper functions

/**
 * Save tournament to IndexedDB
 */
export async function saveTournament(tournament: Tournament): Promise<void> {
  try {
    tournament.lastUpdated = new Date();
    await db.tournaments.put(tournament);
  } catch (error) {
    console.error('Error saving tournament:', error);
    throw new Error('Failed to save tournament');
  }
}

/**
 * Get active tournament from IndexedDB
 * Returns the most recently updated tournament, including finished ones
 */
export async function getActiveTournament(): Promise<Tournament | null> {
  try {
    const tournaments = await db.tournaments
      .orderBy('lastUpdated')
      .reverse()
      .toArray();

    return tournaments.length > 0 ? tournaments[0] : null;
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
    const tournament = await db.tournaments.get(id);
    return tournament || null;
  } catch (error) {
    console.error('Error loading tournament by ID:', error);
    throw new Error('Failed to load tournament');
  }
}

/**
 * Delete tournament from IndexedDB
 */
export async function deleteTournament(id: string): Promise<void> {
  try {
    await db.tournaments.delete(id);
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
    return await db.tournaments.orderBy('lastUpdated').reverse().toArray();
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
 * Clear all data (for development/testing)
 */
export async function clearAllData(): Promise<void> {
  try {
    await db.tournaments.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw new Error('Failed to clear data');
  }
}
