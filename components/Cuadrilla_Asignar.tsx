import React, { useState, useEffect } from 'react';

interface EmpleadoCuadrilla {
  IdEmpleado?: number;
  NombreEmpleado?: string;
  idempleado?: number;
  nombreempleado?: string;
}

interface SiteAsignacion {
  NroInterno?: string | number;
  Concatenado: string;
  IDSite?: string | number;
  idsite?: string | number;
  IdSite?: string | number;
  Correlativo?: string | number;
  correlativo?: string | number;
}


  // (moved inside the component)

interface EmpleadoCuadrilla {
  IdEmpleado?: number;
  NombreEmpleado?: string;
  idempleado?: number;
  nombreempleado?: string;
}

interface SiteAsignacion {
  NroInterno?: string | number;
  Concatenado: string;
  IDSite?: string | number;
  idsite?: string | number;
  IdSite?: string | number;
  Correlativo?: string | number;
  correlativo?: string | number;
}


// (removed duplicate component declaration and state initialization)

const Cuadrilla_Asignar: React.FC = () => {
  // Estado para asignaciones del día
  const [asignacionesDia, setAsignacionesDia] = useState<any[]>([]);
  const [cuadrillas, setCuadrillas] = useState<EmpleadoCuadrilla[]>([]);
  const [sites, setSites] = useState<SiteAsignacion[]>([]);
  const [selectedCuadrilla, setSelectedCuadrilla] = useState('');
  const [cuadrillaInput, setCuadrillaInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [selectedSite, setSelectedSite] = useState('');
  const [siteInput, setSiteInput] = useState('');
  const [showSiteSuggestions, setShowSiteSuggestions] = useState(false);
  const [activeSiteSuggestion, setActiveSiteSuggestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorSites, setErrorSites] = useState('');
  const [errorCuadrillas, setErrorCuadrillas] = useState('');
  // Estado para el gridcontrol
  const [gridData, setGridData] = useState<Array<{
    id_cuadrilla: string;
    Empleado: string;
    NroInterno: string;
    Concatenado: string;
    idsite?: string;
    correlativo?: string;
  }>>([]);

  useEffect(() => {
    async function fetchCuadrillas() {
      try {
        const res = await fetch('/api/cuadrilla-empleado');
        if (!res.ok) throw new Error('No se pudo cargar la lista de cuadrillas.');
        const data = await res.json();
        setCuadrillas(data);
        setErrorCuadrillas('');
      } catch (err) {
        setCuadrillas([]);
        setErrorCuadrillas('Error al cargar cuadrillas.');
      }
    }

    async function fetchSites() {
      try {
        const res = await fetch('/api/asignacion-sites');
        if (!res.ok) throw new Error('No se pudo cargar la lista de sites.');
        const data = await res.json();
        setSites(data);
        setErrorSites('');
      } catch (err) {
        setSites([]);
        setErrorSites('Error al cargar sites.');
      }
    }

    fetchCuadrillas();
    fetchSites();
  }, []);

  // Eliminar fila del grid
  const handleDeleteRow = (idx: number) => {
    setGridData(prev => prev.filter((_, i) => i !== idx));
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (gridData.length === 0) return;
    const header = ['id_cuadrilla', 'Empleado', 'NroInterno', 'Concatenado'];
    const rows = gridData.map(row => [row.id_cuadrilla, row.Empleado, row.NroInterno, row.Concatenado]);
    const csvContent = [header, ...rows]
      .map(e => e.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'asignaciones.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredCuadrillas = cuadrillas.filter(c => {
    const nombre = (c.NombreEmpleado ?? c.nombreempleado ?? '').toLowerCase();
    return cuadrillaInput
      .toLowerCase()
      .split(' ')
      .every(word => nombre.includes(word));
  });

  // Filtrado por palabra en el site (NroInterno y Concatenado), ignorando tildes y mayúsculas
  function normalize(str: string) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  const filteredSites = sites.filter(s => {
    const nroInterno = normalize(String(s.NroInterno ?? ''));
    const concatenado = normalize(s.Concatenado ?? '');
    return normalize(siteInput)
      .split(' ')
      .every(word => nroInterno.includes(word) || concatenado.includes(word));
  });

  const handleCuadrillaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCuadrillaInput(e.target.value);
    setShowSuggestions(true);
    setSelectedCuadrilla('');
    setActiveSuggestion(0);
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

  // Autocompletado para sites
  const handleSiteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteInput(e.target.value);
    setShowSiteSuggestions(true);
    setSelectedSite('');
    setActiveSiteSuggestion(0);
  };

  const handleSiteSuggestionClick = (s: SiteAsignacion) => {
    setSiteInput((s.NroInterno ? s.NroInterno + ' - ' : '') + s.Concatenado);
    setSelectedSite(String(s.NroInterno ?? s.Concatenado));
    setShowSiteSuggestions(false);
  };

  const handleSiteInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSiteSuggestions || filteredSites.length === 0) return;
    if (e.key === 'ArrowDown') {
      setActiveSiteSuggestion(prev => Math.min(prev + 1, filteredSites.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveSiteSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      const s = filteredSites[activeSiteSuggestion];
      if (s) handleSiteSuggestionClick(s);
    }
  };

  const siteInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Buscar datos completos de cuadrilla y site seleccionados
    const cuadrilla = cuadrillas.find(c => String(c.IdEmpleado ?? c.idempleado) === selectedCuadrilla);
    const site = sites.find(s => (s.NroInterno ? String(s.NroInterno) : s.Concatenado) === selectedSite);
    if (!cuadrilla || !site) return;
    setGridData(prev => [
      ...prev,
      {
        id_cuadrilla: String(cuadrilla.IdEmpleado ?? cuadrilla.idempleado ?? ''),
        Empleado: cuadrilla.NombreEmpleado ?? cuadrilla.nombreempleado ?? '',
        NroInterno: String(site.NroInterno ?? ''),
        Concatenado: site.Concatenado ?? '',
        idsite: String(site.IDSite ?? site.idsite ?? site.IdSite ?? ''),
        correlativo: String(site.Correlativo ?? site.correlativo ?? site.Correlativo ?? '')
      }
    ]);
    // Limpiar solo el campo Site y poner focus
    setSiteInput('');
    setSelectedSite('');
    setShowSiteSuggestions(true);
    setTimeout(() => {
      siteInputRef.current?.focus();
    }, 100);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 500,
          margin: '40px auto',
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          padding: 32,
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>
          Asignar Cuadrilla a Site
        </h2>
        <div style={{ marginBottom: 24, position: 'relative' }}>
          <label style={{ fontWeight: 600 }}>Cuadrilla</label>
          <input
            type="text"
            value={cuadrillaInput}
            onChange={handleCuadrillaInput}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar cuadrilla por nombre..."
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              marginTop: 6,
              fontSize: 16,
            }}
            autoComplete="off"
          />
          {showSuggestions && cuadrillaInput && filteredCuadrillas.length > 0 && (
            <ul
              style={{
                position: 'absolute',
                zIndex: 10,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                width: '100%',
                maxHeight: 180,
                overflowY: 'auto',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {filteredCuadrillas.map((c, idx) => (
                <li
                  key={c.IdEmpleado ?? c.idempleado}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    background: idx === activeSuggestion ? '#e0e7ff' : 'transparent',
                  }}
                  onMouseEnter={() => setActiveSuggestion(idx)}
                  onClick={() => handleSuggestionClick(c)}
                >
                  {c.NombreEmpleado ?? c.nombreempleado}
                </li>
              ))}
            </ul>
          )}
          {errorCuadrillas && (
            <div style={{ color: '#dc2626', marginTop: 8 }}>{errorCuadrillas}</div>
          )}
        </div>
        <div style={{ marginBottom: 24, position: 'relative' }}>
          <label style={{ fontWeight: 600 }}>Site</label>
          <input
            type="text"
            value={siteInput}
            onChange={handleSiteInput}
            onKeyDown={handleSiteInputKeyDown}
            onFocus={() => setShowSiteSuggestions(true)}
            placeholder="Buscar site por NroInterno o Concatenado..."
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              marginTop: 6,
              fontSize: 16,
            }}
            autoComplete="off"
            ref={siteInputRef}
          />
          {showSiteSuggestions && siteInput && filteredSites.length > 0 && (
            <ul
              style={{
                position: 'absolute',
                zIndex: 10,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                width: '100%',
                maxHeight: 180,
                overflowY: 'auto',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {filteredSites.map((s, idx) => (
                <li
                  key={String(s.NroInterno) + '-' + s.Concatenado + '-' + idx}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    background: idx === activeSiteSuggestion ? '#e0e7ff' : 'transparent',
                  }}
                  onMouseEnter={() => setActiveSiteSuggestion(idx)}
                  onClick={() => handleSiteSuggestionClick(s)}
                >
                  {(s.NroInterno ? s.NroInterno + ' - ' : '') + s.Concatenado}
                </li>
              ))}
            </ul>
          )}
          {errorSites && (
            <div style={{ color: '#dc2626', marginTop: 8 }}>{errorSites}</div>
          )}
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 12,
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 17,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 8,
          }}
        >
          Asignar
        </button>
      </form>
      {/* GridControl de registros anexados */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32 }}>
        {gridData.length > 0 && (
          <div style={{ maxWidth: 800, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: 20, flex: 1 }}>
            <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Registros anexados</h3>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: 8 }}>
              <button type="button" onClick={handleExportCSV} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 5, padding: '7px 16px', fontWeight: 600, cursor: 'pointer' }}>
                Exportar CSV
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>id_cuadrilla</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Empleado</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>NroInterno</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Concatenado</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>idsite</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>correlativo</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 80 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, idx) => (
                    <tr key={row.id_cuadrilla + '-' + row.NroInterno + '-' + idx}>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.id_cuadrilla}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Empleado}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.NroInterno}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Concatenado}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.idsite}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.correlativo}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <button type="button" onClick={() => handleDeleteRow(idx)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 600, cursor: 'pointer' }}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button type="button" onClick={handleGrabar} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 5, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                Grabar
              </button>
            </div>
          </div>
        )}
        {/* Grid de asignaciones del día */}
        <div style={{ maxWidth: 800, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: 20, flex: 1 }}>
          <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Asignaciones del día</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>id_cuadrilla</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>idsite</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>correlativo</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>fecha</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>usuario</th>
                </tr>
              </thead>
              <tbody>
                {asignacionesDia.map((row, idx) => (
                  <tr key={row.ID_CUADRILLA + '-' + row.IDSITE + '-' + row.CORRESITE + '-' + idx}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.ID_CUADRILLA}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.IDSITE}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.CORRESITE}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.fecha?.substring(0, 10)}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.UsuarioCreacion ?? row.usuario ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Grabar registros del grid en la tabla CUADRILLAASIGNACION
    async function handleGrabar() {
      if (gridData.length === 0) return;
      try {
        const res = await fetch('/api/cuadrilla-asignacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asignaciones: gridData })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Registros grabados correctamente.');
          setGridData([]);
        } else {
          alert('Error al grabar: ' + (data?.error || 'Error desconocido.'));
        }
      } catch (err) {
        alert('Error de red al grabar.');
      }
    }
};

export default Cuadrilla_Asignar;
