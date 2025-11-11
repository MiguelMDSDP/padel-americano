/**
 * useAnnouncer Hook
 * Screen reader announcements for dynamic content updates
 * Implements ARIA live regions for accessibility
 */

import { useEffect, useRef, useCallback } from 'react';

type AnnouncementPriority = 'polite' | 'assertive';

interface AnnounceOptions {
  priority?: AnnouncementPriority;
  clearAfter?: number; // ms to clear announcement
}

export function useAnnouncer() {
  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region containers if they don't exist
    if (!politeRef.current) {
      const politeDiv = document.createElement('div');
      politeDiv.setAttribute('role', 'status');
      politeDiv.setAttribute('aria-live', 'polite');
      politeDiv.setAttribute('aria-atomic', 'true');
      politeDiv.className = 'sr-only';
      document.body.appendChild(politeDiv);
      politeRef.current = politeDiv;
    }

    if (!assertiveRef.current) {
      const assertiveDiv = document.createElement('div');
      assertiveDiv.setAttribute('role', 'alert');
      assertiveDiv.setAttribute('aria-live', 'assertive');
      assertiveDiv.setAttribute('aria-atomic', 'true');
      assertiveDiv.className = 'sr-only';
      document.body.appendChild(assertiveDiv);
      assertiveRef.current = assertiveDiv;
    }

    return () => {
      // Cleanup on unmount
      politeRef.current?.remove();
      assertiveRef.current?.remove();
    };
  }, []);

  const announce = useCallback((
    message: string,
    options: AnnounceOptions = {}
  ) => {
    const { priority = 'polite', clearAfter = 3000 } = options;
    const container = priority === 'assertive' ? assertiveRef.current : politeRef.current;

    if (container) {
      container.textContent = message;

      if (clearAfter > 0) {
        setTimeout(() => {
          container.textContent = '';
        }, clearAfter);
      }
    }
  }, []);

  return { announce };
}

// Standalone utility function for one-off announcements
export function announceToScreenReader(
  message: string,
  priority: AnnouncementPriority = 'polite'
) {
  const container = document.querySelector(`[aria-live="${priority}"]`) as HTMLDivElement;

  if (container) {
    container.textContent = message;
    setTimeout(() => {
      container.textContent = '';
    }, 3000);
  } else {
    // Fallback: create temporary container
    const tempDiv = document.createElement('div');
    tempDiv.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    tempDiv.setAttribute('aria-live', priority);
    tempDiv.setAttribute('aria-atomic', 'true');
    tempDiv.className = 'sr-only';
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);

    setTimeout(() => {
      tempDiv.remove();
    }, 3000);
  }
}
