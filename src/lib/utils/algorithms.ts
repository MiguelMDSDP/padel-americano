// All code in ENGLISH, UI labels in PORTUGUESE
// Tournament algorithms: draw, pairing, and scheduling

import type { Player, Pair, Match, Round, CourtType, Court, TournamentConfig } from '../types';
import { calculateRanking } from './rankings';
import { TOURNAMENT_CONFIG } from '../constants';
import { getPlayersPerPosition } from './calculations';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate unique match ID
 */
function generateMatchId(round: number, index: number): string {
  return `r${round}-m${index + 1}-${Date.now()}`;
}

/**
 * Create a pair from drive and backhand players
 */
function createPair(drivePlayer: Player, backhandPlayer: Player): Pair {
  return {
    drivePlayer,
    backhandPlayer,
  };
}

/**
 * Draw Round 1 - Random pairs with random order
 * All players participate (no one sits out)
 *
 * @param players - List of all tournament players
 * @param courts - List of courts available for the tournament
 * @param config - Tournament configuration (optional, uses defaults if not provided)
 * @returns Configured round with matches
 */
export function drawRound1(
  players: Player[],
  courts: Court[],
  config?: TournamentConfig
): Round {
  const totalPlayers = config?.totalPlayers ?? TOURNAMENT_CONFIG.TOTAL_PLAYERS;
  const playersPerPosition = getPlayersPerPosition(totalPlayers);

  // Separate players by position
  const drivePlayers = players.filter((p) => p.position === 'drive');
  const backhandPlayers = players.filter((p) => p.position === 'backhand');

  // Validate correct number of players
  if (
    drivePlayers.length !== playersPerPosition ||
    backhandPlayers.length !== playersPerPosition
  ) {
    throw new Error(
      `Invalid player count. Need ${playersPerPosition} drive and ${playersPerPosition} backhand players`
    );
  }

  // Shuffle both arrays
  const shuffledDrive = shuffleArray(drivePlayers);
  const shuffledBackhand = shuffleArray(backhandPlayers);

  // Create pairs (all players)
  const pairs: Pair[] = [];
  for (let i = 0; i < playersPerPosition; i++) {
    pairs.push(createPair(shuffledDrive[i], shuffledBackhand[i]));
  }

  // Create matches from pairs
  const matchesPerRound = totalPlayers / 4; // Each match has 4 players (2 pairs)
  const matches: Match[] = [];

  for (let i = 0; i < matchesPerRound; i++) {
    const courtIndex = i % courts.length; // Cycle through available courts
    const court = courts[courtIndex];

    // Calculate order: how many sequential matches per court
    const simultaneousMatches = Math.min(courts.length, matchesPerRound);
    const order = Math.floor(i / simultaneousMatches) + 1;

    matches.push({
      id: generateMatchId(1, i),
      round: 1,
      court: court.name, // Use court name dynamically
      pair1: pairs[i * 2],
      pair2: pairs[i * 2 + 1],
      pair1Score: 0,
      pair2Score: 0,
      status: 'waiting',
      order,
    });
  }

  // Shuffle match order
  const shuffledMatches = shuffleArray(matches);

  // Reassign court positions after shuffle
  const finalMatches = shuffledMatches.map((match, index) => {
    const courtIndex = index % courts.length;
    const simultaneousMatches = Math.min(courts.length, matchesPerRound);

    return {
      ...match,
      court: courts[courtIndex].name,
      order: Math.floor(index / simultaneousMatches) + 1,
    };
  });

  return {
    number: 1,
    matches: finalMatches,
    status: 'configured',
    configuredAt: new Date(),
  };
}

/**
 * Configure subsequent rounds (2-N) based on current ranking
 * Pairs are formed by: 1st Drive + Last Backhand, 2nd Drive + 2nd-to-last Backhand, etc.
 * Matchups are randomized - any pair can face any other pair
 * All players participate (no one sits out)
 *
 * @param players - List of all tournament players with current stats
 * @param roundNumber - Round number to configure (must be >= 2)
 * @param courts - List of courts available for the tournament
 * @param config - Tournament configuration (optional, uses defaults if not provided)
 * @returns Configured round with matches
 */
