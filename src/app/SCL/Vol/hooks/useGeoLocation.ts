import { useState } from 'react';

export function useGeoLocation() {
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const obterLocalizacao = () => {
    if (!navigator.geolocation) {
      setErro("Geolocalização não suportada pelo navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setErro(null);
      },
      (err) => {
        setErro("Permissão de localização negada.");
        console.error(err);
      },
      { enableHighAccuracy: true }
    );
  };

  return { coords, erro, obterLocalizacao };
}