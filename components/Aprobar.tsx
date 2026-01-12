import React, { useState, useEffect } from 'react';

interface EmpleadoCuadrilla {
  IdEmpleado?: number;
  NombreEmpleado?: string;
  idempleado?: number;
  nombreempleado?: string;
}

interface ResultadoAprobar {
  // Define aquí los campos que retorna el SP sp_ObtenerCuadrillaAprobar
  id_cuadrilla?: string;
  id?: string;
  nombre?: string;
  NroInterno?: string;
  nrointerno?: string;
  fecha?: string;
  Fecha?: string;
  TipoTrabajo?: string;
  tipotrabajo?: string;
  Concatenado?: string;
  RutaPDF?: string;
  idAuto?: string;
  // ...otros campos
}

interface AprobarProps {
  titulo?: string;
}

const Aprobar: React.FC<AprobarProps> = ({ titulo = 'Aprobar cuadrilla' }) => {
  // Función para obtener la fecha actual en formato YYYY-MM-DD considerando la zona horaria de Perú (UTC-5)
  function getTodayPeruDateStr() {
    const now = new Date();
    // Ajustar a la zona horaria de Perú (UTC-5)
    const offsetMs = (now.getTimezoneOffset() + 300) * 60 * 1000; // 300 min = 5 horas
    const peruDate = new Date(now.getTime() - offsetMs);
    return peruDate.toISOString().slice(0, 10);
  }
  const [cuadrillas, setCuadrillas] = useState<EmpleadoCuadrilla[]>([]);
  const [cuadrillaInput, setCuadrillaInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [selectedCuadrilla, setSelectedCuadrilla] = useState<string>('');
  const [fechaIni, setFechaIni] = useState(getTodayPeruDateStr());
  const [fechaFin, setFechaFin] = useState(getTodayPeruDateStr());
  const [resultados, setResultados] = useState<ResultadoAprobar[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  // Filtros activos
  const [filtroCuadrillaActivo, setFiltroCuadrillaActivo] = useState(true);
  const [filtroFechaActivo, setFiltroFechaActivo] = useState(true);
  const [filtroEstadoActivo, setFiltroEstadoActivo] = useState(false);
  const [estados, setEstados] = useState<{ id: string; nombre: string }[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  useEffect(() => {
    async function fetchCuadrillas() {
      try {
        const res = await fetch('/api/cuadrilla-asignacion-cuadrillas');
        if (!res.ok) throw new Error('No se pudo cargar la lista de cuadrillas.');
        const data = await res.json();
        setCuadrillas(data);
      } catch (err) {
        setCuadrillas([]);
      }
    }
    async function fetchEstados() {
      try {
        const res = await fetch('/api/estados-web');
        if (!res.ok) throw new Error('No se pudo cargar la lista de estados.');
        const data = await res.json();
        setEstados(Array.isArray(data) ? data : []);
      } catch (err) {
        setEstados([]);
      }
    }
    fetchCuadrillas();
    fetchEstados();
  }, []);

  const filteredCuadrillas = Array.isArray(cuadrillas)
    ? cuadrillas.filter(c => {
        const nombre = (c.NombreEmpleado ?? c.nombreempleado ?? '').toLowerCase();
        return cuadrillaInput
          .toLowerCase()
          .split(' ')
          .every(word => nombre.includes(word));
      })
    : [];

  const handleCuadrillaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCuadrillaInput(e.target.value);
    setShowSuggestions(true);
    setSelectedCuadrilla('');
  };

  const handleSuggestionClick = (c: EmpleadoCuadrilla) => {
    setCuadrillaInput(c.NombreEmpleado ?? c.nombreempleado ?? '');
    setSelectedCuadrilla(String(c.IdEmpleado ?? c.idempleado));
    setShowSuggestions(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredCuadrillas.length === 0) return;
    if (e.key === 'ArrowDown') {
      setActiveSuggestion(prev => Math.min(prev + 1, filteredCuadrillas.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      const c = filteredCuadrillas[activeSuggestion];
      if (c) handleSuggestionClick(c);
    }
  };

  const handleBuscar = async () => {
    // Validar filtros activos
    if (filtroFechaActivo && (!fechaIni || !fechaFin)) return;
    setBuscando(true);
    setResultados([]);
    // Solo enviar parámetros de filtros activos
    const idCuadrillaParam = filtroCuadrillaActivo && selectedCuadrilla ? selectedCuadrilla : '';
    const fechaIniParam = filtroFechaActivo ? fechaIni : '';
    const fechaFinParam = filtroFechaActivo ? fechaFin : '';
    const estadoParam = filtroEstadoActivo && estadoSeleccionado ? estadoSeleccionado : '';
    const mensajeStore = `Store ejecutado: sp_ObtenerCuadrillaAprobar\nParámetros enviados:\n@idCuadrilla: ${idCuadrillaParam}\n@pFechaIni: ${fechaIniParam}\n@pFechaFin: ${fechaFinParam}\n@estado: ${estadoParam}`;
    alert(mensajeStore);
    const res = await fetch('/api/aprobar-busqueda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idCuadrilla: idCuadrillaParam,
        pFechaIni: fechaIniParam,
        pFechaFin: fechaFinParam,
        estado: estadoParam
      })
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      alert('No existe coincidencia');
      setResultados([]);
    } else {
      setResultados(data);
    }
    setBuscando(false);
  };

  // Manejar selección de filas
  const handleCheck = (idx: number) => {
    setSeleccionados(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Acciones de aprobar/rechazar (placeholder)
  const handleAprobar = async () => {
    // Obtener los registros seleccionados
    const registros = seleccionados.map(idx => {
      const row = resultados[idx];
      return {
        pidCuadrilla: row.id_cuadrilla ?? '',
        pNroInterno: row.NroInterno !== undefined && row.NroInterno !== null
          ? String(row.NroInterno)
          : (row.nrointerno !== undefined && row.nrointerno !== null ? String(row.nrointerno) : ''),
        pFecha: row.fecha ?? row.Fecha ?? '',
        ptipotrabajo: row.TipoTrabajo ?? row.tipotrabajo ?? '',
      };
    });
    // Usuario del sistema (ajustar para obtener el real)
    const usuario = 'ADMIN TTT';
    // Mostrar los parámetros y valores a enviar
    let mensaje = 'Parámetros a enviar a sp_CrearSeguimiento:';
    registros.forEach((r, i) => {
      mensaje += `\n\nRegistro ${i + 1}:\n`;
      mensaje += `  pidCuadrilla: ${r.pidCuadrilla}\n`;
      mensaje += `  pNroInterno: ${r.pNroInterno}\n`;
      mensaje += `  pFecha: ${r.pFecha}\n`;
      mensaje += `  pEstado: 8\n`;
      mensaje += `  pUsuario: ${usuario}\n`;
      mensaje += `  ptipotrabajo: ${r.ptipotrabajo}\n`;
    });
    alert(mensaje);
    try {
      const res = await fetch('/api/aprobar-crear-seguimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registros, usuario })
      });
      const data = await res.json();
      if (data.ok) {
        alert('Aprobación exitosa');
        setSeleccionados([]); // Limpiar selección
        handleBuscar(); // Refrescar la grilla
      } else {
        alert('Error al aprobar: ' + data.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert('Error de red: ' + errorMessage);
    }
  };

  const handleRechazar = () => {
    alert(`Rechazar filas: ${seleccionados.map(i => i + 1).join(', ')}`);
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 style={{ marginBottom: 16 }}>{titulo}</h3>
      <div style={{ marginBottom: 16, position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor="cuadrillaInput" style={{ marginRight: 8 }}>Cuadrilla:</label>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            id="cuadrillaInput"
            type="text"
            value={cuadrillaInput}
            onChange={handleCuadrillaInput}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar cuadrilla..."
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            autoComplete="off"
          />
          {showSuggestions && cuadrillaInput && filteredCuadrillas.length > 0 && (
            <ul style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4, margin: 0, padding: 0, listStyle: 'none', maxHeight: 150, overflowY: 'auto', position: 'absolute', zIndex: 10, width: '100%' }}>
              {filteredCuadrillas.map((c, idx) => (
                <li
                  key={c.IdEmpleado ?? c.idempleado}
                  style={{ padding: 8, cursor: 'pointer', background: idx === activeSuggestion ? '#e0e7ff' : 'transparent' }}
                  onMouseEnter={() => setActiveSuggestion(idx)}
                  onClick={() => handleSuggestionClick(c)}
                >
                  {c.NombreEmpleado ?? c.nombreempleado}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <label htmlFor="fechaIni" style={{ marginRight: 8 }}>Fechas:</label>
        <div>
          <label style={{ marginRight: 4 }}>Inicial:</label>
          <input id="fechaIni" type="date" value={fechaIni} onChange={e => setFechaIni(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ marginRight: 4 }}>Final:</label>
          <input id="fechaFin" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
        </div>
      </div>
      <button onClick={handleBuscar} disabled={buscando || (filtroCuadrillaActivo && !selectedCuadrilla) || (filtroFechaActivo && (!fechaIni || !fechaFin)) || (filtroEstadoActivo && !estadoSeleccionado)} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>
        {buscando ? 'Buscando...' : 'Buscar'}
      </button>
      <div style={{ marginTop: 32 }}>
        {resultados.length > 0 && (
          <div>
            <h4>Resultados:</h4>
            <div style={{ marginTop: 32 }}>
              {resultados.length > 0 && (
                <div>
                  <h4>Resultados:</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}></th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>id_cuadrilla</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Concatenado</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Fecha</th>
                          <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>RutaPDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((row: any, idx: number) => (
                          <tr key={row.idAuto + '-' + idx}>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={seleccionados.includes(idx)}
                                onChange={() => handleCheck(idx)}
                              />
                            </td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.id_cuadrilla ?? ''}</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Concatenado ?? ''}</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.fecha ?? ''}</td>
                            <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                              {row.RutaPDF ? (
                                <a href={row.RutaPDF} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                                  Ver PDF
                                </a>
                              ) : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center' }}>
                    <button onClick={handleAprobar} style={{ padding: '10px 32px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                      Aprobar
                    </button>
                    <button onClick={handleRechazar} style={{ padding: '10px 32px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                      Rechazar
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Aprobar;
