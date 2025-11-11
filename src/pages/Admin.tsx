// All code in ENGLISH, UI labels in PORTUGUESE

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '@/hooks/useTournament';
import { useAuth } from '@/contexts/AuthContext';
import { saveTournament } from '@/lib/db';
import type { Tournament, Round } from '@/lib/types';
import { TOURNAMENT_CONFIG } from '@/lib/constants';
import { Trophy, Users, Settings, LogOut, LayoutDashboard, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { PlayersManagement } from '@/components/admin/PlayersManagement';
import { RoundConfigurator } from '@/components/admin/RoundConfigurator';
import { TournamentsManagement } from '@/components/admin/TournamentsManagement';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('players');
  const [showRoundConfig, setShowRoundConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [tournamentName, setTournamentName] = useState('');

  // Live sync with Supabase
  const { tournament } = useTournament();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  /**
   * Open create tournament dialog
   */
  const handleOpenCreateDialog = () => {
    setTournamentName(`Torneio ${new Date().toLocaleDateString('pt-BR')}`);
    setShowCreateDialog(true);
  };

  /**
   * Create new tournament
   */
  const handleCreateTournament = async () => {
    const trimmedName = tournamentName.trim();

    if (!trimmedName) {
      toast.error('O nome do torneio não pode estar vazio');
      return;
    }

    if (trimmedName.length < 3) {
      toast.error('O nome do torneio deve ter pelo menos 3 caracteres');
      return;
    }

    setLoading(true);
    try {
      const newTournament: Tournament = {
        id: `tournament-${Date.now()}`,
        name: trimmedName,
        startDate: new Date(),
        players: [],
        rounds: [],
        status: 'setup',
        isActive: true,
        lastUpdated: new Date(),
      };
      await saveTournament(newTournament);
      toast.success('Torneio criado com sucesso!');
      setShowCreateDialog(false);
      setTournamentName('');
    } catch (err) {
      console.error('Error creating tournament:', err);
      toast.error('Erro ao criar torneio');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle round confirmation from RoundConfigurator
   */
  const handleRoundConfirmed = async (round: Round) => {
    if (!tournament) return;

    setLoading(true);
    try {
      const updated: Tournament = {
        ...tournament,
        rounds: [...tournament.rounds, round],
        status: 'in_progress',
        lastUpdated: new Date(),
      };
      await saveTournament(updated);
      setShowRoundConfig(false);
      toast.success(`Rodada ${round.number} configurada com sucesso!`);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Error confirming round:', err);
      toast.error('Erro ao configurar rodada');
    } finally {
      setLoading(false);
    }
  };

  // Computed state
  const currentRound = tournament?.rounds[tournament.rounds.length - 1];
  const currentRoundNumber = tournament?.rounds.length || 0;
  const nextRoundNumber = currentRoundNumber + 1;

  const driveCount = tournament?.players.filter((p) => p.position === 'drive').length || 0;
  const backhandCount = tournament?.players.filter((p) => p.position === 'backhand').length || 0;
  const totalPlayers = driveCount + backhandCount;
  const hasAllPlayers = totalPlayers === TOURNAMENT_CONFIG.TOTAL_PLAYERS;

  const canConfigureNewRound =
    tournament &&
    hasAllPlayers &&
    (!currentRound || currentRound.status === 'finished') &&
    nextRoundNumber <= TOURNAMENT_CONFIG.TOTAL_ROUNDS;

  const hasMatchesInProgress = currentRound && currentRound.status !== 'finished';
  const tournamentFinished = tournament?.status === 'finished';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Painel Admin</h1>
                <p className="text-sm text-muted-foreground">
                  {tournament ? tournament.name : 'Torneio Stone & Cresol'}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* No Tournament State */}
        {!tournament ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Nenhum torneio ativo</h2>
                <p className="text-muted-foreground">
                  Crie um novo torneio para começar a gerenciar jogadores e rodadas
                </p>
              </div>
              <Button onClick={handleOpenCreateDialog} disabled={loading} size="lg">
                ➕ Criar Novo Torneio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-4xl grid-cols-4">
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jogadores
                <Badge variant="secondary" className="ml-1">
                  {totalPlayers}/24
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rounds" className="flex items-center gap-2" disabled={!hasAllPlayers && tournament.rounds.length === 0}>
                <Dices className="w-4 h-4" />
                Rodadas
                {canConfigureNewRound && (
                  <span className="h-2 w-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2" disabled={!hasMatchesInProgress}>
                <LayoutDashboard className="w-4 h-4" />
                Jogos
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Torneios
              </TabsTrigger>
            </TabsList>

            {/* Players Tab */}
            <TabsContent value="players">
              <div className="space-y-6">
                {/* Tournament Status */}
                {hasAllPlayers && tournament.status === 'setup' && (
                  <Card className="border-l-4 border-green-500 bg-green-50">
                    <CardContent className="py-4">
                      <p className="text-green-900 font-semibold flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        Todos os jogadores cadastrados! Vá para a aba "Rodadas" para sortear a Rodada 1.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!hasAllPlayers && tournament.status === 'setup' && (
                  <Card className="border-l-4 border-yellow-500 bg-yellow-50">
                    <CardContent className="py-4">
                      <p className="text-yellow-900 font-semibold flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        Adicione {TOURNAMENT_CONFIG.TOTAL_PLAYERS - totalPlayers} jogadores para sortear a Rodada 1
                      </p>
                    </CardContent>
                  </Card>
                )}

                <PlayersManagement />
              </div>
            </TabsContent>

            {/* Rounds Tab */}
            <TabsContent value="rounds">
              <div className="space-y-6">
                {/* Current Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Gerenciar Rodadas</span>
                      <Badge variant="outline">
                        {currentRoundNumber}/{TOURNAMENT_CONFIG.TOTAL_ROUNDS}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tournament.rounds.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Nenhuma rodada configurada ainda</p>
                        {hasAllPlayers ? (
                          <Button onClick={() => setShowRoundConfig(true)} size="lg">
                            🎲 Sortear Rodada 1
                          </Button>
                        ) : (
                          <p className="text-sm text-yellow-600">
                            Complete o cadastro de 24 jogadores primeiro
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              Rodada Atual: {currentRoundNumber} de {TOURNAMENT_CONFIG.TOTAL_ROUNDS}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${
                                currentRound?.status === 'finished' ? 'text-green-600' : 'text-yellow-600'
                              }`}
                            >
                              Status:{' '}
                              {currentRound?.status === 'finished' ? '✓ Finalizada' : '⏳ Em Andamento'}
                            </p>
                          </div>

                          {canConfigureNewRound && (
                            <Button
                              onClick={() => setShowRoundConfig(true)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              ⚙️ Configurar Rodada {nextRoundNumber}
                            </Button>
                          )}
                        </div>

                        {tournamentFinished && (
                          <Card className="border-l-4 border-primary bg-primary/5">
                            <CardContent className="py-4">
                              <p className="text-primary font-semibold">
                                🏆 Torneio finalizado! Todas as {TOURNAMENT_CONFIG.TOTAL_ROUNDS} rodadas foram
                                completadas.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Round Configurator Modal */}
                {showRoundConfig && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                      <RoundConfigurator
                        tournament={tournament}
                        roundNumber={nextRoundNumber}
                        onConfirm={handleRoundConfirmed}
                        onCancel={() => setShowRoundConfig(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Dashboard Tab (Matches) */}
            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>

            {/* Tournaments Tab (Management) */}
            <TabsContent value="tournaments">
              <TournamentsManagement />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Create Tournament Dialog */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Criar Novo Torneio</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha um nome para o novo torneio. Você poderá adicionar jogadores e configurar rodadas depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTournament();
                }
              }}
              placeholder="Nome do Torneio"
              maxLength={100}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateTournament}
              disabled={loading || !tournamentName.trim()}
            >
              {loading ? 'Criando...' : 'Criar Torneio'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
