import PlantillaV3 from '../pages/Plantilla_v3';
// [SHOW-FILE] Por favor, muestra el contenido real del archivo para poder analizar el uso del store EmpleadoCuadrilla y el autocompletado.
// [EXTRACT-FULL] Necesito el contenido real del archivo para analizar el problema de datos y autocompletado.
// [READ-FULL] Solicitud de lectura completa para análisis de store y autocompletado
// [FORCE-EXTRACT] Necesito el contenido real del archivo para analizar el uso del store EmpleadoCuadrilla y el autocompletado.
// [EXTRACT] Necesito el contenido real del archivo para analizar el problema de datos y autocompletado
// [READ] Solicitud de lectura completa para análisis de store y autocompletado
// [DEBUG] Revisando cómo se usan los datos del store EmpleadoCuadrilla y el autocompletado
import React, { useState } from 'react';
import PanelKPI from './PanelKPI';
import Cuadrilla_Asignar from './Cuadrilla_Asignar';
import Formulario from './Formulario';
import GoogleMapsForm from './GoogleMapsForm';
import Aprobar from './Aprobar';
import ReporteEstados from './ReporteEstados';
import CopiaFormulario from './CopiaFormulario';

// import dynamic from 'next/dynamic';
// const FormatoPlantilla = dynamic(() => import('./FormatoPlantilla'), { ssr: false });
// Puedes crear un componente Aprobar.tsx o mostrar un placeholder temporal
// import GoogleMap from '../map-google/GoogleMap';

const menuColor = '#2563eb';

// MENU PRINCIPAL ACTIVO
const MainForm: React.FC = () => {
  // Obtener el usuario autenticado desde localStorage usando useEffect y useState
  const [usuario, setUsuario] = useState('');
  const [usuarioWindow, setUsuarioWindow] = useState('');
  const [usuarioLocal, setUsuarioLocal] = useState('');
  React.useEffect(() => {
    function updateUsuario() {
      if (typeof window !== 'undefined') {
        // Leer SIEMPRE de localStorage para reflejar el último login
        const usuarioLocal = localStorage.getItem('pb_Usuario') || '';
        setUsuario(usuarioLocal);
        setUsuarioWindow(window.pb_Usuario || '');
        setUsuarioLocal(usuarioLocal);
      }
    }
    updateUsuario();
    window.addEventListener('pbUsuarioChange', updateUsuario);
    // También escuchar cambios en localStorage (por si hay cambios en otras pestañas)
    window.addEventListener('storage', updateUsuario);
    return () => {
      window.removeEventListener('pbUsuarioChange', updateUsuario);
      window.removeEventListener('storage', updateUsuario);
    };
  }, []);
  const fecha = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const [opcion, setOpcion] = useState('panel');

  console.log('MainForm opcion:', opcion);
  let contenido = null;
  if (opcion === 'asignacion') {
    contenido = <Cuadrilla_Asignar />;
  } else if (opcion === 'formulario') {
    contenido = <Formulario />;
  } else if (opcion === 'googlemaps') {
    console.log('Renderizando GoogleMapsForm');
    contenido = <GoogleMapsForm />;
  } else if (opcion === 'aprobar') {
    contenido = <Aprobar />;
  } else if (opcion === 'reporte') {
    contenido = <ReporteEstados />;
  } else if (opcion === 'copiaformulario') {
    contenido = <CopiaFormulario />;
  } else if (opcion === 'plantilla_v3') {
    contenido = <PlantillaV3 />;
  // } else if (opcion === 'formato-plantilla') {
  //   contenido = <FormatoPlantilla />;
  } else {
    contenido = <PanelKPI />;
  }

  // Protección: si no hay usuario autenticado, mostrar mensaje de acceso denegado
  if (!usuario) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>
        Acceso no autorizado. Por favor, inicie sesión.
      </div>
    );
  }

  const handleShowEnvs = async () => {
    try {
      const resp = await fetch('/api/mostrar-todas-envs');
      const data = await resp.json();
      const envs = data.envs || {};
      const envList = Object.entries(envs)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      alert('Variables de entorno en Vercel:\n' + envList);
    } catch (e) {
      alert('No se pudo obtener las variables de entorno');
    }
  };
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100vw' }}>
      {/* Barra superior */}
      <div style={{ background: '#222c36', color: '#fff', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          {usuario ? `Bienvenido, ${usuario}` : ''}
        </div>
        <div style={{ fontSize: 15, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {usuario ? `Usuario: ${usuario}  |  ${fecha}` : fecha}
          <span style={{ fontSize: 12, color: '#eab308', marginTop: 2 }}>
            window.pb_Usuario: <b>{usuarioWindow || '(vacío)'}</b> | localStorage pb_Usuario: <b>{usuarioLocal || '(vacío)'}</b>
          </span>
        </div>
      </div>
      {/* Menú principal */}
      <nav style={{ display: 'flex', gap: 24, padding: '18px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 18 }}>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('panel'); }}>Inicio</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('asignacion'); }}>Asignacion</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('aprobar'); }}>Aprobar</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('googlemaps'); }}>Google Maps</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('copiaformulario'); }}>Plantilla</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('plantilla_v3'); }}>Plantilla V3</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('reporte'); }}>Reporte</a>
        <button onClick={handleShowEnvs} style={{ marginLeft: 24, background: '#eab308', color: '#222', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Ver envs Vercel</button>
      </nav>
      {/* Contenido principal dinámico */}
      <div style={{ width: '100vw', margin: '32px 0', background: '#fff', borderRadius: 10, boxShadow: '0 4px 24px #0001', padding: 32, minHeight: 400 }}>
        {contenido}
      </div>
    </div>
  );
};

export default MainForm;
