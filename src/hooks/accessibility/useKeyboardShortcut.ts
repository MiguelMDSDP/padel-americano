/**
 * useKeyboardShortcut Hook
 * Register and handle keyboard shortcuts
 * Improves accessibility and power user experience
 */

import { useEffect, useCallback, useRef } from 'react';

type KeyModifier = 'ctrl' | 'alt' | 'shift' | 'meta';

interface ShortcutOptions {
  key: string;
  modifiers?: KeyModifier[];
  description?: string;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcut(
  callback: (event: KeyboardEvent) => void,
  options: ShortcutOptions
) {
  const {
    key,
    modifiers = [],
    preventDefault = true,
    enabled = true,
  } = options;

  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key matches
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      // Check if all required modifiers are pressed
      const hasCtrl = modifiers.includes('ctrl') ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const hasAlt = modifiers.includes('alt') ? event.altKey : !event.altKey;
      const hasShift = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
      const hasMeta = modifiers.includes('meta') ? event.metaKey : !event.metaKey;

      // If modifiers are required
      if (modifiers.length > 0) {
        const ctrlMatch = modifiers.includes('ctrl') ? event.ctrlKey || event.metaKey : true;
        const altMatch = modifiers.includes('alt') ? event.altKey : true;
        const shiftMatch = modifiers.includes('shift') ? event.shiftKey : true;
        const metaMatch = modifiers.includes('meta') ? event.metaKey : true;

        if (ctrlMatch && altMatch && shiftMatch && metaMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          callbackRef.current(event);
        }
      } else {
        // No modifiers required - make sure none are pressed
        if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
          if (preventDefault) {
            event.preventDefault();
          }
          callbackRef.current(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, modifiers, preventDefault, enabled]);
}

// Hook to register multiple shortcuts at once
export function useKeyboardShortcuts(
  shortcuts: Array<{
    callback: (event: KeyboardEvent) => void;
    options: ShortcutOptions;
  }>
) {
  shortcuts.forEach(({ callback, options }) => {
    useKeyboardShortcut(callback, options);
  });
}

// Helper to format shortcut for display
export function formatShortcut(key: string, modifiers: KeyModifier[] = []): string {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

  const modifierSymbols: Record<KeyModifier, string> = {
    ctrl: isMac ? '⌘' : 'Ctrl',
    meta: '⌘',
    alt: isMac ? '⌥' : 'Alt',
    shift: isMac ? '⇧' : 'Shift',
  };

  const parts = modifiers.map(mod => modifierSymbols[mod]);
  parts.push(key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
