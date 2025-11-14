// All code in ENGLISH, UI labels in PORTUGUESE
// Tournament calculation utilities

import { TournamentConfig, TournamentDuration, Court } from '../types';

/**
 * Calculates the estimated duration of a tournament based on its configuration
 *
 * @param config - Tournament configuration (players, rounds, match duration)
 * @param courts - List of courts available for the tournament
 * @returns Detailed breakdown of tournament duration
 *
 * @example
 * // 24 players, 2 courts, 5 rounds, 15min matches, 5min interval
 * const duration = calculateTournamentDuration(config, courts);
 * // Returns: {
 * //   matchesPerRound: 6,
 * //   simultaneousMatches: 2,
 * //   sequentialMatchesPerCourt: 3,
 * //   timePerRoundMinutes: 60,
 * //   totalTournamentMinutes: 300,
 * //   totalTournamentFormatted: "5h 0min"
 * // }
 */
export function calculateTournamentDuration(
  config: TournamentConfig,
  courts: Court[]
): TournamentDuration {
  const { totalPlayers, totalRounds, matchDurationMinutes, intervalMinutes } = config;
  const totalCourts = courts.length;

  // Calculations
  const pairsPerRound = totalPlayers / 2; // Each player forms a pair
  const matchesPerRound = pairsPerRound / 2; // Each match has 2 pairs (4 players)
  const simultaneousMatches = Math.min(totalCourts, matchesPerRound); // Limited by courts or matches
  const sequentialMatchesPerCourt = Math.ceil(matchesPerRound / totalCourts); // Rounds up if not evenly divisible

  // Time calculations
  const timePerMatchMinutes = matchDurationMinutes + intervalMinutes; // Each match + prep time
  const timePerRoundMinutes = sequentialMatchesPerCourt * timePerMatchMinutes;
  const totalTournamentMinutes = totalRounds * timePerRoundMinutes;

  // Format as human-readable string
  const hours = Math.floor(totalTournamentMinutes / 60);
  const minutes = totalTournamentMinutes % 60;
  const totalTournamentFormatted = `${hours}h ${minutes}min`;

  return {
    matchesPerRound,
    simultaneousMatches,
    sequentialMatchesPerCourt,
    timePerRoundMinutes,
    totalTournamentMinutes,
    totalTournamentFormatted,
  };
}

/**
 * Calculates how many players are needed per position (drive/backhand)
 *
 * @param totalPlayers - Total number of players in the tournament
 * @returns Number of players per position (always half of total)
 *
 * @example
 * getPlayersPerPosition(24) // Returns: 12
 * getPlayersPerPosition(32) // Returns: 16
 */
export function getPlayersPerPosition(totalPlayers: number): number {
  return totalPlayers / 2;
}

/**
 * Generates a list of valid player counts (multiples of 8, from 8 to 128)
 *
 * @returns Array of valid player counts: [8, 16, 24, 32, ..., 128]
 *
 * @example
 * const options = getValidPlayerCounts();
 * // Returns: [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128]
 */
export function getValidPlayerCounts(): number[] {
  const counts: number[] = [];
  for (let i = 8; i <= 128; i += 8) {
    counts.push(i);
  }
  return counts;
}

/**
 * Validates if a player count is acceptable for the tournament system
 * Must be a multiple of 8, between 8 and 128 inclusive
 *
 * @param count - Number of players to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidPlayerCount(24) // Returns: true
 * isValidPlayerCount(25) // Returns: false (not multiple of 8)
 * isValidPlayerCount(4)  // Returns: false (too few)
 * isValidPlayerCount(256) // Returns: false (too many)
 */
export function isValidPlayerCount(count: number): boolean {
  return count >= 8 && count <= 128 && count % 8 === 0;
}

/**
 * Generates a default tournament configuration
 * Useful for initializing forms or creating templates
 *
 * @returns Default configuration (24 players, 5 rounds, 15min matches, 5min interval)
 */
export function getDefaultTournamentConfig(): TournamentConfig {
  return {
    totalPlayers: 24,
    totalRounds: 5,
    matchDurationMinutes: 15,
    intervalMinutes: 5,
  };
}

/**
 * Generates default courts for a tournament
 * Creates 2 courts by default (Stone and Cresol)
 *
 * @param tournamentId - ID of the tournament these courts belong to
 * @returns Array of default courts
 */
export function getDefaultCourts(tournamentId: string): Court[] {
  return [
    {
      id: `${tournamentId}-court-stone`,
      tournamentId,
      name: 'Stone',
      color: '#3b82f6', // Blue
      order: 1,
    },
    {
      id: `${tournamentId}-court-cresol`,
      tournamentId,
      name: 'Cresol',
      color: '#10b981', // Green
      order: 2,
    },
  ];
}

/**
 * Calculates how many games each player will play in a round
 * In the Americano format, each player plays exactly once per round
 *
 * @returns Always returns 1 (each player plays once per round)
 */
export function getGamesPerPlayerPerRound(): number {
  return 1; // In Americano format, everyone plays every round
}

/**
 * Calculates total number of games a player will play in the tournament
 *
 * @param totalRounds - Number of rounds in the tournament
 * @returns Total games per player
 *
 * @example
 * getTotalGamesPerPlayer(5) // Returns: 5 (one game per round)
 */
export function getTotalGamesPerPlayer(totalRounds: number): number {
  return totalRounds * getGamesPerPlayerPerRound();
}
