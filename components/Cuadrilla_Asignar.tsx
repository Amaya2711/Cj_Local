import React, { useState, useEffect } from 'react';

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

// Tipos para Ubicación
interface Ubicacion {
  IdUbicacion?: number;
  idubicacion?: number;
  NombreUbicacion?: string;
  nombreubicacion?: string;
  Latitud?: string;
  Longitud?: string;
  Direccion?: string;
  Referencia?: string;
}

const Cuadrilla_Asignar: React.FC = () => {
    // Estado para modo de selección (site o ubicación)
    const [modoSeleccion, setModoSeleccion] = useState<'site' | 'ubicacion'>('site');
    // Estado para Ubicación
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [ubicacionInput, setUbicacionInput] = useState('');
    const [showUbicacionSuggestions, setShowUbicacionSuggestions] = useState(false);
    const [activeUbicacionSuggestion, setActiveUbicacionSuggestion] = useState(0);
    const [selectedUbicacion, setSelectedUbicacion] = useState('');
    const [selectedUbicacionObj, setSelectedUbicacionObj] = useState<Ubicacion | null>(null);
    const [errorUbicaciones, setErrorUbicaciones] = useState('');

    // Modal para nueva ubicación
    const [showModalUbicacion, setShowModalUbicacion] = useState(false);
    const [modalUbicacion, setModalUbicacion] = useState({
      NombreUbicacion: '',
      Latitud: '',
      Longitud: '',
      Direccion: '',
      Referencia: '',
    });
    const [modalUbicacionError, setModalUbicacionError] = useState('');

    // Fetch ubicaciones (SP_Ubicacion)
    useEffect(() => {
      async function fetchUbicaciones() {
        try {
          const res = await fetch('/api/ubicacion');
          if (!res.ok) throw new Error('No se pudo cargar la lista de ubicaciones.');
          const data = await res.json();
          setUbicaciones(Array.isArray(data) ? data : []);
          setErrorUbicaciones('');
        } catch (err) {
          setUbicaciones([]);
          setErrorUbicaciones('Error al cargar ubicaciones.');
        }
      }
      fetchUbicaciones();
    }, []);

    // Filtrado de ubicaciones para autocompletado
    const filteredUbicaciones = Array.isArray(ubicaciones)
      ? ubicaciones.filter(u => {
          const nombre = (u.NombreUbicacion ?? u.nombreubicacion ?? '').toLowerCase();
          return ubicacionInput
            .toLowerCase()
            .split(' ')
            .every(word => nombre.includes(word));
        })
      : [];

    const handleUbicacionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUbicacionInput(e.target.value);
      setShowUbicacionSuggestions(true);
      setSelectedUbicacion('');
      setSelectedUbicacionObj(null);
      setActiveUbicacionSuggestion(0);
    };

    const handleUbicacionSuggestionClick = (u: Ubicacion) => {
      setUbicacionInput(u.NombreUbicacion ?? u.nombreubicacion ?? '');
      setSelectedUbicacion(String(u.IdUbicacion ?? u.idubicacion));
      setSelectedUbicacionObj(u);
      setShowUbicacionSuggestions(false);
    };

    const handleUbicacionInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showUbicacionSuggestions || filteredUbicaciones.length === 0) return;
      if (e.key === 'ArrowDown') {
        setActiveUbicacionSuggestion(prev => Math.min(prev + 1, filteredUbicaciones.length - 1));
      } else if (e.key === 'ArrowUp') {
        setActiveUbicacionSuggestion(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        const u = filteredUbicaciones[activeUbicacionSuggestion];
        if (u) handleUbicacionSuggestionClick(u);
      }
    };

    // Guardar nueva ubicación desde el modal
    const handleGuardarUbicacion = async () => {
      if (!modalUbicacion.NombreUbicacion.trim() || !modalUbicacion.Latitud.trim() || !modalUbicacion.Longitud.trim()) {
        setModalUbicacionError('Nombre, Latitud y Longitud son obligatorios.');
        return;
      }
      setModalUbicacionError('');
      try {
        const res = await fetch('/api/ubicacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modalUbicacion),
        });
        if (!res.ok) {
          const data = await res.json();
          setModalUbicacionError(data?.error || 'Error al registrar ubicación.');
          return;
        }
        setShowModalUbicacion(false);
        setModalUbicacion({ NombreUbicacion: '', Latitud: '', Longitud: '', Direccion: '', Referencia: '' });
        // Refrescar ubicaciones
        const data = await res.json();
        setUbicaciones(prev => [...prev, data]);
        setUbicacionInput(data.NombreUbicacion ?? data.nombreubicacion ?? '');
        setSelectedUbicacion(String(data.IdUbicacion ?? data.idubicacion));
        setSelectedUbicacionObj(data);
      } catch (err) {
        setModalUbicacionError('Error al registrar ubicación.');
      }
    };
  const [mainTab, setMainTab] = useState<number>(0);
  const mainTabNames = ['Asignacion', 'Otro Tab'];

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
        alert('Seleccione una asignacion válida.');
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
          // Cambiar al tab de "Buscar asignación" después de actualizar el estado
          setTimeout(() => setActiveTab(1), 0);
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
        alert('Seleccione una asignacion y un site válidos.');
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
        alert('Ya existe relacion ASIGNACION - FECHA');
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
        alert('Ya existe relacion ASIGNACION - FECHA');
        return;
      }

      // Crear el registro en el grid, sin exigir segmentoid
      const nuevoRegistro = {
        id_cuadrilla,
        Empleado: cuadrilla.NombreEmpleado ?? cuadrilla.nombreempleado ?? '',
        NroInterno,
        Concatenado: site.Concatenado ?? '',
        idsite: String(site.IDSite ?? site.idsite ?? site.IdSite ?? ''),
        correlativo: String(site.Correlativo ?? site.correlativo ?? site.Correlativo ?? ''),
        fecha,
        TipoTrabajo: site.TipoTrabajo ?? '',
        // Campos ocultos de la plantilla
        Nodo: selectedPlantillaObj?.Nodo ?? selectedPlantillaObj?.nodo ?? '',
        Plantilla: selectedPlantillaObj?.Plantilla ?? selectedPlantillaObj?.Nombre ?? selectedPlantillaObj?.name ?? '',
        nodoid: selectedPlantillaObj?.nodoid ?? selectedPlantillaObj?.NodoID ?? '',
        plantillaid: selectedPlantillaObj?.plantillaid ?? selectedPlantillaObj?.PlantillaID ?? '',
        // segmentoid y Segmento son opcionales
        segmentoid: selectedPlantillaObj?.segmentoid ?? selectedPlantillaObj?.SegmentoID ?? '',
        Segmento: selectedPlantillaObj?.Segmento ?? selectedPlantillaObj?.segmento ?? '',
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
    // (Leyendo 60 líneas adicionales para encontrar el gridcontrol y el combobox Plantilla)
  const [cuadrillaInput, setCuadrillaInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [selectedSite, setSelectedSite] = useState('');
  const [siteInput, setSiteInput] = useState('');
  // Nuevo estado para guardar el objeto completo del site seleccionado
  const [selectedSiteObj, setSelectedSiteObj] = useState<SiteAsignacion | null>(null);
  // (Leyendo 60 líneas más para encontrar el render del gridcontrol y la columna de Plantilla)
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
    Segmento?: string;
    segmentoid?: string;
    Nodo?: string;
    Plantilla?: string;
    nodoid?: string;
    plantillaid?: string;
    // ...existing code...
  }>>([]);
  // Declarar el ref para el input de site
  // Duplicate declaration removed. The ref is already declared above.

  // Estado para plantillas (asegurar que solo exista una vez)
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState('');
  const [selectedPlantillaObj, setSelectedPlantillaObj] = useState<any | null>(null);

  // Autocompletado para plantillas
  const [plantillaInput, setPlantillaInput] = useState('');
  const [showPlantillaSuggestions, setShowPlantillaSuggestions] = useState(false);
  const [activePlantillaSuggestion, setActivePlantillaSuggestion] = useState(0);

  // Filtrar plantillas usando los nombres correctos del backend
  const filteredPlantillas = Array.isArray(plantillas)
    ? plantillas.filter(p => {
        const nombre = (p.Plantilla ?? p.Nombre ?? p.name ?? '').toLowerCase();
        return plantillaInput
          .toLowerCase()
          .split(' ')
          .every(word => nombre.includes(word));
      })
    : [];

  // Al seleccionar una sugerencia, usar los nombres correctos
  // Al seleccionar una sugerencia, guardar el objeto completo si es necesario
  const handlePlantillaSuggestionClick = (p: any) => {
    setPlantillaInput(p.Plantilla ?? p.Nombre ?? p.name ?? '');
    setSelectedPlantilla(String(p.plantillaid ?? p.PlantillaID ?? p.id));
    setSelectedPlantillaObj(p);
    setShowPlantillaSuggestions(false);
  };

  // Fetch plantillas (asegura que se cargan todos los campos del store)
  useEffect(() => {
    async function fetchPlantillas() {
      try {
        // Llama al endpoint con el parámetro tipo=1 para filtrar por @Tipo=1
        const res = await fetch('/api/plantillas?tipo=1');
        if (!res.ok) throw new Error('No se pudo cargar la lista de plantillas.');
        const data = await res.json();
        // Si el backend retorna menos de 6 campos, puedes mapear aquí para asegurar los 6 campos
        // Ejemplo: PlantillaID, Plantilla, Nodo, Segmento, Campo5, Campo6
        setPlantillas(Array.isArray(data) ? data.map(p => ({
          PlantillaID: p.PlantillaID ?? p.plantillaid ?? p.id,
          Plantilla: p.Plantilla ?? p.Nombre ?? p.name,
          Nodo: p.Nodo ?? p.nodo,
          Segmento: p.Segmento ?? p.segmento,
          Campo5: p.Campo5 ?? p.campo5,
          Campo6: p.Campo6 ?? p.campo6,
          ...p
        })) : []);
      } catch (err) {
        setPlantillas([]);
      }
    }
    fetchPlantillas();
  }, []);

  // ...existing code...

  useEffect(() => {
    async function fetchCuadrillas() {
      try {
        const res = await fetch('/api/cuadrilla-asignacion-cuadrillas');
        if (!res.ok) throw new Error('No se pudo cargar la lista de cuadrillas.');
        const data = await res.json();
        setCuadrillas(data);
        setErrorCuadrillas('');
      } catch (err) {
        setCuadrillas([]);
        setErrorCuadrillas('Error al cargar cuadrillas.');
      }
    }

    fetchCuadrillas();
  }, []);

  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch('/api/asignacion-sites');
        if (!res.ok) {
          let errorMsg = 'Error al cargar sites.';
          try {
            const errorData = await res.json();
            if (errorData?.error) {
              errorMsg += '\n' + errorData.error;
            } else {
              errorMsg += '\n' + JSON.stringify(errorData);
            }
          } catch {}
          setSites([]);
          setErrorSites(errorMsg);
          return;
        }
        const data = await res.json();
        setSites(data);
        setErrorSites('');
      } catch (err) {
        setSites([]);
        setErrorSites('Error al cargar sites.');
      }
    }

    fetchSites();
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
      if (s) {
        handleSiteSuggestionClick(s);
        setSelectedSiteObj(s); // Asegura que selectedSiteObj se setea correctamente
      }
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
    // Preparar los datos para el SP de seguimiento (SP_InsertarPlantillaSeguimientoImagenes)
    const asignacionesConNroInterno = gridData.map(row => ({
      ...row,
      NroInterno: row.NroInterno ?? '',
      ptipotrabajo: row.TipoTrabajo ?? '', // Enviar como @ptipotrabajo
      SegmentoID: row.segmentoid ?? '' // Enviar como @SegmentoID
    }));

    // Mostrar los parámetros en pantalla antes de grabar
    const paramsPreview = asignacionesConNroInterno.map((row, idx) => {
      return `Registro ${idx + 1}:\n` +
        `PlantillaID: ${row.plantillaid ?? ''}\n` +
        `Id_Auto: (se genera en backend)\n` +
        `IdUsuario: ADMIN_X5\n` +
        `id_cuadrilla: ${row.id_cuadrilla}\n` +
        `NroInterno: ${row.NroInterno}\n` +
        `fecha: ${row.fecha}\n` +
        `ptipotrabajo: ${row.ptipotrabajo}\n` +
           `Nodo: ${row.Nodo ?? ''}\n` +
        `Plantilla: ${row.Plantilla ?? ''}\n` +
        `nodoid: ${row.nodoid ?? ''}\n`;
    }).join('\n\n');
    alert('Parámetros enviados a SP_InsertarPlantillaSeguimientoImagenes:\n\n' + paramsPreview);

    setLoading(true);
    try {
      // Ejecutar el SP de seguimiento directamente (SP_InsertarPlantillaSeguimientoImagenes)
      const seguimientoResponse = await fetch('/api/cuadrilla-asignacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asignaciones: asignacionesConNroInterno, usuario: 'ADMIN_X5', crearSeguimiento: true }),
      });
      const seguimientoData = await seguimientoResponse.json();
      if (seguimientoResponse.ok) {
        alert('DATOS REGISTRADOS');
        setGridData([]);
        fetchAsignacionesDia();
      } else {
        let errorMsg = 'Datos NO GRABADOS';
        try {
          if (seguimientoResponse.status === 409) {
            const errorData = await seguimientoResponse.json();
            alert(errorData?.error || 'Ya existe un registro para este Id_Auto y PlantillaID.');
            return;
          }
          if (seguimientoResponse.headers.get('content-type')?.includes('application/json')) {
            const errorData = await seguimientoResponse.json();
            if (errorData?.error) {
              errorMsg += '\n' + errorData.error;
            } else if (errorData?.details) {
              errorMsg += '\n' + errorData.details;
            } else {
              errorMsg += '\n' + JSON.stringify(errorData);
            }
          } else {
            const text = await seguimientoResponse.text();
            if (text) errorMsg += '\n' + text;
          }
        } catch (e) {}
        alert(errorMsg);
      }
    } catch (err) {
      alert('Datos NO GRABADOS');
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
    // Validar que selectedCuadrilla tenga valor antes de llamar
    if (!selectedCuadrilla) {
      setAsignacionesDia([]);
      return;
    }
    // Obtener fecha local en formato YYYY-MM-DD
    const now = new Date();
    const pFecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    try {
      const res = await fetch(`/api/cuadrilla-asignacion-dia?idCuadrilla=${selectedCuadrilla}&pFecha=${pFecha}`);
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

  // El return principal del componente debe estar aquí, no dentro de otra función
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
          <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Nueva asignación</h2>
            {/* Campo Cuadrilla */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{ fontWeight: 600 }}>Asignacion</label>
              <input
                type="text"
                value={cuadrillaInput}
                onChange={handleCuadrillaInput}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar asignacion por nombre..."
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
            {/* Checkboxes al costado de cada título para habilitar/deshabilitar Site y Ubicación */}
            <div style={{ height: 0, marginBottom: 0 }}></div>

            {/* Campo Site con checkbox */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={modoSeleccion === 'site'}
                  onChange={() => setModoSeleccion(modoSeleccion === 'site' ? 'ubicacion' : 'site')}
                  style={{ marginRight: 4 }}
                />
                Site
              </label>
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
                disabled={modoSeleccion !== 'site'}
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



            {/* Campo Ubicación con checkbox */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={modoSeleccion === 'ubicacion'}
                  onChange={() => setModoSeleccion(modoSeleccion === 'ubicacion' ? 'site' : 'ubicacion')}
                  style={{ marginRight: 4 }}
                />
                Ubicación
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={selectedUbicacion
                    ? (ubicaciones.find(u => String(u.IdUbicacion ?? u.idubicacion) === selectedUbicacion)?.NombreUbicacion
                      ?? ubicaciones.find(u => String(u.IdUbicacion ?? u.idubicacion) === selectedUbicacion)?.nombreubicacion
                      ?? selectedUbicacion)
                    : ubicacionInput}
                  onChange={handleUbicacionInput}
                  onKeyDown={handleUbicacionInputKeyDown}
                  onFocus={() => setShowUbicacionSuggestions(true)}
                  placeholder="Buscar ubicación por nombre..."
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
                  autoComplete="off"
                  disabled={modoSeleccion !== 'ubicacion'}
                />
                <button type="button" onClick={() => setShowModalUbicacion(true)} style={{ marginTop: 6, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '0 14px', fontWeight: 700, fontSize: 18, cursor: 'pointer', height: 40 }} disabled={modoSeleccion !== 'ubicacion'}>Nuevo</button>
              </div>
              {showUbicacionSuggestions && ubicacionInput && filteredUbicaciones.length > 0 && (
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
                  {filteredUbicaciones.map((u, idx) => (
                    <li
                      key={u.IdUbicacion ?? u.idubicacion}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        background: idx === activeUbicacionSuggestion ? '#e0e7ff' : 'transparent',
                      }}
                      onMouseEnter={() => setActiveUbicacionSuggestion(idx)}
                      onClick={() => handleUbicacionSuggestionClick(u)}
                    >
                      {u.NombreUbicacion ?? u.nombreubicacion}
                    </li>
                  ))}
                </ul>
              )}
              {errorUbicaciones && (
                <div style={{ color: '#dc2626', marginTop: 8 }}>{errorUbicaciones}</div>
              )}
            </div>
                  {/* Modal para nueva ubicación */}
                  {showModalUbicacion && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                        <h3 style={{ marginBottom: 18, textAlign: 'center' }}>Registrar nueva ubicación</h3>
                        <div style={{ marginBottom: 14 }}>
                          <label>Nombre ubicación <span style={{ color: '#dc2626' }}>*</span></label>
                          <input type="text" value={modalUbicacion.NombreUbicacion} onChange={e => setModalUbicacion(v => ({ ...v, NombreUbicacion: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #cbd5e1', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label>Latitud <span style={{ color: '#dc2626' }}>*</span></label>
                          <input type="text" value={modalUbicacion.Latitud} onChange={e => setModalUbicacion(v => ({ ...v, Latitud: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #cbd5e1', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label>Longitud <span style={{ color: '#dc2626' }}>*</span></label>
                          <input type="text" value={modalUbicacion.Longitud} onChange={e => setModalUbicacion(v => ({ ...v, Longitud: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #cbd5e1', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label>Dirección</label>
                          <input type="text" value={modalUbicacion.Direccion} onChange={e => setModalUbicacion(v => ({ ...v, Direccion: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #cbd5e1', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 18 }}>
                          <label>Referencia</label>
                          <input type="text" value={modalUbicacion.Referencia} onChange={e => setModalUbicacion(v => ({ ...v, Referencia: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #cbd5e1', marginTop: 4 }} />
                        </div>
                        {modalUbicacionError && <div style={{ color: '#dc2626', marginBottom: 10 }}>{modalUbicacionError}</div>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                          <button type="button" onClick={() => setShowModalUbicacion(false)} style={{ background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                          <button type="button" onClick={handleGuardarUbicacion} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                        </div>
                      </div>
                    </div>
                  )}
            {/* Campo Plantilla */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{ fontWeight: 600 }}>Plantilla</label>
              <input
                type="text"
                value={selectedPlantilla
                  ? (plantillas.find(p => String(p.plantillaid ?? p.PlantillaID ?? p.id) === selectedPlantilla)?.Plantilla
                    ?? plantillas.find(p => String(p.plantillaid ?? p.PlantillaID ?? p.id) === selectedPlantilla)?.Nombre
                    ?? plantillas.find(p => String(p.plantillaid ?? p.PlantillaID ?? p.id) === selectedPlantilla)?.name
                    ?? selectedPlantilla)
                  : plantillaInput}
                onChange={e => {
                  setPlantillaInput(e.target.value);
                  setShowPlantillaSuggestions(true);
                  setSelectedPlantilla('');
                  setSelectedPlantillaObj(null);
                  setActivePlantillaSuggestion(0);
                }}
                onKeyDown={e => {
                  if (!showPlantillaSuggestions || filteredPlantillas.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    setActivePlantillaSuggestion(prev => Math.min(prev + 1, filteredPlantillas.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    setActivePlantillaSuggestion(prev => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter') {
                    const p = filteredPlantillas[activePlantillaSuggestion];
                    if (p) handlePlantillaSuggestionClick(p);
                  }
                }}
                onFocus={() => setShowPlantillaSuggestions(true)}
                placeholder="Buscar plantilla por nombre..."
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
              {/* Mostrar el campo Segmento si hay una plantilla seleccionada */}
              {selectedPlantillaObj && (
                <div style={{ marginTop: 8, color: '#2563eb', fontWeight: 600 }}>
                  Segmento: {selectedPlantillaObj.Segmento ?? selectedPlantillaObj.segmento ?? ''}
                </div>
              )}
              {showPlantillaSuggestions && plantillaInput && filteredPlantillas.length > 0 && (
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
                  {filteredPlantillas.map((p, idx) => (
                    <li
                      key={String(p.plantillaid ?? p.PlantillaID ?? p.id) + '-' + idx}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        background: idx === activePlantillaSuggestion ? '#e0e7ff' : 'transparent',
                      }}
                      onMouseEnter={() => setActivePlantillaSuggestion(idx)}
                      onClick={() => handlePlantillaSuggestionClick(p)}
                    >
                      {/* Mostrar solo Nodo, Plantilla y Segmento */}
                      <span style={{ fontWeight: 600 }}>{p.Nodo ?? ''}</span>
                      {' - '}
                      <span>{p.Plantilla ?? ''}</span>
                      {' - '}
                      <span style={{ color: '#2563eb' }}>{p.Segmento ?? ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Mostrar botones solo si los tres campos tienen valor */}
            <div style={{ display: 'flex', gap: '10px', marginTop: 10 }}>
              <button
                type="button"
                style={{ flex: 1, height: 40, fontSize: 16, backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={handleBuscarAsignaciones}
              >
                Buscar
              </button>
              <button
                type="button"
                style={{ flex: 1, height: 40, fontSize: 16, backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={handleAsignar}
              >
                Asignar
              </button>
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
                    {asignacionesDia.map((row: any, idx: number) => (
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
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Segmento</th>
                  <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>SegmentoID</th>
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
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Segmento ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.segmentoid ?? ''}</td>
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
