"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Utilidades para obtener datos desde los stores
const fetchSP = async (spName: string, params: any = {}) => {
  const { data } = await axios.post(`/api/${spName}`, params);
  return data;
};

const PlantillaV3 = () => {
    // Estado para el popup de nuevo nodo principal
    const [showAddNodo, setShowAddNodo] = useState(false);
    const [nuevoNodoNombre, setNuevoNodoNombre] = useState('');
    const [nuevoNodoCodigo, setNuevoNodoCodigo] = useState('');
    const [addNodoLoading, setAddNodoLoading] = useState(false);
    const [addNodoError, setAddNodoError] = useState('');
    // Estado para popup de nueva plantilla
    const [showAddPlantilla, setShowAddPlantilla] = useState(false);
    const [nuevoPlantillaNombre, setNuevoPlantillaNombre] = useState('');
    const [nuevoPlantillaDesc, setNuevoPlantillaDesc] = useState('');
    const [addPlantillaLoading, setAddPlantillaLoading] = useState(false);
    const [addPlantillaError, setAddPlantillaError] = useState('');
  // Estados para cada bloque
  const [areas, setAreas] = useState<any[]>([]);
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [segmentos, setSegmentos] = useState<any[]>([]);
  const [evidencias, setEvidencias] = useState<any[]>([]);

  // Selecciones
  const [areaSel, setAreaSel] = useState('');
  const [plantillaSel, setPlantillaSel] = useState('');
  const [segmentoSel, setSegmentoSel] = useState('');
  const [evidenciasSel, setEvidenciasSel] = useState<string[]>([]);
  // Control de habilitación de bloques
  const [segmentoEvidenciasEnabled, setSegmentoEvidenciasEnabled] = useState(!!plantillaSel);

  // Popup para agregar evidencia
  const [showAddEvidencia, setShowAddEvidencia] = useState(false);
  const [nuevoEvidenciaNombre, setNuevoEvidenciaNombre] = useState('');
  const [nuevoEvidenciaObligatoria, setNuevoEvidenciaObligatoria] = useState(false);
  const [addEvidenciaLoading, setAddEvidenciaLoading] = useState(false);
  const [addEvidenciaError, setAddEvidenciaError] = useState('');
  // Popup para agregar segmento
  const [showAddSegmento, setShowAddSegmento] = useState(false);
  const [nuevoSegmentoNombre, setNuevoSegmentoNombre] = useState('');
  const [addSegmentoLoading, setAddSegmentoLoading] = useState(false);
  const [addSegmentoError, setAddSegmentoError] = useState('');

  // Estado para los datos del grid
  const [gridData, setGridData] = useState<any[]>([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [detalleData, setDetalleData] = useState<any[]>([]);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [ultimoParametro, setUltimoParametro] = useState<string | null>(null);

  // Consultar el store sp_BuscarPlantilla cuando cambia el área seleccionada
  useEffect(() => {
    if (areaSel) {
      setGridLoading(true);
      // Para Tipo=4, el parámetro PlantillaID es obligatorio y corresponde a areaSel
      axios.post('/api/sp_BuscarPlantilla', { Tipo: 4, PlantillaID: areaSel })
        .then(res => setGridData(res.data))
        .catch(() => setGridData([]))
        .finally(() => setGridLoading(false));
    } else {
      setGridData([]);
    }
  }, [areaSel]);

  // Estructura seleccionada (para el árbol)
  const [estructura, setEstructura] = useState<any[]>([]);
  // Relación de evidencias seleccionadas por segmento
  const [evidenciasPorSegmento, setEvidenciasPorSegmento] = useState<{ [segmentoId: string]: any[] }>({});

  // Cargar datos iniciales
  useEffect(() => {
    // Obtener áreas, plantillas y segmentos al cargar
    axios.post('/api/sp_GetPlaNodoPrincipal').then(res => setAreas(res.data));
    axios.post('/api/sp_GetPlaPlantilla').then(res => setPlantillas(res.data));
    axios.post('/api/sp_GetPlaSegmento').then(res => setSegmentos(res.data));
  }, []);

  // Cuando selecciona un segmento, obtener evidencias
  useEffect(() => {
    if (segmentoSel) {
      axios.post('/api/sp_GetPlaEvidencia').then(res => setEvidencias(res.data));
    } else {
      setEvidencias([]);
    }
  }, [segmentoSel]);

  // Actualizar estructura seleccionada
  useEffect(() => {
    if (areaSel && plantillaSel) {
      // Construir estructura tipo árbol usando evidenciasPorSegmento
      // Buscar el objeto completo de área y plantilla seleccionados
      const areaObj = areas.find(a => (a.NodoID || a.id) == areaSel);
      const plantillaObj = plantillas.find(p => (p.PlantillaID || p.id) == plantillaSel);
      const estructuraSimulada = [
        {
          area: areaObj ? (areaObj.Nombre || areaObj.nombre) : areaSel,
          areaId: areaObj ? (areaObj.NodoID || areaObj.id) : areaSel,
          plantilla: plantillaObj ? (plantillaObj.Nombre || plantillaObj.nombre) : plantillaSel,
          plantillaId: plantillaObj ? (plantillaObj.PlantillaID || plantillaObj.id) : plantillaSel,
          segmentos: Object.entries(evidenciasPorSegmento).map(([segmentoId, evids]) => {
            const segmentoObj = segmentos.find(s => (s.SegmentoID || s.id) == segmentoId);
            return {
              segmento: segmentoObj ? (segmentoObj.Nombre || segmentoObj.nombre) : segmentoId,
              segmentoId: segmentoObj ? (segmentoObj.SegmentoID || segmentoObj.id) : segmentoId,
              evidencias: evids.map(ev => ({
                evidencia: ev.Nombre || ev.nombre,
                evidenciaId: ev.EvidenciaID || ev.id
              }))
            };
          })
        }
      ];
      setEstructura(estructuraSimulada);
    } else {
      setEstructura([]);
    }
  }, [areaSel, plantillaSel, evidenciasPorSegmento, segmentos]);

  return (
    <div style={{ maxWidth: 1600, margin: '40px auto', background: '#f8fafc', borderRadius: 18, boxShadow: '0 8px 32px #0002', padding: 40 }}>
      {/* <h2 style={{ textAlign: 'center', marginBottom: 36, fontWeight: 800, fontSize: 32, color: '#1e40af' }}>Plantilla V3</h2> */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
        {/* Filtros: Área, Plantilla, Segmento, Evidencia */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700 }}>Área:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select value={areaSel} onChange={e => setAreaSel(e.target.value)} className="form-select" style={{ marginLeft: 8 }}>
                <option value="">Seleccione...</option>
                {areas.map((a: any) => <option key={a.NodoID || a.id} value={a.NodoID || a.id}>{a.Nombre || a.nombre}</option>)}
              </select>
              <button
                type="button"
                className="btn btn-success"
                style={{ padding: '2px 5px', display: 'flex', alignItems: 'center', fontSize: 14 }}
                title="Agregar nuevo nodo principal"
                onClick={() => setShowAddNodo(true)}
              >
                <span style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>➕</span>
              </button>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700 }}>Plantilla:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select value={plantillaSel} onChange={e => setPlantillaSel(e.target.value)} className="form-select" style={{ marginLeft: 8, marginRight: 8, width: 180 }}>
                <option value="">Seleccione...</option>
                {plantillas.map((p: any) => <option key={p.PlantillaID} value={p.PlantillaID}>{p.Nombre || p.nombre}</option>)}
              </select>
              <button
                type="button"
                className="btn btn-success"
                style={{ padding: '2px 5px', display: 'flex', alignItems: 'center', fontSize: 14 }}
                title="Agregar nueva plantilla"
                onClick={() => setShowAddPlantilla(true)}
              >
                <span style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>➕</span>
              </button>
              <button
                type="button"
                className="btn btn-info"
                onClick={async () => {
                  if (!areaSel || !plantillaSel) return;
                  try {
                    // Enviar los parámetros como números
                    const params = {
                      Tipo: 5,
                      PlantillaID: Number(plantillaSel),
                      pArea: Number(areaSel)
                    };
                    console.log('Parámetros enviados al cargar plantilla:', params);
                    // Buscar la estructura de la plantilla seleccionada
                    const { data } = await axios.post('/api/sp_BuscarPlantilla', params);
                    if (data && data.length > 0) {
                      // Si hay coincidencias, deshabilitar segmento/evidencias
                      setSegmentoEvidenciasEnabled(false);
                      // Agrupar segmentos y evidencias con nombre y código
                      const segmentosMap: {
                        [key: string]: {
                          segmento: string,
                          segmentoId: string,
                          evidencias: Array<{ evidencia: string, evidenciaId: string }>
                        }
                      } = {};
                      data.forEach((row: any) => {
                        const segmentoId = String(row.SegmentoID || row.segmentoid || '');
                        const segmentoNombre = row.Segmento || row.segmento || segmentoId;
                        const evidenciaId = String(row.EvidenciaID || row.evidenciaid || '');
                        const evidenciaNombre = row.Evidencia || row.evidencia || evidenciaId;
                        if (!segmentosMap[segmentoId]) {
                          segmentosMap[segmentoId] = {
                            segmento: segmentoNombre,
                            segmentoId: segmentoId,
                            evidencias: []
                          };
                        }
                        if (evidenciaId) {
                          segmentosMap[segmentoId].evidencias.push({ evidencia: evidenciaNombre, evidenciaId });
                        }
                      });
                      const areaObj = areas.find(a => (a.NodoID || a.id) == areaSel);
                      const plantillaObj = plantillas.find(p => (p.PlantillaID || p.id) == plantillaSel);
                      const estructuraNueva = [
                        {
                          area: areaObj ? (areaObj.Nombre || areaObj.nombre) : areaSel,
                          areaId: areaObj ? (areaObj.NodoID || areaObj.id) : areaSel,
                          plantilla: plantillaObj ? (plantillaObj.Nombre || plantillaObj.nombre) : plantillaSel,
                          plantillaId: plantillaObj ? (plantillaObj.PlantillaID || plantillaObj.id) : plantillaSel,
                          segmentos: Object.values(segmentosMap)
                        }
                      ];
                      setEstructura(estructuraNueva);
                    } else {
                      // Si no hay coincidencias, habilitar segmento/evidencias
                      setSegmentoEvidenciasEnabled(true);
                      setEstructura([]);
                    }
                  } catch (err) {
                    setEstructura([]);
                    setSegmentoEvidenciasEnabled(true);
                  }
                }}
              >Cargar Plantilla</button>
                      {/* Popup para agregar nueva plantilla */}
                      {showAddPlantilla && (
                        <div style={{
                          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0003', position: 'relative' }}>
                            <button onClick={() => { setShowAddPlantilla(false); setNuevoPlantillaNombre(''); setAddPlantillaError(''); }}
                              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
                            <h3 style={{ marginBottom: 18, color: '#2563eb', fontWeight: 700 }}>Nueva Plantilla</h3>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ fontWeight: 600 }}>Nombre:</label>
                              <input type="text" className="form-control" value={nuevoPlantillaNombre} onChange={e => setNuevoPlantillaNombre(e.target.value)} style={{ marginLeft: 8 }} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ fontWeight: 600 }}>Descripción:</label>
                              <input type="text" className="form-control" value={nuevoPlantillaDesc} onChange={e => setNuevoPlantillaDesc(e.target.value)} style={{ marginLeft: 8 }} />
                            </div>
                            {addPlantillaError && <div style={{ color: '#dc2626', marginBottom: 10 }}>{addPlantillaError}</div>}
                            <button
                              className="btn btn-success"
                              disabled={addPlantillaLoading || !nuevoPlantillaNombre}
                              onClick={async () => {
                                setAddPlantillaLoading(true);
                                setAddPlantillaError('');
                                try {
                                  // Llamar al endpoint para grabar la nueva plantilla
                                  const res = await axios.post('/api/sp_InsertPlaPlantilla', {
                                    Nombre: nuevoPlantillaNombre,
                                    Descripcion: nuevoPlantillaDesc
                                  });
                                  if (res.data && res.data.error) {
                                    setAddPlantillaError(res.data.error);
                                  } else {
                                    setShowAddPlantilla(false);
                                    setNuevoPlantillaNombre('');
                                    setNuevoPlantillaDesc('');
                                    // Recargar plantillas y seleccionar la nueva
                                    axios.post('/api/sp_GetPlaPlantilla').then(r => {
                                      setPlantillas(r.data);
                                      // Buscar la nueva plantilla por nombre y descripción
                                      const nueva = r.data.find((p: any) => p.Nombre === nuevoPlantillaNombre && p.Descripcion === nuevoPlantillaDesc);
                                      if (nueva) {
                                        setPlantillaSel(String(nueva.PlantillaID));
                                      }
                                    });
                                  }
                                } catch (err) {
                                  setAddPlantillaError('Error al grabar la plantilla.');
                                } finally {
                                  setAddPlantillaLoading(false);
                                }
                              }}
                            >{addPlantillaLoading ? 'Guardando...' : 'Guardar'}</button>
                          </div>
                        </div>
                      )}
            </div>
          </div>
          {/* Bloque Segmento y Evidencia: solo habilitado si hay plantilla seleccionada */}
          <div style={{ marginBottom: 24, opacity: segmentoEvidenciasEnabled ? 1 : 0.5, pointerEvents: segmentoEvidenciasEnabled ? 'auto' : 'none' }}>
            <label style={{ fontWeight: 700 }}>Segmento:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select value={segmentoSel} onChange={e => setSegmentoSel(e.target.value)} className="form-select" style={{ marginLeft: 8, width: 180 }} disabled={!segmentoEvidenciasEnabled}>
                <option value="">Seleccione...</option>
                {segmentos.map((s: any) => <option key={s.SegmentoID} value={s.SegmentoID}>{s.Nombre || s.nombre}</option>)}
              </select>
              <button
                type="button"
                className="btn btn-success"
                style={{ padding: '2px 5px', display: 'flex', alignItems: 'center', fontSize: 14 }}
                title="Agregar nuevo segmento"
                onClick={() => setShowAddSegmento(true)}
                disabled={!segmentoEvidenciasEnabled}
              >
                <span style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>➕</span>
              </button>
            </div>
            {/* Popup para agregar nuevo segmento */}
            {showAddSegmento && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0003', position: 'relative' }}>
                  <button onClick={() => { setShowAddSegmento(false); setNuevoSegmentoNombre(''); setAddSegmentoError(''); }}
                    style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
                  <h3 style={{ marginBottom: 18, color: '#2563eb', fontWeight: 700 }}>Nuevo Segmento</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 600 }}>Nombre:</label>
                    <input type="text" className="form-control" value={nuevoSegmentoNombre} onChange={e => setNuevoSegmentoNombre(e.target.value)} style={{ marginLeft: 8 }} />
                  </div>
                  {addSegmentoError && <div style={{ color: '#dc2626', marginBottom: 10 }}>{addSegmentoError}</div>}
                  <button
                    className="btn btn-success"
                    disabled={addSegmentoLoading || !nuevoSegmentoNombre}
                    onClick={async () => {
                      setAddSegmentoLoading(true);
                      setAddSegmentoError('');
                      try {
                        // Llamar al endpoint para grabar el nuevo segmento
                        const res = await axios.post('/api/sp_InsertPlaSegmento', {
                          Nombre: nuevoSegmentoNombre
                        });
                        if (res.data && res.data.error) {
                          setAddSegmentoError(res.data.error);
                        } else {
                          setShowAddSegmento(false);
                          setNuevoSegmentoNombre('');
                          // Recargar segmentos y seleccionar el nuevo
                          axios.post('/api/sp_GetPlaSegmento').then(r => {
                            setSegmentos(r.data);
                            const nuevo = r.data.find((s: any) => s.Nombre === nuevoSegmentoNombre);
                            if (nuevo) {
                              setSegmentoSel(String(nuevo.SegmentoID));
                            }
                          });
                        }
                      } catch (err) {
                        setAddSegmentoError('Error al grabar el segmento.');
                      } finally {
                        setAddSegmentoLoading(false);
                      }
                    }}
                  >{addSegmentoLoading ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </div>
            )}
            {/* Evidencias como checkboxes debajo del segmento */}
            {segmentoSel && segmentoEvidenciasEnabled && (
              <div style={{ marginTop: 12, marginLeft: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                  <label style={{ fontWeight: 700, display: 'block', margin: 0 }}>Evidencias:</label>
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ padding: '2px 5px', fontSize: 14 }}
                    title="Agregar nueva evidencia"
                    onClick={() => setShowAddEvidencia(true)}
                    disabled={!segmentoEvidenciasEnabled}
                  >➕</button>
                      {/* Popup para agregar nueva evidencia */}
                      {showAddEvidencia && (
                        <div style={{
                          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0003', position: 'relative' }}>
                            <button onClick={() => { setShowAddEvidencia(false); setNuevoEvidenciaNombre(''); setAddEvidenciaError(''); }}
                              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
                            <h3 style={{ marginBottom: 18, color: '#2563eb', fontWeight: 700 }}>Nueva Evidencia</h3>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ fontWeight: 600 }}>Nombre:</label>
                              <input type="text" className="form-control" value={nuevoEvidenciaNombre} onChange={e => setNuevoEvidenciaNombre(e.target.value)} style={{ marginLeft: 8 }} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ fontWeight: 600 }}>¿Es obligatoria?</label>
                              <input type="checkbox" checked={nuevoEvidenciaObligatoria} onChange={e => setNuevoEvidenciaObligatoria(e.target.checked)} style={{ marginLeft: 8 }} />
                            </div>
                            {addEvidenciaError && <div style={{ color: '#dc2626', marginBottom: 10 }}>{addEvidenciaError}</div>}
                            <button
                              className="btn btn-success"
                              disabled={addEvidenciaLoading || !nuevoEvidenciaNombre}
                              onClick={async () => {
                                setAddEvidenciaLoading(true);
                                setAddEvidenciaError('');
                                try {
                                  // Llamar al endpoint para grabar la nueva evidencia
                                  const res = await axios.post('/api/sp_InsertPlaEvidencia', {
                                    Nombre: nuevoEvidenciaNombre,
                                    EsObligatoria: nuevoEvidenciaObligatoria ? 1 : 0
                                  });
                                  if (res.data && res.data.error) {
                                    setAddEvidenciaError(res.data.error);
                                  } else {
                                    setShowAddEvidencia(false);
                                    setNuevoEvidenciaNombre('');
                                    setNuevoEvidenciaObligatoria(false);
                                    // Recargar evidencias
                                    axios.post('/api/sp_GetPlaEvidencia').then(r => setEvidencias(r.data));
                                  }
                                } catch (err) {
                                  setAddEvidenciaError('Error al grabar la evidencia.');
                                } finally {
                                  setAddEvidenciaLoading(false);
                                }
                              }}
                            >{addEvidenciaLoading ? 'Guardando...' : 'Guardar'}</button>
                          </div>
                        </div>
                      )}
                </div>
                {evidencias.length === 0 ? (
                  <div style={{ color: '#64748b', fontStyle: 'italic' }}>No hay evidencias para este segmento.</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {evidencias.map((ev: any, idx: number) => (
                        <div key={ev.EvidenciaID} style={{ marginBottom: 4 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="checkbox"
                              value={ev.EvidenciaID}
                              checked={evidenciasSel.includes(String(ev.EvidenciaID))}
                              onChange={e => {
                                const value = String(ev.EvidenciaID);
                                if (e.target.checked) {
                                  setEvidenciasSel([...evidenciasSel, value]);
                                } else {
                                  setEvidenciasSel(evidenciasSel.filter(id => id !== value));
                                }
                              }}
                              disabled={!segmentoEvidenciasEnabled}
                            />
                            {ev.Nombre || ev.nombre}
                          </label>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: 12 }}
                      disabled={!segmentoEvidenciasEnabled || evidenciasSel.length === 0}
                      onClick={() => {
                        // Registrar evidencias seleccionadas para el segmento actual en la estructura
                        if (!segmentoSel) return;
                        setEvidenciasPorSegmento(prev => ({
                          ...prev,
                          [segmentoSel]: evidencias.filter(ev => evidenciasSel.includes(String(ev.EvidenciaID)))
                        }));
                        // Limpiar selección de evidencias tras registrar
                        setEvidenciasSel([]);
                      }}
                    >Registrar evidencias para este segmento</button>
                  </>
                )}
              </div>
            )}
          </div>
                  {/* Popup para agregar nuevo nodo principal */}
                  {showAddNodo && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0003', position: 'relative' }}>
                        <button onClick={() => { setShowAddNodo(false); setNuevoNodoNombre(''); setAddNodoError(''); }}
                          style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
                        <h3 style={{ marginBottom: 18, color: '#2563eb', fontWeight: 700 }}>Nuevo Nodo Principal</h3>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontWeight: 600 }}>Nombre:</label>
                          <input type="text" className="form-control" value={nuevoNodoNombre} onChange={e => setNuevoNodoNombre(e.target.value)} style={{ marginLeft: 8 }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontWeight: 600 }}>Descripción:</label>
                          <input type="text" className="form-control" value={nuevoNodoCodigo} onChange={e => setNuevoNodoCodigo(e.target.value)} style={{ marginLeft: 8 }} />
                        </div>
                        {addNodoError && <div style={{ color: '#dc2626', marginBottom: 10 }}>{addNodoError}</div>}
                        <button
                          className="btn btn-success"
                          disabled={addNodoLoading || !nuevoNodoNombre}
                          onClick={async () => {
                            setAddNodoLoading(true);
                            setAddNodoError('');
                            try {
                              // Llamar al endpoint para grabar el nuevo nodo principal
                              const res = await axios.post('/api/sp_InsertPlaNodoPrincipal', {
                                Nombre: nuevoNodoNombre,
                                Descripcion: nuevoNodoCodigo
                              });
                              if (res.data && res.data.error) {
                                setAddNodoError(res.data.error);
                              } else {
                                setShowAddNodo(false);
                                setNuevoNodoNombre('');
                                // Recargar áreas
                                axios.post('/api/sp_GetPlaNodoPrincipal').then(r => setAreas(r.data));
                              }
                            } catch (err: any) {
                              setAddNodoError('Error al grabar el nodo principal.');
                            } finally {
                              setAddNodoLoading(false);
                            }
                          }}
                        >{addNodoLoading ? 'Guardando...' : 'Guardar'}</button>
                      </div>
                    </div>
                  )}
        </div>
        {/* Estructura tipo árbol */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minHeight: 300 }}>
          <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 20, marginBottom: 18 }}>Estructura Seleccionada</div>
          <button
            type="button"
            className="btn btn-success"
            style={{ marginBottom: 18 }}
            onClick={async () => {
              if (!estructura.length) return;
              try {
                // Usar los IDs reales almacenados en la estructura seleccionada
                const estr = estructura[0];
                const PlantillaID = estr.plantillaId;
                const NodoID = estr.areaId;
                let exito = true;
                // Insertar detalles primero
                for (const seg of estr.segmentos) {
                  const SegmentoID = seg.segmentoId;
                  for (const ev of seg.evidencias) {
                    const EvidenciaID = ev.evidenciaId;
                    // Validar que todos los IDs existan
                    if (
                      PlantillaID === undefined || PlantillaID === null ||
                      NodoID === undefined || NodoID === null ||
                      SegmentoID === undefined || SegmentoID === null ||
                      EvidenciaID === undefined || EvidenciaID === null
                    ) {
                      exito = false;
                      continue;
                    }
                    const IdUsuario = 'admin';
                    const params = {
                      PlantillaID,
                      NodoID,
                      SegmentoID,
                      EvidenciaID,
                      RutaImagen: '',
                      IdUsuario
                    };
                    console.log('Insertando Plantilla_Imagenes:', params);
                    const res = await axios.post('/api/sp_InsertPlantillaImagenes', params);
                    if (!res.data || res.data.error) {
                      exito = false;
                    }
                  }
                }
                // Si todos los inserts de detalle fueron exitosos, ejecutar el SP de cabecera solo una vez
                if (exito) {
                  try {
                    const IdUsuario = 'admin';
                    const paramsCabecera = {
                      PlantillaID,
                      NodoID,
                      IdUsuario
                    };
                    console.log('Insertando cabecera SP_InsertarNodoPlantilla:', paramsCabecera);
                    const resCab = await axios.post('/api/sp_InsertarNodoPlantilla', paramsCabecera);
                    if (!resCab.data || resCab.data.error) {
                      alert('Error al grabar la cabecera de la plantilla.');
                      return;
                    }
                    alert('Plantilla grabada correctamente.');
                  } catch (err) {
                    alert('Error al grabar la cabecera de la plantilla.');
                  }
                } else {
                  alert('Ocurrió un error al grabar la plantilla.');
                }
              } catch (err) {
                alert('Error al grabar la plantilla.');
              }
            }}
            disabled={estructura.length === 0}
          >Grabar Plantilla</button>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {estructura.length === 0 ? (
              <li style={{ color: '#64748b', fontStyle: 'italic' }}>No hay estructura seleccionada.</li>
            ) : (
              estructura.map((area: any, idx: number) => (
                <li key={idx}>
                  <span style={{ fontWeight: 700 }}>
                    Área → {area.area}
                  </span>
                  <ul>
                    <li>
                      <span style={{ fontWeight: 700 }}>
                        Plantilla → {area.plantilla}
                      </span>
                      <ul>
                        {area.segmentos.map((seg: any, i: number) => (
                          <li key={i}>
                            <span>
                              Segmento → {seg.segmento}
                            </span>
                            <ul>
                              {seg.evidencias.map((ev: any, j: number) => (
                                <li key={j}>
                                  Evidencia → {ev.evidencia}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
        {/* GridControl: Tercera columna */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minHeight: 300, overflowX: 'auto' }}>
          <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 20, marginBottom: 18 }}>Plantillas x Area</div>
          {gridLoading ? (
            <div style={{ color: '#64748b', fontStyle: 'italic' }}>Cargando datos...</div>
          ) : gridData.length === 0 ? (
            <div style={{ color: '#64748b', fontStyle: 'italic' }}>No hay datos para mostrar.</div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                  <tr>
                    {Object.keys(gridData[0] || {})
                      .filter(col => col !== 'NodoID' && col !== 'PlantillaID')
                      .map((col, idx) => (
                        <th key={col} style={{ borderBottom: '1px solid #e5e7eb', padding: 6, textAlign: 'left', background: '#f1f5f9' }}>{col}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, i) => (
                    <tr key={i}
                      style={{ cursor: 'pointer' }}
                      onDoubleClick={() => {
                        const plantillaId = row['PlantillaID'];
                        setUltimoParametro(plantillaId ? String(plantillaId) : '');
                        // Usar el valor del combo de área (areaSel) como pArea (NodoID) solo para Tipo=3
                        const areaId = areaSel;
                        console.log('Doble clic - parámetro enviado:', { Tipo: 3, PlantillaID: plantillaId, pArea: areaId });
                        if (plantillaId) {
                          setDetalleLoading(true);
                          axios.post('/api/sp_BuscarPlantilla', { Tipo: 3, PlantillaID: plantillaId, pArea: areaId })
                            .then(res => {
                              setDetalleData(res.data);
                              if (res.data && res.data.length > 0) {
                                const found = res.data.find((row: any) => row.PlantillaID && row.SegmentoID);
                                if (found) {
                                  setPlantillaSel(String(found.PlantillaID));
                                  setSegmentoSel(String(found.SegmentoID));
                                } else {
                                  const foundPlantilla = res.data.find((row: any) => row.PlantillaID);
                                  if (foundPlantilla) {
                                    setPlantillaSel(String(foundPlantilla.PlantillaID));
                                  }
                                }
                                const evidenciasMarcadas = res.data
                                  .map((row: any) => row.EvidenciaID)
                                  .filter((id: any) => !!id);
                                if (evidenciasMarcadas.length > 0) {
                                  setEvidenciasSel(evidenciasMarcadas.map(String));
                                }
                                // Agrupar segmentos y evidencias con nombre y código (igual que el botón Cargar Plantilla)
                                const segmentosMap: {
                                  [key: string]: {
                                    segmento: string,
                                    segmentoId: string,
                                    evidencias: Array<{ evidencia: string, evidenciaId: string }>
                                  }
                                } = {};
                                res.data.forEach((row: any) => {
                                  const segmentoId = String(row.SegmentoID || row.segmentoid || '');
                                  const segmentoNombre = row.Segmento || row.segmento || segmentoId;
                                  const evidenciaId = String(row.EvidenciaID || row.evidenciaid || '');
                                  const evidenciaNombre = row.Evidencia || row.evidencia || evidenciaId;
                                  if (!segmentosMap[segmentoId]) {
                                    segmentosMap[segmentoId] = {
                                      segmento: segmentoNombre,
                                      segmentoId: segmentoId,
                                      evidencias: []
                                    };
                                  }
                                  if (evidenciaId) {
                                    segmentosMap[segmentoId].evidencias.push({ evidencia: evidenciaNombre, evidenciaId });
                                  }
                                });
                                // Usar el valor del combo de área (areaSel) como areaId
                                const estructuraNueva = [
                                  {
                                    area: res.data[0].Nodo || areaSel,
                                    areaId: areaId,
                                    plantilla: res.data[0].Plantilla || plantillaSel,
                                    plantillaId: plantillaId,
                                    segmentos: Object.values(segmentosMap)
                                  }
                                ];
                                setEstructura(estructuraNueva);
                              }
                            })
                            .catch(() => setDetalleData([]))
                            .finally(() => setDetalleLoading(false));
                        }
                      }}
                    >
                      {Object.entries(row)
                        .filter(([col]) => col !== 'NodoID' && col !== 'PlantillaID')
                        .map(([col, val], j) => (
                          <td key={j} style={{ borderBottom: '1px solid #f1f5f9', padding: 6 }}>{String(val)}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mostrar solo mensaje de existencia de registros tras doble clic */}
              {detalleLoading ? (
                <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: 16 }}>Cargando detalle...</div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantillaV3;
