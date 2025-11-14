// All code in ENGLISH, UI labels in PORTUGUESE
// Tournament configuration form - main form for creating tournaments with config

import React, { useState, useMemo } from 'react';
import { TournamentConfig, Court } from '@/lib/types';
import {
  getValidPlayerCounts,
  calculateTournamentDuration,
  getDefaultCourts,
} from '@/lib/utils/calculations';
import { validateTournamentConfig } from '@/lib/utils/validations';
import { CourtsManager } from './CourtsManager';
import { DurationPreview } from './DurationPreview';

interface TournamentConfigFormProps {
  onSubmit: (name: string, config: TournamentConfig, courts: Court[]) => void;
  onCancel: () => void;
}

export function TournamentConfigForm({ onSubmit, onCancel }: TournamentConfigFormProps) {
  const [tournamentName, setTournamentName] = useState('');
  const [totalPlayers, setTotalPlayers] = useState(24);
  const [totalRounds, setTotalRounds] = useState(5);
  const [matchDuration, setMatchDuration] = useState(15);
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [courts, setCourts] = useState<Court[]>(getDefaultCourts('temp'));
  const [errors, setErrors] = useState<string[]>([]);

  const playerCounts = getValidPlayerCounts();

  const config: TournamentConfig = useMemo(
    () => ({
      totalPlayers,
      totalRounds,
      matchDurationMinutes: matchDuration,
      intervalMinutes,
    }),
    [totalPlayers, totalRounds, matchDuration, intervalMinutes]
  );

  const duration = useMemo(
    () => calculateTournamentDuration(config, courts),
    [config, courts]
  );

  const playersPerPosition = totalPlayers / 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors([]);

    // Validate tournament name
    if (!tournamentName.trim()) {
      setErrors(['Nome do torneio é obrigatório']);
      return;
    }

    // Validate configuration
    const validation = validateTournamentConfig(config, courts);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit if all valid
    onSubmit(tournamentName.trim(), config, courts);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Errors Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-semibold mb-2">Erros de Validação:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tournament Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome do Torneio <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Campeonato de Verão 2025"
          required
          maxLength={100}
        />
      </div>

      {/* Number of Players */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Jogadores
        </label>
        <select
          value={totalPlayers}
          onChange={(e) => setTotalPlayers(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {playerCounts.map((count) => (
            <option key={count} value={count}>
              {count} jogadores ({count / 2} Drive + {count / 2} Revés)
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Total de {playersPerPosition} jogadores por posição
        </p>
      </div>

      {/* Courts */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quadras <span className="text-red-500">*</span>
        </label>
        <CourtsManager courts={courts} onChange={setCourts} />
        <p className="mt-2 text-sm text-gray-500">
          {courts.length} {courts.length === 1 ? 'quadra configurada' : 'quadras configuradas'}
        </p>
      </div>

      {/* Time Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Configurações de Tempo
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Duração do Jogo (min)</label>
            <input
              type="number"
              value={matchDuration}
              onChange={(e) => setMatchDuration(Number(e.target.value))}
              min={5}
              max={60}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Intervalo (min)</label>
            <input
              type="number"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              min={0}
              max={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Número de Rodadas</label>
            <input
              type="number"
              value={totalRounds}
              onChange={(e) => setTotalRounds(Number(e.target.value))}
              min={1}
              max={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Duration Preview */}
      <DurationPreview duration={duration} />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Criar Torneio
        </button>
      </div>
    </form>
  );
}
