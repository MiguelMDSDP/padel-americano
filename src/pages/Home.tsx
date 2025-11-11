// All code in ENGLISH, UI labels in PORTUGUESE

import { useTournament } from "@/hooks/useTournament";
import OverallRanking from "@/components/public/OverallRanking";
import MatchesInProgress from "@/components/public/MatchesInProgress";
import UpcomingMatchesReal from "@/components/public/UpcomingMatchesReal";
import RoundHistory from "@/components/public/RoundHistory";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw } from "lucide-react";

export default function Home() {
  // Auto-refresh every 5 seconds using custom hook with Supabase
  const { tournament, loading } = useTournament();

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

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto">
            <Trophy className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            PadelAmericano BR
          </h1>
          <p className="text-muted-foreground">
            Nenhum torneio em andamento
          </p>
          <Button asChild>
            <Link to="/admin">Acessar Painel Administrativo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentRound =
    tournament.rounds.find((r) => r.status === "in_progress") ||
    tournament.rounds[tournament.rounds.length - 1];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo Circle */}
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              {/* Title */}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  PadelAmericano BR
                </h1>
                <p className="text-sm text-muted-foreground">
                  {tournament.name}
                </p>
              </div>
            </div>
            {/* Links */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/historico">Histórico</Link>
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
        {/* Rankings */}
        <OverallRanking players={tournament.players} />

        {/* Matches Section */}
        {currentRound && (
          <>
            {/* Matches in Progress */}
            <MatchesInProgress round={currentRound} />

            {/* Upcoming Matches */}
            <UpcomingMatchesReal round={currentRound} />
          </>
        )}

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
