// [SHOW-FILE] Por favor, muestra el contenido real del archivo para poder analizar el uso del store EmpleadoCuadrilla y el autocompletado.
// [EXTRACT-FULL] Necesito el contenido real del archivo para analizar el problema de datos y autocompletado.
// [READ-FULL] Solicitud de lectura completa para análisis de store y autocompletado
// [FORCE-EXTRACT] Necesito el contenido real del archivo para analizar el uso del store EmpleadoCuadrilla y el autocompletado.
// [EXTRACT] Necesito el contenido real del archivo para analizar el problema de datos y autocompletado
// [READ] Solicitud de lectura completa para análisis de store y autocompletado
// [DEBUG] Revisando cómo se usan los datos del store EmpleadoCuadrilla y el autocompletado
import React, { useState } from 'react';
import Cuadrilla_Asignar from './Cuadrilla_Asignar';
import Formulario from './Formulario';
import GoogleMapsForm from './GoogleMapsForm';

const menuColor = '#2563eb';

// MENU PRINCIPAL ACTIVO
const MainForm: React.FC = () => {
  // Obtener el usuario autenticado desde localStorage usando useEffect y useState
  const [usuario, setUsuario] = useState('');
  React.useEffect(() => {
    function updateUsuario() {
      if (typeof window !== 'undefined') {
        let usuarioGlobal = window.pb_Usuario || localStorage.getItem('pb_Usuario') || 'ADMIN';
        setUsuario(usuarioGlobal);
        // Si no hay usuario registrado, establecer pb_Usuario en ADMIN
        if (!window.pb_Usuario) {
          window.pb_Usuario = 'ADMIN';
          localStorage.setItem('pb_Usuario', 'ADMIN');
        }
      }
    }
    updateUsuario();
    window.addEventListener('pbUsuarioChange', updateUsuario);
    return () => {
      window.removeEventListener('pbUsuarioChange', updateUsuario);
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
  } else {
    contenido = (
      <>
        <h3 style={{ color: '#222c36', marginBottom: 24 }}>Panel principal</h3>
        <p style={{ color: '#64748b' }}>
          Selecciona una opción del menú para comenzar a gestionar el sistema.
        </p>
      </>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100vw' }}>
      {/* Barra superior */}
      <div style={{ background: '#222c36', color: '#fff', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          Bienvenido, {usuario}
        </div>
        <div style={{ fontSize: 15 }}>
          Usuario: {usuario} &nbsp; | &nbsp; {fecha}
        </div>
      </div>
      {/* Menú principal */}
      <nav style={{ display: 'flex', gap: 24, padding: '18px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 18 }}>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('panel'); }}>Inicio</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('asignacion'); }}>Asignacion</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('formulario'); }}>Formulario</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={e => { e.preventDefault(); setOpcion('googlemaps'); }}>Google Maps</a>
      </nav>
      {/* Contenido principal dinámico */}
      <div style={{ width: '100vw', margin: '32px 0', background: '#fff', borderRadius: 10, boxShadow: '0 4px 24px #0001', padding: 32, minHeight: 400 }}>
        {contenido}
      </div>
    </div>
  );
};

export default MainForm;
