// All code in ENGLISH, UI labels in PORTUGUESE
// CourtBadge - Displays court name with configured color

import type { Court } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface CourtBadgeProps {
  courtName: string;
  courts: Court[];
  className?: string;
}

/**
 * CourtBadge Component
 * Displays a court name with its configured background color
 */
export function CourtBadge({ courtName, courts, className = '' }: CourtBadgeProps) {
  // Find the court by name
  const court = courts.find((c) => c.name === courtName);

  // Default color if court not found
  const backgroundColor = court?.color || '#6b7280'; // gray-500 as fallback

  // Calculate if we need light or dark text based on background color
  const isLightBackground = (hex: string): boolean => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 165;
  };

  const textColor = isLightBackground(backgroundColor) ? '#000000' : '#ffffff';

  return (
    <Badge
      variant="secondary"
      className={`font-semibold ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        border: 'none',
      }}
    >
      {courtName}
    </Badge>
  );
}
