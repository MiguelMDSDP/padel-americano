// All code in ENGLISH, UI labels in PORTUGUESE

import type { Round, Match, Court } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { CourtBadge } from "@/components/ui/CourtBadge";
import { Play, Clock } from "lucide-react";

interface UpcomingMatchesProps {
  round: Round;
  courts: Court[];
}

/**
 * MatchCard - Displays a single match
 */
function MatchCard({ match, courts }: { match: Match; courts: Court[] }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <CourtBadge courtName={match.court} courts={courts} className="font-semibold" />
      <div className="flex-1 text-sm">
        <span className="font-medium text-foreground">
          {match.pair1.drivePlayer.name} & {match.pair1.backhandPlayer.name}
        </span>
        <span className="text-muted-foreground mx-2">vs</span>
        <span className="font-medium text-foreground">
          {match.pair2.drivePlayer.name} & {match.pair2.backhandPlayer.name}
        </span>
      </div>
    </div>
  );
}

export default function UpcomingMatchesReal({ round, courts }: UpcomingMatchesProps) {
  // Get unique court names from matches
  const courtNames = Array.from(new Set(round.matches.map((m) => m.court)));

  // Group matches by court and get not finished matches
  const matchesByCourt = courtNames.map((courtName) => {
    const courtMatches = round.matches
      .filter((m) => m.court === courtName)
      .sort((a, b) => a.order - b.order);

    const notFinished = courtMatches.filter((m) => m.status !== "finished");

    return {
      courtName,
      notFinished,
    };
  });

  // Get current matches (first not finished from each court)
  const currentMatches = matchesByCourt
    .filter((c) => c.notFinished.length > 0)
    .map((c) => c.notFinished[0])
    .sort((a, b) => a.court.localeCompare(b.court));

  // Get next matches (second not finished from each court)
  const nextMatches = matchesByCourt
    .filter((c) => c.notFinished.length > 1)
    .map((c) => c.notFinished[1])
    .sort((a, b) => a.court.localeCompare(b.court));

  // If no current matches, don't show anything
  if (currentMatches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Current Match Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            Jogo Atual - Rodada {round.number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentMatches.map((match) => (
            <MatchCard key={match.id} match={match} courts={courts} />
          ))}
        </CardContent>
      </Card>

      {/* Next Match Section - Only show if there are next matches */}
      {nextMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Próximo Jogo - Rodada {round.number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextMatches.map((match) => (
              <MatchCard key={match.id} match={match} courts={courts} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
