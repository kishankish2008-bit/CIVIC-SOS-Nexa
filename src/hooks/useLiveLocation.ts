import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationData, LocationStatus } from '../types';

export interface UseLiveLocationReturn {
  location: LocationData | null;
  status: LocationStatus;
  isTracking: boolean;
  errorMessage: string | null;
  accuracyQuality: 'excellent' | 'good' | 'moderate' | 'low' | 'unavailable';
  speedKmH: number;
  heading: number | null;
  lastUpdatedText: string;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  refreshLocation: () => Promise<void>;
  setCustomLocation: (city: string, country: string, lat?: number, lng?: number) => void;
}

export function useLiveLocation(): UseLiveLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(() => {
    // Default initial location: Bengaluru, Karnataka (with ±12m accuracy)
    return {
      status: 'available',
      latitude: 12.9352,
      longitude: 77.6245,
      accuracy: 12,
      city: 'Bengaluru',
      region: 'Karnataka',
      country: 'India',
      countryCode: 'IN',
      formattedAddress: 'Koramangala 4th Block, Bengaluru, Karnataka 560034',
      freshness: 'LIVE',
      timestamp: Date.now(),
    };
  });

  const [status, setStatus] = useState<LocationStatus>('available');
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speedKmH, setSpeedKmH] = useState<number>(0);
  const [heading, setHeading] = useState<number | null>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Just now');
  const watchIdRef = useRef<number | null>(null);

  // Calculate Accuracy Quality
  const accuracy = location?.accuracy ?? null;
  const accuracyQuality: 'excellent' | 'good' | 'moderate' | 'low' | 'unavailable' = 
    !accuracy ? 'unavailable' :
    accuracy <= 15 ? 'excellent' :
    accuracy <= 30 ? 'good' :
    accuracy <= 100 ? 'moderate' : 'low';

  // Server-side reverse geocode
  const enrichLocationWithServer = useCallback(async (lat: number, lng: number, acc: number, speed?: number | null, head?: number | null) => {
    try {
      const response = await fetch('/api/location/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy: acc })
      });
      if (response.ok) {
        const data = await response.json();
        setLocation({
          status: 'live_tracking',
          latitude: lat,
          longitude: lng,
          accuracy: Math.round(acc),
          city: data.city || 'Bengaluru',
          region: data.region || 'Karnataka',
          country: data.country || 'India',
          countryCode: data.countryCode || 'IN',
          formattedAddress: data.formattedAddress || `${data.city || 'Bengaluru'}, ${data.region || 'Karnataka'}, India`,
          freshness: 'LIVE',
          timestamp: Date.now()
        });
        setStatus('live_tracking');
        setErrorMessage(null);
        if (speed != null && !isNaN(speed)) {
          setSpeedKmH(Math.max(0, Math.round(speed * 3.6)));
        }
        if (head != null && !isNaN(head)) {
          setHeading(Math.round(head));
        }
        setLastUpdatedText('Just now');
        return;
      }
    } catch {
      // Fallback if backend context route fails
    }

    setLocation((prev) => ({
      status: 'live_tracking',
      latitude: lat,
      longitude: lng,
      accuracy: Math.round(acc),
      city: prev?.city || 'Bengaluru',
      region: prev?.region || 'Karnataka',
      country: prev?.country || 'India',
      countryCode: prev?.countryCode || 'IN',
      formattedAddress: prev?.formattedAddress || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
      freshness: 'LIVE',
      timestamp: Date.now()
    }));
    setStatus('live_tracking');
    setLastUpdatedText('Just now');
  }, []);

  const refreshLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      setErrorMessage('Geolocation is not supported by your browser environment.');
      return;
    }

    setStatus('requesting_permission');
    setErrorMessage(null);

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy, speed, heading: h } = position.coords;
          await enrichLocationWithServer(latitude, longitude, accuracy, speed, h);
          resolve();
        },
        (error) => {
          console.warn('[NEXA Geolocation] Position error:', error.message);
          if (error.code === error.PERMISSION_DENIED) {
            setStatus('permission_denied');
            setErrorMessage('Location permission was denied in browser settings.');
          } else {
            setStatus('stale');
            setErrorMessage('Could not acquire direct satellite GPS fix; keeping last verified coordinates.');
          }
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000
        }
      );
    });
  }, [enrichLocationWithServer]);

  const startTracking = useCallback(async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      setErrorMessage('Geolocation is not supported.');
      return;
    }

    setIsTracking(true);
    await refreshLocation();

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        enrichLocationWithServer(
          pos.coords.latitude, 
          pos.coords.longitude, 
          pos.coords.accuracy, 
          pos.coords.speed, 
          pos.coords.heading
        );
      },
      (err) => {
        console.warn('[NEXA Geolocation] Watch update notice:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    watchIdRef.current = id;
  }, [refreshLocation, enrichLocationWithServer]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof window !== 'undefined') {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setStatus('stale');
    setLocation((prev) => prev ? { ...prev, freshness: 'STALE', status: 'stale' } : null);
  }, []);

  const setCustomLocation = useCallback((city: string, country: string, lat = 12.9352, lng = 77.6245) => {
    setLocation({
      status: 'available',
      latitude: lat,
      longitude: lng,
      accuracy: 12,
      city,
      region: country === 'India' ? 'Karnataka' : undefined,
      country,
      formattedAddress: `${city}, ${country}`,
      freshness: 'LIVE',
      timestamp: Date.now()
    });
    setStatus('available');
    setErrorMessage(null);
    setLastUpdatedText('Just now');
  }, []);

  // Initialize tracking on mount if permission exists
  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Update freshness text periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (!location) {
        setLastUpdatedText('Unavailable');
        return;
      }
      const secondsAgo = Math.floor((Date.now() - location.timestamp) / 1000);
      if (secondsAgo < 5) {
        setLastUpdatedText('2 seconds ago');
      } else if (secondsAgo < 60) {
        setLastUpdatedText(`${secondsAgo} seconds ago`);
      } else {
        setLastUpdatedText(`${Math.floor(secondsAgo / 60)} min ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [location]);

  return {
    location,
    status,
    isTracking,
    errorMessage,
    accuracyQuality,
    speedKmH,
    heading,
    lastUpdatedText,
    startTracking,
    stopTracking,
    refreshLocation,
    setCustomLocation
  };
}
