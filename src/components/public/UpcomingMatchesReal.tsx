// All code in ENGLISH, UI labels in PORTUGUESE

import type { Round } from "@/lib/types";
import { COURT_LABELS } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface UpcomingMatchesProps {
  round: Round;
}

export default function UpcomingMatchesReal({ round }: UpcomingMatchesProps) {
  const upcomingMatches = round.matches.filter((m) => m.status === "waiting");

  if (upcomingMatches.length === 0) {
    return null;
  }

  // Sort by court and order
  const sortedMatches = [...upcomingMatches].sort((a, b) => {
    if (a.court !== b.court) {
      return a.court === "stone" ? -1 : 1;
    }
    return a.order - b.order;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Próximos Jogos - Rodada {round.number}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
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
        ))}
      </CardContent>
    </Card>
  );
}
