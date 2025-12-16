import React, { useEffect, useRef } from 'react';

// Espera recibir un prop "coordenadas" con un array de objetos { latitud, altitud }
// Si no recibe coordenadas, muestra un mapa centrado en Perú
const GoogleMap: React.FC<{ coordenadas?: Array<{ latitud: number; altitud: number }> }> = ({ coordenadas = [] }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) return;
    const center = coordenadas.length > 0
      ? { lat: coordenadas[0].latitud, lng: coordenadas[0].altitud }
      : { lat: -9.189967, lng: -75.015152 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: coordenadas.length > 0 ? 13 : 6,
    });
    // No mostrar marcadores, solo la ruta
    // Dibujar la ruta si hay más de un punto
    if (coordenadas.length > 1) {
      new window.google.maps.Polyline({
        path: coordenadas.map(p => ({ lat: p.latitud, lng: p.altitud })),
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map,
      });
    }
  }, [coordenadas]);

  return (
    <div style={{ width: '100%', height: 500, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px #0002', margin: '0 auto' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default GoogleMap;
