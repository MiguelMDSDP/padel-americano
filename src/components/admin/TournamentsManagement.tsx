// All code in ENGLISH, UI labels in PORTUGUESE

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllTournaments } from '@/hooks/useAllTournaments';
import { deleteTournament, setTournamentActive, finalizeTournament } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trophy, Calendar, Users, Eye, Trash2, CheckCircle, XCircle, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TournamentsManagement() {
  const { tournaments, loading, refetch } = useAllTournaments();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedTournamentId) return;

    setActionLoading(true);
    try {
      await deleteTournament(selectedTournamentId);
      toast.success('Torneio deletado com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar torneio');
      console.error(error);
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedTournamentId(null);
    }
  };

  const handleSetActive = async (id: string, isActive: boolean) => {
    setActionLoading(true);
    try {
      await setTournamentActive(id, isActive);
      toast.success(isActive ? 'Torneio ativado' : 'Torneio desativado');
      refetch();
    } catch (error) {
      toast.error('Erro ao alterar status do torneio');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedTournamentId) return;

    setActionLoading(true);
    try {
      await finalizeTournament(selectedTournamentId);
      toast.success('Torneio finalizado com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao finalizar torneio');
      console.error(error);
    } finally {
      setActionLoading(false);
      setFinalizeDialogOpen(false);
      setSelectedTournamentId(null);
    }
  };

  const getStatusBadge = (tournament: any) => {
    if (!tournament.isActive && tournament.status === 'finished') {
      return <Badge variant="secondary">Finalizado</Badge>;
    }
    if (tournament.isActive && tournament.status === 'in_progress') {
      return <Badge variant="default">Ativo</Badge>;
    }
    if (tournament.status === 'setup') {
      return <Badge variant="outline">Em Preparação</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando torneios...</p>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum torneio criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie um novo torneio na aba "Jogadores"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Torneios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tournaments.map((tournament) => {
              const completedRounds = tournament.rounds.filter(r => r.status === 'finished').length;
              const totalRounds = tournament.rounds.length;

              return (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{tournament.name}</h3>
                      {getStatusBadge(tournament)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(tournament.startDate, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tournament.players.length} jogadores
                      </div>
                      <div>
                        Rodadas: {completedRounds}/{totalRounds}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* View button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/historico/${tournament.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>

                    {/* Finalize button (only if active and has rounds) */}
                    {tournament.isActive && tournament.rounds.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTournamentId(tournament.id);
                          setFinalizeDialogOpen(true);
                        }}
                        disabled={actionLoading}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Finalizar
                      </Button>
                    )}

                    {/* Activate/Deactivate button */}
                    {tournament.status === 'finished' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(tournament.id, !tournament.isActive)}
                        disabled={actionLoading}
                      >
                        {tournament.isActive ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    )}

                    {/* Delete button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedTournamentId(tournament.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este torneio? Esta ação não pode ser desfeita.
              Todos os dados de jogadores, partidas e rodadas serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finalize Confirmation Dialog */}
      <AlertDialog open={finalizeDialogOpen} onOpenChange={setFinalizeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Torneio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar este torneio? Ele será marcado como inativo
              e não aparecerá mais na tela principal. Você poderá reativá-lo depois no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalize}
              disabled={actionLoading}
            >
              {actionLoading ? 'Finalizando...' : 'Finalizar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
