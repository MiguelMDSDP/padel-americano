// All code in ENGLISH, UI labels in PORTUGUESE

import type { Player } from "@/lib/types";
import { getAllPlayersStats } from "@/lib/utils/rankings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award } from "lucide-react";

interface OverallRankingProps {
  players: Player[];
}

export default function OverallRanking({ players }: OverallRankingProps) {
  const { drive, backhand } = getAllPlayersStats(players);

  const RankingTable = ({
    title,
    ranking,
    icon: Icon,
  }: {
    title: string;
    ranking: typeof drive;
    icon: typeof Trophy | typeof Award;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum jogador no ranking
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Pos
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Jogador
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Pts
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Saldo
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                  PF
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground hidden sm:table-cell">
                  V-E-D
                </th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-b hover:bg-muted/30 transition-colors ${
                    index === 0
                      ? "bg-warning/10"
                      : index === 1
                      ? "bg-muted/50"
                      : index === 2
                      ? "bg-accent/10"
                      : ""
                  }`}
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Trophy className="w-5 h-5 text-warning" />
                      )}
                      {index === 1 && (
                        <Trophy className="w-5 h-5 text-muted-foreground" />
                      )}
                      {index === 2 && (
                        <Trophy className="w-5 h-5 text-accent" />
                      )}
                      <span className="font-bold text-lg">
                        {player.rankPosition}º
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground">
                        {player.name}
                      </span>
                      <Badge variant="default" className="w-fit text-xs">
                        {player.position === "drive" ? "Drive" : "Revés"}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-center py-4 px-2">
                    <span className="font-bold text-lg text-primary">
                      {player.points}
                    </span>
                  </td>
                  <td className="text-center py-4 px-2">
                    <span
                      className={`font-semibold ${
                        player.balance > 0
                          ? "text-green-600"
                          : player.balance < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {player.balance > 0 ? "+" : ""}
                      {player.balance}
                    </span>
                  </td>
                  <td className="text-center py-4 px-2">
                    <span className="text-muted-foreground font-medium">
                      {player.scored}
                    </span>
                  </td>
                  <td className="text-center py-4 px-2 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground font-medium">
                      <span className="text-green-600">{player.wins}</span>
                      <span className="mx-1">-</span>
                      <span>{player.draws}</span>
                      <span className="mx-1">-</span>
                      <span className="text-red-600">{player.losses}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <RankingTable title="Classificação Drive" ranking={drive} icon={Trophy} />
        <RankingTable
          title="Classificação Revés"
          ranking={backhand}
          icon={Award}
        />
      </div>
    </div>
  );
}
