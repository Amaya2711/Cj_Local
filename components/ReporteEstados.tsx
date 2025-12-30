import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

interface EmpleadoCuadrilla {
  IdEmpleado?: number;
  NombreEmpleado?: string;
  idempleado?: number;
  nombreempleado?: string;
}

interface ResultadoAprobar {
  id: number;
  estado: string;
  RutaPDf?: string; // Agregado para evitar el error de tipo
  // Agrega aquí otras propiedades según tu modelo de datos
  [key: string]: any;
}

const ReporteEstados: React.FC = () => {
  const [cuadrillas, setCuadrillas] = useState<EmpleadoCuadrilla[]>([]);
  const [cuadrillaInput, setCuadrillaInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [selectedCuadrilla, setSelectedCuadrilla] = useState<string>('');
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [resultados, setResultados] = useState<ResultadoAprobar[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [filtroCuadrillaActivo, setFiltroCuadrillaActivo] = useState(true);
  const [filtroFechaActivo, setFiltroFechaActivo] = useState(true);
  const [filtroEstadoActivo, setFiltroEstadoActivo] = useState(false);
  const [estados, setEstados] = useState<{ id: string; nombre: string }[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [mostrarEstados, setMostrarEstados] = useState(false);

  // Exportar resultados a Excel
  const exportarExcel = () => {
    if (!resultados.length) return;
    // Filtrar columnas ocultas
    const columnasOcultas = ['idsite', 'correlativo', 'Site', 'NroInterno', 'Id_Auto', 'Estado', 'tipotrabajo'];
    const datosExportar = resultados.map(row => {
      const obj: Record<string, any> = {};
      Object.keys(row)
        .filter(col => !columnasOcultas.includes(col))
        .forEach(col => {
          // Para RutaPDf, exportar la URL si existe, si no dejar vacío
          if (col.toLowerCase() === 'rutapdf') {
            obj['RutaPDf'] = row[col] && typeof row[col] === 'string' && row[col].trim() !== '' ? row[col] : '';
          } else {
            obj[col] = row[col];
          }
        });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, 'reporte_estados.xlsx');
  };

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
        const res = await fetch('/api/estadosWeb'); // Corregido: debe coincidir con el nombre del archivo de la API
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
    if (filtroFechaActivo && (!fechaIni || !fechaFin)) return;
    setBuscando(true);
    setResultados([]);
    const params = {
      cuadrilla: filtroCuadrillaActivo && selectedCuadrilla ? selectedCuadrilla : '',
      fechaIni: filtroFechaActivo ? fechaIni : '',
      fechaFin: filtroFechaActivo ? fechaFin : '',
      estado: filtroEstadoActivo && estadoSeleccionado ? estadoSeleccionado : ''
    };
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/obtener-cuadrilla-reporte?${query}`);
      if (!res.ok) throw new Error('No existe coincidencia');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setResultados(data);
      } else {
        setResultados([]);
        alert('No existe coincidencia');
      }
    } catch (err) {
      setResultados([]);
      alert('No existe coincidencia');
    } finally {
      setBuscando(false);
    }
  };

  const handleCheck = (idx: number) => {
    setSeleccionados(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleAprobar = async () => {
    // Lógica de aprobación
    alert('Aprobado');
  };

  const handleRechazar = () => {
    alert(`Rechazar filas: ${seleccionados.map(i => i + 1).join(', ')}`);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h3 style={{ marginBottom: 16 }}>Reporte de Estados</h3>
      {/* Filtros y controles existentes */}
      <div style={{ marginBottom: 16, position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" id="filtroCuadrilla" checked={filtroCuadrillaActivo} onChange={e => setFiltroCuadrillaActivo(e.target.checked)} />
        <label htmlFor="filtroCuadrilla" style={{ marginRight: 8 }}>Cuadrilla:</label>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={cuadrillaInput}
            onChange={handleCuadrillaInput}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar cuadrilla..."
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            autoComplete="off"
            disabled={!filtroCuadrillaActivo}
          />
          {showSuggestions && cuadrillaInput && filteredCuadrillas.length > 0 && filtroCuadrillaActivo && (
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
        <input type="checkbox" id="filtroFecha" checked={filtroFechaActivo} onChange={e => setFiltroFechaActivo(e.target.checked)} />
        <label htmlFor="filtroFecha" style={{ marginRight: 8 }}>Fechas:</label>
        <div>
          <label style={{ marginRight: 4 }}>Inicial:</label>
          <input type="date" value={fechaIni} onChange={e => setFechaIni(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} disabled={!filtroFechaActivo} />
        </div>
        <div>
          <label style={{ marginRight: 4 }}>Final:</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} disabled={!filtroFechaActivo} />
        </div>
      </div>
      {/* Checkbox y combobox de estados */}
      <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          id="filtroEstado"
          checked={filtroEstadoActivo}
          onChange={e => {
            setFiltroEstadoActivo(e.target.checked);
            if (!e.target.checked) setEstadoSeleccionado('');
          }}
        />
        <label htmlFor="filtroEstado" style={{ fontWeight: 500, color: '#334155', marginRight: 8 }}>Estado:</label>
        <select
          id="estadoCombo"
          value={estadoSeleccionado}
          onChange={e => setEstadoSeleccionado(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 180 }}
          disabled={!filtroEstadoActivo}
        >
          <option value="">Seleccione un estado...</option>
          {estados.map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </div>

      {/* Botón Buscar debajo de todos los filtros */}
      <div style={{ marginBottom: 32, marginTop: 16 }}>
        <button
          onClick={handleBuscar}
          disabled={buscando || (filtroCuadrillaActivo && !selectedCuadrilla) || (filtroFechaActivo && (!fechaIni || !fechaFin)) || (filtroEstadoActivo && !estadoSeleccionado)}
          style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer', marginTop: 0 }}
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {/* Grilla de resultados */}
      <div style={{ marginTop: 32 }}>
        {resultados.length > 0 && (
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ color: '#334155', fontWeight: 500 }}>
              Registros encontrados: {resultados.length}
            </span>
            <button
              onClick={exportarExcel}
              style={{ padding: '8px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}
            >
              Exportar a Excel
            </button>
          </div>
        )}
        {resultados.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  {Object.keys(resultados[0])
                    .filter(col => !['idsite', 'correlativo', 'Site', 'NroInterno', 'Id_Auto', 'Estado', 'tipotrabajo'].includes(col))
                    .map(col => (
                      <th key={col} style={{ padding: 8, border: '1px solid #e5e7eb' }}>{col}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {resultados.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(row)
                      .filter(col => !['idsite', 'correlativo', 'Site', 'NroInterno', 'Id_Auto', 'Estado', 'tipotrabajo'].includes(col))
                      .map(col => {
                        if (col.toLowerCase() === 'rutapdf') {
                          return (
                            <td key={col} style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                              {row[col] && typeof row[col] === 'string' && row[col].trim() !== '' ? (
                                <a href={row[col]} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Ver PDF</a>
                              ) : null}
                            </td>
                          );
                        }
                        return (
                          <td key={col} style={{ padding: 8, border: '1px solid #e5e7eb' }}>{col.toLowerCase() === 'rutapdf' ? '' : row[col]}</td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReporteEstados;
