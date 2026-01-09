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
    <div style={{ maxWidth: 1200, margin: '40px auto', background: '#f8fafc', borderRadius: 18, boxShadow: '0 8px 32px #0002', padding: 40 }}>
      {/* <h2 style={{ textAlign: 'center', marginBottom: 36, fontWeight: 800, fontSize: 32, color: '#1e40af' }}>Plantilla V3</h2> */}
      <div style={{ display: 'flex', gap: 40 }}>
        {/* Área y Plantilla y Segmento */}
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
            <select value={plantillaSel} onChange={e => setPlantillaSel(e.target.value)} className="form-select" style={{ marginLeft: 8 }}>
              <option value="">Seleccione...</option>
              {plantillas.map((p: any) => <option key={p.PlantillaID || p.id} value={p.PlantillaID || p.id}>{p.Nombre || p.nombre}</option>)}
            </select>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {evidencias.map((ev: any) => (
                <label key={ev.EvidenciaID || ev.id}>
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
      </div>
    </div>
  );
};

export default PlantillaV3;
