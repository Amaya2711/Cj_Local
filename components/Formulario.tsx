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
    const [selectedEvidencia, setSelectedEvidencia] = useState('');

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


    // Para el grid de combinaciones locales
    const [combinaciones, setCombinaciones] = useState<any[]>([]);

    // Estado para mostrar el formulario de nuevo nodo principal
    const [mostrarNuevoNodo, setMostrarNuevoNodo] = useState(false);

    function handleAgregarCombinacion() {
      if (!selectedNodo || !plantillas.length || !selectedSegmento || !selectedEvidencia) return;
      const nodo = nodos.find(n => n.NodoID === Number(selectedNodo));
      const plantilla = plantillas[0];
      const segmento = segmentos.find(s => s.SegmentoID === Number(selectedSegmento));
      const evidencia = evidencias.find(ev => ev.EvidenciaID === Number(selectedEvidencia));
      if (!evidencia) return;
      // Validar duplicados
      const existe = combinaciones.some(c =>
        c.NodoID === selectedNodo &&
        c.PlantillaID === plantilla.PlantillaID &&
        c.SegmentoID === selectedSegmento &&
        c.EvidenciaID === evidencia.EvidenciaID
      );
      if (existe) {
        alert('La combinación ya existe en el listado.');
        return;
      }
      setCombinaciones(prev => [
        ...prev,
        {
          NodoID: selectedNodo,
          NodoNombre: nodo?.Nombre || '',
          PlantillaID: plantilla.PlantillaID,
          PlantillaNombre: plantilla.Nombre,
          SegmentoID: selectedSegmento,
          SegmentoNombre: segmento?.Nombre || '',
          EvidenciaID: evidencia.EvidenciaID,
          EvidenciaNombre: evidencia.Nombre
        }
      ]);
    }

    function handleEliminarCombinacion(idx: number) {
      setCombinaciones(prev => prev.filter((_, i) => i !== idx));
    }

    // Función para grabar las combinaciones en la tabla Plantilla_Imagenes
    async function handleGrabar() {
      if (combinaciones.length === 0) {
        alert('No hay combinaciones para grabar.');
        return;
      }
      // Validar que todos los campos requeridos estén presentes y válidos
      const camposObligatorios = ['NodoID', 'PlantillaID', 'SegmentoID', 'EvidenciaID'];
      for (const c of combinaciones) {
        for (const campo of camposObligatorios) {
          if (
            c[campo] === undefined ||
            c[campo] === null ||
            c[campo] === '' ||
            isNaN(Number(c[campo]))
          ) {
            alert('Error: Hay combinaciones con datos faltantes o inválidos. Verifique antes de grabar.');
            return;
          }
        }
      }
      // Obtener el usuario actual (puedes ajustar según tu sistema de autenticación)
      // Ejemplo: obtener de localStorage, contexto, o variable global
        // Mostrar el valor global pb_Usuario al grabar
        const usuarioGlobal = (typeof window !== 'undefined' && window.pb_Usuario) ? window.pb_Usuario : (typeof window !== 'undefined' ? localStorage.getItem('pb_Usuario') : '');
        alert(`global: ${usuarioGlobal}`);
        const payload = combinaciones.map(c => ({
          NodoID: c.NodoID,
          PlantillaID: c.PlantillaID,
          SegmentoID: c.SegmentoID,
          EvidenciaID: c.EvidenciaID,
          RutaImagen: '',
          IdUsuario: usuarioGlobal
        }));
        // Enviar usuarioGlobal como parte del body principal si el backend lo requiere
        const body = {
          combinaciones: payload,
          usuario: usuarioGlobal
        };
        // ...fetch/axios POST usando body...
      const res = await fetch('/api/plantilla-imagenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registros: payload })
      });
      if (res.ok) {
        alert('Combinaciones grabadas correctamente.');
        setCombinaciones([]);
      } else {
        const errorData = await res.json();
        // Construir la sentencia SQL para mostrarla en el error
        let sqlSentencias = '';
        for (const reg of payload) {
          sqlSentencias += `INSERT INTO Plantilla_Imagenes (NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario) VALUES (${reg.NodoID}, ${reg.PlantillaID}, ${reg.SegmentoID}, ${reg.EvidenciaID}, '${reg.RutaImagen}', '${reg.IdUsuario}');\n`;
        }
        alert('Error al grabar: ' + (errorData.error || '') + '\nSentencia SQL enviada:\n' + sqlSentencias);
      }
    }

    return (
      <div style={{ width: '100%', maxWidth: 700, minWidth: 320, margin: '40px 0 0 0', background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 32, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <div style={{ marginBottom: 24, textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <label htmlFor="nodo-select" style={{ fontWeight: 600 }}>Nodo Principal:</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', width: '100%', alignItems: 'flex-start' }}>
            <select
              id="nodo-select"
              value={selectedNodo}
              onChange={e => { setSelectedNodo(e.target.value); setMostrarRegistro(false); }}
              style={{ width: 100 + '%', minWidth: 320, maxWidth: 600, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
            >
              <option value="">Seleccione un nodo</option>
              {nodos.map((nodo: any) => (
                <option key={nodo.NodoID} value={nodo.NodoID}>{nodo.Nombre}</option>
              ))}
            </select>
            <button onClick={() => setMostrarNuevoNodo(true)} style={{ marginTop: 6, background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
              Registrar Nodo
            </button>
          </div>
        </div>
                {mostrarNuevoNodo && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
                    <div style={{ maxWidth: 350, margin: '80px auto', background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 24 }}>
                      <h4 style={{ marginBottom: 12 }}>Registrar Nuevo Nodo Principal</h4>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const nombre = formData.get('nombre');
                        if (!nombre) return;
                        const res = await fetch('/api/nodo-principal', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ nombre })
                        });
                        if (res.ok) {
                          setMostrarNuevoNodo(false);
                          // Recargar nodos
                          fetch('/api/nodo-principal')
                            .then(res => res.json())
                            .then(data => setNodos(data));
                        } else {
                          alert('Error al registrar nodo principal');
                        }
                      }}>
                        <div style={{ marginBottom: 10 }}>
                          <label>Nombre del nodo:</label><br />
                          <input name="nombre" type="text" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="submit" style={{ background: '#059669', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Guardar Nodo</button>
                          <button type="button" onClick={() => setMostrarNuevoNodo(false)} style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Cancelar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
        <div style={{ marginBottom: 24, textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <label htmlFor="plantilla-select" style={{ fontWeight: 600 }}>Plantilla:</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', width: '100%', alignItems: 'flex-start' }}>
            <select
              id="plantilla-select"
              disabled={!selectedNodo || plantillas.length === 0}
              style={{ width: 100 + '%', minWidth: 320, maxWidth: 600, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
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
              <button onClick={() => setMostrarRegistro(true)} style={{ marginTop: 6, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
                Registrar Plantilla
              </button>
            )}
          </div>
        </div>

        {/* ComboBox Segmento y botón Nuevo segmento */}
        <div style={{ marginBottom: 24, textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <label htmlFor="segmento-select" style={{ fontWeight: 600 }}>Segmento:</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', width: '100%', alignItems: 'flex-start' }}>
            <select
              id="segmento-select"
              disabled={!selectedNodo || !plantillas.length}
              style={{ width: 100 + '%', minWidth: 320, maxWidth: 600, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
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
            <button onClick={() => setMostrarSegmento(true)} style={{ marginTop: 6, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
              Registrar Segmento
            </button>
          </div>
        </div>

        {/* ComboBox Evidencia y botón Nueva evidencia + AGREGAR */}
        <div style={{ marginBottom: 24, textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <label htmlFor="evidencia-select" style={{ fontWeight: 600 }}>Evidencia:</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', width: '100%', alignItems: 'flex-start' }}>
            <select
              id="evidencia-select"
              disabled={!selectedSegmento}
              style={{ width: 100 + '%', minWidth: 320, maxWidth: 600, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
              value={selectedEvidencia}
              onChange={e => setSelectedEvidencia(e.target.value)}
            >
              <option value="">Seleccione una evidencia</option>
              {Array.isArray(evidencias) && evidencias.map((evidencia: any) => (
                <option key={evidencia.EvidenciaID} value={evidencia.EvidenciaID}>{evidencia.Nombre}</option>
              ))}
            </select>
            <button onClick={() => setMostrarEvidencia(true)} style={{ marginTop: 6, background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
              Registrar evidencia
            </button>
          </div>
          <div style={{ marginTop: 12, textAlign: 'left', width: '100%' }}>
            <button onClick={handleAgregarCombinacion} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, minWidth: 120 }}>
              Agregar
            </button>
          </div>
        </div>


        {/* Grid de combinaciones agregadas */}
        {combinaciones.length > 0 && (
          <div style={{ marginBottom: 24, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f3f4f6', padding: 16, width: '100%', maxWidth: 700, minWidth: 320, marginLeft: 0, marginRight: 0, textAlign: 'left' }}>
            <h4 style={{ marginBottom: 10 }}>Combinaciones agregadas</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#e5e7eb' }}>
                  <th style={{ padding: 6, border: '1px solid #cbd5e1' }}>Nodo</th>
                  <th style={{ padding: 6, border: '1px solid #cbd5e1' }}>Plantilla</th>
                  <th style={{ padding: 6, border: '1px solid #cbd5e1' }}>Segmento</th>
                  <th style={{ padding: 6, border: '1px solid #cbd5e1' }}>Evidencia</th>
                  <th style={{ padding: 6, border: '1px solid #cbd5e1' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {combinaciones.map((c, idx) => (
                  <tr key={idx}>
                    {/* Campos ocultos para NodoID, PlantillaID, SegmentoID, EvidenciaID */}
                    <td style={{ display: 'none' }}>{c.NodoID}</td>
                    <td style={{ display: 'none' }}>{c.PlantillaID}</td>
                    <td style={{ display: 'none' }}>{c.SegmentoID}</td>
                    <td style={{ display: 'none' }}>{c.EvidenciaID}</td>
                    {/* Campos visibles */}
                    <td style={{ padding: 6, border: '1px solid #cbd5e1' }}>{c.NodoNombre}</td>
                    <td style={{ padding: 6, border: '1px solid #cbd5e1' }}>{c.PlantillaNombre}</td>
                    <td style={{ padding: 6, border: '1px solid #cbd5e1' }}>{c.SegmentoNombre}</td>
                    <td style={{ padding: 6, border: '1px solid #cbd5e1' }}>{c.EvidenciaNombre}</td>
                    <td style={{ padding: 6, border: '1px solid #cbd5e1' }}>
                      <button onClick={() => handleEliminarCombinacion(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16, width: '100%', textAlign: 'right' }}>
              <button onClick={handleGrabar} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 700, fontSize: 16 }}>
                Grabar
              </button>
            </div>
          </div>
        )}

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
