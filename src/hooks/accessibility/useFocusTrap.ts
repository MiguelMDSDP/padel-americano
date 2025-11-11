/**
 * useFocusTrap Hook
 * Trap focus within a container (modals, dialogs, popovers)
 * Improves keyboard navigation accessibility
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

interface UseFocusTrapOptions {
  active?: boolean;
  initialFocus?: boolean;
  returnFocus?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const {
    active = true,
    initialFocus = true,
    returnFocus = true,
  } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the element that had focus before the trap
    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_ELEMENTS.join(',')
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Set initial focus
    if (initialFocus && firstFocusable) {
      firstFocusable.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // If only one focusable element, prevent tabbing
      if (focusableElements.length === 1) {
        e.preventDefault();
        return;
      }

      // Tab backwards
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      }
      // Tab forwards
      else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);

      // Return focus to previous element
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, initialFocus, returnFocus]);

  return containerRef;
}
