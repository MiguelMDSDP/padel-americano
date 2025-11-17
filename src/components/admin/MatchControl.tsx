// All code in ENGLISH, UI labels in PORTUGUESE

import { useState, useEffect } from 'react';
import type { Match, Court } from '@/lib/types';
import { validateScore, canFinishMatch } from '@/lib/utils/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CourtBadge } from '@/components/ui/CourtBadge';
import { Flag, Trophy } from 'lucide-react';
import { toast } from 'sonner';

/**
 * MatchControl Component
 * Controls a single match with score inputs and finish button
 */
interface MatchControlProps {
  match: Match;
  courts: Court[];
  onFinish: (matchId: string, pair1Score: number, pair2Score: number) => void;
}

export function MatchControl({ match, courts, onFinish }: MatchControlProps) {
  // Score state
  const [pair1Score, setPair1Score] = useState(match.pair1Score);
  const [pair2Score, setPair2Score] = useState(match.pair2Score);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Sync scores when match prop changes
  useEffect(() => {
    setPair1Score(match.pair1Score);
    setPair2Score(match.pair2Score);
  }, [match.pair1Score, match.pair2Score]);

  // Reset confirm dialog and finishing state when match is finished
  useEffect(() => {
    if (match.status === 'finished') {
      setShowConfirmFinish(false);
      setIsFinishing(false);
    }
  }, [match.status]);

  /**
   * Handle finish match
   */
  const handleFinishMatch = () => {
    // Prevent double-finishing
    if (isFinishing || match.status === 'finished') {
      return;
    }

    // Create a temporary match object with current scores for validation
    const matchToValidate: Match = {
      ...match,
      pair1Score,
      pair2Score,
      status: 'in_progress', // Pretend it's in progress for validation
    };

    // Validate that match can be finished
    const validation = canFinishMatch(matchToValidate);
    if (!validation.canFinish) {
      toast.error(validation.error!);
      return;
    }

    // Validate individual scores
    const score1Validation = validateScore(pair1Score);
    if (!score1Validation.isValid) {
      toast.error(`Placar Dupla 1: ${score1Validation.error}`);
      return;
    }

    const score2Validation = validateScore(pair2Score);
    if (!score2Validation.isValid) {
      toast.error(`Placar Dupla 2: ${score2Validation.error}`);
      return;
    }

    // Set finishing state to prevent double-click
    setIsFinishing(true);

    // CRITICAL FIX: Pass current scores to ensure they are saved correctly
    // This prevents the race condition with auto-save timeout
    onFinish(match.id, pair1Score, pair2Score);
    toast.success('Jogo finalizado! Rankings atualizados.');
    setShowConfirmFinish(false);
  };

  const isFinished = match.status === 'finished';

  return (
    <Card className="border-2">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">
              Jogo {match.order}
            </CardTitle>
            <CourtBadge courtName={match.court} courts={courts} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Rodada {match.round}
            </Badge>
            {isFinished && (
              <Badge variant="default" className="bg-green-600">
                ✓ Finalizado
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scores Section */}
        <div className="space-y-4">
          {/* Pair 1 */}
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2 bg-blue-600 text-white">
                  Dupla 1
                </Badge>
                <p className="font-semibold">
                  {match.pair1.drivePlayer.name}
                  <span className="text-sm text-muted-foreground ml-2">(Drive)</span>
                </p>
                <p className="font-semibold">
                  {match.pair1.backhandPlayer.name}
                  <span className="text-sm text-muted-foreground ml-2">(Revés)</span>
                </p>
              </div>

              {/* Score Input */}
              <div className="flex-shrink-0">
                {isFinished ? (
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border-2 border-blue-300">
                    <span className="text-3xl font-bold">{pair1Score}</span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={pair1Score}
                    onChange={(e) => setPair1Score(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max="99"
                    className="w-20 h-20 text-3xl font-bold text-center border-2 border-blue-300"
                  />
                )}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-center">
            <span className="text-2xl font-bold text-muted-foreground">VS</span>
          </div>

          {/* Pair 2 */}
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2 bg-red-600 text-white">
                  Dupla 2
                </Badge>
                <p className="font-semibold">
                  {match.pair2.drivePlayer.name}
                  <span className="text-sm text-muted-foreground ml-2">(Drive)</span>
                </p>
                <p className="font-semibold">
                  {match.pair2.backhandPlayer.name}
                  <span className="text-sm text-muted-foreground ml-2">(Revés)</span>
                </p>
              </div>

              {/* Score Input */}
              <div className="flex-shrink-0">
                {isFinished ? (
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border-2 border-red-300">
                    <span className="text-3xl font-bold">{pair2Score}</span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={pair2Score}
                    onChange={(e) => setPair2Score(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max="99"
                    className="w-20 h-20 text-3xl font-bold text-center border-2 border-red-300"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Result Indicator (if finished) */}
        {isFinished && (
          <div className="p-3 bg-muted rounded-lg text-center">
            {pair1Score > pair2Score ? (
              <p className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Dupla 1 Venceu!
              </p>
            ) : pair2Score > pair1Score ? (
              <p className="text-lg font-bold text-red-700 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Dupla 2 Venceu!
              </p>
            ) : (
              <p className="text-lg font-bold flex items-center justify-center gap-2">
                🤝 Empate!
              </p>
            )}
          </div>
        )}

        {/* Finish Button */}
        {!isFinished && !isFinishing && (
          <div>
            {showConfirmFinish ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleFinishMatch}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                  disabled={isFinishing}
                >
                  ✓ Confirmar Finalização
                </Button>
                <Button
                  onClick={() => setShowConfirmFinish(false)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  disabled={isFinishing}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowConfirmFinish(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={isFinishing}
              >
                <Flag className="w-5 h-5 mr-2" />
                Finalizar Jogo
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
