import { useEffect, useState } from 'react';

export function useSecurity() {
  const [geoBlocked, setGeoBlocked] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    if (!isMobile) {
      setGeoBlocked(false);
      setGeoLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setGeoBlocked(true);
      return;
    }

    setGeoLoading(true);
    let watchId: number;

    const successHandler = (position: GeolocationPosition) => {
      const lat = position.coords.latitude.toString();
      const lng = position.coords.longitude.toString();
      localStorage.setItem('sim_latitude', lat);
      localStorage.setItem('sim_longitude', lng);
      setGeoBlocked(false);
      setGeoLoading(false);
    };

    const errorHandler = (error: GeolocationPositionError) => {
      console.error('[Geolocation Error]', error);
      localStorage.removeItem('sim_latitude');
      localStorage.removeItem('sim_longitude');
      setGeoBlocked(true);
      setGeoLoading(false);
    };

    // Watch position with optimized settings to avoid timeouts on mobile devices
    watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: false, // Avoid forcing hardware GPS (which fails indoors/on slow connections)
      timeout: 30000,            // 30 seconds timeout
      maximumAge: 30000,         // Accept a cached position from the last 30 seconds
    });

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { geoBlocked, geoLoading };
}