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
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const loc = { lat, lng, city: '', state: '' };

          // Reverse geocode using Nominatim (coords → city name)
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
              { headers: { 'User-Agent': 'MonsoonMitra/1.0' } }
            );
            if (res.ok) {
              const data = await res.json();
              if (data?.address) {
                // Pick the most specific populated place name
                loc.city =
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  data.address.county ||
                  data.address.state_district ||
                  '';
                loc.state = data.address.state || '';
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
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
      );
    });
  }, []);

  return { location, loading, error, requestLocation };
}
