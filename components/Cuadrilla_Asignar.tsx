import React, { useEffect, useState } from 'react';

interface EmpleadoCuadrilla {
  IdEmpleado?: number;
  NombreEmpleado?: string;
  idempleado?: number;
  nombreempleado?: string;
}

interface SiteAsignacion {
  NroInterno?: string | number;
  Concatenado: string;
}

const Cuadrilla_Asignar: React.FC = () => {
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

  useEffect(() => {
    async function fetchCuadrillas() {
      try {
        const res = await fetch('/api/cuadrilla-empleado');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCuadrillas(data);
        } else {
          setCuadrillas([]);
          setErrorCuadrillas('No se pudo cargar la lista de cuadrillas.');
        }
      } catch (err) {
        setCuadrillas([]);
        setErrorCuadrillas('Error al cargar cuadrillas.');
      }
    }
    async function fetchSites() {
      try {
        const res = await fetch('/api/asignacion-sites');
        const data = await res.json();
        if (Array.isArray(data)) {
          setSites(data);
        } else {
          setSites([]);
          setErrorSites('No se pudo cargar la lista de sites.');
        }
      } catch (err) {
        setSites([]);
        setErrorSites('Error al cargar sites.');
      }
    }
    fetchCuadrillas();
    fetchSites();
  }, []);

  // Filtrado por palabra en el nombre de cuadrilla
  const filteredCuadrillas = cuadrillas.filter(c => {
    const nombre = (c.NombreEmpleado ?? c.nombreempleado ?? '').toLowerCase();
    return cuadrillaInput
      .toLowerCase()
      .split(' ')
      .every(word => nombre.includes(word));
  });

  // Filtrado por palabra en el site (NroInterno y Concatenado)
  const filteredSites = sites.filter(s => {
    const texto = ((s.NroInterno ? s.NroInterno + ' - ' : '') + s.Concatenado).toLowerCase();
    return siteInput
      .toLowerCase()
      .split(' ')
      .every(word => texto.includes(word));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes manejar la asignación
    alert(`Asignar cuadrilla ${selectedCuadrilla} al site ${selectedSite}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '40px auto', background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 32 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Asignar Cuadrilla a Site</h2>
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <label style={{ fontWeight: 600 }}>Cuadrilla</label>
        <input
          type="text"
          value={cuadrillaInput}
          onChange={handleCuadrillaInput}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Buscar cuadrilla por nombre..."
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
          autoComplete="off"
        />
        {showSuggestions && cuadrillaInput && filteredCuadrillas.length > 0 && (
          <ul style={{
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
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
        {errorCuadrillas && <div style={{ color: '#dc2626', marginTop: 8 }}>{errorCuadrillas}</div>}
      </div>
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <label style={{ fontWeight: 600 }}>Site</label>
        <input
          type="text"
          value={siteInput}
          onChange={handleSiteInput}
          onKeyDown={handleSiteInputKeyDown}
          onFocus={() => setShowSiteSuggestions(true)}
          placeholder="Buscar site por nombre o NroInterno..."
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
          autoComplete="off"
        />
        {showSiteSuggestions && siteInput && filteredSites.length > 0 && (
          <ul style={{
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {filteredSites.map((s, idx) => (
              <li
                key={s.NroInterno ?? s.Concatenado}
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
        {errorSites && <div style={{ color: '#dc2626', marginTop: 8 }}>{errorSites}</div>}
      </div>
      <button type="submit" style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
        Asignar
      </button>
    </form>
  );
};

export default Cuadrilla_Asignar;
