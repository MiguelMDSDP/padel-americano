// All code in ENGLISH, UI labels in PORTUGUESE

import type { Round, Match } from "@/lib/types";
import { COURT_LABELS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface MatchesInProgressProps {
  round: Round;
}

export default function MatchesInProgress({ round }: MatchesInProgressProps) {
  const matchesInProgress = round.matches.filter(
    (m) => m.status === "in_progress"
  );

  if (matchesInProgress.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-live animate-pulse" />
        <h2 className="text-2xl font-bold">
          Jogos em Andamento - Rodada {round.number}
        </h2>
      </div>

      {/* Responsive Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {matchesInProgress.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const elapsedTime = match.startTime
    ? formatDistanceToNow(new Date(match.startTime), {
        addSuffix: false,
        locale: ptBR,
      })
    : "0 min";

  return (
    <Card className="border-2 border-live/20 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* Live Badge */}
          <Badge className="bg-live text-live-foreground animate-pulse">
            🟢 Ao Vivo
          </Badge>
          {/* Court Badge */}
          <Badge variant="outline" className="font-bold text-sm">
            {COURT_LABELS[match.court]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {match.pair1.drivePlayer.name}
            </p>
            <p className="font-semibold text-foreground">
              {match.pair1.backhandPlayer.name}
            </p>
          </div>
          <div className="text-4xl font-bold text-primary tabular-nums">
            {match.pair1Score}
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-center">
          <span className="text-sm font-semibold text-muted-foreground">
            VS
          </span>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {match.pair2.drivePlayer.name}
            </p>
            <p className="font-semibold text-foreground">
              {match.pair2.backhandPlayer.name}
            </p>
          </div>
          <div className="text-4xl font-bold text-primary tabular-nums">
            {match.pair2Score}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-lg font-mono font-semibold text-foreground tabular-nums">
            {elapsedTime}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
