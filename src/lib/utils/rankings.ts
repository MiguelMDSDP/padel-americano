// All code in ENGLISH, UI labels in PORTUGUESE
// Ranking calculation and player stats utilities

import type { Player, Position, RankingEntry } from '../types';
import { POINTS_SYSTEM } from '../constants';

/**
 * Calculate ranking for players of a specific position
 * Criteria (in order):
 * 1. Total points (wins/draws)
 * 2. Point balance (scored - conceded)
 * 3. Total points scored
 */
export function calculateRanking(
  players: Player[],
  position: Position
): RankingEntry[] {
  // Filter players by position
  const filteredPlayers = players.filter((p) => p.position === position);

  // Sort by ranking criteria
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    // 1. Compare total points
    if (a.points !== b.points) {
      return b.points - a.points; // Higher points first
    }

    // 2. Compare balance
    if (a.balance !== b.balance) {
      return b.balance - a.balance; // Higher balance first
    }

    // 3. Compare scored
    return b.scored - a.scored; // Higher scored first
  });

  // Add ranking position numbers
  return sortedPlayers.map((player, index) => ({
    ...player,
    rankPosition: index + 1,
  }));
}

/**
 * Update player stats after a match
 */
export function updatePlayerStats(
  player: Player,
  scored: number,
  conceded: number
): Player {
  const updatedPlayer = { ...player };

  // Update scored and conceded
  updatedPlayer.scored += scored;
  updatedPlayer.conceded += conceded;
  updatedPlayer.balance = updatedPlayer.scored - updatedPlayer.conceded;
  updatedPlayer.gamesPlayed += 1;

  // Determine result and update points
  if (scored > conceded) {
    // Win
    updatedPlayer.wins += 1;
    updatedPlayer.points += POINTS_SYSTEM.WIN;
  } else if (scored === conceded) {
    // Draw
    updatedPlayer.draws += 1;
    updatedPlayer.points += POINTS_SYSTEM.DRAW;
  } else {
    // Loss
    updatedPlayer.losses += 1;
    updatedPlayer.points += POINTS_SYSTEM.LOSS;
  }

  return updatedPlayer;
}

/**
 * Create a new player with initial stats
 */
export function createPlayer(id: string, name: string, position: Position): Player {
  return {
    id,
    name,
    position,
    points: 0,
    balance: 0,
    scored: 0,
    conceded: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gamesPlayed: 0,
  };
}

/**
 * Get all players' current stats
 */
export function getAllPlayersStats(players: Player[]): {
  drive: RankingEntry[];
  backhand: RankingEntry[];
} {
  return {
    drive: calculateRanking(players, 'drive'),
    backhand: calculateRanking(players, 'backhand'),
  };
}

/**
 * Validate if ranking has ties and needs manual intervention
 */
export function hasTiebreakIssues(ranking: RankingEntry[]): boolean {
  for (let i = 0; i < ranking.length - 1; i++) {
    const current = ranking[i];
    const next = ranking[i + 1];

    if (
      current.points === next.points &&
      current.balance === next.balance &&
      current.scored === next.scored
    ) {
      return true; // Perfect tie found
    }
  }

  return false;
}

/**
 * Get player by ID from array
 */
export function getPlayerById(players: Player[], id: string): Player | null {
  return players.find((p) => p.id === id) || null;
}

/**
 * Update multiple players at once
 */
export function updatePlayers(
  allPlayers: Player[],
  playersToUpdate: Player[]
): Player[] {
  const updatedPlayersMap = new Map(playersToUpdate.map((p) => [p.id, p]));

  return allPlayers.map((player) => {
    const updated = updatedPlayersMap.get(player.id);
    return updated || player;
  });
}
