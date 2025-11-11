// All code in ENGLISH, UI labels in PORTUGUESE

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTournamentById } from "@/lib/db";
import type { Tournament } from "@/lib/types";
import OverallRanking from "@/components/public/OverallRanking";
import RoundMatches from "@/components/public/RoundMatches";
import RoundHistory from "@/components/public/RoundHistory";
import Podium from "@/components/public/Podium";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, RefreshCw, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournament = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getTournamentById(id);
      setTournament(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar torneio");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const handleRefresh = () => {
    fetchTournament();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            Carregando torneio...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Trophy className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Torneio não encontrado
          </h1>
          <p className="text-muted-foreground">
            {error || "O torneio que você está procurando não existe"}
          </p>
          <Button asChild>
            <Link to="/">Voltar para Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentRound =
    tournament.rounds.find((r) => r.status === "in_progress") ||
    tournament.rounds[tournament.rounds.length - 1];

  const getStatusBadge = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    {tournament.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {format(tournament.startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Podium - Only show when tournament is finished */}
        {tournament.status === 'finished' && <Podium players={tournament.players} />}

        {/* Round Matches */}
        {currentRound && <RoundMatches round={currentRound} />}

        {/* Rankings */}
        <OverallRanking players={tournament.players} />

        {/* Round History */}
        <RoundHistory rounds={tournament.rounds} />

        {/* Footer */}
        <footer className="text-center py-8 text-muted-foreground">
          <p className="text-sm">PadelAmericano BR © 2025</p>
        </footer>
      </main>
    </div>
  );
}
