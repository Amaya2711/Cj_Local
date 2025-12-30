import React, { useEffect, useState } from 'react';

interface EmpleadoCuadrilla {
  IdEmpleado?: number;
  NombreEmpleado?: string;
  idempleado?: number;
  nombreempleado?: string;
}

interface ResultadoAprobar {
  id: number;
  estado: string;
  // Agrega aquí otras propiedades según tu modelo de datos
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
    const idCuadrillaParam = filtroCuadrillaActivo && selectedCuadrilla ? selectedCuadrilla : '';
    const fechaIniParam = filtroFechaActivo ? fechaIni : '';
    const fechaFinParam = filtroFechaActivo ? fechaFin : '';
    const estadoParam = filtroEstadoActivo && estadoSeleccionado ? estadoSeleccionado : '';
    // Aquí deberías llamar a tu API de búsqueda real
    setBuscando(false);
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
      {/* Botón Buscar debajo de Fechas */}
      <div style={{ marginBottom: 32, marginTop: 0 }}>
        <button
          onClick={handleBuscar}
          disabled={buscando || (filtroCuadrillaActivo && !selectedCuadrilla) || (filtroFechaActivo && (!fechaIni || !fechaFin)) || (filtroEstadoActivo && !estadoSeleccionado)}
          style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer', marginTop: 0 }}
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {/* Combobox de estados */}
      <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor="estadoCombo" style={{ fontWeight: 500, color: '#334155' }}>Estado:</label>
        <select
          id="estadoCombo"
          value={estadoSeleccionado}
          onChange={e => setEstadoSeleccionado(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 180 }}
        >
          <option value="">Seleccione un estado...</option>
          {estados.map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </div>
      {/* El botón 'Estados' ha sido removido por requerimiento */}
      {mostrarEstados && (
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 8, color: '#64748b', fontWeight: 600 }}>
            Store ejecutado: <span style={{ color: '#2563eb' }}>[sp_EstadosWeb]</span>
          </div>
          <h4>Estados disponibles:</h4>
          <div style={{ overflowX: 'auto' }}>
            {estados.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    {Object.keys(estados[0]).map(col => (
                      <th key={col} style={{ padding: 8, border: '1px solid #e5e7eb' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {estados.map((row, idx) => (
                    <tr key={row.id + '-' + idx}>
                      {Object.keys(row).map(col => (
                        <td key={col} style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                          {(row as Record<string, any>)[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay estados para mostrar.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteEstados;
