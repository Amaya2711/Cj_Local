// [EXTRACT-FULL] Necesito el contenido real del archivo para analizar el problema de datos y autocompletado en GoogleMapsForm.
// [READ-FULL] Solicitud de lectura completa para análisis de store EmpleadoCuadrilla y autocompletado en GoogleMapsForm
// [READ-FULL] Solicitud de lectura completa para análisis de store EmpleadoCuadrilla y autocompletado en GoogleMapsForm
import React, { useState, useEffect, useRef } from 'react';

// Puedes personalizar los combos según tus necesidades
type Empleado = {
  id: string | number;
  nombre: string;
  // agrega más campos si es necesario
};

const GoogleMapsForm: React.FC<{ debug?: boolean }> = ({ debug }) => {
  if (debug) {
    console.log('GoogleMapsForm montado');
  }
  // Fecha seleccionada
  const [fecha, setFecha] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10); // yyyy-mm-dd
  });
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadoInput, setEmpleadoInput] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(false);
  const [rutaPuntos, setRutaPuntos] = useState<Array<{ latitud: number; altitud: number }>>([]);

  // Handler para el botón 'Mostrar ruta'
  const handleMostrarRuta = async () => {
    if (!empleadoSeleccionado) {
      alert('Seleccione un empleado válido.');
      return;
    }
    setLoading(true);
    try {
      // Llama al endpoint que ejecuta el store SP_ObtenerFechaRuta
      const res = await fetch(`/api/obtener-fecha-ruta?idEmpleado=${empleadoSeleccionado.id}&fecha=${fecha}`);
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr: any) {
        alert('Respuesta no es JSON. Error: ' + (jsonErr?.message || jsonErr));
        setRutaPuntos([]);
        return;
      }
      if (!res.ok) {
        alert((data?.error ? 'Backend: ' + data.error : '') || 'Error al consultar la ruta.');
        setRutaPuntos([]);
        return;
      }
      if (Array.isArray(data) && data.length > 0) {
        // Asumimos que los campos son latitud y altitud (altitud = longitud)
        setRutaPuntos(
          data.map((p: any) => ({
            latitud: Number(p.latitud ?? p.Latitud ?? p.latitude ?? 0),
            altitud: Number(p.altitud ?? p.Altitud ?? p.longitud ?? p.Longitud ?? p.longitude ?? 0),
          })).filter(p => p.latitud && p.altitud)
        );
      } else {
        alert('No existen registros');
        setRutaPuntos([]);
      }
    } catch (err) {
      alert('Error inesperado al consultar la ruta. Detalle: ' + (err instanceof Error ? err.message : String(err)));
      setRutaPuntos([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener empleados desde el mismo endpoint que Asignacion
  useEffect(() => {
    fetch('/api/cuadrilla-asignacion-cuadrillas')
      .then(res => res.json())
      .then(data => {
        if (debug) {
          console.log('Respuesta cuadrillas:', data);
        }
        // El endpoint retorna un array de objetos con IdEmpleado y NombreEmpleado
        if (Array.isArray(data)) {
          setEmpleados(data.map((c: any) => ({
            id: c.IdEmpleado ?? c.idempleado,
            nombre: c.NombreEmpleado ?? c.nombreempleado
          })));
        } else {
          setEmpleados([]);
        }
      })
      .catch(err => {
        if (debug) {
          console.error('Error al obtener cuadrillas:', err);
        }
        setEmpleados([]);
      });
  }, [debug]);

  // Filtrado para autocompletado
  const empleadosFiltrados = empleados.filter(e =>
    e.nombre?.toLowerCase().includes(empleadoInput.toLowerCase())
  );
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Eliminado texto de prueba */}
      {/* Eliminado título y descripción para compactar el formulario */}
      <form style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '0 0 18px 0', padding: 0 }} autoComplete="off">
                {/* Selector de fecha */}
                <div>
                  <label style={{ fontWeight: 600 }}>Fecha:&nbsp;</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </div>
        <div style={{ position: 'relative', maxWidth: 350 }}>
          <label style={{ fontWeight: 600 }}>Empleado:&nbsp;</label>
          <input
            type="text"
            value={empleadoInput}
            onChange={e => {
              setEmpleadoInput(e.target.value);
              setEmpleadoSeleccionado(null);
            }}
            placeholder="Buscar empleado..."
            style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
          />
          {empleadoInput && empleadosFiltrados.length > 0 && !empleadoSeleccionado && (
            <ul style={{
              position: 'absolute',
              zIndex: 10,
              background: '#fff',
              border: '1px solid #ddd',
              width: '100%',
              maxHeight: 180,
              overflowY: 'auto',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              boxShadow: '0 2px 8px #0002'
            }}>
              {empleadosFiltrados.map(e => (
                <li
                  key={e.id}
                  style={{ padding: 8, cursor: 'pointer' }}
                  onClick={() => {
                    setEmpleadoSeleccionado(e);
                    setEmpleadoInput(e.nombre);
                  }}
                >
                  {e.nombre}
                </li>
              ))}
            </ul>
          )}
          {empleadoSeleccionado && (
            <div style={{ color: '#2563eb', fontSize: 13, marginTop: 2 }}>
              Seleccionado: {empleadoSeleccionado.nombre}
            </div>
          )}
          {/* Mensaje si no hay empleados */}
          {empleados.length === 0 && (
            <div style={{ color: 'crimson', fontSize: 13, marginTop: 4 }}>
              No se encontraron empleados. Verifica la API o el store EmpleadoCuadrilla.
            </div>
          )}
        </div>
        {/* Botón Mostrar ruta */}
        <div>
          <button
            type="button"
            style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 5, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', width: '100%' }}
            onClick={handleMostrarRuta}
            disabled={loading}
          >
            {loading ? 'Consultando...' : 'Mostrar ruta'}
          </button>
        </div>
        {/* Puedes agregar más combos aquí */}
      </form>
      <div style={{ width: '100%', height: 500, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px #0002', position: 'relative' }}>
        {/* Si hay puntos de ruta, mostrar el mapa con marcadores usando Google Maps JS API */}
        {rutaPuntos.length > 0 ? (
          <GoogleMapWithMarkers puntos={rutaPuntos} />
        ) : (
          <iframe
            title="Mapa de Perú"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6339647.964024019!2d-81.410697!3d-9.189967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8e573b5b7e1%3A0x1e6e7e7e7e7e7e7e!2sPer%C3%BA!5e0!3m2!1ses-419!2spe!4v1700000000000!5m2!1ses-419!2spe"
            allowFullScreen
          ></iframe>
        )}
      </div>
    </div>
  );
};

// Componente para mostrar el mapa con marcadores usando Google Maps JS API

type PuntoRuta = { latitud: number; altitud: number };

const GoogleMapWithMarkers: React.FC<{ puntos: PuntoRuta[] }> = ({ puntos }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) return;
    // Centrar en el primer punto o en Perú si no hay
    const center = puntos.length > 0 ? { lat: puntos[0].latitud, lng: puntos[0].altitud } : { lat: -9.189967, lng: -75.015152 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 10,
    });
    // Marcar los puntos
    puntos.forEach(p => {
      new window.google.maps.Marker({
        position: { lat: p.latitud, lng: p.altitud },
        map,
      });
    });
    // Dibujar la ruta si hay más de un punto
    if (puntos.length > 1) {
      new window.google.maps.Polyline({
        path: puntos.map(p => ({ lat: p.latitud, lng: p.altitud })),
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });
    }
  }, [puntos]);
  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMapsForm;
