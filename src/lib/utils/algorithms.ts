// All code in ENGLISH, UI labels in PORTUGUESE
// Tournament algorithms: draw, pairing, and scheduling

import type { Player, Pair, Match, Round, CourtType } from '../types';
import { calculateRanking } from './rankings';
import { TOURNAMENT_CONFIG } from '../constants';

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
 * All 24 players participate (no one sits out)
 */
export function drawRound1(players: Player[]): Round {
  // Separate players by position
  const drivePlayers = players.filter((p) => p.position === 'drive');
  const backhandPlayers = players.filter((p) => p.position === 'backhand');

  // Validate correct number of players
  if (
    drivePlayers.length !== TOURNAMENT_CONFIG.PLAYERS_PER_POSITION ||
    backhandPlayers.length !== TOURNAMENT_CONFIG.PLAYERS_PER_POSITION
  ) {
    throw new Error(
      `Invalid player count. Need ${TOURNAMENT_CONFIG.PLAYERS_PER_POSITION} drive and ${TOURNAMENT_CONFIG.PLAYERS_PER_POSITION} backhand players`
    );
  }

  // Shuffle both arrays
  const shuffledDrive = shuffleArray(drivePlayers);
  const shuffledBackhand = shuffleArray(backhandPlayers);

  // Create 12 pairs (all 24 players)
  const pairs: Pair[] = [];
  for (let i = 0; i < TOURNAMENT_CONFIG.PLAYERS_PER_POSITION; i++) {
    pairs.push(createPair(shuffledDrive[i], shuffledBackhand[i]));
  }

  // Create 6 matches from 12 pairs
  const matches: Match[] = [];
  const courts: CourtType[] = ['stone', 'cresol'];

  for (let i = 0; i < TOURNAMENT_CONFIG.MATCHES_PER_ROUND; i++) {
    const court = courts[i % 2]; // Alternate between courts
    const order = Math.floor(i / 2) + 1; // 1, 1, 2, 2, 3, 3

    matches.push({
      id: generateMatchId(1, i),
      round: 1,
      court,
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
  const finalMatches = shuffledMatches.map((match, index) => ({
    ...match,
    court: courts[index % 2],
    order: Math.floor(index / 2) + 1,
  }));

  return {
    number: 1,
    matches: finalMatches,
    status: 'configured',
    configuredAt: new Date(),
  };
}

/**
 * Configure rounds 2-5 based on current ranking
 * Pairs are formed by: 1st Drive + 12th Backhand, 2nd Drive + 11th Backhand, etc.
 * Matchups are randomized - any pair can face any other pair
 * All 24 players participate (no one sits out)
 */
export function configureNextRound(
  players: Player[],
  roundNumber: number
): Round {
  if (roundNumber < 2 || roundNumber > TOURNAMENT_CONFIG.TOTAL_ROUNDS) {
    throw new Error(`Invalid round number: ${roundNumber}`);
  }

  // Calculate current rankings
  const driveRanking = calculateRanking(players, 'drive');
  const backhandRanking = calculateRanking(players, 'backhand');

  // Validate rankings
  if (
    driveRanking.length !== TOURNAMENT_CONFIG.PLAYERS_PER_POSITION ||
    backhandRanking.length !== TOURNAMENT_CONFIG.PLAYERS_PER_POSITION
  ) {
    throw new Error('Invalid player count for ranking');
  }

  // Create balanced pairs based on ranking
  // Pattern: 1st + 12th, 2nd + 11th, 3rd + 10th, etc.
  const pairs: Pair[] = [];

  for (let i = 0; i < TOURNAMENT_CONFIG.PLAYERS_PER_POSITION; i++) {
    const drivePlayer = driveRanking[i];
    const backhandPlayer = backhandRanking[TOURNAMENT_CONFIG.PLAYERS_PER_POSITION - 1 - i];

    pairs.push(createPair(drivePlayer, backhandPlayer));
  }

  // Shuffle pairs to randomize matchups
  const shuffledPairs = shuffleArray(pairs);

  // Create 6 matches from shuffled pairs
  // Each match pairs consecutive teams from shuffled array
  const matches: Match[] = [];
  const courts: CourtType[] = ['stone', 'cresol'];

  for (let i = 0; i < TOURNAMENT_CONFIG.MATCHES_PER_ROUND; i++) {
    const pairA = shuffledPairs[i * 2]; // First pair of match
    const pairB = shuffledPairs[i * 2 + 1]; // Second pair of match

    const court = courts[i % 2];
    const order = Math.floor(i / 2) + 1;

    matches.push({
      id: generateMatchId(roundNumber, i),
      round: roundNumber,
      court,
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
  const finalMatches = shuffledMatches.map((match, index) => ({
    ...match,
    court: courts[index % 2],
    order: Math.floor(index / 2) + 1,
  }));

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
