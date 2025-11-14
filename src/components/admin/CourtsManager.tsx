// All code in ENGLISH, UI labels in PORTUGUESE
// Courts manager component - add/remove/edit courts

import React from 'react';
import { Court } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';

interface CourtsManagerProps {
  courts: Court[];
  onChange: (courts: Court[]) => void;
}

const PRESET_COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Ciano', value: '#06b6d4' },
];

export function CourtsManager({ courts, onChange }: CourtsManagerProps) {
  const addCourt = () => {
    const newCourt: Court = {
      id: `temp-${Date.now()}`,
      tournamentId: '',
      name: `Quadra ${courts.length + 1}`,
      color: PRESET_COLORS[courts.length % PRESET_COLORS.length].value,
      order: courts.length + 1,
    };
    onChange([...courts, newCourt]);
  };

  const removeCourt = (id: string) => {
    const updated = courts.filter((c) => c.id !== id);
    // Reorder remaining courts
    const reordered = updated.map((c, idx) => ({ ...c, order: idx + 1 }));
    onChange(reordered);
  };

  const updateCourt = (id: string, field: keyof Court, value: string | number) => {
    const updated = courts.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* List of courts */}
      <div className="space-y-2">
        {courts.map((court) => (
          <div
            key={court.id}
            className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50"
          >
            {/* Color Preview */}
            <div
              className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
              style={{ backgroundColor: court.color }}
              title={court.color}
            />

            {/* Name Input */}
            <input
              type="text"
              value={court.name}
              onChange={(e) => updateCourt(court.id, 'name', e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome da quadra"
              maxLength={30}
            />

            {/* Color Picker */}
            <select
              value={court.color}
              onChange={(e) => updateCourt(court.id, 'color', e.target.value)}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PRESET_COLORS.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.name}
                </option>
              ))}
            </select>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeCourt(court.id)}
              disabled={courts.length === 1}
              className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={courts.length === 1 ? 'Mínimo 1 quadra obrigatória' : 'Remover quadra'}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Court Button */}
      <button
        type="button"
        onClick={addCourt}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
      >
        <Plus size={18} />
        Adicionar Quadra
      </button>
    </div>
  );
}
