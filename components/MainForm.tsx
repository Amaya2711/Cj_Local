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
      {/* Contenido principal dinámico */}
      <div style={{ width: '100vw', margin: '32px 0', background: '#fff', borderRadius: 10, boxShadow: '0 4px 24px #0001', padding: 32, minHeight: 400 }}>
        {contenido}
      </div>
    </div>
  );
};

export default MainForm;
