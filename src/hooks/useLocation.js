// src/hooks/useLocation.js
import { useState, useCallback } from 'react';

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation not supported');
        setError(err);
        reject(err);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: '',
            state: '',
          };

          // Try reverse geocoding
          try {
            const res = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${loc.lat}&longitude=${loc.lng}&count=1&language=en`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.results?.[0]) {
                loc.city = data.results[0].name || '';
                loc.state = data.results[0].admin1 || '';
              }
            }
          } catch {}

          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        (err) => {
          setError(err);
          setLoading(false);
          reject(err);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    });
  }, []);

  return { location, loading, error, requestLocation };
}
