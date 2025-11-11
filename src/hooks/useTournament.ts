// All code in ENGLISH, UI labels in PORTUGUESE
// Custom hook for real-time tournament data with Supabase

import { useEffect, useState } from 'react';
import { getActiveTournament } from '@/lib/db';
import type { Tournament } from '@/lib/types';

/**
 * Hook to fetch and auto-refresh tournament data
 * Polls Supabase every 5 seconds for updates
 */
export function useTournament() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchTournament = async () => {
      try {
        const data = await getActiveTournament();
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
  }, []);

  return { tournament, loading, error };
}
