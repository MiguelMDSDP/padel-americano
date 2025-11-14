// All code in ENGLISH, UI labels in PORTUGUESE
// Custom hook for real-time tournament data by ID with Supabase

import { useEffect, useState } from 'react';
import { getTournamentById } from '@/lib/db';
import type { Tournament } from '@/lib/types';

/**
 * Hook to fetch and auto-refresh specific tournament data by ID
 * Polls Supabase every 5 seconds for updates
 */
export function useTournamentById(tournamentId: string | null) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      setTournament(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchTournament = async () => {
      try {
        const data = await getTournamentById(tournamentId);
        if (isMounted) {
          setTournament(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchTournament();

    // Poll every 5 seconds
    intervalId = setInterval(fetchTournament, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [tournamentId]);

  return { tournament, loading, error };
}
