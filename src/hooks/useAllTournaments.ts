// All code in ENGLISH, UI labels in PORTUGUESE
// Custom hook for fetching all tournaments (for history)

import { useEffect, useState } from 'react';
import { getAllTournaments } from '@/lib/db';
import type { Tournament } from '@/lib/types';

/**
 * Hook to fetch all tournaments
 * Polls Supabase every 10 seconds for updates
 */
export function useAllTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        if (isMounted) {
          setTournaments(data);
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
    fetchTournaments();

    // Poll every 10 seconds (less frequent than active tournament)
    intervalId = setInterval(fetchTournaments, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await getAllTournaments();
      setTournaments(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { tournaments, loading, error, refetch };
}
