// All code in ENGLISH, UI labels in PORTUGUESE

import type { Player } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface PodiumProps {
  players: Player[];
}

interface PairResult {
  position: number;
  drivePlayer: Player;
  backhandPlayer: Player;
  totalPoints: number;
}

export default function Podium({ players }: PodiumProps) {
  // Separate players by position and sort by points
  const drivePlayers = players
    .filter((p) => p.position === "drive")
    .sort((a, b) => b.points - a.points);
  const backhandPlayers = players
    .filter((p) => p.position === "backhand")
    .sort((a, b) => b.points - a.points);

  // Form pairs: 1st drive with 1st backhand, 2nd with 2nd, etc
  const pairs: PairResult[] = [];
  const maxPairs = Math.min(3, drivePlayers.length, backhandPlayers.length);

  for (let i = 0; i < maxPairs; i++) {
    const drivePlayer = drivePlayers[i];
    const backhandPlayer = backhandPlayers[i];
    pairs.push({
      position: i + 1,
      drivePlayer,
      backhandPlayer,
      totalPoints: drivePlayer.points + backhandPlayer.points,
    });
  }

  if (pairs.length === 0) {
    return null;
  }

  const getPodiumHeight = (position: number) => {
    if (position === 1) return "h-48";
    if (position === 2) return "h-40";
    return "h-32";
  };

  const getPodiumColor = (position: number) => {
    if (position === 1) return "bg-gradient-to-b from-yellow-400 to-yellow-600";
    if (position === 2) return "bg-gradient-to-b from-gray-300 to-gray-500";
    return "bg-gradient-to-b from-orange-400 to-orange-600";
  };

  const getMedalEmoji = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    return "🥉";
  };

  return (
    <Card className="overflow-hidden border-2 border-primary">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardTitle className="text-center text-2xl flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" />
          Pódio Final
          <Trophy className="w-8 h-8" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {/* Podium Display */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          {pairs[1] && (
            <div className="flex flex-col items-center flex-1">
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{getMedalEmoji(2)}</div>
                <Badge variant="secondary" className="mb-2 bg-gray-400 text-white">
                  2º Lugar
                </Badge>
                <div className="space-y-1">
                  <p className="font-bold text-sm">{pairs[1].drivePlayer.name}</p>
                  <p className="font-bold text-sm">{pairs[1].backhandPlayer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pairs[1].totalPoints} pontos
                  </p>
                </div>
              </div>
              <div className={`w-full ${getPodiumHeight(2)} ${getPodiumColor(2)} rounded-t-lg flex items-center justify-center shadow-lg`}>
                <span className="text-6xl font-bold text-white opacity-30">2</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {pairs[0] && (
            <div className="flex flex-col items-center flex-1">
              <div className="text-center mb-3">
                <div className="text-5xl mb-2">{getMedalEmoji(1)}</div>
                <Badge variant="default" className="mb-2 bg-yellow-500 text-white">
                  1º Lugar
                </Badge>
                <div className="space-y-1">
                  <p className="font-bold text-base">{pairs[0].drivePlayer.name}</p>
                  <p className="font-bold text-base">{pairs[0].backhandPlayer.name}</p>
                  <p className="text-sm text-muted-foreground font-semibold">
                    {pairs[0].totalPoints} pontos
                  </p>
                </div>
              </div>
              <div className={`w-full ${getPodiumHeight(1)} ${getPodiumColor(1)} rounded-t-lg flex items-center justify-center shadow-xl`}>
                <span className="text-7xl font-bold text-white opacity-40">1</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {pairs[2] && (
            <div className="flex flex-col items-center flex-1">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{getMedalEmoji(3)}</div>
                <Badge variant="secondary" className="mb-2 bg-orange-500 text-white">
                  3º Lugar
                </Badge>
                <div className="space-y-1">
                  <p className="font-bold text-sm">{pairs[2].drivePlayer.name}</p>
                  <p className="font-bold text-sm">{pairs[2].backhandPlayer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pairs[2].totalPoints} pontos
                  </p>
                </div>
              </div>
              <div className={`w-full ${getPodiumHeight(3)} ${getPodiumColor(3)} rounded-t-lg flex items-center justify-center shadow-lg`}>
                <span className="text-5xl font-bold text-white opacity-30">3</span>
              </div>
            </div>
          )}
        </div>

        {/* Pair Details */}
        <div className="grid md:grid-cols-3 gap-4">
          {pairs.map((pair) => (
            <Card key={pair.position} className="border-2">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">{getMedalEmoji(pair.position)}</div>
                  <p className="text-xs text-muted-foreground mb-2">Dupla {pair.position}º Lugar</p>
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Drive</p>
                      <p className="font-semibold">{pair.drivePlayer.name}</p>
                      <p className="text-sm text-muted-foreground">{pair.drivePlayer.points} pts</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Revés</p>
                      <p className="font-semibold">{pair.backhandPlayer.name}</p>
                      <p className="text-sm text-muted-foreground">{pair.backhandPlayer.points} pts</p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Total da Dupla</p>
                      <p className="text-lg font-bold text-primary">{pair.totalPoints} pontos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
