import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTimer Hook
 *
 * Custom hook for countdown timer with start/pause/reset functionality
 * Default duration: 15 minutes (900 seconds)
 *
 * @param durationMinutes - Duration in minutes (default: 15)
 * @returns Timer state and control methods
 */
export function useTimer(durationMinutes: number = 15) {
  // Calculate initial duration in seconds
  const initialDuration = durationMinutes * 60;

  // Internal states
  const [timeRemaining, setTimeRemaining] = useState<number>(initialDuration); // in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Ref to store interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Format time as mm:ss
   * @param seconds - Time in seconds
   * @returns Formatted string (e.g., "15:00", "03:45")
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  /**
   * Calculate progress as percentage (0-100)
   * Used for progress bar visualization
   */
  const calculateProgress = useCallback((): number => {
    const elapsed = initialDuration - timeRemaining;
    const progress = (elapsed / initialDuration) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0-100
  }, [timeRemaining, initialDuration]);

  /**
   * Start the timer
   */
  const start = useCallback(() => {
    if (timeRemaining <= 0) {
      return; // Cannot start if already finished
    }
    setIsRunning(true);
    setIsFinished(false);
  }, [timeRemaining]);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  /**
   * Reset the timer to initial duration
   */
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeRemaining(initialDuration);
  }, [initialDuration]);

  /**
   * Effect to handle countdown logic
   */
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;

          // Check if timer finished
          if (newTime <= 0) {
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }

          return newTime;
        });
      }, 1000); // Update every second
    } else {
      // Clear interval if not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  /**
   * Effect to handle timer finish
   */
  useEffect(() => {
    if (timeRemaining === 0 && !isFinished) {
      setIsFinished(true);
      setIsRunning(false);
    }
  }, [timeRemaining, isFinished]);

  // Return timer state and methods
  return {
    timeRemaining,                    // seconds remaining (number)
    timeFormatted: formatTime(timeRemaining), // formatted time (string: "mm:ss")
    isRunning,                        // is timer currently running? (boolean)
    isFinished,                       // has timer reached zero? (boolean)
    progress: calculateProgress(),    // progress percentage 0-100 (number)
    start,                            // start/resume timer
    pause,                            // pause timer
    reset,                            // reset to initial duration
  };
}
