// All code in ENGLISH, UI labels in PORTUGUESE

import type { Round, Match } from "@/lib/types";
import { COURT_LABELS } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock } from "lucide-react";

interface UpcomingMatchesProps {
  round: Round;
}

/**
 * MatchCard - Displays a single match
 */
function MatchCard({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <Badge variant="secondary" className="font-semibold">
        {COURT_LABELS[match.court]}
      </Badge>
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

export default function UpcomingMatchesReal({ round }: UpcomingMatchesProps) {
  // Get matches by court and sort by order
  const stoneMatches = round.matches
    .filter((m) => m.court === "stone")
    .sort((a, b) => a.order - b.order);
  const cresolMatches = round.matches
    .filter((m) => m.court === "cresol")
    .sort((a, b) => a.order - b.order);

  // Get all NOT finished matches for each court
  const stoneNotFinished = stoneMatches.filter((m) => m.status !== "finished");
  const cresolNotFinished = cresolMatches.filter((m) => m.status !== "finished");

  // Current matches (first NOT finished from each court)
  const currentMatches = [];
  if (stoneNotFinished[0]) currentMatches.push(stoneNotFinished[0]);
  if (cresolNotFinished[0]) currentMatches.push(cresolNotFinished[0]);

  // Next matches (second NOT finished from each court)
  const nextMatches = [];
  if (stoneNotFinished[1]) nextMatches.push(stoneNotFinished[1]);
  if (cresolNotFinished[1]) nextMatches.push(cresolNotFinished[1]);

  // Sort by court (stone first)
  const sortedCurrentMatches = currentMatches.sort((a, b) => {
    return a.court === "stone" ? -1 : 1;
  });
  const sortedNextMatches = nextMatches.sort((a, b) => {
    return a.court === "stone" ? -1 : 1;
  });

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
          {sortedCurrentMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
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
            {sortedNextMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
