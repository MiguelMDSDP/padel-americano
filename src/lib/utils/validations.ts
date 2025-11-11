// All code in ENGLISH, UI labels in PORTUGUESE
// Validation utilities

import type { Player, Tournament, Round, Match, Position } from '../types';
import { TOURNAMENT_CONFIG } from '../constants';

/**
 * Validate player name
 */
export function validatePlayerName(name: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      error: 'Nome do jogador é obrigatório',
    };
  }

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: 'Nome deve ter pelo menos 2 caracteres',
    };
  }

  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: 'Nome deve ter no máximo 50 caracteres',
    };
  }

  return { isValid: true };
}

/**
 * Validate score
 */
export function validateScore(score: number): {
  isValid: boolean;
  error?: string;
} {
  if (score < 0) {
    return {
      isValid: false,
      error: 'Placar não pode ser negativo',
    };
  }

  if (!Number.isInteger(score)) {
    return {
      isValid: false,
      error: 'Placar deve ser um número inteiro',
    };
  }

  if (score > 99) {
    return {
      isValid: false,
      error: 'Placar muito alto (máximo 99)',
    };
  }

  return { isValid: true };
}

/**
 * Validate player count by position
 */
export function validatePlayerCount(players: Player[]): {
  isValid: boolean;
  error?: string;
  driveCount: number;
  backhandCount: number;
} {
  const driveCount = players.filter((p) => p.position === 'drive').length;
  const backhandCount = players.filter((p) => p.position === 'backhand').length;

  const isValid =
    driveCount === TOURNAMENT_CONFIG.PLAYERS_PER_POSITION &&
    backhandCount === TOURNAMENT_CONFIG.PLAYERS_PER_POSITION;

  return {
    isValid,
    error: isValid
      ? undefined
      : `É necessário ${TOURNAMENT_CONFIG.PLAYERS_PER_POSITION} jogadores de cada posição. Atual: ${driveCount} Drive, ${backhandCount} Revés`,
    driveCount,
    backhandCount,
  };
}

/**
 * Check for duplicate player names
 */
export function hasDuplicateNames(players: Player[]): {
  hasDuplicates: boolean;
  duplicates: string[];
} {
  const nameCount = new Map<string, number>();

  players.forEach((player) => {
    const normalizedName = player.name.toLowerCase().trim();
    nameCount.set(normalizedName, (nameCount.get(normalizedName) || 0) + 1);
  });

  const duplicates = Array.from(nameCount.entries())
    .filter(([_, count]) => count > 1)
    .map(([name, _]) => name);

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
  };
}

/**
 * Validate that a player can be added
 */
export function canAddPlayer(
  players: Player[],
  position: Position
): {
  canAdd: boolean;
  error?: string;
} {
  const positionCount = players.filter((p) => p.position === position).length;

  if (positionCount >= TOURNAMENT_CONFIG.PLAYERS_PER_POSITION) {
    return {
      canAdd: false,
      error: `Já existem ${TOURNAMENT_CONFIG.PLAYERS_PER_POSITION} jogadores na posição ${
        position === 'drive' ? 'Drive' : 'Revés'
      }`,
    };
  }

  return { canAdd: true };
}

/**
 * Validate that a round can be configured
 */
