// Removed duplicate declaration of activeTab, TabNames, cuadrillaInput, siteInput, asignacionesDia, loading
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
    // (Eliminado: declaración duplicada de filteredUbicaciones)

    // Removed duplicate handleUbicacionInput declaration

    // Removed duplicate declaration of handleUbicacionSuggestionClick

    // (Removed duplicate declaration of handleUbicacionInputKeyDown)

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
  // Estado para checkboxes de exclusión Site/Ubicación
  const [siteChecked, setSiteChecked] = useState(true);
  const [ubicacionChecked, setUbicacionChecked] = useState(false);
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
    id_cuadrilla: string,
    Empleado: string,
    NroInterno: string,
    Concatenado: string,
    idsite?: string,
    correlativo?: string,
    fecha?: string,
    TipoTrabajo?: string,
    Segmento?: string,
    segmentoid?: string,
    Nodo?: string,
    Plantilla?: string,
    nodoid?: string,
    plantillaid?: string,
    nombreubicacion?: string,
    // ...existing code...
  }>>([]);

  // Estado para ubicaciones
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [selectedUbicacion, setSelectedUbicacion] = useState('');
  const [selectedUbicacionObj, setSelectedUbicacionObj] = useState<Ubicacion | null>(null);
  const [ubicacionInput, setUbicacionInput] = useState('');
  const [showUbicacionSuggestions, setShowUbicacionSuggestions] = useState(false);
  const [activeUbicacionSuggestion, setActiveUbicacionSuggestion] = useState(0);
  // Estado para modal de nueva ubicación
  const [showNuevoUbicacion, setShowNuevoUbicacion] = useState(false);
  const [nuevoNombreUbicacion, setNuevoNombreUbicacion] = useState('');
  const [nuevoLatitud, setNuevoLatitud] = useState('');
  const [nuevoLongitud, setNuevoLongitud] = useState('');
  const [nuevoDireccion, setNuevoDireccion] = useState('');
  const [nuevoReferencia, setNuevoReferencia] = useState('');
  const [nuevoUbicacionLoading, setNuevoUbicacionLoading] = useState(false);
  const [nuevoUbicacionError, setNuevoUbicacionError] = useState('');

  // Filtrar ubicaciones
  const filteredUbicaciones = Array.isArray(ubicaciones)
    ? ubicaciones.filter(u => {
        const nombre = (u.nombreubicacion ?? '').toLowerCase();
        return ubicacionInput
          .toLowerCase()
          .split(' ')
          .every(word => nombre.includes(word));
      })
    : [];

  // Handlers para autocompletado de ubicaciones
  const handleUbicacionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUbicacionInput(e.target.value);
    setShowUbicacionSuggestions(true);
    setSelectedUbicacion('');
    setActiveUbicacionSuggestion(0);
  };

  const handleUbicacionSuggestionClick = (u: Ubicacion) => {
    setUbicacionInput(u.nombreubicacion ?? '');
    setSelectedUbicacion(String(u.idubicacion));
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

  // Fetch ubicaciones (simular o conectar a API real)
  useEffect(() => {
    async function fetchUbicaciones() {
      try {
        const res = await fetch('/api/ubicaciones');
        if (!res.ok) throw new Error('No se pudo cargar la lista de ubicaciones.');
        const data = await res.json();
        setUbicaciones(Array.isArray(data) ? data : []);
      } catch (err) {
        setUbicaciones([]);
      }
    }
    fetchUbicaciones();
  }, []);
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
  // Define handleBuscarAsignaciones para evitar error de referencia
  const handleBuscarAsignaciones = async () => {
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
        fecha: fechaLocal,
        nombreubicacion: selectedUbicacionObj?.nombreubicacion ?? ''
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

  // Handler para el botón Asignar
  const handleAsignar = () => {
    // Aquí puedes implementar la lógica de asignación, por ejemplo agregar al gridData
    // o mostrar un mensaje temporal
    alert('Funcionalidad de asignar aún no implementada.');
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
            {/* Campo Site */}
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
          {/* ...existing code... */}
        </div>
      )}
      {/* Grid de registros anexados solo en la pestaña de nueva asignación */}
      {activeTab === 0 && gridData.length > 0 && (
        <div style={{ maxWidth: 800, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: 20, flex: 1, margin: '40px auto' }}>
          <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Registros anexados</h3>
          {/* ...existing code... */}
        </div>
      )}
    </div>
  );
};

export default Cuadrilla_Asignar;
