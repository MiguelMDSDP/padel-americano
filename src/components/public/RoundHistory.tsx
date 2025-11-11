// All code in ENGLISH, UI labels in PORTUGUESE

import { useState } from "react";
import type { Round } from "@/lib/types";
import { COURT_LABELS } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ChevronDown, ChevronUp } from "lucide-react";

interface RoundHistoryProps {
  rounds: Round[];
}

export default function RoundHistory({ rounds }: RoundHistoryProps) {
  const finishedRounds = rounds.filter((r) => r.status === "finished");

  if (finishedRounds.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Histórico de Rodadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {finishedRounds.map((round) => (
          <RoundAccordion key={round.number} round={round} />
        ))}
      </CardContent>
    </Card>
  );
}

function RoundAccordion({ round }: { round: Round }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex justify-between items-center hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-foreground">Rodada {round.number}</span>
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
            Finalizada
          </Badge>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-3 space-y-2 bg-muted/10">
          {round.matches.map((match) => {
            // Calculate winner
            const isPair1Winner = match.pair1Score > match.pair2Score;
            const isPair2Winner = match.pair2Score > match.pair1Score;

            return (
              <div
                key={match.id}
                className="p-3 bg-card rounded-lg border text-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline" className="font-semibold text-xs">
                    {COURT_LABELS[match.court]}
                  </Badge>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 text-right">
                    <span className="text-muted-foreground">
                      {match.pair1.drivePlayer.name} & {match.pair1.backhandPlayer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4">
                    <span
                      className={`font-bold text-2xl tabular-nums ${
                        isPair1Winner ? "text-green-600" : "text-foreground"
                      }`}
                    >
                      {match.pair1Score}
                    </span>
                    <span className="text-muted-foreground font-semibold">×</span>
                    <span
                      className={`font-bold text-2xl tabular-nums ${
                        isPair2Winner ? "text-green-600" : "text-foreground"
                      }`}
                    >
                      {match.pair2Score}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-muted-foreground">
                      {match.pair2.drivePlayer.name} & {match.pair2.backhandPlayer.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