export function canConfigureRound(
  tournament: Tournament,
  roundNumber: number
): {
  canConfigure: boolean;
  error?: string;
} {
  // Check if round number is valid (1-5)
  if (roundNumber < 1 || roundNumber > TOURNAMENT_CONFIG.TOTAL_ROUNDS) {
    return {
      canConfigure: false,
      error: `Número de rodada inválido. Deve ser entre 1 e ${TOURNAMENT_CONFIG.TOTAL_ROUNDS}`,
    };
  }

  // Check if tournament has correct number of players
  const playerValidation = validatePlayerCount(tournament.players);
  if (!playerValidation.isValid) {
    return {
      canConfigure: false,
      error: playerValidation.error,
    };
  }

  // Check if round already exists
  const existingRound = tournament.rounds.find((r) => r.number === roundNumber);
  if (existingRound) {
    return {
      canConfigure: false,
      error: `Rodada ${roundNumber} já foi configurada`,
    };
  }

  // For rounds > 1, check if previous round is finished
  if (roundNumber > 1) {
    const previousRound = tournament.rounds.find((r) => r.number === roundNumber - 1);

    if (!previousRound) {
      return {
        canConfigure: false,
        error: `Configure a rodada ${roundNumber - 1} primeiro`,
      };
    }

    const allMatchesFinished = previousRound.matches.every(
      (m) => m.status === 'finished'
    );

    if (!allMatchesFinished) {
      return {
        canConfigure: false,
        error: `É necessário finalizar todos os jogos da rodada ${roundNumber - 1}`,
      };
    }
  }

  return { canConfigure: true };
}

/**
 * Validate that a match can be started
 */
export function canStartMatch(match: Match, round: Round): {
  canStart: boolean;
  error?: string;
} {
  if (match.status !== 'waiting') {
    return {
      canStart: false,
      error: 'Este jogo já foi iniciado ou finalizado',
    };
  }

  // Check if another match on the same court and order is in progress
  const conflictingMatch = round.matches.find(
    (m) =>
      m.id !== match.id &&
      m.court === match.court &&
      m.order === match.order &&
      m.status === 'in_progress'
  );

  if (conflictingMatch) {
    return {
      canStart: false,
      error: 'Aguarde o jogo anterior finalizar nesta quadra',
    };
  }

  return { canStart: true };
}

/**
 * Validate that a match can be finished
 */
export function canFinishMatch(match: Match): {
  canFinish: boolean;
  error?: string;
} {
  if (match.status === 'finished') {
    return {
      canFinish: false,
      error: 'Este jogo já foi finalizado',
    };
  }

  if (match.status === 'waiting') {
    return {
      canFinish: false,
      error: 'Este jogo ainda não foi iniciado',
    };
  }

  // Validate scores
  const score1Validation = validateScore(match.pair1Score);
  if (!score1Validation.isValid) {
    return {
      canFinish: false,
      error: `Placar do par 1: ${score1Validation.error}`,
    };
  }

  const score2Validation = validateScore(match.pair2Score);
  if (!score2Validation.isValid) {
    return {
      canFinish: false,
      error: `Placar do par 2: ${score2Validation.error}`,
    };
  }

  return { canFinish: true };
}

/**
 * Validate tournament structure
 */
export function validateTournament(tournament: Tournament): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate basic fields
  if (!tournament.id) errors.push('ID do torneio ausente');
  if (!tournament.name) errors.push('Nome do torneio ausente');

  // Validate players array exists
  if (!tournament.players || !Array.isArray(tournament.players)) {
    errors.push('Array de jogadores ausente ou inválido');
  } else {
    // Validate players
    const playerValidation = validatePlayerCount(tournament.players);
    if (!playerValidation.isValid) {
      errors.push(playerValidation.error!);
    }

    // Check for duplicate names
    const duplicateCheck = hasDuplicateNames(tournament.players);
    if (duplicateCheck.hasDuplicates) {
      errors.push(`Nomes duplicados encontrados: ${duplicateCheck.duplicates.join(', ')}`);
    }
  }

  // Validate rounds array exists
  if (!tournament.rounds || !Array.isArray(tournament.rounds)) {
    errors.push('Array de rodadas ausente ou inválido');
  } else {
    // Validate rounds
    if (tournament.rounds.length > TOURNAMENT_CONFIG.TOTAL_ROUNDS) {
      errors.push(`Máximo de ${TOURNAMENT_CONFIG.TOTAL_ROUNDS} rodadas permitido`);
    }

    // Validate each round
    tournament.rounds.forEach((round) => {
      if (round.matches.length !== TOURNAMENT_CONFIG.MATCHES_PER_ROUND) {
        errors.push(
          `Rodada ${round.number} deve ter ${TOURNAMENT_CONFIG.MATCHES_PER_ROUND} jogos`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
