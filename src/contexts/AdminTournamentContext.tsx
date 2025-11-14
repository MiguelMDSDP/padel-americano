// All code in ENGLISH, UI labels in PORTUGUESE
// Context to manage selected tournament in admin panel

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTournamentById } from '@/hooks/useTournamentById';
import { useAllTournaments } from '@/hooks/useAllTournaments';
import type { Tournament } from '@/lib/types';

interface AdminTournamentContextType {
  // Currently selected tournament
  tournament: Tournament | null;
  // ID of selected tournament
  selectedTournamentId: string | null;
  // Function to change selected tournament
  setSelectedTournamentId: (id: string | null) => void;
  // All available tournaments
  allTournaments: Tournament[];
  // Loading states
  loading: boolean;
  tournamentsLoading: boolean;
  // Force refresh
  refetch: () => void;
}

const AdminTournamentContext = createContext<AdminTournamentContextType | undefined>(undefined);

export function AdminTournamentProvider({ children }: { children: ReactNode }) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const { tournaments: allTournaments, loading: tournamentsLoading, refetch } = useAllTournaments();
  const { tournament, loading } = useTournamentById(selectedTournamentId);

  // Auto-select active tournament on mount or when tournaments change
  useEffect(() => {
    if (!selectedTournamentId && allTournaments.length > 0) {
      // Try to find active tournament first
      const activeTournament = allTournaments.find(t => t.isActive);
      if (activeTournament) {
        setSelectedTournamentId(activeTournament.id);
      } else {
        // Otherwise select the most recent one
        setSelectedTournamentId(allTournaments[0].id);
      }
    }
  }, [allTournaments, selectedTournamentId]);

  return (
    <AdminTournamentContext.Provider
      value={{
        tournament,
        selectedTournamentId,
        setSelectedTournamentId,
        allTournaments,
        loading,
        tournamentsLoading,
        refetch,
      }}
    >
      {children}
    </AdminTournamentContext.Provider>
  );
}

export function useAdminTournament() {
  const context = useContext(AdminTournamentContext);
  if (context === undefined) {
    throw new Error('useAdminTournament must be used within AdminTournamentProvider');
  }
  return context;
}
