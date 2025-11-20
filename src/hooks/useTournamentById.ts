// All code in ENGLISH, UI labels in PORTUGUESE
// Custom hook for real-time tournament data by ID with Supabase

import { useEffect, useState, useRef } from 'react';
import { getTournamentById } from '@/lib/db';
import type { Tournament } from '@/lib/types';

/**
 * Hook to fetch and auto-refresh specific tournament data by ID
 * Polls Supabase every 5 seconds for updates
 * Pauses polling during operations to prevent race conditions
 */
export function useTournamentById(tournamentId: string | null) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pausePollingRef = useRef(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      setTournament(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchTournament = async () => {
      // Skip fetch if polling is paused (during save operations)
      if (pausePollingRef.current) {
        return;
      }

      try {
        const data = await getTournamentById(tournamentId);
        if (isMounted && !pausePollingRef.current) {
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
    intervalIdRef.current = setInterval(fetchTournament, 5000);

    return () => {
      isMounted = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [tournamentId]);

  // Function to pause polling (called before save operations)
  const pausePolling = () => {
    pausePollingRef.current = true;
  };

  // Function to resume polling and force immediate refresh
  const resumePolling = async () => {
    pausePollingRef.current = false;
    // Force immediate refresh after operation completes
    if (tournamentId) {
      try {
        const data = await getTournamentById(tournamentId);
        setTournament(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    }
  };

  return { tournament, loading, error, pausePolling, resumePolling };
}
