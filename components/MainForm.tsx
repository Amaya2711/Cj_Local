import React, { useState } from 'react';
import Cuadrilla_Asignar from '../components/Cuadrilla_Asignar';
import Formulario from './Formulario';

const menuColor = '#2563eb';

const MainForm: React.FC = () => {
  const usuario = 'ADMIN_X1'; // Puedes reemplazarlo por el usuario autenticado si lo necesitas
  const fecha = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const [opcion, setOpcion] = useState('panel');

  let contenido = null;
    if (opcion === 'asignacion') {
      contenido = <Cuadrilla_Asignar />;
    } else if (opcion === 'formulario') {
      contenido = <Formulario />;
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
         // Bienvenido, {usuario}
        </div>
        <div style={{ fontSize: 15 }}>
          Usuario: {usuario} &nbsp; | &nbsp; {fecha}
        </div>
      </div>
      {/* Menú principal */}
      <nav style={{ display: 'flex', gap: 24, padding: '18px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 18 }}>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={() => setOpcion('panel')}>Inicio</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={() => setOpcion('sites')}>Sites</a>
          <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={() => setOpcion('asignacion')}>Asignacion</a>
        {/* <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={() => setOpcion('tickets')}>Tickets</a> */}
        {/* <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={() => setOpcion('mapa')}>Mapa</a> */}
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={() => setOpcion('googlemaps')}>Google Maps</a>
        <a href="#" style={{ color: menuColor, textDecoration: 'none' }} onClick={() => setOpcion('formulario')}>Formulario</a>
      </nav>
      {/* Contenido principal dinámico */}
      <div style={{ width: '100vw', margin: '32px 0', background: '#fff', borderRadius: 10, boxShadow: '0 4px 24px #0001', padding: 32, minHeight: 400 }}>
        {contenido}
      </div>
    </div>
  );
};

export default MainForm;