export function configureNextRound(
  players: Player[],
  roundNumber: number,
  courts: Court[],
  config?: TournamentConfig
): Round {
  const totalPlayers = config?.totalPlayers ?? TOURNAMENT_CONFIG.TOTAL_PLAYERS;
  const totalRounds = config?.totalRounds ?? TOURNAMENT_CONFIG.TOTAL_ROUNDS;
  const playersPerPosition = getPlayersPerPosition(totalPlayers);

  if (roundNumber < 2 || roundNumber > totalRounds) {
    throw new Error(`Invalid round number: ${roundNumber}. Must be between 2 and ${totalRounds}`);
  }

  // Calculate current rankings
  const driveRanking = calculateRanking(players, 'drive');
  const backhandRanking = calculateRanking(players, 'backhand');

  // Validate rankings
  if (
    driveRanking.length !== playersPerPosition ||
    backhandRanking.length !== playersPerPosition
  ) {
    throw new Error(`Invalid player count for ranking. Expected ${playersPerPosition} per position`);
  }

  // Create balanced pairs based on ranking
  // Pattern: 1st + Last, 2nd + 2nd-to-last, 3rd + 3rd-to-last, etc.
  const pairs: Pair[] = [];

  for (let i = 0; i < playersPerPosition; i++) {
    const drivePlayer = driveRanking[i];
    const backhandPlayer = backhandRanking[playersPerPosition - 1 - i];

    pairs.push(createPair(drivePlayer, backhandPlayer));
  }

  // Shuffle pairs to randomize matchups
  const shuffledPairs = shuffleArray(pairs);

  // Create matches from shuffled pairs
  // Each match pairs consecutive teams from shuffled array
  const matchesPerRound = totalPlayers / 4;
  const matches: Match[] = [];

  for (let i = 0; i < matchesPerRound; i++) {
    const pairA = shuffledPairs[i * 2]; // First pair of match
    const pairB = shuffledPairs[i * 2 + 1]; // Second pair of match

    const courtIndex = i % courts.length;
    const court = courts[courtIndex];

    // Calculate order: how many sequential matches per court
    const simultaneousMatches = Math.min(courts.length, matchesPerRound);
    const order = Math.floor(i / simultaneousMatches) + 1;

    matches.push({
      id: generateMatchId(roundNumber, i),
      round: roundNumber,
      court: court.name, // Use court name dynamically
      pair1: pairA,
      pair2: pairB,
      pair1Score: 0,
      pair2Score: 0,
      status: 'waiting',
      order,
    });
  }

  // Shuffle match order
  const shuffledMatches = shuffleArray(matches);

  // Reassign court positions after shuffle
  const finalMatches = shuffledMatches.map((match, index) => {
    const courtIndex = index % courts.length;
    const simultaneousMatches = Math.min(courts.length, matchesPerRound);

    return {
      ...match,
      court: courts[courtIndex].name,
      order: Math.floor(index / simultaneousMatches) + 1,
    };
  });

  return {
    number: roundNumber,
    matches: finalMatches,
    status: 'configured',
    configuredAt: new Date(),
  };
}

/**
 * Validate that all players play exactly once in a round
 */
export function validateRound(round: Round, totalPlayers: number): boolean {
  const playerIds = new Set<string>();

  for (const match of round.matches) {
    const ids = [
      match.pair1.drivePlayer.id,
      match.pair1.backhandPlayer.id,
      match.pair2.drivePlayer.id,
      match.pair2.backhandPlayer.id,
    ];

    // Check for duplicates within this match's set
    for (const id of ids) {
      if (playerIds.has(id)) {
        return false; // Player plays more than once
      }
      playerIds.add(id);
    }
  }

  // Check that all players are included
  return playerIds.size === totalPlayers;
}

/**
 * Check if a round is complete (all matches finished)
 */
export function isRoundComplete(round: Round): boolean {
  return round.matches.every((match) => match.status === 'finished');
}

/**
 * Get matches by court
 */
export function getMatchesByCourt(
  matches: Match[],
  court: CourtType
): Match[] {
  return matches.filter((m) => m.court === court);
}

/**
 * Get next waiting match on a court
 */
export function getNextMatch(matches: Match[], court: CourtType): Match | null {
  const courtMatches = getMatchesByCourt(matches, court);
  const waitingMatches = courtMatches.filter((m) => m.status === 'waiting');

  if (waitingMatches.length === 0) return null;

  // Return match with lowest order
  return waitingMatches.reduce((prev, curr) =>
    prev.order < curr.order ? prev : curr
  );
}

/**
 * Get current match in progress on a court
 */
export function getCurrentMatch(
  matches: Match[],
  court: CourtType
): Match | null {
  const courtMatches = getMatchesByCourt(matches, court);
  return courtMatches.find((m) => m.status === 'in_progress') || null;
}
