'use client';
import { useState, useEffect } from 'react';

export default function SitesPage() {
            // Estados para mostrar mensajes de validación
            const [cuadrillaWarning, setCuadrillaWarning] = useState('');
            const [siteWarning, setSiteWarning] = useState('');
          // Estado para las relaciones cuadrilla-site-fecha
          const [relaciones, setRelaciones] = useState<Array<{ cuadrilla: string; cuadrillaId: string; fecha: string; site: string; idsite: string; corresite: string }>>([]);
        // Estado para la fecha seleccionada
        const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
      // Función de normalización para ignorar acentos y mayúsculas
    function normalize(str: string) {
      if (typeof str !== 'string') return '';
      return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
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
    async function fetchData() {
      await fetchCuadrillas();
      await fetchSites();
    }
    fetchData();
  }, []);

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 16 }}>
        <button
          style={{ padding: '10px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}
          onClick={async () => {
            if (relaciones.length === 0) {
              alert('No hay datos en el grid para grabar.');
              return;
            }
            let success = 0;
            let fail = 0;
            for (const rel of relaciones) {
              // Usar los valores directamente del grid
              const payload = {
                id_cuadrilla: rel.cuadrillaId,
                idsite: rel.idsite,
                corresite: rel.corresite,
                fecha: rel.fecha,
                Estado: 1,
                UsuarioCreacion: 'ADMIN',
                FechaCreacion: new Date().toISOString()
              };
              try {
                const res = await fetch('/api/sqlserver-cuadrillaasignacion', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) success++;
                else fail++;
              } catch {
                fail++;
              }
            }
            alert(`Grabados: ${success}, Fallidos: ${fail}`);
            if (success > 0) setRelaciones([]);
          }}
        >Grabar</button>
      </div>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Sites V1 (Asignación SQL Server)</h2>
      <div style={{ maxWidth: 500, margin: '0 auto', marginBottom: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500 }}>Cuadrilla</label>
          {loadingCuadrilla && <div style={{ color: '#2563eb', marginBottom: 8 }}>Cargando cuadrillas...</div>}
          {errorCuadrilla && <div style={{ color: '#dc2626', marginBottom: 8 }}>{errorCuadrilla}</div>}
          <input
            type="text"
            value={cuadrillaInput}
            onChange={e => {
              const value = e.target.value;
              setCuadrillaInput(value);
              setShowCuadrillaOptions(true);
              setCuadrillaActive(0);
              if (value.trim() !== '') setCuadrillaWarning('');
            }}
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
          {cuadrillaWarning && <div style={{ color: '#dc2626', marginTop: 4 }}>{cuadrillaWarning}</div>}
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

        {/* Control de fecha */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500 }}>FECHA</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #e5e7eb', marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500 }}>Site</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={siteInput}
              onChange={e => { setSiteInput(e.target.value); setShowSiteOptions(true); setSiteActive(0); setSiteWarning(''); }}
              onFocus={() => setShowSiteOptions(true)}
              onBlur={() => setTimeout(() => setShowSiteOptions(false), 100)}
              onKeyDown={e => {
                if (!showSiteOptions) return;
                const filtered = sites.filter((s) => {
                  // Buscar coincidencias en todos los campos relevantes
                  const fields = [s.nombrecliente, s.nombreproyecto, s.idsite, s.correlativo, s.NombreSite, s.TipoTrabajo].map(normalize);
                  const display = fields.join(' ');
                  const searchWords = normalize(siteInput).split(/\s+/).filter(Boolean);
                  if (searchWords.length === 0) return false;
                  return searchWords.every(word => word && display.includes(word));
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
              style={{ width: '100%', minWidth: 350, padding: 8, borderRadius: 4, border: '1px solid #e5e7eb', marginTop: 4 }}
            />
            {siteWarning && <div style={{ color: '#dc2626', marginTop: 4 }}>{siteWarning}</div>}
            {showSiteOptions && sites.filter((s) => {
              const fields = [s.nombrecliente, s.nombreproyecto, s.idsite, s.correlativo, s.NombreSite, s.TipoTrabajo].map(normalize);
              const display = fields.join(' ');
              const searchWords = normalize(siteInput).split(/\s+/).filter(Boolean);
              if (searchWords.length === 0) return false;
              return searchWords.every(word => word && display.includes(word));
            }).length > 0 && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #e5e7eb', borderRadius: 4, maxHeight: 180, overflowY: 'auto', background: 'white', position: 'absolute', zIndex: 20, width: '100%' }}>
                {sites.filter((s) => {
                  const fields = [s.nombrecliente, s.nombreproyecto, s.idsite, s.correlativo, s.NombreSite, s.TipoTrabajo].map(normalize);
                  const display = fields.join(' ');
                  const searchWords = normalize(siteInput).split(/\s+/).filter(Boolean);
                  if (searchWords.length === 0) return false;
                  return searchWords.every(word => word && display.includes(word));
                }).map((s, idx) => (
                  <li
                    key={normalize(`${s.nombrecliente || ''}_${s.nombreproyecto || ''}_${s.idsite || ''}_${s.correlativo || ''}_${s.NombreSite || ''}_${s.TipoTrabajo || ''}`) + '_' + idx}
                    style={{ padding: 8, background: idx === siteActive ? '#e0e7ff' : 'white', cursor: 'pointer' }}
                    onMouseDown={() => { setSiteInput(siteDisplay(s)); setShowSiteOptions(false); }}
                  >
                    {siteDisplay(s)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Botón para registrar la relación debajo del campo de Site */}
          <div style={{ margin: '24px 0', textAlign: 'center' }}>
            <button
              style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}
              onClick={() => {
                let valid = true;
                // Validar cuadrilla
                const cuadrillaObj = cuadrillas.find(c => (c.NombreCuadrilla || '').trim().toLowerCase() === cuadrillaInput.trim().toLowerCase());
                if (!cuadrillaInput) {
                  setCuadrillaWarning('Debe ingresar primero el nombre de cuadrilla.');
                  valid = false;
                } else if (!cuadrillaObj) {
                  setCuadrillaWarning('La cuadrilla ingresada no es válida.');
                  valid = false;
                } else {
                  setCuadrillaWarning('');
                }
                // Validar site
                const siteObj = sites.find(s => {
                  const display = `${s.nombrecliente || ''} ${s.nombreproyecto || ''} ${s.idsite || ''} ${s.correlativo || ''} ${s.NombreSite || ''} ${s.TipoTrabajo || ''}`.replace(/ +/g, ' ').trim().toLowerCase();
                  return display === siteInput.trim().toLowerCase();
                });
                if (!siteInput) {
                  setSiteWarning('Debe ingresar primero el nombre de site.');
                  valid = false;
                } else if (!siteObj) {
                  setSiteWarning('El site ingresado no es válido.');
                  valid = false;
                } else {
                  setSiteWarning('');
                }
                if (!selectedDate) valid = false;
                if (!valid || !cuadrillaObj || !siteObj) return;
                setRelaciones(prev => [
                  ...prev,
                  {
                    cuadrilla: cuadrillaInput,
                    cuadrillaId: cuadrillaObj.IdEmpleado,
                    fecha: selectedDate,
                    site: siteInput,
                    idsite: siteObj.idsite,
                    corresite: siteObj.correlativo
                  }
                ]);
                setSiteInput('');
              }}
            >Registrar relación</button>
          </div>
        </div>

        </div>

        {/* Grid para mostrar las relaciones cuadrilla-site-fecha */}

        {relaciones.length > 0 && (
          <div style={{ marginTop: 96, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 600 }}>Cuadrilla</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 600 }}>ID Cuadrilla</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 600 }}>Fecha</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 600 }}>Site</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 600 }}>ID Site</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 600 }}>Corresite</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 600 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {relaciones.map((rel, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{rel.cuadrilla}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{rel.cuadrillaId}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{rel.fecha}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{rel.site}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{rel.idsite}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{rel.corresite}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'center' }}>
                      <button
                        style={{ padding: '4px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}
                        onClick={() => {
                          setRelaciones(prev => prev.filter((_, i) => i !== idx));
                        }}
                      >Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
    </>
  );
}
