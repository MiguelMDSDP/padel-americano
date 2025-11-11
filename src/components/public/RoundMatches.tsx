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
import { Trophy } from "lucide-react";

interface RoundMatchesProps {
  round: Round;
}

/**
 * MatchCard - Displays a single match with status and score
 */
function MatchCard({ match }: { match: Match }) {
  const isFinished = match.status === "finished";

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge variant="secondary" className="font-semibold">
          Jogo {match.order}
        </Badge>
        <Badge variant="outline">
          {COURT_LABELS[match.court]}
        </Badge>
        {isFinished ? (
          <Badge variant="default" className="bg-green-600">
            ✓ Finalizado
          </Badge>
        ) : (
          <Badge variant="secondary">
            Aguardando
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Pair 1 */}
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          isFinished && match.pair1Score > match.pair2Score
            ? 'bg-blue-100 border-2 border-blue-300'
            : 'bg-blue-50'
        }`}>
          <div className="flex items-center gap-3">
            <p className="font-semibold text-sm text-center">
              {match.pair1.drivePlayer.name} & {match.pair1.backhandPlayer.name}
            </p>
            {isFinished && (
              <>
                <span className="text-2xl font-bold">{match.pair1Score}</span>
                {match.pair1Score > match.pair2Score && (
                  <Trophy className="w-5 h-5 text-blue-700" />
                )}
              </>
            )}
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-center">
          <span className="text-sm font-bold text-muted-foreground">VS</span>
        </div>

        {/* Pair 2 */}
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          isFinished && match.pair2Score > match.pair1Score
            ? 'bg-red-100 border-2 border-red-300'
            : 'bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            <p className="font-semibold text-sm text-center">
              {match.pair2.drivePlayer.name} & {match.pair2.backhandPlayer.name}
            </p>
            {isFinished && (
              <>
                <span className="text-2xl font-bold">{match.pair2Score}</span>
                {match.pair2Score > match.pair1Score && (
                  <Trophy className="w-5 h-5 text-red-700" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoundMatches({ round }: RoundMatchesProps) {
  // Sort matches by order
  const sortedMatches = [...round.matches].sort((a, b) => a.order - b.order);

  const finishedCount = sortedMatches.filter(m => m.status === 'finished').length;
  const totalCount = sortedMatches.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Rodada {round.number} - Jogos
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {finishedCount}/{totalCount} finalizados
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {sortedMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
