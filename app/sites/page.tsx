'use client';
import { useState, useEffect } from 'react';

export default function SitesPage() {
      // Función de normalización para ignorar acentos y mayúsculas
    function normalize(str: string | undefined) {
      return (str || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    }
    const [cuadrillaActiveIdx, setCuadrillaActiveIdx] = useState(-1);
    const [sites, setSites] = useState<Array<Record<string, any>>>([]);
    const [cuadrillas, setCuadrillas] = useState<Array<Record<string, any>>>([]);
    const [loadingCuadrilla, setLoadingCuadrilla] = useState(false);
    const [loadingSite, setLoadingSite] = useState(false);
    function siteDisplay(s: Record<string, any>) {
      return `${s.nombrecliente || ''} ${s.nombreproyecto || ''} ${s.idsite || ''} ${s.correlativo || ''} ${s.NombreSite || ''} ${s.TipoTrabajo || ''}`.replace(/ +/g, ' ').trim();
    }
    const [errorCuadrilla, setErrorCuadrilla] = useState('');
    const [errorSite, setErrorSite] = useState('');
    const [cuadrillaInput, setCuadrillaInput] = useState('');
    const [siteInput, setSiteInput] = useState('');
    const [cuadrillaActive, setCuadrillaActive] = useState(0);
    const [siteActive, setSiteActive] = useState(0);
    const [showCuadrillaOptions, setShowCuadrillaOptions] = useState(false);
    const [showSiteOptions, setShowSiteOptions] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    // Estados para el autocompletado de cuadrilla
    const [cuadrillaSearch, setCuadrillaSearch] = useState('');
    const [selectedCuadrilla, setSelectedCuadrilla] = useState(null);

  useEffect(() => {
    async function fetchCuadrillas() {
      setLoadingCuadrilla(true);
      setErrorCuadrilla('');
      try {
        const res = await fetch('/api/sqlserver-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'EXEC EmpleadoCuadrilla' })
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setCuadrillas(data);
        } else {
          setErrorCuadrilla('No se pudo obtener la información de Cuadrillas.');
        }
      } catch (err) {
        setErrorCuadrilla('Error al consultar SQL Server.');
      }
      setLoadingCuadrilla(false);
    }
    async function fetchSites() {
      setLoadingSite(true);
      setErrorSite('');
      try {
        const res = await fetch('/api/sqlserver-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'EXEC Asignacion_Sites' })
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSites(data);
        } else {
          setErrorSite('No se pudo obtener la información de Sites.');
        }
      } catch (err) {
        setErrorSite('Error al consultar SQL Server.');
      }
      setLoadingSite(false);
    }
    fetchCuadrillas();
    fetchSites();
  }, []);

  return (
    <>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Sites V1 (Asignación SQL Server)</h2>
      <div style={{ maxWidth: 500, margin: '0 auto', marginBottom: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500 }}>Cuadrilla</label>
          {loadingCuadrilla && <div style={{ color: '#2563eb', marginBottom: 8 }}>Cargando cuadrillas...</div>}
          {errorCuadrilla && <div style={{ color: '#dc2626', marginBottom: 8 }}>{errorCuadrilla}</div>}
          <input
            type="text"
            value={cuadrillaInput}
            onChange={e => { setCuadrillaInput(e.target.value); setShowCuadrillaOptions(true); setCuadrillaActive(0); }}
            onFocus={() => setShowCuadrillaOptions(true)}
            onBlur={() => setTimeout(() => setShowCuadrillaOptions(false), 100)}
            onKeyDown={e => {
              if (!showCuadrillaOptions) return;
              const filtered = cuadrillas.filter((c) => {
                const nombre = c.NombreCuadrilla || '';
                return nombre.toLowerCase().includes(cuadrillaInput.toLowerCase());
              });
              if (e.key === 'ArrowDown') {
                setCuadrillaActive((prev) => Math.min(prev + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                setCuadrillaActive((prev) => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter' && filtered[cuadrillaActive]) {
                setCuadrillaInput(filtered[cuadrillaActive].NombreCuadrilla);
                setShowCuadrillaOptions(false);
              }
            }}
            placeholder="Buscar cuadrilla..."
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #e5e7eb', marginTop: 4 }}
            disabled={loadingCuadrilla || !!errorCuadrilla}
          />
          {showCuadrillaOptions && cuadrillas.filter((c) => {
            const nombre = c.NombreCuadrilla || '';
            const searchWords = cuadrillaInput.toLowerCase().split(/\s+/).filter(Boolean);
            return searchWords.every(word => nombre.toLowerCase().includes(word));
          }).length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #e5e7eb', borderRadius: 4, maxHeight: 180, overflowY: 'auto', background: 'white', position: 'absolute', zIndex: 10, width: '100%' }}>
              {cuadrillas.filter((c) => {
                const nombre = c.NombreCuadrilla || '';
                const searchWords = cuadrillaInput.toLowerCase().split(/\s+/).filter(Boolean);
                return searchWords.every(word => nombre.toLowerCase().includes(word));
              }).map((c, idx) => (
                <li
                  key={c.IdEmpleado}
                  style={{ padding: 8, background: idx === cuadrillaActive ? '#e0e7ff' : 'white', cursor: 'pointer' }}
                  onMouseDown={() => { setCuadrillaInput(c.NombreCuadrilla); setShowCuadrillaOptions(false); }}
                >
                  {c.NombreCuadrilla}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500 }}>Site</label>
          <input
            type="text"
            value={siteInput}
            onChange={e => { setSiteInput(e.target.value); setShowSiteOptions(true); setSiteActive(0); }}
            onFocus={() => setShowSiteOptions(true)}
            onBlur={() => setTimeout(() => setShowSiteOptions(false), 100)}
            onKeyDown={e => {
              if (!showSiteOptions) return;
              const filtered = sites.filter((s) => {
                const display = normalize(siteDisplay(s));
                const searchWords = normalize(siteInput).split(/\s+/).filter(Boolean);
                if (searchWords.length === 0) return false;
                return searchWords.some(word => word && display.includes(word));
              });
              if (e.key === 'ArrowDown') {
                setSiteActive((prev) => Math.min(prev + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                setSiteActive((prev) => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter' && filtered[siteActive]) {
                setSiteInput(siteDisplay(filtered[siteActive]));
                setShowSiteOptions(false);
              }
            }}
          />
          {showSiteOptions && sites.filter((s) => {
            const display = normalize(siteDisplay(s));
            const searchWords = normalize(siteInput).split(/\s+/).filter(Boolean);
            if (searchWords.length === 0) return false;
            return searchWords.some(word => word && display.includes(word));
          }).length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #e5e7eb', borderRadius: 4, maxHeight: 180, overflowY: 'auto', background: 'white', position: 'absolute', zIndex: 10, width: '100%' }}>
              {sites.filter((s) => {
                const display = normalize(siteDisplay(s));
                const searchWords = normalize(siteInput).split(/\s+/).filter(Boolean);
                if (searchWords.length === 0) return false;
                return searchWords.some(word => word && display.includes(word));
              }).map((s, idx) => (
                <li
                  key={s.idsite && s.correlativo ? `${s.idsite}_${s.correlativo}` : `site_${idx}`}
                  style={{ padding: 8, background: idx === siteActive ? '#e0e7ff' : 'white', cursor: 'pointer' }}
                  onMouseDown={() => { setSiteInput(siteDisplay(s)); setShowSiteOptions(false); }}
                >
                  {siteDisplay(s)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
