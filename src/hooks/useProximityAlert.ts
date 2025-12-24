import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

interface UseProximityAlertOptions {
  thresholdMeters?: number;
  onProximityReached?: () => void;
}

export function useProximityAlert(
  instructorLocation: Coordinates | null | undefined,
  studentLocation: Coordinates | null | undefined,
  options: UseProximityAlertOptions = {}
) {
  const { thresholdMeters = 500, onProximityReached } = options;
  const { toast } = useToast();
  const alertShownRef = useRef(false);
  const previousDistanceRef = useRef<number | null>(null);

  const checkProximity = useCallback(() => {
    if (!instructorLocation || !studentLocation) return;

    const distance = calculateDistance(instructorLocation, studentLocation);

    // Check if instructor is within threshold and alert hasn't been shown
    if (distance <= thresholdMeters && !alertShownRef.current) {
      alertShownRef.current = true;
      
      // Show toast notification
      toast({
        title: '🚗 Instrutor se aproximando!',
        description: `O instrutor está a menos de ${thresholdMeters}m de você. Prepare-se!`,
        duration: 10000,
      });

      // Play notification sound if available
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // Ignore audio errors
      }

      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      onProximityReached?.();
    }

    // Reset alert if instructor moves away
    if (distance > thresholdMeters * 1.5) {
      alertShownRef.current = false;
    }

    previousDistanceRef.current = distance;
  }, [instructorLocation, studentLocation, thresholdMeters, toast, onProximityReached]);

  useEffect(() => {
    checkProximity();
  }, [checkProximity]);

  // Return current distance for display
  const distance =
    instructorLocation && studentLocation
      ? calculateDistance(instructorLocation, studentLocation)
      : null;

  return {
    distance,
    isNearby: distance !== null && distance <= thresholdMeters,
    alertShown: alertShownRef.current,
  };
}
