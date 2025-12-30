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
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState<number | null>(null);
  const [evidenciasAgregadas, setEvidenciasAgregadas] = useState<number[]>([]);
  const [guardado, setGuardado] = useState(false);

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
      setEvidenciasAgregadas([]);
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
      setEvidenciasAgregadas([]);
    }
  }, [plantillaSeleccionada]);

  // Cargar evidencias al seleccionar segmento
  useEffect(() => {
    if (segmentoSeleccionado) {
      fetch(`/api/evidencia?segmentoId=${segmentoSeleccionado}`)
        .then(res => res.json())
        .then(data => setEvidencias(data));
    } else {
      setEvidencias([]);
      setEvidenciaSeleccionada(null);
      setEvidenciasAgregadas([]);
    }
  }, [segmentoSeleccionado]);

  // Paso 1: Selección de nodo principal
  const PasoNodo = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>1. Selecciona el Nodo Principal</h3>
      {loadingNodos ? (
        <div style={{ margin: '16px 0', color: '#2563eb' }}>Cargando nodos...</div>
      ) : errorNodos ? (
        <div style={{ margin: '16px 0', color: '#ef4444' }}>{errorNodos}</div>
      ) : (
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

  // Paso 3: Selección de segmento
  const PasoSegmento = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>3. Selecciona el Segmento</h3>
      <select
        value={segmentoSeleccionado ?? ''}
        onChange={e => setSegmentoSeleccionado(Number(e.target.value))}
        style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 12 }}
        disabled={!plantillaSeleccionada || segmentos.length === 0}
      >
        <option value="">{segmentos.length === 0 ? 'No hay segmentos' : 'Seleccione un segmento...'}</option>
        {segmentos.map(s => (
          <option key={s.SegmentoID} value={s.SegmentoID}>{s.Nombre}</option>
        ))}
      </select>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button
          onClick={() => setPaso(2)}
          style={{ padding: '10px 24px', background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}
        >
          Atrás
        </button>
        <button
          onClick={() => setPaso(4)}
          disabled={!segmentoSeleccionado}
          style={{ padding: '10px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: !segmentoSeleccionado ? 'not-allowed' : 'pointer' }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Paso 4: Agregar evidencias
  const PasoEvidencias = () => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ color: '#1e293b', fontWeight: 600 }}>4. Agrega Evidencias</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <select
          value={evidenciaSeleccionada ?? ''}
          onChange={e => setEvidenciaSeleccionada(Number(e.target.value))}
          style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
          disabled={!segmentoSeleccionado || evidencias.length === 0}
        >
          <option value="">{evidencias.length === 0 ? 'No hay evidencias' : 'Seleccione una evidencia...'}</option>
          {evidencias.map(e => (
            <option key={e.EvidenciaID} value={e.EvidenciaID}>{e.Nombre}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (evidenciaSeleccionada && !evidenciasAgregadas.includes(evidenciaSeleccionada)) {
              setEvidenciasAgregadas([...evidenciasAgregadas, evidenciaSeleccionada]);
              setEvidenciaSeleccionada(null);
            }
          }}
          disabled={!evidenciaSeleccionada || evidenciasAgregadas.includes(evidenciaSeleccionada)}
          style={{ padding: '10px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: (!evidenciaSeleccionada || evidenciasAgregadas.includes(evidenciaSeleccionada)) ? 'not-allowed' : 'pointer' }}
        >
          Agregar
        </button>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {evidenciasAgregadas.map(id => {
          const ev = evidencias.find(e => e.EvidenciaID === id);
          return ev ? (
            <li key={id} style={{ background: '#f1f5f9', borderRadius: 4, padding: 8, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {ev.Nombre}
              <button onClick={() => setEvidenciasAgregadas(evidenciasAgregadas.filter(eid => eid !== id))} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Eliminar</button>
            </li>
          ) : null;
        })}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button
          onClick={() => setPaso(3)}
          style={{ padding: '10px 24px', background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}
        >
          Atrás
        </button>
        <button
          onClick={() => setPaso(5)}
          disabled={evidenciasAgregadas.length === 0}
          style={{ padding: '10px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: evidenciasAgregadas.length === 0 ? 'not-allowed' : 'pointer' }}
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
        <div style={{ marginBottom: 12 }}>
          <strong>Segmento:</strong> {segmentos.find(s => s.SegmentoID === segmentoSeleccionado)?.Nombre}
        </div>
        <div>
          <strong>Evidencias:</strong>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {evidenciasAgregadas.map(id => <li key={id}>{evidencias.find(e => e.EvidenciaID === id)?.Nombre}</li>)}
          </ul>
        </div>
      </div>
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
