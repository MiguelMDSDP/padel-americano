import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export const UpcomingMatches = () => {
  const upcomingMatches = [
    {
      court: "Stone",
      team1: "Lucas Alves & Fernanda Reis",
      team2: "Roberto Dias & Camila Nunes"
    },
    {
      court: "Cresol",
      team1: "Eduardo Martins & Patricia Lima",
      team2: "Gabriel Costa & Larissa Santos"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Próximos Jogos - Rodada 3
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingMatches.map((match, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Badge variant="secondary" className="font-semibold">
              {match.court}
            </Badge>
            <div className="flex-1 text-sm">
              <span className="font-medium text-foreground">{match.team1}</span>
              <span className="text-muted-foreground mx-2">vs</span>
              <span className="font-medium text-foreground">{match.team2}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
