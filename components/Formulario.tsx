import React, { useEffect, useState } from 'react';

interface NodoPrincipal {
  NodoID: number;
  Nombre: string;
}

const Formulario: React.FC = () => {
  const [nodos, setNodos] = useState<NodoPrincipal[]>([]);
  const [selectedNodo, setSelectedNodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNodos() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/nodo-principal');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al cargar nodos');
        setNodos(data);
      } catch (err) {
        setError('Error al cargar nodos');
        setNodos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNodos();
  }, []);

    interface Plantilla {
      PlantillaID: number;
      Nombre: string;
      // Agrega otras propiedades si existen
    }
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [mostrarRegistro, setMostrarRegistro] = useState(false);
    const [segmentos, setSegmentos] = useState<any[]>([]);
    const [mostrarSegmento, setMostrarSegmento] = useState(false);
    const [evidencias, setEvidencias] = useState<any[]>([]);
    const [mostrarEvidencia, setMostrarEvidencia] = useState(false);
    const [selectedSegmento, setSelectedSegmento] = useState('');

    useEffect(() => {
      if (selectedNodo) {
        fetch(`/api/plantilla?nodoId=${selectedNodo}`)
          .then(res => res.json())
          .then(data => setPlantillas(data));
      } else {
        setPlantillas([]);
        setSegmentos([]);
      }
    }, [selectedNodo]);

    useEffect(() => {
      if (plantillas.length > 0) {
        // Cargar segmentos para la primera plantilla seleccionada
        fetch(`/api/segmento?plantillaId=${plantillas[0].PlantillaID}`)
          .then(res => res.json())
          .then(data => setSegmentos(data));
      } else {
        setSegmentos([]);
      }
    }, [plantillas]);

    useEffect(() => {
      if (selectedSegmento) {
        fetch(`/api/evidencia?segmentoId=${selectedSegmento}`)
          .then(res => res.json())
          .then(data => setEvidencias(data));
      } else {
        setEvidencias([]);
      }
    }, [selectedSegmento]);

    return (
      <div style={{ maxWidth: 400, margin: '40px auto', background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="nodo-select" style={{ fontWeight: 600 }}>Nodo Principal:</label>
          <select
            id="nodo-select"
            value={selectedNodo}
            onChange={e => { setSelectedNodo(e.target.value); setMostrarRegistro(false); }}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
          >
            <option value="">Seleccione un nodo</option>
            {nodos.map((nodo: any) => (
              <option key={nodo.NodoID} value={nodo.NodoID}>{nodo.Nombre}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="plantilla-select" style={{ fontWeight: 600 }}>Plantilla:</label>
          <select
            id="plantilla-select"
            disabled={!selectedNodo || plantillas.length === 0}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
            onChange={e => {
              // Filtrar segmentos según la plantilla seleccionada
              const plantillaId = e.target.value;
              if (plantillaId) {
                fetch(`/api/segmento?plantillaId=${plantillaId}`)
                  .then(res => res.json())
                  .then(data => setSegmentos(data));
              } else {
                setSegmentos([]);
              }
            }}
          >
            <option value="">{plantillas.length === 0 ? 'No hay plantillas' : 'Seleccione una plantilla'}</option>
            {plantillas.map((plantilla: any) => (
              <option key={plantilla.PlantillaID} value={plantilla.PlantillaID}>{plantilla.Nombre}</option>
            ))}
          </select>
          {selectedNodo && (
            <button onClick={() => setMostrarRegistro(true)} style={{ marginLeft: 8, marginTop: 8 }}>
              Registrar nueva Plantilla
            </button>
          )}
        </div>

        {/* ComboBox Segmento y botón Nuevo segmento */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="segmento-select" style={{ fontWeight: 600 }}>Segmento:</label>
          <select
            id="segmento-select"
            disabled={!selectedNodo || !plantillas.length}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
            onChange={e => {
              setSelectedSegmento(e.target.value);
            }}
            value={selectedSegmento}
          >
            <option value="">Seleccione un segmento</option>
            {Array.isArray(segmentos) && segmentos.map((segmento: any) => (
              <option key={segmento.SegmentoID} value={segmento.SegmentoID}>{segmento.Nombre}</option>
            ))}
          </select>
          <button onClick={() => setMostrarSegmento(true)} style={{ marginLeft: 8, marginTop: 8 }}>
            Nuevo segmento
          </button>
        </div>

        {/* ComboBox Evidencia y botón Nuevo evidencia */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="evidencia-select" style={{ fontWeight: 600 }}>Evidencia:</label>
          <select
            id="evidencia-select"
            disabled={!selectedSegmento}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
          >
            <option value="">Seleccione una evidencia</option>
            {Array.isArray(evidencias) && evidencias.map((evidencia: any) => (
              <option key={evidencia.EvidenciaID} value={evidencia.EvidenciaID}>{evidencia.Nombre}</option>
            ))}
          </select>
          <button onClick={() => setMostrarEvidencia(true)} style={{ marginLeft: 8, marginTop: 8 }}>
            Nueva evidencia
          </button>
        </div>

        {mostrarEvidencia && (
          <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
            <h4 style={{ marginBottom: 12 }}>Registrar Nueva Evidencia</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const nombre = formData.get('nombre');
              const segmentoId = selectedSegmento;
              const esObligatoria = formData.get('esObligatoria') === 'on' ? 1 : 0;
              // Calcular el orden automáticamente (correlativo)
              let orden = 1;
              if (Array.isArray(evidencias) && evidencias.length > 0) {
                orden = Math.max(...evidencias.map(ev => ev.Orden)) + 1;
              }
              if (!segmentoId) {
                alert('Seleccione un segmento antes de registrar evidencia');
                return;
              }
              const res = await fetch('/api/evidencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, segmentoId, esObligatoria, orden })
              });
              if (res.ok) {
                setMostrarEvidencia(false);
                alert('Evidencia registrada correctamente');
                // Recargar evidencias
                fetch(`/api/evidencia?segmentoId=${segmentoId}`)
                  .then(res => res.json())
                  .then(data => setEvidencias(data));
              } else {
                const errorData = await res.json();
                alert('Error al registrar evidencia: ' + (errorData.error || ''));
              }
            }}>
              <div style={{ marginBottom: 10 }}>
                <label>Nombre:</label><br />
                <input name="nombre" type="text" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>
                  <input name="esObligatoria" type="checkbox" style={{ marginRight: 8 }} />
                  ¿Es obligatoria?
                </label>
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Guardar Evidencia</button>
            </form>
          </div>
        )}

        {mostrarSegmento && (
          <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
            <h4 style={{ marginBottom: 12 }}>Registrar Nuevo Segmento</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const nombre = formData.get('nombre');
              const orden = formData.get('orden');
              // Usar la plantilla seleccionada en el combobox
              const selectPlantilla = document.getElementById('plantilla-select') as HTMLSelectElement;
              const plantillaId = selectPlantilla && selectPlantilla.value ? parseInt(selectPlantilla.value) : null;
              if (!plantillaId) {
                alert('Seleccione una plantilla antes de registrar un segmento');
                return;
              }
              const res = await fetch('/api/segmento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, orden, plantillaId })
              });
              if (res.ok) {
                setMostrarSegmento(false);
                alert('Segmento registrado correctamente');
                // Recargar segmentos
                if (plantillaId) {
                  fetch(`/api/segmento?plantillaId=${plantillaId}`)
                    .then(res => res.json())
                    .then(data => setSegmentos(data));
                }
              } else {
                const errorData = await res.json();
                alert('Error al registrar segmento: ' + (errorData.error || ''));
              }
            }}>
              <div style={{ marginBottom: 10 }}>
                <label>Nombre:</label><br />
                <input name="nombre" type="text" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Orden:</label><br />
                <input name="orden" type="number" min="1" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Guardar Segmento</button>
            </form>
          </div>
        )}
        {mostrarRegistro && (
          <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
            <h4 style={{ marginBottom: 12 }}>Registrar Nueva Plantilla</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const nombre = formData.get('nombre');
              const descripcion = formData.get('descripcion');
              const nodoId = selectedNodo;
              const res = await fetch('/api/plantilla', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, descripcion, nodoId })
              });
              if (res.ok) {
                setMostrarRegistro(false);
                setPlantillas([]); // Forzar recarga
              } else {
                alert('Error al registrar plantilla');
              }
            }}>
              <div style={{ marginBottom: 10 }}>
                <label>Nombre:</label><br />
                <input name="nombre" type="text" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Descripción:</label><br />
                <textarea name="descripcion" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Guardar Plantilla</button>
            </form>
          </div>
        )}
      </div>
    );
};

export default Formulario;
