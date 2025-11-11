// All code in ENGLISH, UI labels in PORTUGUESE

import { useState } from 'react';
import type { Tournament, Round, Match } from '@/lib/types';
import { drawRound1, configureNextRound, getMatchesByCourt, validateRound } from '@/lib/utils/algorithms';
import { canConfigureRound } from '@/lib/utils/validations';
import { COURT_LABELS, TOURNAMENT_CONFIG } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shuffle, Check, X, Info } from 'lucide-react';
import { toast } from 'sonner';

/**
 * RoundConfigurator Component
 * Configures tournament rounds with preview before confirmation
 */
interface RoundConfiguratorProps {
  tournament: Tournament;
  roundNumber: number;
  onConfirm: (round: Round) => void;
  onCancel: () => void;
}

export function RoundConfigurator({
  tournament,
  roundNumber,
  onConfirm,
  onCancel,
}: RoundConfiguratorProps) {
  const [previewRound, setPreviewRound] = useState<Round | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Generate round configuration
   */
  const handleGenerate = () => {
    setIsGenerating(true);

    try {
      // Validate that round can be configured
      const validation = canConfigureRound(tournament, roundNumber);
      if (!validation.canConfigure) {
        toast.error(validation.error!);
        setIsGenerating(false);
        return;
      }

      // Generate round based on round number
      let round: Round;

      if (roundNumber === 1) {
        // Round 1: Random draw
        round = drawRound1(tournament.players);
        toast.info('Rodada 1 sorteada! Revise e confirme.');
      } else {
        // Rounds 2-5: Ranking-based pairing
        round = configureNextRound(tournament.players, roundNumber);
        toast.info(`Rodada ${roundNumber} configurada! Revise e confirme.`);
      }

      // Validate round
      const isValid = validateRound(round, TOURNAMENT_CONFIG.TOTAL_PLAYERS);
      if (!isValid) {
        toast.error('Erro na configuração da rodada. Tente novamente.');
        setIsGenerating(false);
        return;
      }

      setPreviewRound(round);
    } catch (error) {
      console.error('Error generating round:', error);
      toast.error('Erro ao gerar rodada. Verifique os jogadores.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Regenerate round (shuffle again)
   */
  const handleRegenerate = () => {
    setPreviewRound(null);
    handleGenerate();
  };

  /**
   * Confirm round configuration
   */
  const handleConfirm = () => {
    if (!previewRound) return;

    onConfirm(previewRound);
    toast.success(`Rodada ${roundNumber} configurada com sucesso!`);
  };

  /**
   * Get button text based on round number
   */
  const getButtonText = () => {
    if (roundNumber === 1) {
      return '🎲 Sortear Rodada 1';
    }
    return `⚙️ Configurar Rodada ${roundNumber}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Configurar Rodada {roundNumber}</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            {roundNumber === 1
              ? 'Sorteio aleatório dos 24 jogadores em 6 jogos'
              : 'Pareamento baseado no ranking atual (1º + 12º, 2º + 11º, etc)'}
          </p>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      {!previewRound && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isGenerating ? 'Gerando...' : getButtonText()}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewRound && (
        <>
          {/* Preview Header */}
          <Card className="border-l-4 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    📋 Preview da Rodada {roundNumber}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Revise as duplas abaixo e confirme a configuração ou sorteie novamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courts Preview */}
          <div className="space-y-4">
            {/* Stone Court */}
            <CourtPreview
              court="stone"
              matches={getMatchesByCourt(previewRound.matches, 'stone')}
            />

            {/* Cresol Court */}
            <CourtPreview
              court="cresol"
              matches={getMatchesByCourt(previewRound.matches, 'cresol')}
            />
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Sortear Novamente
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Configuração
                </Button>
                <Button
                  onClick={onCancel}
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Informações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Total de jogos: {TOURNAMENT_CONFIG.MATCHES_PER_ROUND}</li>
                <li>• Jogos por quadra: 3</li>
                <li>• Todos os 24 jogadores participam</li>
                <li>• Cada jogador joga 1 vez por rodada</li>
                {roundNumber === 1 && (
                  <li className="text-primary font-semibold">
                    • Rodada 1: Sorteio totalmente aleatório
                  </li>
                )}
                {roundNumber > 1 && (
                  <li className="text-primary font-semibold">
                    • Rodadas 2-5: Pareamento balanceado por ranking
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * CourtPreview Sub-component
 * Displays matches for a specific court
 */
interface CourtPreviewProps {
  court: 'stone' | 'cresol';
  matches: Match[];
}

function CourtPreview({ court, matches }: CourtPreviewProps) {
  // Sort matches by order
  const sortedMatches = [...matches].sort((a, b) => a.order - b.order);

  return (
    <Card className="overflow-hidden">
      {/* Court Header */}
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-lg flex items-center gap-2">
          🏛️ Quadra {COURT_LABELS[court]}
          <Badge variant="secondary" className="ml-auto">
            {sortedMatches.length} jogos
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* Matches List */}
      <CardContent className="p-0">
        <div className="divide-y">
          {sortedMatches.map((match, index) => (
            <MatchPreview key={match.id} match={match} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MatchPreview Sub-component
 * Displays a single match preview
 */
interface MatchPreviewProps {
  match: Match;
  index: number;
}

function MatchPreview({ match, index }: MatchPreviewProps) {
  return (
    <div className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex flex-col items-center gap-4">
        {/* Match Number */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
          {index + 1}
        </div>

        {/* Match Details */}
        <div className="w-full">
          {/* Pair 1 */}
          <div className="mb-2 text-center">
            <Badge variant="secondary" className="mb-1 bg-blue-600 text-white text-xs">
              Dupla 1
            </Badge>
            <div className="font-semibold text-foreground text-sm">
              {match.pair1.drivePlayer.name}
              <span className="text-xs text-muted-foreground ml-1">(Drive)</span>
              <span className="mx-2 text-muted-foreground">/</span>
              {match.pair1.backhandPlayer.name}
              <span className="text-xs text-muted-foreground ml-1">(Revés)</span>
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-center text-sm font-bold text-muted-foreground my-1">VS</div>

          {/* Pair 2 */}
          <div className="text-center">
            <Badge variant="secondary" className="mb-1 bg-red-600 text-white text-xs">
              Dupla 2
            </Badge>
            <div className="font-semibold text-foreground text-sm">
              {match.pair2.drivePlayer.name}
              <span className="text-xs text-muted-foreground ml-1">(Drive)</span>
              <span className="mx-2 text-muted-foreground">/</span>
              {match.pair2.backhandPlayer.name}
              <span className="text-xs text-muted-foreground ml-1">(Revés)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
