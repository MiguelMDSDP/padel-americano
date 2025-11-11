// All code in ENGLISH, UI labels in PORTUGUESE

import { useState, useMemo } from 'react';
import { useTournament } from '@/hooks/useTournament';
import type { Player, Position } from '@/lib/types';
import { saveTournament } from '@/lib/db';
import { createPlayer } from '@/lib/utils/rankings';
import { validatePlayerName, canAddPlayer } from '@/lib/utils/validations';
import { TOURNAMENT_CONFIG } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export function PlayersManagement() {
  const { tournament } = useTournament();

  // Form state
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState<Position>('drive');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Calculate player counts
  const drivePlayers = useMemo(
    () => tournament?.players.filter((p) => p.position === 'drive') || [],
    [tournament?.players]
  );

  const backhandPlayers = useMemo(
    () => tournament?.players.filter((p) => p.position === 'backhand') || [],
    [tournament?.players]
  );

  const driveCount = drivePlayers.length;
  const backhandCount = backhandPlayers.length;
  const maxPlayers = TOURNAMENT_CONFIG.PLAYERS_PER_POSITION;

  /**
   * Handle adding a new player
   */
  const handleAddPlayer = async () => {
    if (!tournament) return;

    const trimmedName = playerName.trim();

    // Validate name
    const nameValidation = validatePlayerName(trimmedName);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error!);
      return;
    }

    // Check if can add player for this position
    const canAdd = canAddPlayer(tournament.players, position);
    if (!canAdd.canAdd) {
      toast.error(canAdd.error!);
      return;
    }

    // Check for duplicate names (case-insensitive)
    const duplicateCheck = tournament.players.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicateCheck) {
      toast.error(`Jogador "${trimmedName}" já está cadastrado`);
      return;
    }

    // Create new player with unique ID
    const newPlayer = createPlayer(
      `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trimmedName,
      position
    );

    // Update tournament
    const updatedTournament = {
      ...tournament,
      players: [...tournament.players, newPlayer],
      lastUpdated: new Date(),
    };

    await saveTournament(updatedTournament);
    toast.success(`Jogador ${trimmedName} adicionado com sucesso!`);

    // Clear form
    setPlayerName('');
  };

  /**
   * Handle deleting a player
   */
  const handleDeletePlayer = async (playerId: string) => {
    if (!tournament) return;

    const player = tournament.players.find((p) => p.id === playerId);
    if (!player) return;

    // Check if tournament has started (has rounds)
    if (tournament.rounds.length > 0) {
      toast.error('Não é possível remover jogadores após iniciar o torneio');
      return;
    }

    // Update tournament
    const updatedTournament = {
      ...tournament,
      players: tournament.players.filter((p) => p.id !== playerId),
      lastUpdated: new Date(),
    };

    await saveTournament(updatedTournament);
    toast.success(`Jogador ${player.name} removido com sucesso`);

    // Clear confirmation
    setConfirmDelete(null);
  };

  /**
   * Filter players by search term
   */
  const filterPlayers = (players: Player[]) => {
    if (!searchTerm) return players;

    return players.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredDrivePlayers = filterPlayers(drivePlayers);
  const filteredBackhandPlayers = filterPlayers(backhandPlayers);

  if (!tournament) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Player Form */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Jogador</h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Name Input */}
              <div className="flex-1">
                <Input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPlayer();
                    }
                  }}
                  placeholder="Nome do Jogador"
                  maxLength={50}
                />
              </div>

              {/* Position Select */}
              <Select value={position} onValueChange={(val) => setPosition(val as Position)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drive">Drive</SelectItem>
                  <SelectItem value="backhand">Revés</SelectItem>
                </SelectContent>
              </Select>

              {/* Add Button */}
              <Button
                onClick={handleAddPlayer}
                disabled={!playerName.trim()}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Player Counter */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Drive:</span>
              <Badge
                variant={driveCount === maxPlayers ? "default" : "secondary"}
                className="text-base px-3 py-1"
              >
                {driveCount}/{maxPlayers}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Revés:</span>
              <Badge
                variant={backhandCount === maxPlayers ? "default" : "secondary"}
                className="text-base px-3 py-1"
              >
                {backhandCount}/{maxPlayers}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Total:</span>
              <Badge
                variant={driveCount + backhandCount === maxPlayers * 2 ? "default" : "outline"}
                className="text-base px-3 py-1"
              >
                {driveCount + backhandCount}/{maxPlayers * 2}
              </Badge>
            </div>
          </div>

          {/* Search Filter */}
          {tournament.players.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar jogador por nome..."
                className="pl-10"
              />
            </div>
          )}

          {/* Players Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Drive Players */}
            <PlayerList
              title="Drive"
              players={filteredDrivePlayers}
              count={driveCount}
              maxCount={maxPlayers}
              onDelete={handleDeletePlayer}
              confirmDelete={confirmDelete}
              setConfirmDelete={setConfirmDelete}
              searchTerm={searchTerm}
            />

            {/* Backhand Players */}
            <PlayerList
              title="Revés"
              players={filteredBackhandPlayers}
              count={backhandCount}
              maxCount={maxPlayers}
              onDelete={handleDeletePlayer}
              confirmDelete={confirmDelete}
              setConfirmDelete={setConfirmDelete}
              searchTerm={searchTerm}
            />
          </div>

          {/* Empty State */}
          {tournament.players.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum jogador cadastrado ainda.</p>
              <p className="text-sm mt-2">
                Adicione 24 jogadores (12 Drive + 12 Revés) para começar o torneio.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * PlayerList Sub-component
 * Displays a list of players for a specific position
 */
interface PlayerListProps {
  title: string;
  players: Player[];
  count: number;
  maxCount: number;
  onDelete: (playerId: string) => void;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  searchTerm: string;
}

function PlayerList({
  title,
  players,
  count,
  maxCount,
  onDelete,
  confirmDelete,
  setConfirmDelete,
  searchTerm,
}: PlayerListProps) {
  return (
    <Card>
      {/* Header */}
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-lg">
          {title} ({count}/{maxCount})
        </CardTitle>
      </CardHeader>

      {/* Player List */}
      <CardContent className="p-0">
        <div className="divide-y max-h-96 overflow-y-auto">
          {players.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {searchTerm
                ? 'Nenhum jogador encontrado'
                : `Nenhum jogador cadastrado em ${title}`}
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>

                {/* Delete Button */}
                {confirmDelete === player.id ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(player.id)}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDelete(player.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Remover jogador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
