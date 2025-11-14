// All code in ENGLISH, UI labels in PORTUGUESE
// Duration preview component - shows estimated tournament duration

import React from 'react';
import { TournamentDuration } from '@/lib/types';
import { Clock } from 'lucide-react';

interface DurationPreviewProps {
  duration: TournamentDuration;
}

export function DurationPreview({ duration }: DurationPreviewProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="text-blue-600" size={20} />
        <h3 className="font-semibold text-blue-900">Estimativa de Duração</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Jogos por rodada:</span>
          <span className="ml-2 font-semibold">{duration.matchesPerRound}</span>
        </div>
        <div>
          <span className="text-gray-600">Jogos simultâneos:</span>
          <span className="ml-2 font-semibold">{duration.simultaneousMatches}</span>
        </div>
        <div>
          <span className="text-gray-600">Jogos por quadra:</span>
          <span className="ml-2 font-semibold">{duration.sequentialMatchesPerCourt}</span>
        </div>
        <div>
          <span className="text-gray-600">Tempo por rodada:</span>
          <span className="ml-2 font-semibold">{duration.timePerRoundMinutes} min</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-300">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">TEMPO TOTAL ESTIMADO</div>
          <div className="text-2xl font-bold text-blue-600">
            {duration.totalTournamentFormatted}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ({duration.totalTournamentMinutes} minutos)
          </div>
        </div>
      </div>
    </div>
  );
}
