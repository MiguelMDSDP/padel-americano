// All code in ENGLISH, UI labels in PORTUGUESE

import { useState } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { saveTournament } from '@/lib/db';
import { updatePlayerStats } from '@/lib/utils/rankings';
import type { Tournament, Round, Match } from '@/lib/types';
import { TOURNAMENT_CONFIG } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchControl } from '@/components/admin/MatchControl';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);

  // Live sync with Supabase
  const { tournament } = useTournament();

  /**
   * Finish match and update player stats
   */
  const handleMatchFinish = async (matchId: string, pair1Score: number, pair2Score: number) => {
    if (!tournament) return;

    setLoading(true);
    try {
      // CRITICAL FIX: Always fetch the latest tournament data from the database
      // to avoid race conditions when finishing multiple matches quickly
      const latestTournament = await getActiveTournament();
      if (!latestTournament) {
        toast.error('Torneio não encontrado');
        return;
      }

      const currentRound = latestTournament.rounds[latestTournament.rounds.length - 1];
      if (!currentRound) return;

      const match = currentRound.matches.find((m) => m.id === matchId);
      if (!match) return;

      // CRITICAL FIX: Use the scores passed as parameters from MatchControl
      // This ensures we use the most up-to-date scores, avoiding race condition with auto-save
      const finalPair1Score = pair1Score;
      const finalPair2Score = pair2Score;

      // Update player stats using the final scores
      const updatedPlayers = latestTournament.players.map((player) => {
        // Check if player is in pair1
        if (player.id === match.pair1.drivePlayer.id || player.id === match.pair1.backhandPlayer.id) {
          return updatePlayerStats(player, finalPair1Score, finalPair2Score);
        }
        // Check if player is in pair2
        if (player.id === match.pair2.drivePlayer.id || player.id === match.pair2.backhandPlayer.id) {
          return updatePlayerStats(player, finalPair2Score, finalPair1Score);
        }
        return player;
      });

      // Update match status and scores
      const updatedMatches = currentRound.matches.map((m) =>
        m.id === matchId
          ? {
              ...m,
              pair1Score: finalPair1Score,
              pair2Score: finalPair2Score,
              status: 'finished' as const,
              endTime: new Date()
            }
          : m
      );

      // Check if all matches are finished
      const allFinished = updatedMatches.every((m) => m.status === 'finished');

      const updatedRounds = [...latestTournament.rounds];
      updatedRounds[updatedRounds.length - 1] = {
        ...currentRound,
        matches: updatedMatches,
        status: allFinished ? ('finished' as const) : ('in_progress' as const),
      };

      const updated: Tournament = {
        ...latestTournament,
        players: updatedPlayers,
        rounds: updatedRounds,
        status:
          latestTournament.rounds.length === TOURNAMENT_CONFIG.TOTAL_ROUNDS && allFinished
            ? 'finished'
            : 'in_progress',
      };

      await saveTournament(updated);
      setTournament(updated);
    } catch (err) {
      console.error('Error finishing match:', err);
      toast.error('Erro ao finalizar jogo');
    } finally {
      setLoading(false);
    }
  };

  // No tournament state
  if (!tournament) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg">Nenhum torneio ativo</p>
          <p className="text-sm mt-2">Crie um novo torneio na aba Jogadores</p>
        </CardContent>
      </Card>
    );
  }

  const currentRound = tournament.rounds[tournament.rounds.length - 1];

  // No rounds yet
  if (!currentRound) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg">Nenhuma rodada configurada</p>
          <p className="text-sm mt-2">
            Configure a primeira rodada após cadastrar todos os jogadores
          </p>
        </CardContent>
      </Card>
    );
  }

  const finishedMatches = currentRound.matches.filter((m) => m.status === 'finished').length;
  const totalMatches = currentRound.matches.length;
  const roundFinished = currentRound.status === 'finished';

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Rodada {currentRound.number} de {TOURNAMENT_CONFIG.TOTAL_ROUNDS}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {finishedMatches} de {totalMatches} jogos finalizados
              </p>
            </div>
            {roundFinished && (
              <Badge variant="default" className="bg-green-600">
                ✓ Rodada Finalizada
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Matches Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {currentRound.matches.map((match) => (
          <MatchControl
            key={match.id}
            match={match}
            onFinish={handleMatchFinish}
          />
        ))}
      </div>

      {/* Next Round Indicator */}
      {roundFinished && currentRound.number < TOURNAMENT_CONFIG.TOTAL_ROUNDS && (
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-6 text-center">
            <p className="text-lg font-semibold">
              ✓ Rodada finalizada! Configure a próxima rodada para continuar o torneio.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tournament Finished */}
      {tournament.status === 'finished' && (
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardContent className="py-8 text-center">
            <p className="text-2xl font-bold mb-2">🏆 Torneio Finalizado!</p>
            <p className="text-lg">Todas as {TOURNAMENT_CONFIG.TOTAL_ROUNDS} rodadas foram completadas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
