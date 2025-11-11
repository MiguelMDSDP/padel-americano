import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";

interface Player {
  position: number;
  name: string;
  points: number;
  balance: number;
  pointsScored: number;
  side: "Drive" | "Revés";
}

interface ClassificationTableProps {
  players: Player[];
}

export const ClassificationTable = ({ players }: ClassificationTableProps) => {
  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-warning" />;
    if (position === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (position === 3) return <Medal className="w-5 h-5 text-accent" />;
    return null;
  };

  const getPositionBg = (position: number) => {
    if (position === 1) return "bg-warning/10";
    if (position === 2) return "bg-muted/50";
    if (position === 3) return "bg-accent/10";
    return "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Pos</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Jogador</th>
            <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">Pts</th>
            <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">Saldo</th>
            <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">PF</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr 
              key={player.position} 
              className={`border-b hover:bg-muted/30 transition-colors ${getPositionBg(player.position)}`}
            >
              <td className="py-4 px-2">
                <div className="flex items-center gap-2">
                  {getPositionIcon(player.position)}
                  <span className="font-bold text-lg">{player.position}º</span>
                </div>
              </td>
              <td className="py-4 px-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">{player.name}</span>
                  <Badge 
                    variant={player.side === "Drive" ? "default" : "secondary"}
                    className="w-fit text-xs"
                  >
                    {player.side}
                  </Badge>
                </div>
              </td>
              <td className="text-center py-4 px-2">
                <span className="font-bold text-lg text-primary">{player.points}</span>
              </td>
              <td className="text-center py-4 px-2">
                <span className={`font-semibold ${player.balance > 0 ? 'text-success' : 'text-destructive'}`}>
                  {player.balance > 0 ? '+' : ''}{player.balance}
                </span>
              </td>
              <td className="text-center py-4 px-2">
                <span className="text-muted-foreground font-medium">{player.pointsScored}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
