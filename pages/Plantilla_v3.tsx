"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Utilidades para obtener datos desde los stores
const fetchSP = async (spName: string, params: any = {}) => {
  const { data } = await axios.post(`/api/${spName}`, params);
  return data;
};

const PlantillaV3 = () => {
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
      axios.post('/api/sp_BuscarPlantilla', { Tipo: 4, Valor: areaSel })
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
      // Buscar el nombre del área y plantilla seleccionados
      const areaObj = areas.find(a => (a.NodoID || a.id) == areaSel);
      const plantillaObj = plantillas.find(p => (p.PlantillaID || p.id) == plantillaSel);
      const estructuraSimulada = [
        {
          area: areaObj ? (areaObj.Nombre || areaObj.nombre) : areaSel,
          plantilla: plantillaObj ? (plantillaObj.Nombre || plantillaObj.nombre) : plantillaSel,
          segmentos: Object.entries(evidenciasPorSegmento).map(([segmentoId, evids]) => {
            const segmentoObj = segmentos.find(s => (s.SegmentoID || s.id) == segmentoId);
            return {
              segmento: segmentoObj ? (segmentoObj.Nombre || segmentoObj.nombre) : segmentoId,
              evidencias: evids.map(ev => ({ evidencia: ev.Nombre || ev.nombre }))
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
            <select value={areaSel} onChange={e => setAreaSel(e.target.value)} className="form-select" style={{ marginLeft: 8 }}>
              <option value="">Seleccione...</option>
              {areas.map((a: any) => <option key={a.NodoID || a.id} value={a.NodoID || a.id}>{a.Nombre || a.nombre}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700 }}>Plantilla:</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <select value={plantillaSel} onChange={e => setPlantillaSel(e.target.value)} className="form-select" style={{ marginLeft: 8, marginRight: 8 }}>
                <option value="">Seleccione...</option>
                {plantillas.map((p: any) => <option key={p.PlantillaID || p.id} value={p.PlantillaID || p.id}>{p.Nombre || p.nombre}</option>)}
              </select>
              <button
                type="button"
                className="btn btn-info"
                disabled={!areaSel || !plantillaSel}
                onClick={async () => {
                  if (!areaSel || !plantillaSel) return;
                  try {
                    // Buscar la estructura de la plantilla seleccionada
                    const { data } = await axios.post('/api/sp_BuscarPlantilla', { Tipo: 3, PlantillaID: plantillaSel });
                    if (data && data.length > 0) {
                      // Agrupar segmentos y evidencias
                      const segmentosMap: { [key: string]: { nombre: string, evidencias: Array<{ evidencia: string }> } } = {};
                      data.forEach((row: any) => {
                        const segmentoId = String(row.SegmentoID || row.segmentoid || '');
                        const segmentoNombre = row.Segmento || row.segmento || segmentoId;
                        const evidenciaId = String(row.EvidenciaID || row.evidenciaid || '');
                        const evidenciaNombre = row.Evidencia || row.evidencia || evidenciaId;
                        if (!segmentosMap[segmentoId]) {
                          segmentosMap[segmentoId] = { nombre: segmentoNombre, evidencias: [] };
                        }
                        if (evidenciaId) {
                          segmentosMap[segmentoId].evidencias.push({ evidencia: evidenciaNombre });
                        }
                      });
                      const areaObj = areas.find(a => (a.NodoID || a.id) == areaSel);
                      const plantillaObj = plantillas.find(p => (p.PlantillaID || p.id) == plantillaSel);
                      const estructuraNueva = [
                        {
                          area: areaObj ? (areaObj.Nombre || areaObj.nombre) : areaSel,
                          plantilla: plantillaObj ? (plantillaObj.Nombre || plantillaObj.nombre) : plantillaSel,
                          segmentos: Object.values(segmentosMap)
                        }
                      ];
                      setEstructura(estructuraNueva);
                    } else {
                      setEstructura([]);
                    }
                  } catch (err) {
                    setEstructura([]);
                  }
                }}
              >Cargar Plantilla</button>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700 }}>Segmento:</label>
            <select value={segmentoSel} onChange={e => setSegmentoSel(e.target.value)} className="form-select" style={{ marginLeft: 8 }}>
              <option value="">Seleccione...</option>
              {segmentos.map((s: any) => <option key={s.SegmentoID || s.id} value={s.SegmentoID || s.id}>{s.Nombre || s.nombre}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700 }}>Evidencia:</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              alignItems: 'start',
            }}>
              {evidencias.map((ev: any) => (
                <label key={ev.EvidenciaID || ev.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    checked={evidenciasSel.includes(ev.EvidenciaID || ev.id)}
                    onChange={e => {
                      const evidId = ev.EvidenciaID || ev.id;
                      if (e.target.checked) {
                        setEvidenciasSel([...evidenciasSel, evidId]);
                      } else {
                        setEvidenciasSel(evidenciasSel.filter(id => id !== evidId));
                      }
                    }}
                    style={{ marginRight: 6 }}
                  /> {ev.Nombre || ev.nombre}
                </label>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary mt-2"
              style={{ marginTop: 10 }}
              disabled={!segmentoSel || evidencias.length === 0}
              onClick={() => {
                if (segmentoSel && evidenciasSel.length > 0) {
                  // Solo agregar las evidencias marcadas para el segmento
                  const evidenciasMarcadas = evidencias.filter(ev => evidenciasSel.includes(ev.EvidenciaID || ev.id));
                  setEvidenciasPorSegmento(prev => ({
                    ...prev,
                    [segmentoSel]: evidenciasMarcadas
                  }));
                  setEvidenciasSel([]);
                }
              }}
            >Add</button>
          </div>
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
                // Preparar los datos para el store
                // Se asume que la estructura tiene un solo objeto con area, plantilla y segmentos
                const estr = estructura[0];
                const plantillaNombre = estr.plantilla;
                const areaNombre = estr.area;
                // Buscar los IDs reales de área y plantilla
                const areaObj = areas.find(a => (a.Nombre || a.nombre) === areaNombre);
                const plantillaObj = plantillas.find(p => (p.Nombre || p.nombre) === plantillaNombre);
                const PlantillaID = plantillaObj ? (plantillaObj.PlantillaID || plantillaObj.id) : null;
                const NodoID = areaObj ? (areaObj.NodoID || areaObj.id) : null;
                // Recorrer segmentos y evidencias
                let detalles: Array<{ SegmentoID: any, EvidenciaID: any }> = [];
                estr.segmentos.forEach((seg: any) => {
                  // Buscar el segmento por nombre
                  const segmentoObj = segmentos.find(s => (s.Nombre || s.nombre) === seg.segmento);
                  const SegmentoID = segmentoObj ? (segmentoObj.SegmentoID || segmentoObj.id) : null;
                  seg.evidencias.forEach((ev: any) => {
                    // Buscar la evidencia por nombre
                    const evidenciaObj = evidencias.find(e => (e.Nombre || e.nombre) === ev.evidencia);
                    const EvidenciaID = evidenciaObj ? (evidenciaObj.EvidenciaID || evidenciaObj.id) : null;
                    detalles.push({ SegmentoID, EvidenciaID });
                  });
                });
                // Llamar al store para cada detalle (puedes ajustar para enviar un arreglo si el backend lo soporta)
                let exito = true;
                for (const det of detalles) {
                  const res = await axios.post('/api/sp_InsertPlantillaImagenes', {
                    PlantillaID,
                    NodoID,
                    SegmentoID: det.SegmentoID,
                    EvidenciaID: det.EvidenciaID,
                    RutaImagen: ''
                  });
                  if (!res.data || res.data.error) {
                    exito = false;
                  }
                }
                if (exito) {
                  alert('Plantilla grabada correctamente.');
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
                  <span style={{ fontWeight: 700 }}>Área → {area.area}</span>
                  <ul>
                    <li>
                      <span style={{ fontWeight: 700 }}>Plantilla → {area.plantilla}</span>
                      <ul>
                        {area.segmentos.map((seg: any, i: number) => (
                          <li key={i}>
                            <span>Segmento → {seg.segmento}</span>
                            <ul>
                              {seg.evidencias.map((ev: any, j: number) => (
                                <li key={j}>Evidencia → {ev.evidencia}</li>
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
                      .filter(col => col.toLowerCase() !== 'nodoid' && col.toLowerCase() !== 'plantillaid')
                      .map((col, idx) => (
                        <th key={idx} style={{ borderBottom: '1px solid #e5e7eb', padding: 6, textAlign: 'left', background: '#f1f5f9' }}>{col}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, i) => (
                    <tr key={i}
                      style={{ cursor: 'pointer' }}
                      onDoubleClick={() => {
                        const plantillaId = row['PlantillaID'] || row['plantillaid'];
                        setUltimoParametro(plantillaId ? String(plantillaId) : '');
                        console.log('Doble clic - parámetro enviado:', { Tipo: 3, PlantillaID: plantillaId });
                        if (plantillaId) {
                          setDetalleLoading(true);
                          axios.post('/api/sp_BuscarPlantilla', { Tipo: 3, PlantillaID: plantillaId })
                            .then(res => {
                              setDetalleData(res.data);
                              // Si existen registros, seleccionar la Plantilla en el combo
                              if (res.data && res.data.length > 0) {
                                // Buscar el PlantillaID y SegmentoID en el resultado y setearlos
                                const found = res.data.find((row: any) => (row.PlantillaID || row.plantillaid) && (row.SegmentoID || row.segmentoid));
                                if (found) {
                                  setPlantillaSel(String(found.PlantillaID || found.plantillaid));
                                  setSegmentoSel(String(found.SegmentoID || found.segmentoid));
                                } else {
                                  // Si no hay SegmentoID, buscar solo PlantillaID
                                  const foundPlantilla = res.data.find((row: any) => row.PlantillaID || row.plantillaid);
                                  if (foundPlantilla) {
                                    setPlantillaSel(String(foundPlantilla.PlantillaID || foundPlantilla.plantillaid));
                                  }
                                }
                                // Marcar los checks de evidencia
                                const evidenciasMarcadas = res.data
                                  .map((row: any) => row.EvidenciaID || row.evidenciaid)
                                  .filter((id: any) => !!id);
                                if (evidenciasMarcadas.length > 0) {
                                  setEvidenciasSel(evidenciasMarcadas.map(String));
                                }
                                // Agrupar todos los segmentos y evidencias de la plantilla seleccionada
                                const segmentosMap: { [key: string]: { nombre: string, evidencias: Array<{ evidencia: string }> } } = {};
                                res.data.forEach((row: any) => {
                                  const segmentoId = String(row.SegmentoID || row.segmentoid || '');
                                  const segmentoNombre = row.Segmento || row.segmento || segmentoId;
                                  const evidenciaId = String(row.EvidenciaID || row.evidenciaid || '');
                                  const evidenciaNombre = row.Evidencia || row.evidencia || evidenciaId;
                                  if (!segmentosMap[segmentoId]) {
                                    segmentosMap[segmentoId] = { nombre: segmentoNombre, evidencias: [] };
                                  }
                                  if (evidenciaId) {
                                    segmentosMap[segmentoId].evidencias.push({ evidencia: evidenciaNombre });
                                  }
                                });
                                const estructuraNueva = [
                                  {
                                    area: res.data[0].Nodo || res.data[0].nodo || areaSel,
                                    plantilla: res.data[0].Plantilla || res.data[0].plantilla || plantillaSel,
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
                        .filter(([col]) => col.toLowerCase() !== 'nodoid' && col.toLowerCase() !== 'plantillaid')
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
              ) : detalleData.length > 0 ? (
                <div style={{ color: '#16a34a', fontWeight: 600, marginTop: 16 }}>Existen registros</div>
              ) : detalleData.length === 0 && detalleData !== null ? (
                <div style={{ color: '#dc2626', fontWeight: 600, marginTop: 16 }}>No existen registros</div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantillaV3;
