// All code in ENGLISH, UI labels in PORTUGUESE
// Type definitions for PadelAmericano BR Tournament System

export type Position = 'drive' | 'backhand';
export type CourtType = 'stone' | 'cresol';
export type MatchStatus = 'waiting' | 'in_progress' | 'finished';
export type RoundStatus = 'configured' | 'in_progress' | 'finished';
export type TournamentStatus = 'setup' | 'in_progress' | 'finished';

export interface Player {
  id: string;
  name: string;
  position: Position;
  points: number;
  balance: number; // scored - conceded
  scored: number;
  conceded: number;
  wins: number;
  draws: number;
  losses: number;
  gamesPlayed: number;
}

export interface Pair {
  drivePlayer: Player;
  backhandPlayer: Player;
}

export interface Match {
  id: string;
  round: number;
  court: CourtType;
  pair1: Pair;
  pair2: Pair;
  pair1Score: number;
  pair2Score: number;
  status: MatchStatus;
  order: number; // Match order on the court (1, 2, 3, ...)
  startTime?: Date;
  endTime?: Date;
}

export interface Round {
  number: number;
  matches: Match[];
  status: RoundStatus;
  configuredAt?: Date;
}

export interface Tournament {
  id: string;
  name: string;
  startDate: Date;
  players: Player[];
  rounds: Round[];
  status: TournamentStatus;
  isActive: boolean; // Controls if tournament is currently active/visible
  lastUpdated: Date;
}

// Helper type for ranking display
export interface RankingEntry extends Player {
  rankPosition: number; // ranking position 1-12 (renamed to avoid conflict with Player.position)
}

// Type for match result update
export interface MatchResult {
  matchId: string;
  pair1Score: number;
  pair2Score: number;
}

// Type for player creation
export interface CreatePlayerInput {
  name: string;
  position: Position;
}
