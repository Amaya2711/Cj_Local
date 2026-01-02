import React, { useState, useEffect } from 'react';

interface Nodo {
  NodoID: number;
  Nombre: string;
}
interface Plantilla {
  PlantillaID: number;
  Nombre: string;
}
interface Segmento {
  SegmentoID: number;
  Nombre: string;
}
interface Evidencia {
  EvidenciaID: number;
  Nombre: string;
}

const CopiaFormulario: React.FC = () => {
  const [paso, setPaso] = useState(1);
  const [nodos, setNodos] = useState<Nodo[]>([]);
  const [nodoSeleccionado, setNodoSeleccionado] = useState<number | null>(null);
  const [loadingNodos, setLoadingNodos] = useState(false);
  const [errorNodos, setErrorNodos] = useState('');

  // Función para ejecutar el SP de seguimiento
  async function handleInsertarPlantillaSeguimiento(autoId: number) {
    if (!nodoSeleccionado || !plantillaSeleccionada) {
      alert('Debe seleccionar nodo y plantilla.');
      return;
    }
    const usuarioGlobal = (typeof window !== 'undefined' && (window as any).pb_Usuario) ? (window as any).pb_Usuario : (typeof window !== 'undefined' ? localStorage.getItem('pb_Usuario') : '');
    if (!usuarioGlobal) {
      alert('No se encontró el usuario.');
      return;
    }
    // Mostrar los parámetros antes de ejecutar el SP
    const parametros = {
      NodoID: nodoSeleccionado,
      PlantillaID: plantillaSeleccionada,
      AutoID: autoId,
      IdUsuario: usuarioGlobal
    };
    alert('Parámetros enviados al SP_InsertarPlantillaSeguimientoImagenes:\n' + JSON.stringify(parametros, null, 2));
    try {
      const res = await fetch('/api/insertar-plantilla-seguimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parametros)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Seguimiento insertado correctamente.\n' + JSON.stringify(data.result, null, 2));
      } else {
        alert('Error al insertar seguimiento: ' + (data.error || ''));
      }
    } catch (err) {
      alert('Error inesperado al llamar al endpoint de seguimiento.');
    }
  }

  useEffect(() => {
    async function fetchNodos() {
      setLoadingNodos(true);
      setErrorNodos('');
      try {
        const res = await fetch('/api/nodo-principal');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al cargar nodos');
        setNodos(data);
      } catch (err) {
        setErrorNodos('Error al cargar nodos');
        setNodos([]);
      } finally {
        setLoadingNodos(false);
      }
    }
    fetchNodos();
  }, []);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<number | null>(null);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState<number | null>(null);
  const [segmentosAgregados, setSegmentosAgregados] = useState<number[]>([]);
  const [evidenciasPorSegmento, setEvidenciasPorSegmento] = useState<{ [segmentoId: number]: Evidencia[] }>({});
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState<number | null>(null);
  const [segmentoEvidenciaSeleccionado, setSegmentoEvidenciaSeleccionado] = useState<number | null>(null);
  const [evidenciasAgregadasPorSegmento, setEvidenciasAgregadasPorSegmento] = useState<{ [segmentoId: number]: number[] }>({});
  const [guardado, setGuardado] = useState(false);
  // --- NUEVO: Para grid de combinaciones y grabado en plantilla_imagenes ---
  const [combinaciones, setCombinaciones] = useState<any[]>([]);

  // Agregar combinación Nodo-Plantilla-Segmento-Evidencia
  function handleAgregarCombinacion() {
    if (!nodoSeleccionado || !plantillaSeleccionada || !segmentoSeleccionado || !evidenciaSeleccionada) return;
    const nodo = nodos.find(n => n.NodoID === nodoSeleccionado);
    const plantilla = plantillas.find(p => p.PlantillaID === plantillaSeleccionada);
    const segmento = segmentos.find(s => s.SegmentoID === segmentoSeleccionado);
    const evidencia = evidencias.find(ev => ev.EvidenciaID === evidenciaSeleccionada);
    if (!evidencia) return;
    // Validar duplicados
    const existe = combinaciones.some(c =>
      c.NodoID === nodoSeleccionado &&
      c.PlantillaID === plantillaSeleccionada &&
      c.SegmentoID === segmentoSeleccionado &&
      c.EvidenciaID === evidenciaSeleccionada
    );
    if (existe) {
      alert('La combinación ya existe en el listado.');
      return;
    }
    setCombinaciones(prev => [
      ...prev,
      {
        NodoID: nodoSeleccionado,
        NodoNombre: nodo?.Nombre || '',
        PlantillaID: plantilla?.PlantillaID,
        PlantillaNombre: plantilla?.Nombre,
        SegmentoID: segmentoSeleccionado,
        SegmentoNombre: segmento?.Nombre || '',
        EvidenciaID: evidencia.EvidenciaID,
        EvidenciaNombre: evidencia.Nombre
      }
    ]);
  }

  function handleEliminarCombinacion(idx: number) {
    setCombinaciones(prev => prev.filter((_, i) => i !== idx));
  }

  // Grabar combinaciones en plantilla_imagenes
  async function handleGrabarCombinaciones() {
    if (combinaciones.length === 0) {
      alert('No hay combinaciones para grabar.');
      return;
    }
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
    const usuarioGlobal = (typeof window !== 'undefined' && (window as any).pb_Usuario) ? (window as any).pb_Usuario : (typeof window !== 'undefined' ? localStorage.getItem('pb_Usuario') : '');
    const payload = combinaciones.map(c => ({
      NodoID: c.NodoID,
      PlantillaID: c.PlantillaID,
      SegmentoID: c.SegmentoID,
      EvidenciaID: c.EvidenciaID,
      RutaImagen: '',
      IdUsuario: usuarioGlobal
    }));
    const res = await fetch('/api/plantilla-imagenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ combinaciones: payload })
    });
    const data = await res.json();
    if (res.ok) {
      alert(
        'Combinaciones grabadas correctamente.\n' +
        'Sentencias SQL ejecutadas:\n' + (data.sentenciasSQL?.join('\n') || '') +
        '\n\nParámetros enviados:\n' + JSON.stringify(data.parametrosEjecutados, null, 2)
      );
      setCombinaciones([]);
    } else {
      let sqlSentencias = '';
      for (const reg of payload) {
        sqlSentencias += `INSERT INTO Plantilla_Imagenes (NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario, FechaRegistro) VALUES (${reg.NodoID}, ${reg.PlantillaID}, ${reg.SegmentoID}, ${reg.EvidenciaID}, '${reg.RutaImagen || ''}', '${reg.IdUsuario}', '${new Date().toISOString()}');\n`;
      }
      alert('Error al grabar: ' + (data.error || '') + '\nSentencia SQL enviada:\n' + sqlSentencias + '\n\nParámetros enviados:\n' + JSON.stringify(data.parametrosEjecutados, null, 2));
    }
  }

  // Cargar plantillas al seleccionar nodo
  useEffect(() => {
    if (nodoSeleccionado) {
      fetch(`/api/plantilla?nodoId=${nodoSeleccionado}`)
        .then(res => res.json())
        .then(data => setPlantillas(data));
    } else {
      setPlantillas([]);
      setPlantillaSeleccionada(null);
      setSegmentos([]);
      setSegmentoSeleccionado(null);
      setEvidencias([]);
      setEvidenciaSeleccionada(null);
    }
  }, [nodoSeleccionado]);

  // Cargar segmentos al seleccionar plantilla
  useEffect(() => {
    if (plantillaSeleccionada) {
      fetch(`/api/segmento?plantillaId=${plantillaSeleccionada}`)
        .then(res => res.json())
        .then(data => setSegmentos(data));
    } else {
      setSegmentos([]);
      setSegmentoSeleccionado(null);
      setEvidencias([]);
      setEvidenciaSeleccionada(null);
      setEvidenciasAgregadasPorSegmento({});
    }
  }, [plantillaSeleccionada]);

  // Cargar evidencias dinámicamente para cada segmento agregado
  useEffect(() => {
    async function cargarEvidenciasParaSegmentos() {
      const evidenciasMap: { [segmentoId: number]: Evidencia[] } = {};
      for (const segmentoId of segmentosAgregados) {
        const res = await fetch(`/api/evidencia?segmentoId=${segmentoId}`);
        const data = await res.json();
        evidenciasMap[segmentoId] = data;
      }
      setEvidenciasPorSegmento(evidenciasMap);
    }
    if (segmentosAgregados.length > 0) {
      cargarEvidenciasParaSegmentos();
    } else {
      setEvidenciasPorSegmento({});
      setEvidenciasAgregadasPorSegmento({});
      setSegmentoEvidenciaSeleccionado(null);
      setEvidenciaSeleccionada(null);
    }
  }, [segmentosAgregados]);

  // Estado para mostrar formularios de alta
  const [mostrarNuevoNodo, setMostrarNuevoNodo] = useState(false);
  const [mostrarNuevaPlantilla, setMostrarNuevaPlantilla] = useState(false);
  const [mostrarNuevoSegmento, setMostrarNuevoSegmento] = useState(false);
  const [mostrarNuevaEvidencia, setMostrarNuevaEvidencia] = useState(false);

  // Paso 1: Selección de nodo principal
  const PasoNodo = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>1. Selecciona el Nodo Principal</h3>
      {loadingNodos ? (
        <div style={{ margin: '16px 0', color: '#2563eb' }}>Cargando nodos...</div>
      ) : errorNodos ? (
        <div style={{ margin: '16px 0', color: '#ef4444' }}>{errorNodos}</div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={nodoSeleccionado ?? ''}
            onChange={e => setNodoSeleccionado(Number(e.target.value))}
            style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 12 }}
          >
            <option value="">Seleccione un nodo...</option>
            {nodos.map(n => (
              <option key={n.NodoID} value={n.NodoID}>{n.Nombre}</option>
            ))}
          </select>
          <button onClick={() => setMostrarNuevoNodo(true)} style={{ marginTop: 12, background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
            Registrar Nodo
          </button>
        </div>
      )}
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
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <button
          onClick={() => setPaso(2)}
          disabled={nodoSeleccionado === null}
          style={{ padding: '10px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: nodoSeleccionado === null ? 'not-allowed' : 'pointer' }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Paso 2: Selección de plantilla
  const PasoPlantilla = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>2. Selecciona la Plantilla</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <select
          value={plantillaSeleccionada ?? ''}
          onChange={e => setPlantillaSeleccionada(Number(e.target.value))}
          style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 12 }}
          disabled={!nodoSeleccionado || plantillas.length === 0}
        >
          <option value="">{plantillas.length === 0 ? 'No hay plantillas' : 'Seleccione una plantilla...'}</option>
          {plantillas.map(p => (
            <option key={p.PlantillaID} value={p.PlantillaID}>{p.Nombre}</option>
          ))}
        </select>
        <button onClick={() => setMostrarNuevaPlantilla(true)} style={{ marginTop: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
          Registrar Plantilla
        </button>
      </div>
      {mostrarNuevaPlantilla && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <div style={{ maxWidth: 350, margin: '80px auto', background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Registrar Nueva Plantilla</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const nombre = formData.get('nombre');
              const descripcion = formData.get('descripcion');
              const nodoId = nodoSeleccionado;
              const res = await fetch('/api/plantilla', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, descripcion, nodoId })
              });
              if (res.ok) {
                setMostrarNuevaPlantilla(false);
                // Recargar plantillas
                fetch(`/api/plantilla?nodoId=${nodoSeleccionado}`)
                  .then(res => res.json())
                  .then(data => setPlantillas(data));
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Guardar Plantilla</button>
                <button type="button" onClick={() => setMostrarNuevaPlantilla(false)} style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button
          onClick={() => setPaso(1)}
          style={{ padding: '10px 24px', background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}
        >
          Atrás
        </button>
        <button
          onClick={() => setPaso(3)}
          disabled={!plantillaSeleccionada}
          style={{ padding: '10px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: !plantillaSeleccionada ? 'not-allowed' : 'pointer' }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Paso 3: Agregar múltiples segmentos
  const PasoSegmento = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>3. Agrega Segmentos</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select
          value={segmentoSeleccionado ?? ''}
          onChange={e => setSegmentoSeleccionado(Number(e.target.value))}
          style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
          disabled={!plantillaSeleccionada || segmentos.length === 0}
        >
          <option value="">{segmentos.length === 0 ? 'No hay segmentos' : 'Seleccione un segmento...'}</option>
          {segmentos.map(s => (
            <option key={s.SegmentoID} value={s.SegmentoID}>{s.Nombre}</option>
          ))}
        </select>
        <button onClick={() => setMostrarNuevoSegmento(true)} style={{ marginTop: 0, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
          Registrar Segmento
        </button>
        <button
          onClick={() => {
            if (segmentoSeleccionado && !segmentosAgregados.includes(segmentoSeleccionado)) {
              setSegmentosAgregados([...segmentosAgregados, segmentoSeleccionado]);
              setSegmentoSeleccionado(null);
            }
          }}
          disabled={!segmentoSeleccionado || segmentosAgregados.includes(segmentoSeleccionado)}
          style={{ padding: '10px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: (!segmentoSeleccionado || segmentosAgregados.includes(segmentoSeleccionado)) ? 'not-allowed' : 'pointer' }}
        >
          Agregar
        </button>
      </div>
      {mostrarNuevoSegmento && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <div style={{ maxWidth: 350, margin: '80px auto', background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Registrar Nuevo Segmento</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const nombre = formData.get('nombre');
              const orden = formData.get('orden');
              const plantillaId = plantillaSeleccionada;
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
                setMostrarNuevoSegmento(false);
                // Recargar segmentos
                fetch(`/api/segmento?plantillaId=${plantillaId}`)
                  .then(res => res.json())
                  .then(data => setSegmentos(data));
              } else {
                alert('Error al registrar segmento');
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Guardar Segmento</button>
                <button type="button" onClick={() => setMostrarNuevoSegmento(false)} style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {segmentosAgregados.map(id => {
          const seg = segmentos.find(s => s.SegmentoID === id);
          return seg ? (
            <li key={id} style={{ background: '#f1f5f9', borderRadius: 4, padding: 8, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {seg.Nombre}
              <button onClick={() => setSegmentosAgregados(segmentosAgregados.filter(sid => sid !== id))} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Eliminar</button>
            </li>
          ) : null;
        })}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button
          onClick={() => setPaso(2)}
          style={{ padding: '10px 24px', background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}
        >
          Atrás
        </button>
        <button
          onClick={() => setPaso(4)}
          disabled={segmentosAgregados.length === 0}
          style={{ padding: '10px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: segmentosAgregados.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Paso 4: Agregar evidencias por segmento y combinaciones
  const PasoEvidencias = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>4. Agrega Evidencias por Segmento</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select
          value={segmentoEvidenciaSeleccionado ?? ''}
          onChange={e => {
            setSegmentoEvidenciaSeleccionado(Number(e.target.value));
            setEvidenciaSeleccionada(null);
          }}
          style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
          disabled={segmentosAgregados.length === 0}
        >
          <option value="">Seleccione un segmento...</option>
          {segmentosAgregados.map(id => {
            const seg = segmentos.find(s => s.SegmentoID === id);
            return seg ? <option key={id} value={id}>{seg.Nombre}</option> : null;
          })}
        </select>
        <select
          value={evidenciaSeleccionada ?? ''}
          onChange={e => setEvidenciaSeleccionada(Number(e.target.value))}
          style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
          disabled={!segmentoEvidenciaSeleccionado || !evidenciasPorSegmento[segmentoEvidenciaSeleccionado] || evidenciasPorSegmento[segmentoEvidenciaSeleccionado].length === 0}
        >
          <option value="">{!segmentoEvidenciaSeleccionado || !evidenciasPorSegmento[segmentoEvidenciaSeleccionado] ? 'Seleccione un segmento primero' : (evidenciasPorSegmento[segmentoEvidenciaSeleccionado].length === 0 ? 'No hay evidencias' : 'Seleccione una evidencia...')}</option>
          {segmentoEvidenciaSeleccionado && evidenciasPorSegmento[segmentoEvidenciaSeleccionado] && evidenciasPorSegmento[segmentoEvidenciaSeleccionado].map(e => (
            <option key={e.EvidenciaID} value={e.EvidenciaID}>{e.Nombre}</option>
          ))}
        </select>
        <button onClick={() => setMostrarNuevaEvidencia(true)} style={{ marginTop: 0, background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
          Registrar evidencia
        </button>
        <button
          onClick={() => {
            if (segmentoEvidenciaSeleccionado && evidenciaSeleccionada) {
              const actuales = evidenciasAgregadasPorSegmento[segmentoEvidenciaSeleccionado] || [];
              if (!actuales.includes(evidenciaSeleccionada)) {
                setEvidenciasAgregadasPorSegmento({
                  ...evidenciasAgregadasPorSegmento,
                  [segmentoEvidenciaSeleccionado]: [...actuales, evidenciaSeleccionada]
                });
                setEvidenciaSeleccionada(null);
              }
            }
          }}
          disabled={
            !Boolean(segmentoEvidenciaSeleccionado) ||
            !Boolean(evidenciaSeleccionada) ||
            (
              Boolean(segmentoEvidenciaSeleccionado) &&
              Boolean(evidenciaSeleccionada) &&
              (evidenciasAgregadasPorSegmento[Number(segmentoEvidenciaSeleccionado)] || []).includes(Number(evidenciaSeleccionada))
            )
          }
          style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: (!segmentoEvidenciaSeleccionado || !evidenciaSeleccionada || (segmentoEvidenciaSeleccionado && evidenciaSeleccionada && (evidenciasAgregadasPorSegmento[segmentoEvidenciaSeleccionado] || []).includes(evidenciaSeleccionada))) ? 'not-allowed' : 'pointer' }}
        >
          Agregar
        </button>
      </div>
      {mostrarNuevaEvidencia && (
        <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
          <h4 style={{ marginBottom: 12 }}>Registrar Nueva Evidencia</h4>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const nombre = formData.get('nombre');
            const segmentoId = segmentoEvidenciaSeleccionado;
            const esObligatoria = formData.get('esObligatoria') === 'on' ? 1 : 0;
            // Calcular el orden automáticamente (correlativo)
            let orden = 1;
            const evidenciasActuales = segmentoId ? evidenciasPorSegmento[segmentoId] || [] : [];
            if (Array.isArray(evidenciasActuales) && evidenciasActuales.length > 0) {
              orden = Math.max(...evidenciasActuales.map(ev => (ev as any).Orden || 1)) + 1;
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
              setMostrarNuevaEvidencia(false);
              alert('Evidencia registrada correctamente');
              // Recargar evidencias para el segmento
              fetch(`/api/evidencia?segmentoId=${segmentoId}`)
                .then(res => res.json())
                .then(data => setEvidenciasPorSegmento(prev => ({ ...prev, [segmentoId]: data })));
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
            <button type="button" onClick={() => setMostrarNuevaEvidencia(false)} style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600, marginLeft: 8 }}>Cancelar</button>
          </form>
        </div>
      )}
      {/* Listar evidencias agregadas por segmento */}
      {Object.keys(evidenciasAgregadasPorSegmento).length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Evidencias agregadas por segmento:</h4>
          {segmentosAgregados.map(segId => {
            const seg = segmentos.find(s => s.SegmentoID === segId);
            const evidIds = evidenciasAgregadasPorSegmento[segId] || [];
            return (
              <div key={segId} style={{ marginBottom: 10 }}>
                <strong>{seg?.Nombre}</strong>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {evidIds.map(eid => {
                    const ev = evidenciasPorSegmento[segId]?.find(e => e.EvidenciaID === eid);
                    return ev ? (
                      <li key={eid} style={{ background: '#f1f5f9', borderRadius: 4, padding: 8, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {ev.Nombre}
                        <button onClick={() => setEvidenciasAgregadasPorSegmento(prev => ({ ...prev, [segId]: prev[segId].filter(x => x !== eid) }))} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Eliminar</button>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      {/* NUEVO: Grid de combinaciones y botón para grabar en plantilla_imagenes */}
      {combinaciones.length > 0 && (
        <div style={{ marginTop: 24, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f3f4f6', padding: 16, width: '100%', maxWidth: 700, minWidth: 320, marginLeft: 0, marginRight: 0, textAlign: 'left' }}>
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
                  <td style={{ display: 'none' }}>{c.NodoID}</td>
                  <td style={{ display: 'none' }}>{c.PlantillaID}</td>
                  <td style={{ display: 'none' }}>{c.SegmentoID}</td>
                  <td style={{ display: 'none' }}>{c.EvidenciaID}</td>
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
            <button onClick={handleGrabarCombinaciones} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 700, fontSize: 16 }}>
              Grabar en Plantilla_Imagenes
            </button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button
          onClick={() => setPaso(3)}
          style={{ padding: '10px 24px', background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}
        >
          Atrás
        </button>
        <button
          onClick={() => setPaso(5)}
          disabled={Object.values(evidenciasAgregadasPorSegmento).every(arr => arr.length === 0)}
          style={{ padding: '10px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: Object.values(evidenciasAgregadasPorSegmento).every(arr => arr.length === 0) ? 'not-allowed' : 'pointer' }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Paso 5: Resumen y guardar
  const PasoResumen = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>5. Resumen y Confirmación</h3>
      <div style={{ background: '#f8fafc', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <strong>Nodo principal:</strong> {nodos.find(n => n.NodoID === nodoSeleccionado)?.Nombre}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Plantilla:</strong> {plantillas.find(p => p.PlantillaID === plantillaSeleccionada)?.Nombre}
        </div>
        <div>
          <strong>Segmentos y Evidencias:</strong>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {segmentosAgregados.map(segId => {
              const seg = segmentos.find(s => s.SegmentoID === segId);
              const evidIds = evidenciasAgregadasPorSegmento[segId] || [];
              return (
                <li key={segId} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{seg?.Nombre || `Segmento ${segId}`}:</span>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {evidIds.map(eid => {
                      const ev = evidenciasPorSegmento[segId]?.find(e => e.EvidenciaID === eid);
                      return ev ? <li key={eid}>{ev.Nombre}</li> : null;
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {/* Botón para ejecutar el SP de seguimiento (ejemplo con AutoID=1) */}
      <button
        style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 700, fontSize: 16, marginBottom: 16 }}
        onClick={() => {
          const autoId = Number(prompt('Ingrese el Id_Auto para seguimiento:', '1'));
          if (!isNaN(autoId) && autoId > 0) handleInsertarPlantillaSeguimiento(autoId);
        }}
      >
        Ejecutar Seguimiento (SP)
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setPaso(4)}
          style={{ padding: '10px 24px', background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}
        >
          Atrás
        </button>
        <button
          onClick={() => { setGuardado(true); setPaso(6); }}
          style={{ padding: '12px 32px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(5,150,105,0.08)', cursor: 'pointer' }}
        >
          Guardar Plantilla
        </button>
      </div>
    </div>
  );

  // Paso 5: Éxito
  const PasoExito = () => (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h3 style={{ color: '#059669', fontWeight: 700, marginBottom: 16 }}>¡Plantilla guardada con éxito!</h3>
      <button
        onClick={() => {
          setPaso(1);
          setNodoSeleccionado(null);
          setSegmentos([]);
          setEvidencias([]);
          setGuardado(false);
        }}
        style={{ padding: '10px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, marginTop: 16 }}
      >
        Crear otra plantilla
      </button>
    </div>
  );

  // Indicador de progreso
  const pasos = ['Nodo', 'Plantilla', 'Segmento', 'Evidencias', 'Resumen'];
  return (
    <div style={{
      maxWidth: 700,
      margin: '40px auto',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: 32
    }}>
      <h2 style={{ color: '#1e293b', fontWeight: 700, marginBottom: 8 }}>Crear Plantilla (Wizard)</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
        {pasos.map((p, idx) => (
          <div key={p} style={{
            padding: '8px 18px',
            borderRadius: 20,
            background: paso === idx + 1 ? '#2563eb' : '#e5e7eb',
            color: paso === idx + 1 ? '#fff' : '#334155',
            fontWeight: 600,
            fontSize: 15
          }}>{idx + 1}. {p}</div>
        ))}
      </div>
      {paso === 1 && <PasoNodo />}
      {paso === 2 && <PasoPlantilla />}
      {paso === 3 && <PasoSegmento />}
      {paso === 4 && <PasoEvidencias />}
      {paso === 5 && <PasoResumen />}
      {paso === 6 && <PasoExito />}
    </div>
  );
};

export default CopiaFormulario;
