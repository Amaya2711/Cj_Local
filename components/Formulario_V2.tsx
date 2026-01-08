import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const Tree = dynamic(() => import('react-organizational-chart').then(mod => mod.Tree), { ssr: false });
const TreeNode = dynamic(() => import('react-organizational-chart').then(mod => mod.TreeNode), { ssr: false });

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

interface Registro {
  Nodo: Nodo;
  Plantilla: Plantilla;
  Segmentos: Array<{
    Segmento: Segmento;
    Evidencias: Evidencia[];
  }>;
}

const Formulario_V2: React.FC = () => {
  // Estados para los datos
  const [nodos, setNodos] = useState<Nodo[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  // Evidencias por segmento
  const [evidenciasPorSegmento, setEvidenciasPorSegmento] = useState<{ [segId: number]: Evidencia[] }>({});

  // Estado para el registro dinámico
  const [registro, setRegistro] = useState<Registro | null>(null);

  // Ejemplo de carga de datos (simulado)
  const [loadingNodos, setLoadingNodos] = useState(false);
  const [errorNodos, setErrorNodos] = useState('');
  const [mostrarNuevoNodo, setMostrarNuevoNodo] = useState(false);
  const [mostrarNuevaPlantilla, setMostrarNuevaPlantilla] = useState(false);
  React.useEffect(() => {
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

  // UI para seleccionar y crear el registro
  const [nodoSel, setNodoSel] = useState<number | null>(null);
  const [plantillaSel, setPlantillaSel] = useState<number | null>(null);
  const [segmentosSel, setSegmentosSel] = useState<number[]>([]);
  const [evidenciasSel, setEvidenciasSel] = useState<{ [segId: number]: number[] }>({});

  // Cargar segmentos al seleccionar plantilla
  React.useEffect(() => {
    if (plantillaSel) {
      fetch(`/api/segmento?plantillaId=${plantillaSel}`)
        .then(res => res.json())
        .then(data => setSegmentos(data));
    } else {
      setSegmentos([]);
      setSegmentosSel([]);
      setEvidenciasSel({});
    }
  }, [plantillaSel]);

  // Cargar evidencias solo para los segmentos seleccionados
  React.useEffect(() => {
    async function cargarEvidenciasPorSegmento() {
      const evidenciasMap: { [segId: number]: Evidencia[] } = {};
      for (const segmentoId of segmentosSel) {
        const res = await fetch(`/api/evidencia?segmentoId=${segmentoId}`);
        const data = await res.json();
        evidenciasMap[segmentoId] = data;
      }
      setEvidenciasPorSegmento(evidenciasMap);
    }
    if (segmentosSel.length > 0) {
      cargarEvidenciasPorSegmento();
    } else {
      setEvidenciasPorSegmento({});
    }
  }, [segmentosSel]);

  // Cargar plantillas al seleccionar nodo
  React.useEffect(() => {
    if (nodoSel) {
      fetch(`/api/plantilla?nodoId=${nodoSel}`)
        .then(res => res.json())
        .then(data => setPlantillas(data));
    } else {
      setPlantillas([]);
      setPlantillaSel(null);
    }
  }, [nodoSel]);

  // Función para crear el registro dinámicamente
  const handleCrearRegistro = (nodo: Nodo, plantilla: Plantilla, segmentos: Array<{ segmento: Segmento; evidencias: Evidencia[] }>) => {
    setRegistro({
      Nodo: nodo,
      Plantilla: plantilla,
      Segmentos: segmentos.map(s => ({ Segmento: s.segmento, Evidencias: s.evidencias }))
    });
  };

  // Renderizar el árbol dinámico solo en cliente
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => { setIsClient(true); }, []);
  const renderTree = () => {
    if (!registro || !isClient) return null;
    return (
      <Tree
        lineWidth={'2px'}
        lineColor={'#2563eb'}
        lineBorderRadius={'8px'}
        label={<div style={{ padding: 8, background: '#2563eb', color: '#fff', borderRadius: 8 }}>{registro.Nodo.Nombre}</div>}
      >
        <TreeNode label={<div style={{ padding: 8, background: '#059669', color: '#fff', borderRadius: 8 }}>{registro.Plantilla.Nombre}</div>}>
          {registro.Segmentos.map((seg, idx) => (
            <TreeNode key={idx} label={<div style={{ padding: 8, background: '#f59e42', color: '#fff', borderRadius: 8 }}>{seg.Segmento.Nombre}</div>}>
              {seg.Evidencias.map(ev => (
                <TreeNode key={ev.EvidenciaID} label={<div style={{ padding: 8, background: '#64748b', color: '#fff', borderRadius: 8 }}>{ev.Nombre}</div>} />
              ))}
            </TreeNode>
          ))}
        </TreeNode>
      </Tree>
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32 }}>
      {/* Título eliminado por solicitud del usuario */}
      <div style={{ marginBottom: 24 }}>
        <label><strong>Equipo:</strong></label><br />
        {loadingNodos ? (
          <div style={{ margin: '8px 0', color: '#2563eb' }}>Cargando equipos...</div>
        ) : errorNodos ? (
          <div style={{ margin: '8px 0', color: '#ef4444' }}>{errorNodos}</div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={nodoSel ?? ''} onChange={e => setNodoSel(Number(e.target.value))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}>
              <option value="">Seleccione un equipo...</option>
              {nodos.map(n => (
                <option key={n.NodoID} value={n.NodoID}>{n.Nombre}</option>
              ))}
            </select>
            <button onClick={() => setMostrarNuevoNodo(true)} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
              Registrar Equipo
            </button>
          </div>
        )}
        {mostrarNuevoNodo && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
            <div style={{ maxWidth: 350, margin: '80px auto', background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Registrar Nuevo Equipo</h4>
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
                  const res2 = await fetch('/api/nodo-principal');
                  const data2 = await res2.json();
                  setNodos(data2);
                } else {
                  alert('Error al registrar equipo');
                }
              }}>
                <div style={{ marginBottom: 10 }}>
                  <label>Nombre del equipo:</label><br />
                  <input name="nombre" type="text" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ background: '#059669', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Guardar Equipo</button>
                  <button type="button" onClick={() => setMostrarNuevoNodo(false)} style={{ background: '#ef4444', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 6, fontWeight: 600 }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label><strong>Plantilla:</strong></label><br />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={plantillaSel ?? ''} onChange={e => setPlantillaSel(Number(e.target.value))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <option value="">Seleccione plantilla...</option>
            {plantillas.map(p => <option key={p.PlantillaID} value={p.PlantillaID}>{p.Nombre}</option>)}
          </select>
          <button onClick={() => setMostrarNuevaPlantilla(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, minWidth: 120 }}>
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
                const nodoId = nodoSel;
                if (!nodoId) {
                  alert('Seleccione un nodo antes de registrar una plantilla');
                  return;
                }
                const res = await fetch('/api/plantilla', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ nombre, descripcion, nodoId })
                });
                if (res.ok) {
                  setMostrarNuevaPlantilla(false);
                  // Recargar plantillas
                  const res2 = await fetch(`/api/plantilla?nodoId=${nodoId}`);
                  const data2 = await res2.json();
                  setPlantillas(data2);
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
      </div>
      <div style={{ marginBottom: 24 }}>
        <label><strong>Segmentos:</strong></label><br />
        {segmentos.map(s => (
          <div key={s.SegmentoID} style={{ marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={segmentosSel.includes(s.SegmentoID)}
              onChange={e => {
                if (e.target.checked) {
                  setSegmentosSel([...segmentosSel, s.SegmentoID]);
                  // Seleccionar automáticamente solo las evidencias asociadas (según evidenciasPorSegmento)
                  const evidenciasIds = (evidenciasPorSegmento[s.SegmentoID] || []).map(ev => ev.EvidenciaID);
                  setEvidenciasSel(prev => ({ ...prev, [s.SegmentoID]: evidenciasIds }));
                } else {
                  setSegmentosSel(segmentosSel.filter(id => id !== s.SegmentoID));
                  setEvidenciasSel(prev => {
                    const nuevo = { ...prev };
                    delete nuevo[s.SegmentoID];
                    return nuevo;
                  });
                }
              }}
            /> {s.Nombre}
            {segmentosSel.includes(s.SegmentoID) && (
              <div style={{ marginLeft: 24 }}>
                <label>Evidencias:</label><br />
                {(evidenciasPorSegmento[s.SegmentoID] || []).map(ev => (
                  <span key={ev.EvidenciaID} style={{ marginRight: 12 }}>
                    <input
                      type="checkbox"
                      checked={evidenciasSel[s.SegmentoID]?.includes(ev.EvidenciaID) || false}
                      onChange={e2 => {
                        setEvidenciasSel(prev => {
                          const arr = prev[s.SegmentoID] || [];
                          if (e2.target.checked) return { ...prev, [s.SegmentoID]: [...arr, ev.EvidenciaID] };
                          else return { ...prev, [s.SegmentoID]: arr.filter(id => id !== ev.EvidenciaID) };
                        });
                      }}
                    /> {ev.Nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 700, fontSize: 16, marginBottom: 24 }}
        onClick={() => {
          const nodo = nodos.find(n => n.NodoID === nodoSel);
          const plantilla = plantillas.find(p => p.PlantillaID === plantillaSel);
          if (!nodo || !plantilla) {
            alert('Seleccione equipo y plantilla');
            return;
          }
          const segmentosArr = segmentosSel.map(segId => {
            const segmento = segmentos.find(s => s.SegmentoID === segId)!;
            const evids = (evidenciasSel[segId] || []).map(eid => (evidenciasPorSegmento[segId] || []).find(ev => ev.EvidenciaID === eid)!);
            return { segmento, evidencias: evids };
          });
          handleCrearRegistro(nodo, plantilla, segmentosArr);
        }}
      >
        Crear Registro Dinámico
      </button>
      <div style={{ marginTop: 32 }}>
        <h3>Vista Dinámica (Árbol)</h3>
        {/* Cambiar etiqueta raíz del árbol a Equipo */}
        {registro && isClient ? (
          <Tree
            lineWidth={'2px'}
            lineColor={'#2563eb'}
            lineBorderRadius={'8px'}
            label={<div style={{ padding: 8, background: '#2563eb', color: '#fff', borderRadius: 8 }}>{registro.Nodo.Nombre} {/* Equipo */}</div>}
          >
            <TreeNode label={<div style={{ padding: 8, background: '#059669', color: '#fff', borderRadius: 8 }}>{registro.Plantilla.Nombre}</div>}>
              {registro.Segmentos.map((seg, idx) => (
                <TreeNode key={idx} label={<div style={{ padding: 8, background: '#f59e42', color: '#fff', borderRadius: 8 }}>{seg.Segmento.Nombre}</div>}>
                  {seg.Evidencias.map(ev => (
                    <TreeNode key={ev.EvidenciaID} label={<div style={{ padding: 8, background: '#64748b', color: '#fff', borderRadius: 8 }}>{ev.Nombre}</div>} />
                  ))}
                </TreeNode>
              ))}
            </TreeNode>
          </Tree>
        ) : renderTree()}
      </div>
    </div>
  );
};

export default Formulario_V2;
