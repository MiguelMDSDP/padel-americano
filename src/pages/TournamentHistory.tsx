// All code in ENGLISH, UI labels in PORTUGUESE

import { useAllTournaments } from "@/hooks/useAllTournaments";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TournamentHistory() {
  const { tournaments, loading, refetch } = useAllTournaments();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            Carregando histórico...
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (tournament: any) => {
    if (!tournament.isActive && tournament.status === 'finished') {
      return <Badge variant="secondary">Finalizado</Badge>;
    }
    if (tournament.isActive && tournament.status === 'in_progress') {
      return <Badge variant="default">Em Andamento</Badge>;
    }
    if (tournament.status === 'setup') {
      return <Badge variant="outline">Em Preparação</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  const getWinner = (tournament: any) => {
    if (tournament.status !== 'finished' || !tournament.players.length) {
      return null;
    }
    // Find player with most points
    const winner = [...tournament.players].sort((a, b) => b.points - a.points)[0];
    return winner;
  };

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
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  PadelAmericano BR
                </h1>
                <p className="text-sm text-muted-foreground">
                  {tournaments.length} {tournaments.length === 1 ? 'torneio' : 'torneios'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Nenhum torneio encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              Ainda não há torneios criados no sistema
            </p>
            <Button asChild>
              <Link to="/admin">Criar Torneio</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => {
              const winner = getWinner(tournament);
              const totalRounds = tournament.rounds.length;
              const completedRounds = tournament.rounds.filter(r => r.status === 'finished').length;

              return (
                <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      {getStatusBadge(tournament)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(tournament.startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {tournament.players.length} jogadores
                      </div>
                      <div className="text-muted-foreground">
                        Rodadas: {completedRounds}/{totalRounds}
                      </div>
                    </div>

                    {/* Winner */}
                    {winner && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Vencedor</p>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{winner.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {winner.points} pts
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/torneio/${tournament.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-muted-foreground mt-8">
          <p className="text-sm">PadelAmericano BR © 2025</p>
        </footer>
      </main>
    </div>
  );
}
