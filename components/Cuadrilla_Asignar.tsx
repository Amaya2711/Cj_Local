import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Define the SiteAsignacion type (adjust fields as needed based on your API response)
interface SiteAsignacion {
  NroInterno?: string | number;
  Concatenado?: string;
  IDSite?: string | number;
  idsite?: string | number;
  IdSite?: string | number;
  Correlativo?: string | number;
  correlativo?: string | number;
  TipoTrabajo?: string;
  // Add any other fields you expect from your API
}

// Define the EmpleadoCuadrilla type (adjust fields as needed based on your API response)
interface EmpleadoCuadrilla {
  IdEmpleado?: string | number;
  idempleado?: string | number;
  NombreEmpleado?: string;
  nombreempleado?: string;
  // Add any other fields you expect from your API
}

// Define the Ubicacion type (adjust fields as needed based on your API response)
interface Ubicacion {
  IdUbicacion?: string | number;
  idubicacion?: string | number;
  NroInterno?: string | number;
  NombreUbicacion?: string;
  nombreubicacion?: string;
  Nombreubicacion?: string;
  Latitud?: string;
  Longitud?: string;
  Direccion?: string;
  Referencia?: string;
  // Add any other fields you expect from your API
}

// Definir el array de librerías fuera del componente para evitar warnings de Google Maps
// Usar solo los valores permitidos por el tipo Library de @react-google-maps/api
const GOOGLE_MAPS_LIBRARIES: Array<'places' | 'drawing' | 'geometry' | 'visualization'> = ['places'];
// Configuración para el modal de Google Maps
const MAPS_MODAL_STYLE = {
  position: 'fixed' as 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 2000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const MAPS_CONTAINER_STYLE = {
  width: '400px', height: '400px', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', background: 'white', padding: 24
};


const Cuadrilla_Asignar: React.FC = () => {
    // Estado para la fecha seleccionada
    // Usar la fecha actual del sistema +1 día en formato YYYY-MM-DD, considerando la zona horaria local de Perú
    function getTomorrowDateStr() {
      // Obtener la fecha actual en la zona horaria local
      const now = new Date();
      // Sumar un día (24 horas)
      now.setDate(now.getDate() + 1);
      // Ajustar a la zona horaria de Perú (UTC-5)
      const offsetMs = (now.getTimezoneOffset() + 300) * 60 * 1000; // 300 min = 5 horas
      const peruDate = new Date(now.getTime() - offsetMs);
      return peruDate.toISOString().slice(0, 10);
    }
    const [fechaInput, setFechaInput] = useState<string>(getTomorrowDateStr());
    // Estado para modo de selección (site o ubicación)
    const [modoSeleccion, setModoSeleccion] = useState<'site' | 'ubicacion'>('site');
    // Estado para mostrar el modal de Google Maps
    const [showMapsModal, setShowMapsModal] = useState(false);
    const [selectedMapCoords, setSelectedMapCoords] = useState<{ lat: number, lng: number } | null>(null);

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

    // Para insertar coordenadas seleccionadas en el modal de nueva ubicación

    // Cuando cambian las coordenadas seleccionadas en el mapa y el modal de nueva ubicación está abierto,
    // actualiza automáticamente los campos de latitud y longitud en el formulario de nueva ubicación.
    useEffect(() => {
      if (showModalUbicacion && selectedMapCoords) {
        setModalUbicacion(v => ({ ...v, Latitud: String(selectedMapCoords.lat), Longitud: String(selectedMapCoords.lng) }));
      }
    }, [selectedMapCoords, showModalUbicacion]);

    const handleInsertCoordsToModal = () => {
      setShowMapsModal(false);
    };

    // Cargar Google Maps API
    const { isLoaded } = useJsApiLoader({
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      libraries: GOOGLE_MAPS_LIBRARIES,
    });
    // Estado para Ubicación
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [ubicacionInput, setUbicacionInput] = useState('');
    const [showUbicacionSuggestions, setShowUbicacionSuggestions] = useState(false);
    const [activeUbicacionSuggestion, setActiveUbicacionSuggestion] = useState(0);
    const [selectedUbicacion, setSelectedUbicacion] = useState('');
    const [selectedUbicacionObj, setSelectedUbicacionObj] = useState<Ubicacion | null>(null);
    const [errorUbicaciones, setErrorUbicaciones] = useState('');

    // Fetch ubicaciones (SP_Ubicacion) con @Accion=2
    // Función para refrescar ubicaciones (usada en el efecto y después de guardar)
    const fetchUbicaciones = async () => {
      try {
        const res = await fetch('/api/ubicacion?accion=2');
        if (!res.ok) throw new Error('No se pudo cargar la lista de ubicaciones.');
        const data = await res.json();
        setUbicaciones(Array.isArray(data) ? data : []);
        setErrorUbicaciones('');
      } catch (err) {
        setUbicaciones([]);
        setErrorUbicaciones('Error al cargar ubicaciones.');
      }
    };
    useEffect(() => {
      fetchUbicaciones();
    }, []);

    // Filtrado de ubicaciones para autocompletado
    const filteredUbicaciones = Array.isArray(ubicaciones)
      ? ubicaciones.filter(u => {
          const nombre = (u.NombreUbicacion ?? u.nombreubicacion ?? u.Nombreubicacion ?? '').toLowerCase();
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
      setUbicacionInput(u.NombreUbicacion ?? u.nombreubicacion ?? u.Nombreubicacion ?? '');
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
        // Refrescar ubicaciones desde el backend para asegurar que el nuevo registro esté incluido
        await fetchUbicaciones();
        // Opcional: puedes buscar el registro recién creado y seleccionarlo automáticamente
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
      // Usar la fecha seleccionada
      const pFecha = fechaInput;
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
            // Validar que haya plantilla seleccionada
            if (!selectedPlantillaObj) {
              alert('Debe seleccionar una plantilla antes de asignar.');
              return;
            }
      // Buscar datos completos de cuadrilla y site seleccionados
      const cuadrilla = cuadrillas.find(c => String(c.IdEmpleado ?? c.idempleado) === selectedCuadrilla);
      const site = selectedSiteObj;
      if (!cuadrilla) {
        alert('Seleccione una asignacion válida.');
        return;
      }
      if (modoSeleccion === 'site' && !site) {
        alert('Seleccione un site válido.');
        return;
      }
      if (modoSeleccion === 'ubicacion' && !selectedUbicacionObj) {
        alert('Ubicacion no existe');
        return;
      }
      const id_cuadrilla = String(cuadrilla.IdEmpleado ?? cuadrilla.idempleado ?? '');
      // Determinar NroInterno según el modo de selección
      let NroInterno = '';
      if (modoSeleccion === 'ubicacion') {
        NroInterno = String(selectedUbicacionObj?.NroInterno ?? '');
      } else {
        NroInterno = site ? String(site.NroInterno ?? '') : '';
      }
      const fecha = fechaInput;

      // Validar en el grid local
      const existeEnGrid = gridData.some(row => row.id_cuadrilla === id_cuadrilla && row.NroInterno === NroInterno && row.fecha === fecha);
      if (existeEnGrid) {
        alert('Ya existe relacion ASIGNACION - FECHA');
        return;
      }

      // Validar en la base de datos (asignaciones del día) por id_cuadrilla, NroInterno y fecha
      const existeEnAsignaciones = asignacionesDia.some(row => {
        const rowIdCuadrilla = String(row.id_cuadrilla ?? row.ID_CUADRILLA ?? row.idempleado ?? row.IdEmpleado ?? '');
        let rowNroInterno = row.NroInterno ?? '';
        let nroInternoLocal = NroInterno;
        rowNroInterno = String(rowNroInterno).trim();
        nroInternoLocal = String(nroInternoLocal).trim();
        let rowFecha = String(row.fecha ?? row.fechacreacion ?? row.FechaCreacion ?? '');
        let fechaLocal = fecha;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(rowFecha)) {
          const [d, m, y] = rowFecha.split('/');
          rowFecha = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaLocal)) {
          const [d, m, y] = fechaLocal.split('/');
          fechaLocal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return rowIdCuadrilla === id_cuadrilla && rowNroInterno === nroInternoLocal && rowFecha === fechaLocal;
      });
      if (existeEnAsignaciones) {
        alert('Ya existe relacion ASIGNACION - FECHA');
        return;
      }

      // Crear el registro en el grid
      const nuevoRegistro = {
        id_cuadrilla,
        Empleado: cuadrilla.NombreEmpleado ?? cuadrilla.nombreempleado ?? '',
        NroInterno,
        Nombreubicacion: modoSeleccion === 'ubicacion' ? (selectedUbicacionObj?.Nombreubicacion ?? selectedUbicacionObj?.NombreUbicacion ?? selectedUbicacionObj?.nombreubicacion ?? '') : undefined,
        Concatenado: modoSeleccion === 'site' && site ? site.Concatenado ?? '' : undefined,
        idsite: modoSeleccion === 'ubicacion'
          ? 'SIST01'
          : (site && (site.IDSite ?? site.idsite ?? site.IdSite) !== undefined
              ? String(site.IDSite ?? site.idsite ?? site.IdSite).split(',')[0]
              : ''),
        correlativo: modoSeleccion === 'ubicacion'
          ? '1'
          : (site && (site.Correlativo ?? site.correlativo) !== undefined
              ? String(site.Correlativo ?? site.correlativo).split(',')[0]
              : ''),
        fecha,
        TipoTrabajo: modoSeleccion === 'ubicacion' ? 'VARIOS' : (site ? site.TipoTrabajo ?? '' : ''),
        Nodo: selectedPlantillaObj?.Nodo ?? selectedPlantillaObj?.nodo ?? '',
        Plantilla: selectedPlantillaObj?.Plantilla ?? selectedPlantillaObj?.Nombre ?? selectedPlantillaObj?.name ?? '',
        nodoid: selectedPlantillaObj?.nodoid ?? selectedPlantillaObj?.NodoID ?? '',
        plantillaid: selectedPlantillaObj?.plantillaid ?? selectedPlantillaObj?.PlantillaID ?? '',
        segmentoid: selectedPlantillaObj?.segmentoid ?? selectedPlantillaObj?.SegmentoID ?? '',
        Segmento: selectedPlantillaObj?.Segmento ?? selectedPlantillaObj?.segmento ?? '',
        pCheck: 1, // Valor por defecto, puedes ajustar la lógica si es necesario
      };
      setGridData(prev => [...prev, nuevoRegistro]);

      // Limpiar solo el combobox de asignación (cuadrilla)
      setCuadrillaInput('');
      setSelectedCuadrilla('');
      setShowSuggestions(false);
      setActiveSuggestion(0);
      // Site y ubicación se mantienen igual
    };

    // ...rest of the component logic and return statement...
  // Estado para asignaciones del día
  // Estado para selección de registros en el grid
  const [selectedGridRows, setSelectedGridRows] = useState<number[]>([]);
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
    Concatenado?: string;
    Nombreubicacion?: string;
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

  // Estado para plantillas (asegura que solo exista una vez)
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
        // Llama al endpoint que ejecuta el store sp_GetPlaPlantilla
        const res = await fetch('/api/plantillas?store=sp_GetPlaPlantilla');
        if (!res.ok) throw new Error('No se pudo cargar la lista de plantillas.');
        const data = await res.json();
        // Mapear los campos esperados del store
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
        const res = await fetch('/api/sites');
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

    // Solo buscar si hay al menos 1 letra en el input
    if (siteInput && siteInput.trim().length > 0) {
      fetchSites();
    } else {
      setSites([]);
      setErrorSites('');
    }
  }, [siteInput]);

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
    // Usar la fecha seleccionada
    const fechaLocal = fechaInput;
    setGridData(prev => [
      ...prev,
      {
        id_cuadrilla: String(cuadrilla.IdEmpleado ?? cuadrilla.idempleado ?? ''),
        Empleado: cuadrilla.NombreEmpleado ?? cuadrilla.nombreempleado ?? '',
        NroInterno: String(site.NroInterno ?? ''),
        Concatenado: site.Concatenado ?? '',
        idsite: String(site.IDSite ?? site.idsite ?? site.IdSite ?? '').split(',')[0],
        correlativo: String(site.Correlativo ?? site.correlativo ?? site.Correlativo ?? '').split(',')[0],
        fecha: fechaLocal,
        pCheck: 1 // Valor por defecto, puedes ajustar la lógica si es necesario
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
    if (!selectedGridRows || selectedGridRows.length === 0) {
      alert('Debe seleccionar al menos un registro para grabar.');
      return;
    }
    // Enviar todos los registros, marcando pCheck=1 si está seleccionado, 0 si no
    const asignacionesConNroInterno = gridData.map((row, idx) => ({
      ...row,
      NroInterno: row.NroInterno ?? '',
      ptipotrabajo: row.TipoTrabajo ?? '', // Enviar como @ptipotrabajo
      SegmentoID: row.segmentoid ?? '', // Enviar como @SegmentoID
      pCheck: selectedGridRows.includes(idx) ? 1 : 0
    }));

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
        setSelectedGridRows([]);
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

  // Obtener asignaciones del día (por fecha seleccionada, sin filtrar por cuadrilla)
  const fetchAsignacionesDia = async () => {
    const pFecha = fechaInput;
    try {
      const res = await fetch(`/api/cuadrilla-asignacion-dia?pFecha=${pFecha}`);
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
    <div style={{ maxWidth: 2400, margin: '0px auto 16px auto', background: '#f8fafc', borderRadius: 18, boxShadow: '0 8px 32px #0002', padding: '0px 40px 40px 40px', minWidth: 1600 }}>
      {/* Tabs secundarios con estilo igual a Plantilla_v3 */}
      <div style={{ display: 'flex', borderBottom: '2px solid #2563eb', marginBottom: 32 }}>
        <button
          style={{
            padding: '12px 32px',
            border: 'none',
            background: activeTab === 0 ? '#2563eb' : '#fff',
            color: activeTab === 0 ? '#fff' : '#2563eb',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            marginRight: 8
          }}
          onClick={() => setActiveTab(0)}
        >Nuevo registro</button>
        <button
          style={{
            padding: '12px 32px',
            border: 'none',
            background: activeTab === 1 ? '#2563eb' : '#fff',
            color: activeTab === 1 ? '#fff' : '#2563eb',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10
          }}
          onClick={() => {
            setActiveTab(1);
            fetchAsignacionesDia();
          }}
        >Asignacion del dia</button>
      </div>
      {/* Contenido de pestañas */}
      {activeTab === 0 && (
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', justifyContent: 'center' }}>
          {/* Primera columna: datos actuales del formulario */}
          <div style={{ minWidth: 350, maxWidth: 500, flex: 1 }}>
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                padding: 32,
              }}
            >
              {/* Campo Fecha (antes de Asignacion) */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600 }}>Fecha</label>
                <input
                  type="date"
                  value={fechaInput}
                  onChange={e => setFechaInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    marginTop: 6,
                    fontSize: 16,
                  }}
                />
              </div>
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
                  placeholder="Buscar site por Concatenado..."
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
                        key={String(s.Concatenado) + '-' + idx}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          background: idx === activeSiteSuggestion ? '#e0e7ff' : 'transparent',
                        }}
                        onMouseEnter={() => setActiveSiteSuggestion(idx)}
                        onClick={() => handleSiteSuggestionClick(s)}
                      >
                        {s.Concatenado}
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
                    value={showUbicacionSuggestions || !selectedUbicacionObj
                      ? ubicacionInput
                      : (selectedUbicacionObj.NombreUbicacion ?? selectedUbicacionObj.nombreubicacion ?? selectedUbicacionObj.Nombreubicacion ?? '')}
                    onChange={handleUbicacionInput}
                    onKeyDown={handleUbicacionInputKeyDown}
                    onFocus={() => setShowUbicacionSuggestions(true)}
                    placeholder="Buscar ubicación por nombre..."
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
                    autoComplete="off"
                    disabled={modoSeleccion !== 'ubicacion'}
                  />
                  <button
                    type="button"
                    style={{
                      marginTop: 6,
                      background: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0 14px',
                      fontWeight: 700,
                      fontSize: 18,
                      cursor: modoSeleccion === 'ubicacion' ? 'pointer' : 'not-allowed',
                      height: 40,
                      opacity: modoSeleccion === 'ubicacion' ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    disabled={modoSeleccion !== 'ubicacion'}
                    onClick={() => {
                      if (modoSeleccion !== 'ubicacion') return;
                      const ubicacion = selectedUbicacionObj || ubicaciones.find(u => String(u.IdUbicacion ?? u.idubicacion) === selectedUbicacion);
                      const lat = ubicacion?.Latitud;
                      const lng = ubicacion?.Longitud;
                      if (lat && lng) {
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                      } else {
                        alert('Seleccione una ubicación con coordenadas válidas.');
                      }
                    }}
                    title="Ver ubicación en Google Maps"
                  >
                    {/* Ícono de lupa SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    style={{
                      marginTop: 6,
                      background: '#fff',
                      color: '#059669',
                      border: '1px solid #059669',
                      borderRadius: 6,
                      padding: '0 10px',
                      fontWeight: 700,
                      fontSize: 18,
                      cursor: modoSeleccion === 'ubicacion' ? 'pointer' : 'not-allowed',
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: modoSeleccion === 'ubicacion' ? 1 : 0.5
                    }}
                    disabled={modoSeleccion !== 'ubicacion'}
                    title="Seleccionar ubicación en Google Maps"
                    onClick={() => {
                      if (modoSeleccion !== 'ubicacion') return;
                      setShowMapsModal(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModalUbicacion(true)}
                    style={{
                      marginTop: 6,
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0 14px',
                      fontWeight: 700,
                      fontSize: 18,
                      cursor: modoSeleccion === 'ubicacion' ? 'pointer' : 'not-allowed',
                      height: 40,
                      opacity: modoSeleccion === 'ubicacion' ? 1 : 0.5
                    }}
                    disabled={modoSeleccion !== 'ubicacion'}
                  >Nuevo</button>
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
                          textAlign: 'left',
                        }}
                        onMouseEnter={() => setActiveUbicacionSuggestion(idx)}
                        onClick={() => handleUbicacionSuggestionClick(u)}
                      >
                        {u.NombreUbicacion ?? u.nombreubicacion ?? u.Nombreubicacion}
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
                {/* Segmento label removed as requested */}
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
              {/* Campo Site con checkbox */}
              {/* ...campo Site igual que antes... */}
              {/* Campo Ubicación con checkbox */}
              {/* ...campo Ubicación igual que antes... */}
              {/* Modal para nueva ubicación */}
              {/* ...modal igual que antes... */}
              {/* Campo Plantilla */}
              {/* ...campo Plantilla igual que antes... */}
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
            </form>
          </div>
          {/* Segunda columna: grid de registros anexados */}
          <div style={{ minWidth: 400, maxWidth: 800, flex: 2 }}>
            {gridData.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: 20, margin: '0 auto' }}>
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
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 40 }}>
                          <input
                            type="checkbox"
                            checked={selectedGridRows.length === gridData.length}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedGridRows(gridData.map((_, idx) => idx));
                              } else {
                                setSelectedGridRows([]);
                              }
                            }}
                            aria-label="Seleccionar todos"
                          />
                        </th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 160 }}>Empleado</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Asignacion</th>
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 110 }}>Fecha</th>
                        {/* <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 90 }}>idsite</th> */}
                        {/* <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 90 }}>correlativo</th> */}
                        <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 80 }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gridData.map((row, idx) => (
                        <tr key={row.Empleado + '-' + idx}>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedGridRows.includes(idx)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedGridRows(prev => [...prev, idx]);
                                } else {
                                  setSelectedGridRows(prev => prev.filter(i => i !== idx));
                                }
                              }}
                              aria-label={`Seleccionar registro ${idx + 1}`}
                            />
                          </td>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Empleado}</td>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.Nombreubicacion ? row.Nombreubicacion : (row.Concatenado ?? '')}</td>
                          <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.fecha ?? ''}</td>
                          {/* <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.idsite ?? ''}</td> */}
                          {/* <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.correlativo ?? ''}</td> */}
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
        </div>
      )}
      {activeTab === 1 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0' }}>
          <div style={{ maxWidth: 1200, width: '100%', background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 32, marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Asignaciones del día</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <label style={{ fontWeight: 600 }}>Fecha:</label>
              <input
                type="date"
                value={fechaInput}
                onChange={e => setFechaInput(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
              />
              <button
                type="button"
                onClick={fetchAsignacionesDia}
                style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 5, padding: '7px 16px', fontWeight: 600, cursor: 'pointer' }}
              >Buscar</button>
              <button type="button" onClick={() => handleExportAsignacionesDiaCSV()} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 5, padding: '7px 16px', fontWeight: 600, cursor: 'pointer' }}>
                Exportar CSV
              </button>
            </div>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 900 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 260 }}>Empleado</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 260 }}>Asignacion</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 110 }}>Fecha</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 60 }}>ID_Principal</th>
                    <th style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 80 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {asignacionesDia.map((row: any, idx: number) => (
                    <tr key={
                      (row.ID_CUADRILLA ?? row.id_cuadrilla ?? row.idempleado ?? row.IdEmpleado ?? idx) +
                      '-' + (row.IDSITE ?? row.idsite ?? row.IdSite ?? idx)
                    }>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.Empleado ?? row.NombreEmpleado ?? row.nombreempleado ?? ''}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', minWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.Concatenado ?? row.concatenado ?? ''}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{row.fecha ?? ''}</td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <input type="checkbox" checked={!!row.ID_Principal} disabled readOnly />
                      </td>
                      <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <button
                          type="button"
                          style={{
                            background: (Number(row.ID_Principal) === 1) ? '#2563eb' : '#e5e7eb',
                            color: (Number(row.ID_Principal) === 1) ? 'white' : '#888',
                            border: 'none',
                            borderRadius: 5,
                            padding: '6px 14px',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: (Number(row.ID_Principal) === 1) ? 'pointer' : 'not-allowed',
                            opacity: (Number(row.ID_Principal) === 1) ? 1 : 0.6
                          }}
                          disabled={Number(row.ID_Principal) !== 1}
                          onClick={() => {
                            if (Number(row.ID_Principal) === 1) {
                              setActiveTab(0);
                              // Cargar datos en el formulario
                              const cuadrillaId = String(row.id_cuadrilla ?? row.ID_CUADRILLA ?? row.idempleado ?? row.IdEmpleado ?? '');
                              setSelectedCuadrilla(cuadrillaId);
                              const cuadrillaObj = cuadrillas.find(c => String(c.IdEmpleado ?? c.idempleado) === cuadrillaId);
                              setCuadrillaInput(cuadrillaObj ? (cuadrillaObj.NombreEmpleado ?? cuadrillaObj.nombreempleado ?? '') : '');
                              if (row.idsite || row.IDSITE || row.IdSite) {
                                const siteId = String(row.idsite ?? row.IDSITE ?? row.IdSite ?? '');
                                const siteObj = sites.find(s => String(s.IDSite ?? s.idsite ?? s.IdSite) === siteId);
                                setSelectedSiteObj(siteObj || null);
                                setSiteInput(siteObj ? (siteObj.NroInterno ? siteObj.NroInterno + ' - ' : '') + siteObj.Concatenado : '');
                                setModoSeleccion('site');
                              } else if (row.Nombreubicacion || row.NombreUbicacion || row.nombreubicacion) {
                                setModoSeleccion('ubicacion');
                                const ubicacionObj = ubicaciones.find(u => String(u.NroInterno ?? '') === String(row.NroInterno ?? ''));
                                setSelectedUbicacionObj(ubicacionObj || null);
                                setUbicacionInput(ubicacionObj ? (ubicacionObj.NombreUbicacion ?? ubicacionObj.nombreubicacion ?? ubicacionObj.Nombreubicacion ?? '') : '');
                              }
                              setFechaInput(row.fecha ? String(row.fecha).slice(0, 10) : fechaInput);

                              // Limpiar el grid y agregar solo el registro editado
                              setGridData([
                                {
                                  id_cuadrilla: cuadrillaId,
                                  Empleado: cuadrillaObj ? (cuadrillaObj.NombreEmpleado ?? cuadrillaObj.nombreempleado ?? '') : '',
                                  NroInterno: String(row.NroInterno ?? ''),
                                  Nombreubicacion: row.Nombreubicacion ?? row.NombreUbicacion ?? row.nombreubicacion ?? undefined,
                                  Concatenado: row.Concatenado ?? '',
                                  idsite: row.idsite ?? row.IDSITE ?? row.IdSite ?? '',
                                  correlativo: row.correlativo ?? row.Correlativo ?? '',
                                  fecha: row.fecha ? String(row.fecha).slice(0, 10) : fechaInput,
                                  TipoTrabajo: row.TipoTrabajo ?? '',
                                  Segmento: row.Segmento ?? '',
                                  segmentoid: row.segmentoid ?? '',
                                  Nodo: row.Nodo ?? '',
                                  Plantilla: row.Plantilla ?? '',
                                  nodoid: row.nodoid ?? '',
                                  plantillaid: row.plantillaid ?? '',
                                  // ...otros campos si es necesario
                                }
                              ]);
                            }
                          }}
                        >Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    {/* Modal Google Maps para seleccionar ubicación */}
    {showMapsModal && (
      <div style={MAPS_MODAL_STYLE}>
        <div style={{ width: '480px', height: '520px', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', background: 'white', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h3 style={{ marginBottom: 12, textAlign: 'center' }}>Seleccionar ubicación en el mapa</h3>
          <div style={{ width: '440px', height: '340px', borderRadius: 8, overflow: 'hidden', marginBottom: 18, border: '1px solid #e5e7eb' }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedMapCoords || { lat: -12.0464, lng: -77.0428 }}
                zoom={selectedMapCoords ? 16 : 12}
                onClick={e => {
                  if (e && e.latLng) {
                    setSelectedMapCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }
                }}
              >
                {selectedMapCoords && (
                  <Marker position={selectedMapCoords} />
                )}
              </GoogleMap>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando mapa...</div>
            )}
          </div>
          {selectedMapCoords && (
            <div style={{ marginBottom: 12, fontSize: 15, color: '#2563eb', textAlign: 'center' }}>
              Coordenadas seleccionadas:<br />
              <span style={{ fontWeight: 600 }}>Lat: {selectedMapCoords.lat.toFixed(6)}, Lng: {selectedMapCoords.lng.toFixed(6)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <button
              type="button"
              onClick={() => setShowMapsModal(false)}
              style={{ background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
            >Cancelar</button>
            <button
              type="button"
              onClick={() => {
                setShowMapsModal(false);
                if (showModalUbicacion && selectedMapCoords) {
                  setModalUbicacion(v => ({ ...v, Latitud: String(selectedMapCoords.lat), Longitud: String(selectedMapCoords.lng) }));
                }
              }}
              style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
              disabled={!selectedMapCoords}
            >Usar ubicación</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default Cuadrilla_Asignar;
