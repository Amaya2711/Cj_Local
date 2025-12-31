// --- INICIO: DEBUG ---
// Este comentario es temporal para indicar que se está revisando el código de este archivo
// para explicar qué elementos se muestran en el mapa y la funcionalidad del círculo rojo con número.
// --- FIN: DEBUG ---
// [EXTRACT-FULL] Necesito el contenido real del archivo para analizar el problema de datos y autocompletado en GoogleMapsForm.
// [READ-FULL] Solicitud de lectura completa para análisis de store EmpleadoCuadrilla y autocompletado en GoogleMapsForm
// [READ-FULL] Solicitud de lectura completa para análisis de store EmpleadoCuadrilla y autocompletado en GoogleMapsForm
// --- DEBUG de variables de entorno Google Maps (replicado de GoogleMap.tsx) ---
console.log('🔍 INIT: Verificando variables de entorno al cargar GoogleMapsForm');
console.log('🌐 Entorno:', typeof window !== 'undefined' ? window.location.hostname : 'server');
console.log('API Key presente:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
console.log('API Key valor:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 15) + '...' || 'undefined');
console.log('Supabase URL presente:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('🔍 TODAS las variables NEXT_PUBLIC:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));

const isProduction = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') || 
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname !== 'localhost'
);

if (isProduction && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️ PRODUCCIÓN: Variables de entorno no configuradas en plataforma de despliegue');
}
import React, { useState, useEffect, useRef } from 'react';
import GoogleMap from '../map-google/GoogleMap';

// Puedes personalizar los combos según tus necesidades
type Empleado = {
  id: string | number;
  nombre: string;
  // agrega más campos si es necesario
};

const GoogleMapsForm: React.FC<{ debug?: boolean }> = ({ debug }) => {
  // useEffect para cargar Google Maps JS API dinámicamente (debe estar dentro del componente)
  React.useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBmtiE0jWFGUFAZXoBgF3XyXmBmJit6m6U';
    if (!apiKey || apiKey === 'undefined') {
      console.error('❌ Google Maps API Key no encontrada en variables de entorno');
      return;
    }
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,visualization&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Maps JS API cargado correctamente en GoogleMapsForm');
      };
      script.onerror = (error) => {
        console.error('❌ Error cargando Google Maps script en GoogleMapsForm:', error);
      };
      document.head.appendChild(script);
    } else {
      console.log('ℹ️ Google Maps JS API ya estaba cargado en GoogleMapsForm');
    }
  }, []);
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
  const [rutaPuntos, setRutaPuntos] = useState<Array<{ latitud: number; altitud: number; fecha?: string; hora?: string }>>([]);
  // Handler para el botón 'Buscar' (todas las ubicaciones del día)
  const handleBuscarTodas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/obtener-fecha-ruta?fecha=${fecha}`);
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        alert('Respuesta no es JSON. Error: ' + ((jsonErr instanceof Error ? jsonErr.message : String(jsonErr))));
        setRutaPuntos([]);
        return;
      }
      if (!res.ok) {
        alert((data?.error ? 'Backend: ' + data.error : '') || 'Error al consultar ubicaciones.');
        setRutaPuntos([]);
        return;
      }
      if (Array.isArray(data) && data.length > 0) {
        setRutaPuntos(
          data.map((p: any) => ({
            latitud: Number(p.latitud ?? p.Latitud ?? p.latitude ?? 0),
            altitud: Number(p.altitud ?? p.Altitud ?? p.longitud ?? p.Longitud ?? p.longitude ?? 0),
            fecha: p.fecha || p.Fecha || (p.timestamp ? String(p.timestamp).split('T')[0] : ''),
            hora: p.hora || p.Hora || (p.timestamp ? (String(p.timestamp).split('T')[1] || '').substring(0,8) : ''),
          })).filter(p => p.latitud && p.altitud)
        );
      } else {
        alert('No existen ubicaciones para el día seleccionado');
        setRutaPuntos([]);
      }
    } catch (err) {
      alert('Error inesperado al consultar ubicaciones. Detalle: ' + (err instanceof Error ? err.message : String(err)));
      setRutaPuntos([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler para el botón 'Mostrar ruta'
  const handleMostrarRuta = async () => {
    if (!empleadoSeleccionado) {
      alert('Seleccione un empleado válido.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/obtener-fecha-ruta?idEmpleado=${empleadoSeleccionado.id}&fecha=${fecha}`);
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        alert('Respuesta no es JSON. Error: ' + ((jsonErr instanceof Error ? jsonErr.message : String(jsonErr))));
        setRutaPuntos([]);
        return;
      }
      if (!res.ok) {
        alert((data?.error ? 'Backend: ' + data.error : '') || 'Error al consultar la ruta.');
        setRutaPuntos([]);
        return;
      }
      if (Array.isArray(data) && data.length > 0) {
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
        {/* Botones de acción */}
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
      {/* Mapa Google Maps Platform mostrando todos los puntos del día */}
      <GoogleMap coordenadas={rutaPuntos} />

      {/* Cuadro de detalle de puntos visualizados oculto */}
    </div>
  );
};



              // El useEffect debe estar dentro del cuerpo del componente principal
export default GoogleMapsForm;
