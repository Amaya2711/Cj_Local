// import React, { useState, useEffect } from 'react';
// (Removed duplicate import. Keep only one import for React and hooks below.)



// (Removed duplicate Cuadrilla_Asignar component implementation. The correct implementation is below.)

// import React, { useState } from 'react';
// (Removed duplicate import. Keep only one import for React and hooks below.)
import React, { useState, useEffect } from 'react';

// Removed duplicate Cuadrilla and Asignacion type declarations.

// (Removed duplicate Cuadrilla_Asignar component implementation. The correct implementation is below.)
// (Removed duplicate imports and duplicate type/component definitions.)
// The main, correct implementation starts below.


type Cuadrilla = {
	IdEmpleado?: number;
  idempleado?: number;
  NombreEmpleado?: string;
  nombreempleado?: string;
}

type Asignacion = {
  id_cuadrilla?: string;
  empleado?: string;
  asignacion?: string;
  fecha?: string;
}

// Removed duplicate declaration of activeTab, TabNames, cuadrillaInput, siteInput, asignacionesDia, loading

// (Removed duplicate broken export default function and its logic.)
// The correct Cuadrilla_Asignar React.FC is defined below and already includes TabNames and all required state.

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
  TipoTrabajo?: string;
}

const Cuadrilla_Asignar: React.FC = () => {
  const [mainTab, setMainTab] = useState<number>(0);
  const mainTabNames = ['Cuadrilla', 'Otro Tab'];

    const [activeTab, setActiveTab] = useState(0);
    const TabNames = ['Nueva asignación', 'Buscar asignación'];

    // Estado para asignaciones del día
    // (Eliminado: const [asignacionesDia, setAsignacionesDia] = useState<any[]>([]);)
      // Removed duplicate declaration: const [cuadrillas, setCuadrillas] = useState<EmpleadoCuadrilla[]>([]);
      // (Removed duplicate state declarations for sites, selectedCuadrilla, cuadrillaInput, showSuggestions, activeSuggestion, selectedSite, siteInput, showSiteSuggestions, activeSiteSuggestion, loading, errorSites, errorCuadrillas, and gridData)

    // Buscar asignaciones de cuadrilla usando el SP
    const handleBuscarAsignaciones = async () => {
      const idCuadrilla = selectedCuadrilla;
      const nombreStore = 'sp_ObtenerCuadrillaAsignacion';
      if (!idCuadrilla) {
        alert('Seleccione una cuadrilla válida.');
        return;
      }
      // Obtener fecha local en formato YYYY-MM-DD
      const now = new Date();
      const pFecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setLoading(true);
      try {
        const res = await fetch(`/api/cuadrilla-asignacion?id_cuadrilla=${idCuadrilla}&pFecha=${pFecha}`);
        const data = await res.json();
        if (!res.ok) {
          alert(`Error API: ${data.errorMessage || JSON.stringify(data.error)}`);
          setAsignacionesDia([]);
          return;
        }
        if (!data || data.length === 0) {
          alert(`No existe coincidencia\nStore ejecutado: ${nombreStore}\nParámetros enviados:\nidCuadrilla: ${idCuadrilla}\npFecha: ${pFecha}`);
          setAsignacionesDia([]);
          // Mantener en el primer tab
          setActiveTab(0);
        } else {
          setAsignacionesDia(data);
          // Si hay data en gridData, cambiar al tab de "Buscar asignación"
          if (gridData.length > 0) {
            setActiveTab(1);
          }
        }
      } catch (err) {
        alert(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
        setAsignacionesDia([]);
        setActiveTab(0);
      } finally {
        setLoading(false);
      }
    };

    // Handler para el botón Asignar: agrega el registro al gridData
    const handleAsignar = async () => {
      // Buscar datos completos de cuadrilla y site seleccionados
      const cuadrilla = cuadrillas.find(c => String(c.IdEmpleado ?? c.idempleado) === selectedCuadrilla);
      //const site = sites.find(s => (s.NroInterno ? String(s.NroInterno) : s.Concatenado) === selectedSite);
      const site = selectedSiteObj;
      setSelectedSiteObj(null);
      if (!cuadrilla || !site) {
        alert('Seleccione una cuadrilla y un site válidos.');
        return;
      }
      const id_cuadrilla = String(cuadrilla.IdEmpleado ?? cuadrilla.idempleado ?? '');
      const NroInterno = String(site.NroInterno ?? '');
      // Obtener fecha local en formato YYYY-MM-DD
      const now = new Date();
      const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Validar en el grid local
      const existeEnGrid = gridData.some(row => row.id_cuadrilla === id_cuadrilla && row.NroInterno === NroInterno && row.fecha === fecha);
      if (existeEnGrid) {
        alert('Ya existe relacion CUADRILLA - FECHA');
        return;
      }

      // Validar en la base de datos (asignaciones del día) por id_cuadrilla, NroInterno y fecha
      const existeEnAsignaciones = asignacionesDia.some(row => {
        // Usar los nombres de columna según el SQL y los datos
        const rowIdCuadrilla = String(row.id_cuadrilla ?? row.ID_CUADRILLA ?? row.idempleado ?? row.IdEmpleado ?? '');
        // NroInterno puede estar como string o número, normalizar ambos a string y quitar espacios
        let rowNroInterno = row.NroInterno ?? row.nrointerno ?? row.NroInterno ?? row.nroInterno ?? '';
        let nroInternoLocal = NroInterno;
        rowNroInterno = String(rowNroInterno).trim();
        nroInternoLocal = String(nroInternoLocal).trim();
        // Fecha puede venir como '2025-11-29' o '29/11/2025', normalizar a YYYY-MM-DD
        let rowFecha = String(row.fecha ?? row.fechacreacion ?? row.FechaCreacion ?? '');
        let fechaLocal = fecha;
        // Si la fecha viene como DD/MM/YYYY, convertir a YYYY-MM-DD
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(rowFecha)) {
          const [d, m, y] = rowFecha.split('/');
          rowFecha = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaLocal)) {
          const [d, m, y] = fechaLocal.split('/');
          fechaLocal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        // Depuración
        // console.log('Comparando:', {rowIdCuadrilla, id_cuadrilla, rowNroInterno, nroInternoLocal, rowFecha, fechaLocal});
        return rowIdCuadrilla === id_cuadrilla && rowNroInterno === nroInternoLocal && rowFecha === fechaLocal;
      });
      if (existeEnAsignaciones) {
        alert('Ya existe relacion CUADRILLA - FECHA');
        return;
      }

      // Crear el registro en el grid
      const nuevoRegistro = {
        id_cuadrilla,
        Empleado: cuadrilla.NombreEmpleado ?? cuadrilla.nombreempleado ?? '',
        NroInterno,
        Concatenado: site.Concatenado ?? '',
        idsite: String(site.IDSite ?? site.idsite ?? site.IdSite ?? ''),
        correlativo: String(site.Correlativo ?? site.correlativo ?? site.Correlativo ?? ''),
        fecha,
        TipoTrabajo: site.TipoTrabajo ?? ''
      };
      setGridData(prev => [...prev, nuevoRegistro]);

      // Limpiar solo el campo Site y poner focus
      setSiteInput('');
      setSelectedSite('');
      setShowSiteSuggestions(true);
      setTimeout(() => {
        siteInputRef.current?.focus();
      }, 100);
    };

    // ...rest of the component logic and return statement...
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
  // Nuevo estado para guardar el objeto completo del site seleccionado
  const [selectedSiteObj, setSelectedSiteObj] = useState<SiteAsignacion | null>(null);
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
    fecha?: string;
    TipoTrabajo?: string;
  }>>([]);

  // Add the rest of your component logic and return statement here

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
    // No return here; useEffect should not return JSX
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

  // Normaliza cadenas para búsquedas insensibles a mayúsculas/minúsculas y tildes
  function normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
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
    setAsignacionesDia([]); // Limpiar asignaciones al cambiar input manualmente
  };

  const handleSuggestionClick = (c: EmpleadoCuadrilla) => {
    setCuadrillaInput(c.NombreEmpleado ?? c.nombreempleado ?? '');
    setSelectedCuadrilla(String(c.IdEmpleado ?? c.idempleado));
    setShowSuggestions(false);
    // La búsqueda se ejecutará automáticamente por useEffect
  };
  // Ejecutar búsqueda automáticamente cuando cambia la cuadrilla seleccionada manualmente
  useEffect(() => {
    if (selectedCuadrilla) {
      handleBuscarAsignaciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCuadrilla]);

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
    setSelectedSite(String(s.NroInterno));
    setShowSiteSuggestions(false);
    setSelectedSiteObj(s);
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
    //const site = sites.find(s => (s.NroInterno ? String(s.NroInterno) : s.Concatenado) === selectedSite);
    const site = selectedSiteObj;
    setSelectedSiteObj(null);
    if (!cuadrilla || !site) return;
    // Obtener fecha local en formato YYYY-MM-DD
    const now = new Date();
    const fechaLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setGridData(prev => [
      ...prev,
      {
        id_cuadrilla: String(cuadrilla.IdEmpleado ?? cuadrilla.idempleado ?? ''),
        Empleado: cuadrilla.NombreEmpleado ?? cuadrilla.nombreempleado ?? '',
        NroInterno: String(site.NroInterno ?? ''),
        Concatenado: site.Concatenado ?? '',
        idsite: String(site.IDSite ?? site.idsite ?? site.IdSite ?? ''),
        correlativo: String(site.Correlativo ?? site.correlativo ?? site.Correlativo ?? ''),
        fecha: fechaLocal
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

  // Grabar registros del grid en la base de datos
  const handleGrabar = async () => {
    if (gridData.length === 0) {
      alert('No hay registros para grabar.');
      return;
    }
    setLoading(true);
    try {
      // Asegurarse de enviar NroInterno y @ptipotrabajo como parte de cada asignación
      const asignacionesConNroInterno = gridData.map(row => ({
        ...row,
        NroInterno: row.NroInterno ?? '',
        ptipotrabajo: row.TipoTrabajo ?? '' // Enviar como @ptipotrabajo
      }));

      // 1. Ejecutar el store sp_CrearAsignacion
      const crearResponse = await fetch('/api/cuadrilla-asignacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asignaciones: asignacionesConNroInterno, usuario: 'ADMIN', crearAsignacion: true }),
      });
      const crearData = await crearResponse.json();
      if (!crearResponse.ok) {
        alert('Error al crear asignación: ' + (crearData.error || 'Error desconocido'));
        setLoading(false);
        return;
      }

      // 2. Ejecutar el store sp_CrearSeguimiento
      const seguimientoResponse = await fetch('/api/cuadrilla-asignacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asignaciones: asignacionesConNroInterno, usuario: 'ADMIN', crearSeguimiento: true }),
      });
      const seguimientoData = await seguimientoResponse.json();
      if (!seguimientoResponse.ok) {
        alert('Error al crear seguimiento: ' + (seguimientoData.error || 'Error desconocido'));
        setLoading(false);
        return;
      }

      alert('Grabado exitoso.');
      setGridData([]);
      fetchAsignacionesDia();
    } catch (err) {
      alert('Error al grabar: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Exportar registros anexados a CSV
  const handleExportCSV = () => {
    if (gridData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const headers = ['id_cuadrilla', 'Empleado', 'NroInterno', 'Concatenado', 'idsite', 'correlativo'];
    const csvRows = [
      headers.join(','),
      ...gridData.map(row =>
        headers.map(h => `"${(row as any)[h] ?? ''}"`).join(',')
      )
    ];
    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registros_anexados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Eliminar una fila del gridData por índice
  const handleDeleteRow = (idx: number) => {
    setGridData(prev => prev.filter((_, i) => i !== idx));
  };
          // ...código existente...

  // Obtener asignaciones del día
  const fetchAsignacionesDia = async () => {
    try {
      const res = await fetch('/api/cuadrilla-asignacion-dia');
      if (!res.ok) throw new Error('No se pudo cargar asignaciones del día');
      const data = await res.json();
      setAsignacionesDia(data);
    } catch {
      setAsignacionesDia([]);
    }
  };

  useEffect(() => {
    fetchAsignacionesDia();
  }, []);


  // Exportar asignaciones del día a CSV
  const handleExportAsignacionesDiaCSV = () => {
    if (asignacionesDia.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    // Obtener todas las claves únicas de los objetos como columnas
    const allKeys = Array.from(
      asignacionesDia.reduce((keys, row) => {
        Object.keys(row).forEach(k => keys.add(k));
        return keys;
      }, new Set())
    );
    const headers = allKeys;
    const separator = ';';
    const csvRows = [
      headers.join(separator),
      ...asignacionesDia.map(row =>
        headers.map(h => {
          const val = row[h as string] !== undefined ? row[h as string] : '';
          // Solo poner comillas si el valor contiene punto y coma, comilla o salto de línea
          if (typeof val === 'string' && /[";\n]/.test(val)) {
            return '"' + val.replace(/"/g, '""') + '"';
          }
          return val;
        }).join(separator)
      )
    ];
    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'asignaciones_dia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Asegurarse de que no hay un cierre de bloque extra antes del return
  return (
    <div>
      {/* Tabs secundarios */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, marginTop: 24 }}>
        {TabNames.map((tabName, idx) => (
          <button
            key={tabName}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '8px 24px',
              marginRight: 8,
              borderRadius: 8,
              border: 'none',
              background: activeTab === idx ? '#059669' : '#e5e7eb',
              color: activeTab === idx ? 'white' : '#222',
              fontWeight: activeTab === idx ? 700 : 500,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: activeTab === idx ? '0 2px 8px rgba(5,150,105,0.12)' : 'none',
            }}
          >
            {tabName}
          </button>
        ))}
      </div>
      {/* Contenido de la pestaña secundaria seleccionada */}
      {activeTab === 0 && (
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
          {/* ...existing code for cuadrilla and site inputs, buttons... */}
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
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
              autoComplete="off"
              ref={siteInputRef}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: 10 }}>
              <button
                type="button"
                style={{ flex: 1, height: 40, fontSize: 16 }}
                onClick={handleBuscarAsignaciones}
              >
                Buscar
              </button>
              <button
                type="button"
                style={{ flex: 1, height: 40, fontSize: 16, backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                onClick={handleAsignar}
              >
                Asignar
              </button>
            </div>
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
          {/* Botón Asignar eliminado, solo queda el de la línea con Buscar */}
        </form>
      )}
      {activeTab === 1 && (
        <div style={{ maxWidth: 600, margin: '40px auto', background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 32 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Buscar asignación</h2>
          {/* Aquí puedes agregar filtros o información de búsqueda adicional si lo necesitas */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32 }}>
            {/* Grid de asignaciones del día */}
            <div style={{ maxWidth: 800, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: 20, flex: 1 }}>
              <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Asignaciones del día</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: 8 }}>
                <button type="button" onClick={() => handleExportAsignacionesDiaCSV()} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 5, padding: '7px 16px', fontWeight: 600, cursor: 'pointer' }}>
                  Exportar CSV
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>id_cuadrilla</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 160 }}>Empleado</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Asignacion</th>
                      <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 110 }}>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignacionesDia.map((row, idx) => (
                      <tr key={
                        (row.ID_CUADRILLA ?? row.id_cuadrilla ?? row.idempleado ?? row.IdEmpleado ?? idx) +
                        '-' + (row.IDSITE ?? row.idsite ?? row.IdSite ?? idx)
                      }>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.ID_CUADRILLA ?? row.id_cuadrilla ?? row.idempleado ?? row.IdEmpleado ?? ''}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Empleado ?? row.NombreEmpleado ?? row.nombreempleado ?? ''}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Concatenado ?? row.concatenado ?? ''}</td>
                        <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.fecha ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Grid de registros anexados solo en la pestaña de nueva asignación */}
      {activeTab === 0 && gridData.length > 0 && (
        <div style={{ maxWidth: 800, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: 20, flex: 1, margin: '40px auto' }}>
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
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 160 }}>Empleado</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Asignacion</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 110 }}>Fecha</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 80 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {gridData.map((row, idx) => (
                  <tr key={row.id_cuadrilla + '-' + row.NroInterno + '-' + idx}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.id_cuadrilla}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Empleado}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Concatenado}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.fecha ?? ''}</td>
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
    </div>
  );
};

export default Cuadrilla_Asignar;
