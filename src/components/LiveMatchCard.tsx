import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Match {
  court: string;
  team1: string[];
  team2: string[];
  score1: number;
  score2: number;
  time: string;
}

interface LiveMatchCardProps {
  match: Match;
}

export const LiveMatchCard = ({ match }: LiveMatchCardProps) => {
  return (
    <Card className="border-2 border-live/20 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-live text-live-foreground animate-pulse">
            🟢 Ao Vivo
          </Badge>
          <Badge variant="outline" className="font-bold text-sm">
            {match.court}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground">{match.team1[0]}</p>
            <p className="font-semibold text-foreground">{match.team1[1]}</p>
          </div>
          <div className="text-4xl font-bold text-primary tabular-nums">
            {match.score1}
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-center">
          <span className="text-sm font-semibold text-muted-foreground">VS</span>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground">{match.team2[0]}</p>
            <p className="font-semibold text-foreground">{match.team2[1]}</p>
          </div>
          <div className="text-4xl font-bold text-primary tabular-nums">
            {match.score2}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-lg font-mono font-semibold text-foreground tabular-nums">
            {match.time}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
