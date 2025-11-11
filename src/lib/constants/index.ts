// All code in ENGLISH, UI labels in PORTUGUESE
// Constants for PadelAmericano BR Tournament System

// Admin credentials (hard-coded for v1)
export const ADMIN_CREDENTIALS = {
  username: 'admin-americano-br',
  password: 'team-miguel-lives',
} as const;

// Tournament configuration
export const TOURNAMENT_CONFIG = {
  TOTAL_PLAYERS: 24,
  PLAYERS_PER_POSITION: 12,
  TOTAL_ROUNDS: 5,
  MATCHES_PER_ROUND: 6,
  MATCH_DURATION_MINUTES: 15,
  COURTS: ['stone', 'cresol'] as const,
} as const;

// Points system
export const POINTS_SYSTEM = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
} as const;

// UI Messages in PORTUGUESE
export const MESSAGES = {
  // Success messages
  SAVE_SUCCESS: 'Torneio salvo com sucesso!',
  PLAYER_ADDED: 'Jogador adicionado com sucesso!',
  PLAYER_UPDATED: 'Jogador atualizado com sucesso!',
  PLAYER_DELETED: 'Jogador removido com sucesso!',
  ROUND_CONFIGURED: 'Rodada configurada com sucesso!',
  MATCH_STARTED: 'Jogo iniciado!',
  MATCH_FINISHED: 'Jogo finalizado!',
  SCORE_UPDATED: 'Placar atualizado!',
  TOURNAMENT_EXPORTED: 'Torneio exportado com sucesso!',
  TOURNAMENT_IMPORTED: 'Torneio importado com sucesso!',

  // Error messages
  VALIDATION_ERROR: 'Erro de validação',
  SAVE_ERROR: 'Erro ao salvar o torneio',
  LOAD_ERROR: 'Erro ao carregar o torneio',
  INVALID_CREDENTIALS: 'Usuário ou senha inválidos',
  PLAYERS_COUNT_ERROR: 'É necessário cadastrar exatamente 12 jogadores de cada posição',
  PLAYER_NAME_REQUIRED: 'Nome do jogador é obrigatório',
  ROUND_NOT_FINISHED: 'É necessário finalizar todos os jogos da rodada atual',
  INVALID_SCORE: 'Placar inválido',
  DUPLICATE_PLAYER: 'Um jogador não pode jogar duas vezes na mesma rodada',
  IMPORT_ERROR: 'Erro ao importar torneio. Verifique o arquivo.',

  // Info messages
  LOADING: 'Carregando...',
  NO_TOURNAMENT: 'Nenhum torneio em andamento',
  NO_MATCHES: 'Nenhum jogo disponível',
  CONFIGURE_ROUND: 'Configure a próxima rodada',
  ALL_ROUNDS_COMPLETE: 'Todas as rodadas foram concluídas!',

  // Confirmation messages
  CONFIRM_DELETE_PLAYER: 'Tem certeza que deseja remover este jogador?',
  CONFIRM_FINISH_MATCH: 'Tem certeza que deseja finalizar este jogo?',
  CONFIRM_CONFIGURE_ROUND: 'Deseja configurar a rodada {round}?',
  CONFIRM_IMPORT: 'Importar este torneio irá substituir o torneio atual. Deseja continuar?',
} as const;

// Position labels in PORTUGUESE
export const POSITION_LABELS = {
  drive: 'Drive',
  backhand: 'Revés',
} as const;

// Court labels in PORTUGUESE
export const COURT_LABELS = {
  stone: 'Stone',
  cresol: 'Cresol',
} as const;

// Status labels in PORTUGUESE
export const STATUS_LABELS = {
  waiting: 'Aguardando',
  in_progress: 'Em Andamento',
  finished: 'Finalizado',
  setup: 'Configuração',
  configured: 'Configurado',
} as const;
